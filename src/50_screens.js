/* =========================================================
   PHARAOH QUEST — layar: judul, pilih karakter, HUD, overlay
   ========================================================= */

var DISPLAY_FONT = "'PharaohDisplay','Cinzel Decorative','Papyrus','Trebuchet MS',serif";
function shadowTxt(s, x, y, size, color, align){
  CTX.save();
  CTX.shadowColor = 'rgba(25,8,4,.95)'; CTX.shadowBlur = 5; CTX.shadowOffsetY = 2;
  txt(s, x, y, size, color, align || 'center');
  CTX.restore();
}
function txt(s, x, y, size, color, align, bold){
  CTX.fillStyle = color || '#f6e7c8';
  CTX.font = (bold === false ? '' : 'bold ') + size + 'px "Trebuchet MS",Verdana,sans-serif';
  CTX.textAlign = align || 'left';
  CTX.textBaseline = 'middle';
  CTX.fillText(s, x, y);
}
function outlined(s, x, y, size, color, stroke, align){
  CTX.font = 'bold ' + size + 'px ' + DISPLAY_FONT;
  CTX.textAlign = align || 'center'; CTX.textBaseline = 'middle';
  CTX.lineWidth = Math.max(3, size / 8);
  CTX.strokeStyle = stroke || '#3a2408';
  CTX.strokeText(s, x, y);
  CTX.fillStyle = color; CTX.fillText(s, x, y);
}
function rrect(x, y, w, h, r){
  CTX.beginPath();
  CTX.moveTo(x + r, y);
  CTX.arcTo(x + w, y, x + w, y + h, r);
  CTX.arcTo(x + w, y + h, x, y + h, r);
  CTX.arcTo(x, y + h, x, y, r);
  CTX.arcTo(x, y, x + w, y, r);
  CTX.closePath();
}
function panel(x, y, w, h, alpha){
  CTX.fillStyle = 'rgba(20,10,32,' + (alpha || 0.82) + ')';
  rrect(x, y, w, h, 14); CTX.fill();
  CTX.strokeStyle = 'rgba(245,197,66,.7)'; CTX.lineWidth = 3;
  rrect(x, y, w, h, 14); CTX.stroke();
}

/* ---------- layout kartu pilih karakter ---------- */
var CARD_W = 170, CARD_H = 170, CARD_X0 = 195, CARD_Y = [95, 285], CARD_GAP = 30;
var START_BTN = { x: VW/2 - 110, y: 472, w: 220, h: 48 };
var LEADER_BTN = { x: VW - 312, y: 418, w: 294, h: 40 };
function cardRect(i){
  return { x: CARD_X0 + (i % 3) * (CARD_W + CARD_GAP),
           y: CARD_Y[(i / 3) | 0], w: CARD_W, h: CARD_H };
}

/* ---------- kembali ke home (muat ulang papan skor) ---------- */
function goTitle(){
  G.screen = 'title';
  NET.board(function(top, online){ G.titleTop = top; G.titleOnline = online; });
}

/* ---------- update layar menu ---------- */
function updateMenus(){
  if (G.screen === 'title'){
    if (pressed.l){ openBoard(); clearPressed(); return; }
    if (pressed.enter || pressed.jump){ G.screen = 'intro'; SFX.blip(); clearPressed(); return; }
  } else if (G.screen === 'board'){
    if (pressed.enter || pressed.esc || pressed.jump){ goTitle(); SFX.blip(); }
  } else if (G.screen === 'intro'){
    if (pressed.enter || pressed.jump){ startGame(); }
    if (pressed.esc){ goTitle(); }
  } else if (G.screen === 'over'){
    if (pressed.enter || pressed.jump || pressed.esc){ goTitle(); }
  } else if (G.screen === 'complete'){
    if (pressed.enter || pressed.jump || pressed.esc){ goTitle(); }
  }
  clearPressed();
}

/* ---------- klik / tap ---------- */
function canvasClick(x, y){
  var i, r;
  if (G.screen === 'title'){
    if (x >= LEADER_BTN.x && x <= LEADER_BTN.x + LEADER_BTN.w &&
        y >= LEADER_BTN.y && y <= LEADER_BTN.y + LEADER_BTN.h){ openBoard(); return; }
    G.screen = 'intro'; SFX.blip(); return;
  }
  if (G.screen === 'intro'){
    if (x >= START_BTN.x && x <= START_BTN.x + START_BTN.w &&
        y >= START_BTN.y && y <= START_BTN.y + START_BTN.h){
      startGame();
    } else {
      SFX.blip();
    }
    return;
  }
  if (G.screen === 'board'){ goTitle(); return; }
  if (G.screen === 'over'){ goTitle(); return; }
  if (G.screen === 'complete'){ goTitle(); return; }
  if (G.screen === 'play' && G.paused){ G.paused = false; }
}

/* ============================================================ */
function renderTitle(){
  drawSky('desert', G.t * 0.6, G.t);

  if (artImage && artImage.complete && artImage.width){
    var h = 250, w = h * artImage.width / artImage.height;
    var bob = Math.sin(G.t * 0.04) * 6;
    CTX.save();
    CTX.shadowColor = 'rgba(255,120,60,.55)'; CTX.shadowBlur = 34;
    CTX.drawImage(artImage, 400 - w/2, 150 + bob, w, h);
    CTX.restore();
  }

  /* tombol papan penuh — di bawah panel HALL OF FAME */
  CTX.fillStyle = 'rgba(224,72,62,.95)';
  rrect(LEADER_BTN.x, LEADER_BTN.y, LEADER_BTN.w, LEADER_BTN.h, 12); CTX.fill();
  CTX.strokeStyle = '#ffd976'; CTX.lineWidth = 3;
  rrect(LEADER_BTN.x, LEADER_BTN.y, LEADER_BTN.w, LEADER_BTN.h, 12); CTX.stroke();
  outlined('🏆 HALL OF FAME — FULL BOARD', LEADER_BTN.x + LEADER_BTN.w/2, LEADER_BTN.y + 21, 16, '#ffffff', '#5c130d');

  outlined('PHARAOH QUEST', VW/2, 64, 58, '#ffd976', '#a01820');
  outlined('Pharaoh on AVAX · The Liquidity Mission', VW/2, 108, 21, '#e84142', '#f6e7c8');
  shadowTxt('The Bear Market stole the royal liquidity — reclaim your PHAR & AVAX!', VW/2, 134, 15, '#fff6e0');

  /* panel HALL OF FAME — selalu terlihat di home */
  var px = VW - 312, py = 142, pw2 = 294, ph2 = 268;
  panel(px, py, pw2, ph2);
  outlined('🏆 HALL OF FAME', px + pw2/2, py + 24, 20, '#ffd976', '#5c130d');
  if (G.titleTop === null){
    shadowTxt('CONNECTING…', px + pw2/2, py + 130, 16, '#ffe9b0');
  } else {
    shadowTxt(G.titleOnline ? '★ GLOBAL TOP 5 ★' : 'LOCAL TOP 5 (offline)',
              px + pw2/2, py + 48, 12.5, G.titleOnline ? '#ff6b5e' : '#ffe9b0');
    var top5 = G.titleTop || [];
    if (!top5.length){
      shadowTxt('No scores yet —', px + pw2/2, py + 120, 15, '#fff6e0');
      shadowTxt('be the first legend!', px + pw2/2, py + 142, 15, '#fff6e0');
    }
    for (var li = 0; li < Math.min(5, top5.length); li++){
      var ly = py + 78 + li * 27, me5 = top5[li].u === NET.user;
      if (me5){ CTX.fillStyle = 'rgba(245,197,66,.16)'; CTX.fillRect(px + 10, ly - 12, pw2 - 20, 24); }
      var md = li === 0 ? '#ffd976' : li === 1 ? '#d8d8d8' : li === 2 ? '#d9a05b' : '#f6e7c8';
      txt(String(li + 1) + '.', px + 20, ly, 15, md, 'left');
      txt(top5[li].u, px + 46, ly, 15, me5 ? '#ffd976' : '#f6e7c8', 'left');
      txt(String(top5[li].s).padStart(6, '0'), px + pw2 - 18, ly, 15, md, 'right');
    }
    var myRank = -1;
    for (var ri = 0; ri < top5.length; ri++) if (top5[ri].u === NET.user) myRank = ri + 1;
    shadowTxt('YOU: ' + (NET.user || '—') + (myRank > 0 ? '  ·  RANK #' + myRank : ''),
              px + pw2/2, py + ph2 - 34, 13, '#ff9d97');
    shadowTxt('L / tap button = full board', px + pw2/2, py + ph2 - 14, 11.5, 'rgba(246,231,200,.75)');
  }

  if (G.t % 70 < 45) outlined('PRESS ENTER / TAP TO START', VW/2, 468, 24, '#ffffff', '#4a2c0a');
  /* pita footer gelap agar teks bawah kontras */
  CTX.fillStyle = 'rgba(24,8,6,.72)';
  CTX.fillRect(0, 476, VW, VH - 476);
  CTX.fillStyle = 'rgba(245,197,66,.55)';
  CTX.fillRect(0, 476, VW, 2);
  shadowTxt('PLAYER: ' + (NET.user || '—'), VW/2, 494, 15, '#ff9d97');
  shadowTxt(IS_TOUCH ? 'On-screen: ◀ ▶ move · ▲ jump · ⚡ shoot · 🛡 block'
               : '← → / A D move · SPACE jump · J shoot · K block · L = leaderboard', VW/2, 514, 14, '#ffe9b0');
  shadowTxt('BEST SCORE: ' + G.best, VW/2, 533, 14, '#ffd976');
  shadowTxt('Made to celebrate the 1-Year Anniversary of Pharaoh on AVAX', VW/2, 548, 12.5, '#ffd976');
  shadowTxt('BY : SASAM', VW/2, 560 - 6, 12.5, '#ff6b5e');
}

var SCENES = [
  ['IDLE',       'resting pose'],
  ['RUN',        '← → / A D'],
  ['ATTACK',     'J / X · energy blast'],
  ['DEFEND',     'K / C (hold) · shield'],
  ['SUPER MODE', 'grab the ANKH = xPHAR'],
  ['HURT',       'costs 1 life']
];

function renderIntro(){
  drawSky('ruins', G.t * 0.4, G.t);
  CTX.fillStyle = 'rgba(10,5,20,.62)'; CTX.fillRect(0, 0, VW, VH);

  outlined('ONE HERO, SIX SCENES', VW/2, 46, 34, '#ffd976', '#4a2c0a');

  for (var i = 0; i < 6; i++){
    var r = cardRect(i), im = charImgs[i];
    CTX.fillStyle = 'rgba(20,10,32,.72)';
    rrect(r.x, r.y, r.w, r.h, 12); CTX.fill();
    CTX.lineWidth = 2;
    CTX.strokeStyle = 'rgba(245,197,66,.45)';
    rrect(r.x, r.y, r.w, r.h, 12); CTX.stroke();

    var h = 96, w = Math.min(h * im.width / im.height, r.w - 16);
    CTX.drawImage(im, r.x + r.w/2 - w/2, r.y + 10, w, h);
    txt(SCENES[i][0], r.x + r.w/2, r.y + 118, 15, '#ffd976', 'center');
    shadowTxt(SCENES[i][1], r.x + r.w/2, r.y + 140, 12, '#fff6e0');
  }

  CTX.fillStyle = 'rgba(224,72,62,.95)';
  rrect(START_BTN.x, START_BTN.y, START_BTN.w, START_BTN.h, 12); CTX.fill();
  CTX.strokeStyle = '#ffd976'; CTX.lineWidth = 3;
  rrect(START_BTN.x, START_BTN.y, START_BTN.w, START_BTN.h, 12); CTX.stroke();
  outlined('START ▶', VW/2, START_BTN.y + 25, 24, '#ffffff', '#5c130d');

  shadowTxt('Careful: the BEAR MARKET cannot be stomped — shoot ⚡ or block 🛡!',
      VW/2, 543, 14, '#fff6e0');
}

/* ---------- HUD ---------- */
function renderHUD(){
  CTX.fillStyle = 'rgba(15,7,26,.55)';
  CTX.fillRect(0, 0, VW, 46);
  CTX.fillStyle = 'rgba(245,197,66,.5)';
  CTX.fillRect(0, 46, VW, 2);

  var im = charImgs[0];
  CTX.drawImage(im, 10, 5, 18 * im.width / im.height, 36);
  txt('×' + G.lives, 10 + 22 * im.width / im.height + 6, 24, 17, '#ff9d8a');

  txt('SCORE ' + String(G.score).padStart(6, '0'), 130, 24, 17, '#ffd976');

  drawCoin(300, 23, G.t, 0);
  txt('×' + G.coins, 316, 24, 17, '#f6e7c8');

  txt('LEVEL ' + (G.levelIdx + 1) + ' — ' + G.L.name, VW/2, 24, 16, '#f6e7c8', 'center');

  var tl = Math.max(0, Math.ceil(G.timeLeft));
  CTX.fillStyle = tl < 60 && G.t % 30 < 15 ? '#ff6b5e' : '#f6e7c8';
  CTX.beginPath(); CTX.arc(VW - 108, 23, 8, 0, 7); CTX.fill();
  txt(String(tl), VW - 92, 24, 17, tl < 60 && G.t % 30 < 15 ? '#ff6b5e' : '#f6e7c8');

  if (G.P.powerT > 0){
    txt('xPHAR ' + Math.ceil(G.P.powerT / 60) + 's', VW - 170, 24, 15, '#ffd976', 'right');
  }

  /* HP bar BEAR PHARAOH */
  var boss = null;
  for (var i2 = 0; i2 < G.L.enemies.length; i2++){
    var e2 = G.L.enemies[i2];
    if (e2.type === 'B' && !e2.dead) boss = e2;
  }
  if (boss){
    outlined('BEAR PHARAOH', VW/2, 66, 16, '#ff6b5e', '#2a060a');
    CTX.fillStyle = 'rgba(14,5,9,.8)';
    rrect(VW/2 - 150, 78, 300, 12, 6); CTX.fill();
    CTX.fillStyle = '#e84142';
    if (boss.hp > 0){ rrect(VW/2 - 148, 80, 296 * boss.hp / 6, 8, 4); CTX.fill(); }
    CTX.strokeStyle = '#ffd976'; CTX.lineWidth = 2;
    rrect(VW/2 - 150, 78, 300, 12, 6); CTX.stroke();
  }
}

/* ---------- dunia ---------- */
function renderWorld(){
  var L = G.L, cam = Math.floor(G.camX);
  drawSky(L.theme, cam, G.t);

  CTX.save();
  CTX.translate(-cam, 0);

  drawBird();
  L.deco.forEach(function(d){
    if (d.type !== 'billboard' && d.type !== 'logo' && d.type !== 'sign') drawDeco(d);
  });

  var tx0 = Math.max(0, Math.floor(cam / TILE) - 1);
  var tx1 = Math.min(L.width - 1, tx0 + Math.ceil(VW / TILE) + 2);
  for (var ty = 0; ty < ROWS; ty++)
    for (var tx = tx0; tx <= tx1; tx++){
      var c = L.grid[ty][tx];
      if (c !== ' ') drawTile(c, tx, ty);
    }

  /* platform bergerak */
  L.mplats.forEach(function(m){
    CTX.fillStyle = '#c99a55';
    rrect(m.x, m.y, m.w, m.h, 6); CTX.fill();
    CTX.fillStyle = '#f6d89a'; CTX.fillRect(m.x + 2, m.y, m.w - 4, 5);
    CTX.strokeStyle = '#8a6534'; CTX.lineWidth = 2;
    rrect(m.x, m.y, m.w, m.h, 6); CTX.stroke();
  });

  /* mural brand di tembok jalan (di atas tile) */
  L.deco.forEach(function(d){
    if (d.type === 'billboard' || d.type === 'logo' || d.type === 'sign') drawDeco(d);
  });

  drawPyramid(L.flag * TILE, L.ground * TILE);
  drawFlag(L.flag * TILE, L.ground * TILE);

  L.coins.forEach(function(c){ if (!c.got) drawCoin(c.x, c.y, G.t, c.ph); });
  L.ankhs.forEach(function(a){ if (!a.got) drawAnkhItem(a.x, a.y, G.t); });
  L.gems.forEach(function(a){ if (!a.got) drawGemItem(a.x, a.y, G.t); });
  L.enemies.forEach(function(e){ if (!e.gone) drawEnemy(e); });
  G.shots.forEach(drawShot);

  drawPlayer();

  CTX.restore();
  drawPops();

  /* kegelapan makam + cahaya obor */
  if (L.theme === 'tomb'){
    var px = G.P.x + G.P.w/2 - cam, py = G.P.y + G.P.h/2;
    var g = CTX.createRadialGradient(px, py, 70, px, py, 360);
    g.addColorStop(0, 'rgba(8,2,14,0)');
    g.addColorStop(1, 'rgba(8,2,14,.80)');
    CTX.fillStyle = g; CTX.fillRect(0, 0, VW, VH);
    L.deco.forEach(function(d){
      if (d.type !== 'torch') return;
      var x = d.x * TILE - cam, y = G.L.ground * TILE - 108;
      if (x < -60 || x > VW + 60) return;
      var gg = CTX.createRadialGradient(x, y, 4, x, y, 90);
      gg.addColorStop(0, 'rgba(255,160,60,.35)');
      gg.addColorStop(1, 'rgba(255,160,60,0)');
      CTX.fillStyle = gg;
      CTX.beginPath(); CTX.arc(x, y, 90, 0, 7); CTX.fill();
    });
  }
}

/* ---------- overlay saat main ---------- */
function renderPlayOverlays(){
  if (centerPopT > 0){
    centerPopT--;
    CTX.globalAlpha = Math.min(1, centerPopT / 20);
    outlined(centerPopTxt, VW/2, 120, 26, '#ffd976', '#4a2c0a');
    CTX.globalAlpha = 1;
  }

  if (G.done && G.doneT > 25){
    panel(VW/2 - 240, 170, 480, 190);
    outlined('LEVEL ' + (G.levelIdx + 1) + ' COMPLETE!', VW/2, 215, 34, '#ffd976');
    txt('LEVEL BONUS  +1000', VW/2, 262, 19, '#f6e7c8', 'center');
    txt('TIME BONUS  +' + G.timeBonus, VW/2, 292, 19, '#f6e7c8', 'center');
    txt(G.levelIdx + 1 < LEVELS.length ? 'Get ready for the next level…' : '…', VW/2, 330, 15, 'rgba(246,231,200,.8)', 'center');
  }

  if (G.paused){
    CTX.fillStyle = 'rgba(5,2,12,.62)'; CTX.fillRect(0, 0, VW, VH);
    outlined('PAUSED', VW/2, 220, 46, '#ffd976');
    shadowTxt('P = resume · M = music · R = restart level', VW/2, 268, 17, '#fff6e0');
  }
}

/* ---------- leaderboard ---------- */
function openBoard(){
  G.screen = 'board';
  G.boardLoading = true; G.boardData = null;
  NET.board(function(top, online){
    G.boardData = top; G.boardOnline = online; G.boardLoading = false;
  });
}
function renderBoard(){
  drawSky('ruins', G.t * 0.4, G.t);
  CTX.fillStyle = 'rgba(10,5,20,.7)'; CTX.fillRect(0, 0, VW, VH);
  outlined('HALL OF FAME', VW/2, 52, 40, '#ffd976', '#a01820');
  panel(VW/2 - 300, 84, 600, 400);
  if (G.boardLoading){
    outlined('CONNECTING…', VW/2, 280, 24, '#ffe9b0');
  } else {
    var top = G.boardData || [];
    shadowTxt(G.boardOnline ? '★ GLOBAL LEADERBOARD — PHARAOH ON AVAX ★'
                            : 'LOCAL LEADERBOARD (server offline)', VW/2, 108, 14,
              G.boardOnline ? '#ff6b5e' : '#ffe9b0');
    if (!top.length){
      shadowTxt('No scores yet — be the first legend!', VW/2, 280, 18, '#fff6e0');
    }
    for (var i = 0; i < Math.min(10, top.length); i++){
      var y = 140 + i * 32, me = top[i].u === NET.user;
      if (me){ CTX.fillStyle = 'rgba(245,197,66,.16)'; CTX.fillRect(VW/2 - 280, y - 14, 560, 28); }
      var medal = i === 0 ? '#ffd976' : i === 1 ? '#d8d8d8' : i === 2 ? '#d9a05b' : '#f6e7c8';
      txt(String(i + 1).padStart(2, ' '), VW/2 - 260, y, 17, medal, 'left');
      txt(top[i].u, VW/2 - 210, y, 17, me ? '#ffd976' : '#f6e7c8', 'left');
      txt(String(top[i].s).padStart(6, '0'), VW/2 + 260, y, 17, medal, 'right');
    }
    shadowTxt('You play as: ' + (NET.user || '—'), VW/2, 462, 14, '#ff9d97');
  }
  if (G.t % 70 < 45) shadowTxt('ENTER / ESC = BACK', VW/2, 508, 16, '#fff6e0');
}

/* ---------- game over & tamat ---------- */
function renderOver(){
  drawSky('ruins', 0, G.t);
  CTX.fillStyle = 'rgba(10,3,10,.66)'; CTX.fillRect(0, 0, VW, VH);
  outlined('GAME OVER', VW/2, 190, 62, '#ff6b5e', '#3a0d08');
  txt('FINAL SCORE  ' + G.score, VW/2, 258, 24, '#ffd976', 'center');
  txt('BEST SCORE  ' + G.best, VW/2, 290, 17, '#f6e7c8', 'center');
  shadowTxt(NET.user ? '✔ score submitted to HALL OF FAME as ' + NET.user
                     : 'score saved locally', VW/2, 322, 14, '#9fe8a0');
  if (G.t % 70 < 45) outlined('ENTER / TAP = HOME & HALL OF FAME', VW/2, 372, 22, '#ffffff', '#4a2c0a');
  var secs = Math.max(0, Math.ceil((180 - G.endT) / 60));
  shadowTxt('back to HOME in ' + secs + 's — play again from there', VW/2, 412, 14, '#ffe9b0');
}

function renderComplete(){
  drawSky('desert', G.t * 0.5, G.t);
  CTX.fillStyle = 'rgba(10,5,20,.35)'; CTX.fillRect(0, 0, VW, VH);
  outlined('QUEST COMPLETE!', VW/2, 130, 52, '#ffd976', '#4a2c0a');
  txt('The royal liquidity is back in the Vault!', VW/2, 190, 18, '#f6e7c8', 'center');
  txt('Pharaoh on AVAX triumphs — 100% of fees to stakers!', VW/2, 216, 18, '#f6e7c8', 'center');

  var im = charImgs[4];
  var h = 200, w = h * im.width / im.height;
  CTX.save();
  CTX.shadowColor = 'rgba(255,217,118,.8)'; CTX.shadowBlur = 30;
  CTX.drawImage(im, VW/2 - w/2, 250, w, h);
  CTX.restore();

  txt('FINAL SCORE  ' + G.score + '   ·   BEST  ' + G.best, VW/2, 470, 20, '#ffd976', 'center');
  shadowTxt(NET.user ? '✔ score submitted to HALL OF FAME as ' + NET.user
                     : 'score saved locally', VW/2, 498, 14, '#9fe8a0');
  var secs = Math.max(0, Math.ceil((300 - G.endT) / 60));
  if (G.t % 70 < 45) outlined('ENTER / TAP = HOME', VW/2, 528, 20, '#ffffff', '#4a2c0a');
  shadowTxt('back to HOME & leaderboard in ' + secs + 's', VW/2, 550, 13, '#ffe9b0');
}
