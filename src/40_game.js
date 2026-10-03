/* =========================================================
   PHARAOH QUEST — state game, fisika, logika entitas
   ========================================================= */

var G = {
  screen:'title', L:null, levelIdx:0,
  P:null, camX:0, t:0,
  score:0, coins:0, lives:3, timeLeft:0,
  best:0, sel:0, charIdx:0,
  paused:false, dying:false, dieT:0,
  done:false, doneT:0, timeBonus:0, enterT:0, endT:0,
  titleTop:null, titleOnline:false,
  fx:[], bumps:{}
};
try { G.best = parseInt(localStorage.getItem('pharaohquest_best') || '0', 10) || 0; } catch(e){}

var GRAV = 0.55, ACC = 0.55, MAXVX = 4.3, JUMPV = 12.9, MAXFALL = 13.5;

function newPlayer(){
  return { x:2*TILE, y:(G.L.ground)*TILE - 64, w:30, h:62, vx:0, vy:0,
           face:1, grounded:true, coyote:7, jbuf:0, invincibleT:0, powerT:0,
           groundY:(G.L.ground)*TILE, ride:null, prevBottom:0,
           attackT:0, atkCd:0, defending:false, hurtT:0, jumps:0 };
}

function loadLevel(i){
  G.levelIdx = i;
  G.L = buildLevel(i);
  G.P = newPlayer();
  G.camX = 0; G.timeLeft = G.L.time;
  G.fx = []; G.bumps = {}; G.shots = [];
  G.done = false; G.doneT = 0; G.timeBonus = 0; G.enterT = 0;
  G.dying = false; G.dieT = 0; G.paused = false;
  G.bird = { on:false }; G.birdT = 420; G.bossHint = 0;
}

function startGame(){
  G.score = 0; G.coins = 0; G.lives = 3; G.submitted = false;
  loadLevel(0);
  G.screen = 'play';
  SFX.unlock(); SFX.setMusic(SFX.musicOn);
}

function saveBest(){
  if (G.score > G.best){ G.best = G.score;
    try { localStorage.setItem('pharaohquest_best', String(G.best)); } catch(e){} }
}

/* ---------- tile helpers ---------- */
function tileAt(tx, ty){
  if (tx < 0 || tx >= G.L.width) return '#';
  if (ty < 0 || ty >= ROWS) return ' ';
  return G.L.grid[ty][tx];
}
function solid(tx, ty){
  var c = tileAt(tx, ty);
  return c === '#' || c === 'B' || c === '?' || c === 'U';
}

function addPop(x, y, txt, color, size){
  G.fx.push({ x:x, y:y, txt:txt, t:0, life:55, color:color || '#ffd976', size:size || 16 });
}

/* ---------- kematian & respawn ---------- */
function startDie(){
  if (G.dying) return;
  G.dying = true; G.dieT = 0;
  G.P.vy = -11; G.P.vx = 0;
  SFX.die();
}
function loseLife(){
  G.lives--;
  if (G.lives <= 0){
    saveBest();
    G.screen = 'over'; G.endT = 0;
    SFX.sad();
  } else {
    respawn();
  }
}
function respawn(){
  G.P = newPlayer();
  G.camX = 0;
  G.timeLeft = G.L.time;
  G.dying = false; G.dieT = 0;
  G.P.invincibleT = 100;
}

/* ---------- pemain ---------- */
function hitFromBelow(tx, ty){
  var c = tileAt(tx, ty);
  if (c === '?'){
    G.L.grid[ty][tx] = 'U';
    G.bumps[tx + ',' + ty] = G.t;
    G.coins++; G.score += 50;
    addPop(tx*TILE + 20, ty*TILE - 8, '+50', '#ffd976', 18);
    SFX.coin();
  } else if (c === 'B' || c === '#'){
    G.bumps[tx + ',' + ty] = G.t;
    SFX.bump();
  }
}

function takeHit(srcX){
  var P = G.P;
  if (P.invincibleT > 0 || G.dying || G.done) return;
  if (P.powerT > 0) return;
  G.lives--;
  P.hurtT = 40;
  addPop(P.x + P.w/2, P.y - 8, 'OUCH!', '#ff6b5e', 18);
  SFX.hurt();
  if (G.lives <= 0){ startDie(); return; }
  P.invincibleT = 110;
  P.vy = -7;
  P.vx = (P.x + P.w/2 < srcX ? -4 : 4);
}

function updatePlayer(){
  var P = G.P, L = G.L, i, m;

  if (G.done){ /* jalan kemenangan ke kanan, lalu masuk piramida */
    G.doneT++;
    var doorX = L.flag * TILE + 90;
    if (P.x + P.w/2 < doorX - 4){
      P.vx = 1.6; P.x += P.vx;
    } else {
      P.vx = 0;
      G.enterT++;
      if (G.enterT === 1) SFX.power();
    }
    P.vy += GRAV; P.y = Math.min(P.y + P.vy, L.ground*TILE - P.h);
    if (P.y >= L.ground*TILE - P.h) P.vy = 0;
    P.face = 1;
    if (G.doneT > 150 || G.enterT > 60){
      if (G.levelIdx + 1 >= LEVELS.length){
        saveBest();
        G.screen = 'complete'; G.endT = 0;
        SFX.fanfare();
      } else {
        loadLevel(G.levelIdx + 1);
      }
    }
    return;
  }

  if (G.dying){
    G.dieT++;
    P.vy += GRAV * 0.9;
    P.y += P.vy;
    if (G.dieT > 110) loseLife();
    return;
  }

  if (P.invincibleT > 0) P.invincibleT--;
  if (P.powerT > 0) P.powerT--;
  if (P.hurtT > 0) P.hurtT--;
  if (P.attackT > 0) P.attackT--;
  if (P.atkCd > 0) P.atkCd--;

  /* bertahan: angkat perisai energi (diam di tempat) */
  P.defending = keys.defend && P.grounded && !G.done && !G.dying && P.attackT <= 0;

  /* serang: tembakan energi */
  if (pressed.attack && P.atkCd <= 0 && !P.defending && !G.done && !G.dying){
    P.attackT = 16; P.atkCd = 26;
    var sup = P.powerT > 0;
    G.shots.push({ x: P.x + (P.face > 0 ? P.w + 8 : -8), y: P.y + P.h * 0.42,
                   vx: P.face * (sup ? 11 : 9), r: sup ? 13 : 9, sup: sup, t: 0 });
    SFX.shot();
  }

  /* input */
  var ax = 0;
  if (!P.defending){
    if (keys.left)  { ax -= ACC; P.face = -1; }
    if (keys.right) { ax += ACC; P.face =  1; }
  }
  P.vx += ax;
  if (!ax || P.defending) P.vx *= P.grounded ? 0.78 : 0.94;
  P.vx = clamp(P.vx, -MAXVX, MAXVX);
  if (Math.abs(P.vx) < 0.05) P.vx = 0;

  /* lompat: coyote + buffer + lompat variabel + double jump */
  if (pressed.jump) P.jbuf = 7; else if (P.jbuf > 0) P.jbuf--;
  if (P.grounded){ P.coyote = 7; P.jumps = 0; } else if (P.coyote > 0) P.coyote--;
  if (P.jbuf > 0){
    if (P.coyote > 0){
      P.vy = -JUMPV; P.jbuf = 0; P.coyote = 0;
      P.grounded = false; P.ride = null; P.jumps = 1;
      SFX.jump();
    } else if (P.jumps < 2){
      P.vy = -10.6; P.jbuf = 0; P.jumps = 2; /* ketuk 2x = lompat lebih tinggi */
      SFX.jump();
    }
  }
  if (!keys.jump && P.vy < -4.5) P.vy = -4.5;

  P.vy += GRAV;
  P.vy = Math.min(P.vy, MAXFALL);

  /* ikut platform bergerak */
  if (P.ride){
    P.x += P.ride.dx;
    P.y += P.ride.dy;
  }

  /* ---- gerak horizontal ---- */
  P.x += P.vx;
  var top = Math.floor(P.y / TILE), bot = Math.floor((P.y + P.h - 1) / TILE);
  if (P.vx > 0){
    var tx = Math.floor((P.x + P.w) / TILE);
    for (i = top; i <= bot; i++) if (solid(tx, i)){
      if (tileAt(tx, i) === '?') hitFromBelow(tx, i);
      P.x = tx*TILE - P.w - 0.01; P.vx = 0; break; }
  } else if (P.vx < 0){
    var tx2 = Math.floor(P.x / TILE);
    for (i = top; i <= bot; i++) if (solid(tx2, i)){
      if (tileAt(tx2, i) === '?') hitFromBelow(tx2, i);
      P.x = (tx2+1)*TILE + 0.01; P.vx = 0; break; }
  }
  P.x = clamp(P.x, 0, L.pxW - P.w);

  /* ---- gerak vertikal ---- */
  P.prevBottom = P.y + P.h;
  P.y += P.vy;
  P.grounded = false; P.ride = null;
  var lx = Math.floor((P.x + 2) / TILE), rx = Math.floor((P.x + P.w - 2) / TILE);

  if (P.vy >= 0){
    var ty = Math.floor((P.y + P.h) / TILE);
    for (i = lx; i <= rx; i++) if (solid(i, ty)){
      P.y = ty*TILE - P.h - 0.01; P.vy = 0; P.grounded = true; break;
    }
    /* platform satu arah */
    if (!P.grounded) for (i = 0; i < L.mplats.length; i++){
      m = L.mplats[i];
      if (P.x + P.w - 4 > m.x && P.x + 4 < m.x + m.w &&
          P.y + P.h >= m.y && P.prevBottom <= m.y + 6){
        P.y = m.y - P.h; P.vy = 0; P.grounded = true; P.ride = m; break;
      }
    }
  } else {
    var ty2 = Math.floor(P.y / TILE);
    for (i = lx; i <= rx; i++) if (solid(i, ty2)){
      P.y = (ty2+1)*TILE + 0.01; P.vy = 0.5;
      hitFromBelow(i, ty2);
      break;
    }
  }

  /* bayangan: cari tanah di bawah */
  var sy = Math.floor((P.y + P.h) / TILE) + 1;
  P.groundY = P.y + P.h;
  for (i = sy; i < ROWS; i++){
    if (solid(Math.floor((P.x + P.w/2) / TILE), i)){ P.groundY = i*TILE; break; }
    P.groundY = VH;
  }

  /* duri */
  var fy = Math.floor((P.y + P.h - 4) / TILE);
  for (i = lx; i <= rx; i++) if (tileAt(i, fy) === '^'){ takeHit(i*TILE + 20); break; }

  /* jatuh ke jurang */
  if (P.y > ROWS*TILE + 40){
    G.lives--;
    if (G.lives <= 0){ saveBest(); G.screen = 'over'; G.endT = 0; SFX.sad(); }
    else { SFX.die(); respawn(); }
    return;
  }

  /* ---- koin & harta ---- */
  var px = P.x + P.w/2, py = P.y + P.h/2;
  L.coins.forEach(function(c){
    if (!c.got && Math.abs(c.x - px) < 26 && Math.abs(c.y - py) < 40){
      c.got = true; G.coins++; G.score += 50;
      addPop(c.x, c.y - 12, '+50');
      SFX.coin();
      if (G.coins % 20 === 0){ G.lives++; addPop(px, P.y - 16, '1-UP!', '#7dff9a', 20); SFX.power(); }
    }
  });
  L.ankhs.forEach(function(a){
    if (!a.got && Math.abs(a.x - px) < 30 && Math.abs(a.y - py) < 44){
      a.got = true; P.powerT = 420; G.score += 250;
      addPop(a.x, a.y - 16, 'xPHAR MODE!', '#ffd976', 20);
      SFX.power();
    }
  });
  L.gems.forEach(function(a){
    if (!a.got && Math.abs(a.x - px) < 28 && Math.abs(a.y - py) < 42){
      a.got = true; G.score += 200;
      addPop(a.x, a.y - 14, '+1 AVAX!', '#ff8a8b', 18);
      SFX.coin();
    }
  });

  /* ---- bendera finish (terkunci selama boss hidup) ---- */
  var bossAlive = false;
  for (var b3 = 0; b3 < L.enemies.length; b3++)
    if (L.enemies[b3].type === 'B' && !L.enemies[b3].dead) bossAlive = true;
  if (bossAlive && P.x + P.w > (L.flag - 4) * TILE && G.bossHint <= 0){
    addPop(P.x, P.y - 20, 'DEFEAT THE BEAR PHARAOH!', '#ff6b5e', 20);
    G.bossHint = 150;
  }
  if (G.bossHint > 0) G.bossHint--;
  if (!bossAlive && P.x + P.w > L.flag*TILE && !G.done){
    G.done = true; G.doneT = 0;
    G.timeBonus = Math.max(0, Math.ceil(G.timeLeft)) * 5;
    G.score += 1000 + G.timeBonus;
    addPop(P.x, P.y - 20, '+' + (1000 + G.timeBonus), '#7dff9a', 22);
    SFX.fanfare();
  }
}

/* ---------- platform bergerak ---------- */
function updateMplats(){
  G.L.mplats.forEach(function(m){
    var p = Math.sin(G.t * 0.02 * m.speed * 2 + m.ph);
    var nx = m.ox + (m.axis === 'h' ? (p * 0.5 + 0.5) * m.range : 0);
    var ny = m.oy + (m.axis === 'v' ? (p * 0.5 + 0.5) * m.range : 0);
    m.dx = nx - m.x; m.dy = ny - m.y;
    m.x = nx; m.y = ny;
  });
}

/* ---------- musuh ---------- */
function updateEnemies(){
  var L = G.L, P = G.P, i;
  L.enemies.forEach(function(e){
    if (e.gone) return;
    if (e.dead){ e.deadT++; if (e.deadT > 34) e.gone = true; return; }
    e.anim++;
    if (e.bounceT > 0) e.bounceT--;

    if (e.type === 'h'){
      e.x += e.vx;
      e.y = e.baseY + Math.sin(G.t * 0.03 + e.ph) * 50;
      if (e.x < TILE || e.x > L.pxW - TILE - e.w) e.vx *= -1;
    } else {
      e.vy = (e.vy || 0) + GRAV;
      if (e.type === 'B'){ /* BEAR PHARAOH: rutinitas charge */
        if (e.flash > 0) e.flash--;
        if (e.charge > 0){ e.charge--; }
        else if (e.ground && --e.chargeT <= 0){
          e.vx = (P.x + P.w/2 > e.x + e.w/2 ? 1 : -1) * 3.1;
          e.charge = 46; e.chargeT = 175;
          addPop(e.x + e.w/2, e.y - 14, 'MARKET CRASH!', '#ff6b5e', 18);
          SFX.hurt();
        }
      }
      if (e.ground && e.type !== 'B'){ /* jangan masuk jurang: berbalik di tepi */
        var dirx = e.vx > 0 ? 1 : -1;
        var fx2 = Math.floor((e.x + (dirx > 0 ? e.w + 3 : -3)) / TILE);
        var by2 = Math.floor((e.y + e.h + 8) / TILE);
        if (!solid(fx2, by2)) e.vx *= -1;
      }
      if (e.type === 'B'){ /* boss tetap di arena vault */
        if (e.x < 158*TILE) { e.x = 158*TILE; e.vx = Math.abs(e.vx); }
        if (e.x > 173*TILE - e.w) { e.x = 173*TILE - e.w; e.vx = -Math.abs(e.vx); }
      }
      e.x += e.vx;
      var top = Math.floor(e.y / TILE), bot = Math.floor((e.y + e.h - 1) / TILE);
      if (e.vx > 0){
        var tx = Math.floor((e.x + e.w) / TILE);
        for (i = top; i <= bot; i++) if (solid(tx, i)){ e.x = tx*TILE - e.w; e.vx *= -1; break; }
      } else {
        var tx2 = Math.floor(e.x / TILE);
        for (i = top; i <= bot; i++) if (solid(tx2, i)){ e.x = (tx2+1)*TILE; e.vx *= -1; break; }
      }
      e.y += e.vy;
      e.ground = false;
      var ty = Math.floor((e.y + e.h) / TILE);
      var lx = Math.floor((e.x + 3) / TILE), rx = Math.floor((e.x + e.w - 3) / TILE);
      for (i = lx; i <= rx; i++) if (solid(i, ty)){ e.y = ty*TILE - e.h; e.vy = 0; e.ground = true; break; }
      if (e.y > ROWS*TILE + 80){ e.gone = true; return; }
    }

    /* tabrakan dengan pemain */
    if (G.dying || G.done) return;
    if (P.x < e.x + e.w && P.x + P.w > e.x && P.y < e.y + e.h && P.y + P.h > e.y){
      if (P.defending){
        if (!e.bounceT){
          e.vx = (e.x + e.w/2 < P.x + P.w/2 ? -1 : 1) * Math.max(1.3, Math.abs(e.vx));
          e.bounceT = 30;
          addPop(P.x + P.w/2, P.y - 6, 'BLOCKED!', '#9fe8ff', 15);
          SFX.shieldS();
        }
        return;
      }
      if (P.powerT > 0 && e.type !== 'B'){
        e.dead = true; e.deadT = 0; G.score += 150;
        addPop(e.x + e.w/2, e.y - 8, '+150', '#ffd976', 16);
        SFX.stomp();
      } else if (P.vy > 1 && P.prevBottom <= e.y + 12 && e.type !== 'b' && e.type !== 'B'){
        e.dead = true; e.deadT = 0; G.score += 100;
        addPop(e.x + e.w/2, e.y - 8, '+100', '#ffffff', 16);
        P.vy = keys.jump ? -10.5 : -7.5;
        P.y = e.y - P.h - 1;
        SFX.stomp();
      } else {
        takeHit(e.x + e.w/2);
      }
    }
  });
}

/* ---------- tembakan energi ---------- */
function updateShots(){
  var L = G.L;
  for (var i = G.shots.length - 1; i >= 0; i--){
    var s = G.shots[i];
    s.t++; s.x += s.vx;
    if (solid(Math.floor(s.x / TILE), Math.floor(s.y / TILE))){
      addPop(s.x, s.y, '✦', '#9fe8ff', 14);
      G.shots.splice(i, 1);
      SFX.bump();
      continue;
    }
    if (s.t > 110 || s.x < G.camX - 120 || s.x > G.camX + VW + 120){
      G.shots.splice(i, 1);
      continue;
    }
    for (var j = 0; j < L.enemies.length; j++){
      var e = L.enemies[j];
      if (e.dead || e.gone) continue;
      if (s.x + s.r > e.x && s.x - s.r < e.x + e.w &&
          s.y + s.r > e.y && s.y - s.r < e.y + e.h){
        if (e.type === 'B'){
          e.hp--; e.flash = 8; G.score += 100;
          addPop(e.x + e.w/2, e.y - 10, 'HIT! ' + Math.max(0, e.hp), '#ffd976', 16);
          SFX.stomp();
          if (e.hp <= 0){
            e.dead = true; e.deadT = 0; G.score += 2000;
            addPop(e.x + e.w/2, e.y - 30, 'BEAR PHARAOH DEFEATED! +2000', '#7dff9a', 20);
            SFX.power();
          }
          G.shots.splice(i, 1);
          break;
        }
        e.dead = true; e.deadT = 0; G.score += 100;
        addPop(e.x + e.w/2, e.y - 8, '+100', '#ffffff', 16);
        SFX.stomp();
        if (!s.sup) G.shots.splice(i, 1);
        break;
      }
    }
  }
}

/* ---------- satu langkah update saat bermain ---------- */
function updatePlay(){
  if (pressed.p){ G.paused = !G.paused; SFX.blip(); }
  if (pressed.m){ var on = SFX.toggleMusic(); addPopCenter(on ? 'MUSIC: ON' : 'MUSIC: OFF'); }
  if (pressed.r && !G.done){ loadLevel(G.levelIdx); }
  if (G.paused){ clearPressed(); return; }

  G.t++;
  /* burung lewat bawa kain PHAR.GG */
  if (G.bird.on){
    G.bird.t++; G.bird.x += G.bird.vx;
    G.bird.y += Math.sin(G.bird.t * 0.05) * 0.4;
    if (G.bird.x < -200 || G.bird.x > G.L.pxW + 200) G.bird.on = false;
  } else if (--G.birdT <= 0){
    var dir = Math.random() < 0.5 ? 1 : -1;
    G.bird = { on:true, t:0, vx:dir * 2.4,
               x: dir > 0 ? G.camX - 160 : G.camX + VW + 160,
               y: 70 + Math.random() * 90 };
    G.birdT = 700 + Math.random() * 700;
  }
  updateMplats();
  updatePlayer();
  updateEnemies();
  updateShots();

  /* efek melayang */
  for (var i = G.fx.length - 1; i >= 0; i--){
    var f = G.fx[i];
    f.t++; f.y -= 0.9;
    if (f.t > f.life) G.fx.splice(i, 1);
  }

  /* waktu */
  if (!G.done && !G.dying){
    G.timeLeft -= 1/60;
    if (G.timeLeft <= 0){
      G.timeLeft = 0;
      G.lives--;
      if (G.lives <= 0){ saveBest(); G.screen = 'over'; G.endT = 0; SFX.sad(); }
      else startDie();
    }
  }

  /* kamera */
  var target = clamp(G.P.x + G.P.w/2 - VW*0.40 + G.P.face*50, 0, G.L.pxW - VW);
  G.camX = lerp(G.camX, target, 0.12);

  clearPressed();
}

var centerPopT = 0, centerPopTxt = '';
function addPopCenter(txt){ centerPopTxt = txt; centerPopT = 60; }

function clearPressed(){ pressed = {}; }
