/* =========================================================
   PHARAOH QUEST — gambar: palet tema, tile, dekorasi,
   musuh, koin, bendera, pemain, paralaks
   ========================================================= */

var THEMES = {
  desert: {
    skyTop:'#6fb7d8', skyBot:'#ffe3a6', sun:'#fff3c0', sunGlow:'rgba(255,240,180,.55)',
    far:'#d9a95f', dune:'#e9c078',
    ground:'#a05f2c', groundTop:'#d99a55', groundDark:'#6e3f18', brick:'#8a5426',
    brickDark:'#543012', q:'#f5c542', qDark:'#8a5a10', used:'#9c7a4a',
    glyph:'rgba(120,80,30,.35)'
  },
  ruins: {
    skyTop:'#3b1f55', skyBot:'#ff9d5c', sun:'#ff7043', sunGlow:'rgba(255,120,70,.5)',
    far:'#2b183f', dune:'#4a2c5e',
    ground:'#9a8b78', groundTop:'#cdbb9a', groundDark:'#5c5044', brick:'#8a7a66',
    brickDark:'#4e4438', q:'#f5c542', qDark:'#8a5a10', used:'#7a6c58',
    glyph:'rgba(40,25,60,.5)'
  },
  tomb: {
    skyTop:'#171021', skyBot:'#241631', sun:'#000000', sunGlow:'rgba(0,0,0,0)',
    far:'#1d1428', dune:'#180f22',
    ground:'#5f4a72', groundTop:'#8a6ba6', groundDark:'#372a44', brick:'#544064',
    brickDark:'#2e2138', q:'#f5c542', qDark:'#8a5a10', used:'#4a3a58',
    glyph:'rgba(245,197,66,.16)'
  }
};
var GLYPHS = ['ankh','eye','bird','zig','sun'];

/* ---------- langit & latar belakang ---------- */
function drawSky(theme, camX, t){
  var P = THEMES[theme], g = CTX.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, P.skyTop); g.addColorStop(1, P.skyBot);
  CTX.fillStyle = g; CTX.fillRect(0, 0, VW, VH);

  if (theme !== 'tomb'){
    /* matahari */
    var sx = VW - 170 - camX * 0.05, sy = 92;
    CTX.fillStyle = P.sunGlow;
    CTX.beginPath(); CTX.arc(sx, sy, 74, 0, 7); CTX.fill();
    CTX.fillStyle = P.sun;
    CTX.beginPath(); CTX.arc(sx, sy, 36, 0, 7); CTX.fill();
  } else {
    /* hieroglif samar di dinding makam */
    CTX.fillStyle = P.glyph;
    var off = (camX * 0.3) % 160;
    for (var gx = -off; gx < VW; gx += 160){
      for (var gy = 40; gy < VH - 120; gy += 120){
        drawGlyphIcon('ankh', gx + 30, gy, 22);
        drawGlyphIcon('eye',  gx + 95, gy + 14, 26);
      }
    }
  }

  /* piramida jauh */
  var f = camX * 0.15, n = 5, i, bx, w = 420;
  CTX.fillStyle = P.far;
  for (i = 0; i < n + 2; i++){
    bx = i * w - (f % w) - w;
    var h2 = 150 + rnd(i + Math.floor(f / w)) * 90;
    CTX.beginPath();
    CTX.moveTo(bx, VH - 100);
    CTX.lineTo(bx + w * 0.5, VH - 100 - h2);
    CTX.lineTo(bx + w, VH - 100);
    CTX.closePath(); CTX.fill();
    CTX.fillStyle = 'rgba(255,255,255,.10)';
    CTX.beginPath();
    CTX.moveTo(bx + w * 0.5, VH - 100 - h2);
    CTX.lineTo(bx + w * 0.78, VH - 100);
    CTX.lineTo(bx + w * 0.5, VH - 100);
    CTX.closePath(); CTX.fill();
    CTX.fillStyle = P.far;
  }

  /* gundukan pasir dekat */
  var f2 = camX * 0.35, w2 = 300;
  CTX.fillStyle = P.dune;
  CTX.beginPath();
  CTX.moveTo(0, VH);
  for (i = -1; i < VW / 60 + 2; i++){
    var xx = i * 60 - (f2 % 60);
    CTX.quadraticCurveTo(xx + 30, VH - 130 - rnd(Math.floor((f2 + xx) / 60)) * 40, xx + 60, VH - 90);
  }
  CTX.lineTo(VW, VH); CTX.closePath(); CTX.fill();
}

/* ---------- ikon hieroglif kecil ---------- */
function drawGlyphIcon(kind, x, y, s){
  CTX.save(); CTX.translate(x, y);
  var u = s / 24;
  CTX.lineWidth = 3 * u; CTX.strokeStyle = CTX.fillStyle;
  if (kind === 'ankh'){
    CTX.beginPath(); CTX.ellipse(0, -8 * u, 5 * u, 7 * u, 0, 0, 7); CTX.stroke();
    CTX.beginPath(); CTX.moveTo(0, -1 * u); CTX.lineTo(0, 12 * u); CTX.stroke();
    CTX.beginPath(); CTX.moveTo(-7 * u, 2 * u); CTX.lineTo(7 * u, 2 * u); CTX.stroke();
  } else if (kind === 'eye'){
    CTX.beginPath(); CTX.moveTo(-10 * u, 0); CTX.quadraticCurveTo(0, -7 * u, 10 * u, 0);
    CTX.quadraticCurveTo(0, 6 * u, -10 * u, 0); CTX.stroke();
    CTX.beginPath(); CTX.arc(0, -1 * u, 3 * u, 0, 7); CTX.fill();
  } else if (kind === 'bird'){
    CTX.beginPath(); CTX.arc(2 * u, -8 * u, 4 * u, 0, 7); CTX.fill();
    CTX.fillRect(-6 * u, -5 * u, 9 * u, 10 * u);
    CTX.fillRect(3 * u, -9 * u, 5 * u, 2 * u);
  } else if (kind === 'zig'){
    CTX.beginPath(); CTX.moveTo(-10 * u, 2 * u);
    for (var i = 0; i < 4; i++) CTX.lineTo(-10 * u + (i * 5 + 2.5) * u, (i % 2 ? 2 : -4) * u);
    CTX.stroke();
  } else { /* sun */
    CTX.beginPath(); CTX.arc(0, 0, 7 * u, 0, 7); CTX.fill();
  }
  CTX.restore();
}

/* ---------- tile ---------- */
function bumpOffset(tx, ty){
  var b = G.bumps[tx + ',' + ty];
  if (!b) return 0;
  return -Math.sin(Math.min(1, (G.t - b) / 12) * Math.PI) * 8;
}

function drawTile(ch, tx, ty){
  var P = THEMES[G.L.theme], x = tx * TILE, y = ty * TILE;
  if (ch === '#'){
    CTX.fillStyle = P.ground; CTX.fillRect(x, y, TILE, TILE);
    CTX.fillStyle = P.groundDark;
    CTX.fillRect(x, y + TILE - 4, TILE, 4);
    CTX.fillRect(x + TILE - 2, y, 2, TILE);
    if (ty === 0 || !solid(tx, ty - 1)){
      CTX.fillStyle = P.groundTop; CTX.fillRect(x, y, TILE, 7);
      CTX.fillStyle = P.glyph;
      drawGlyphIcon(GLYPHS[(tx * 7 + ty * 3) % 5], x + 20, y + 24, 16);
    }
    CTX.strokeStyle = P.groundDark; CTX.lineWidth = 1;
    CTX.beginPath(); CTX.moveTo(x, y + 20); CTX.lineTo(x + TILE, y + 20); CTX.stroke();
  } else if (ch === 'B'){
    CTX.fillStyle = P.brick; CTX.fillRect(x, y, TILE, TILE);
    CTX.strokeStyle = P.brickDark; CTX.lineWidth = 2;
    CTX.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    CTX.beginPath();
    CTX.moveTo(x, y + 13); CTX.lineTo(x + TILE, y + 13);
    CTX.moveTo(x, y + 26); CTX.lineTo(x + TILE, y + 26);
    CTX.moveTo(x + 20, y); CTX.lineTo(x + 20, y + 13);
    CTX.moveTo(x + 10, y + 13); CTX.lineTo(x + 10, y + 26);
    CTX.moveTo(x + 30, y + 13); CTX.lineTo(x + 30, y + 26);
    CTX.moveTo(x + 20, y + 26); CTX.lineTo(x + 20, y + 40);
    CTX.stroke();
  } else if (ch === '?' || ch === 'U'){
    var off = bumpOffset(tx, ty);
    y += off;
    CTX.fillStyle = ch === '?' ? P.q : P.used;
    CTX.fillRect(x, y, TILE, TILE);
    CTX.strokeStyle = P.qDark; CTX.lineWidth = 3;
    CTX.strokeRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3);
    CTX.fillStyle = P.qDark;
    [[5,5],[TILE-7,5],[5,TILE-7],[TILE-7,TILE-7]].forEach(function(c){
      CTX.fillRect(x + c[0], y + c[1], 3, 3);
    });
    if (ch === '?'){
      CTX.fillStyle = P.qDark;
      CTX.font = 'bold 24px "Trebuchet MS",sans-serif';
      CTX.textAlign = 'center'; CTX.textBaseline = 'middle';
      CTX.fillText('?', x + TILE/2, y + TILE/2 + 2 + Math.sin(G.t * 0.1 + tx) * 1.5);
    }
  } else if (ch === '^'){
    CTX.fillStyle = '#cfd2d6'; CTX.strokeStyle = '#5b5f66'; CTX.lineWidth = 2;
    for (var i = 0; i < 3; i++){
      var sx = x + i * 14;
      CTX.beginPath();
      CTX.moveTo(sx + 1, y + TILE);
      CTX.lineTo(sx + 7, y + 8);
      CTX.lineTo(sx + 13, y + TILE);
      CTX.closePath(); CTX.fill(); CTX.stroke();
    }
  }
}

/* ---------- dekorasi dunia ---------- */
function drawDeco(d){
  var x = d.x * TILE, gy = G.L.ground * TILE, t = G.t;
  CTX.save();
  if (d.type === 'palm'){
    CTX.strokeStyle = '#7a5230'; CTX.lineWidth = 8;
    CTX.beginPath(); CTX.moveTo(x, gy);
    CTX.quadraticCurveTo(x + 8, gy - 70, x + 4, gy - 120); CTX.stroke();
    CTX.strokeStyle = '#3f7d3a'; CTX.lineWidth = 6;
    for (var i = 0; i < 5; i++){
      var a = -Math.PI/2 + (i - 2) * 0.5 + Math.sin(t * 0.02 + d.x) * 0.03;
      CTX.beginPath(); CTX.moveTo(x + 4, gy - 120);
      CTX.quadraticCurveTo(x + 4 + Math.cos(a) * 34, gy - 120 + Math.sin(a) * 26 - 10,
                           x + 4 + Math.cos(a) * 52, gy - 120 + Math.sin(a) * 40);
      CTX.stroke();
    }
  } else if (d.type === 'statue'){
    CTX.fillStyle = '#c9a25e';
    CTX.fillRect(x - 14, gy - 92, 28, 92);
    CTX.fillStyle = '#e8c886';
    CTX.beginPath(); /* nemes */
    CTX.moveTo(x - 18, gy - 78); CTX.lineTo(x, gy - 100); CTX.lineTo(x + 18, gy - 78);
    CTX.closePath(); CTX.fill();
    CTX.fillStyle = '#8a6a3a'; CTX.fillRect(x - 10, gy - 80, 20, 10);
  } else if (d.type === 'obelisk'){
    CTX.fillStyle = '#d8b271';
    CTX.beginPath();
    CTX.moveTo(x - 10, gy); CTX.lineTo(x - 6, gy - 150); CTX.lineTo(x, gy - 168);
    CTX.lineTo(x + 6, gy - 150); CTX.lineTo(x + 10, gy); CTX.closePath(); CTX.fill();
    CTX.fillStyle = 'rgba(255,235,170,.9)';
    CTX.beginPath(); CTX.moveTo(x - 6, gy - 150); CTX.lineTo(x, gy - 168); CTX.lineTo(x + 6, gy - 150);
    CTX.closePath(); CTX.fill();
    CTX.fillStyle = 'rgba(120,80,30,.5)';
    for (var k = 0; k < 4; k++) drawGlyphIcon(GLYPHS[k % 5], x, gy - 40 - k * 28, 12);
  } else if (d.type === 'sphinx'){
    CTX.fillStyle = '#caa25e';
    CTX.fillRect(x - 46, gy - 34, 92, 34);           /* badan */
    CTX.beginPath(); CTX.arc(x - 40, gy - 46, 18, 0, 7); CTX.fill(); /* kepala */
    CTX.beginPath();
    CTX.moveTo(x - 56, gy - 40); CTX.lineTo(x - 40, gy - 70); CTX.lineTo(x - 24, gy - 40);
    CTX.closePath(); CTX.fill();                      /* nemes */
    CTX.fillRect(x + 30, gy - 46, 16, 46);
  } else if (d.type === 'torch'){
    CTX.strokeStyle = '#6a4a2a'; CTX.lineWidth = 6;
    CTX.beginPath(); CTX.moveTo(x, gy); CTX.lineTo(x, gy - 90); CTX.stroke();
    CTX.fillStyle = '#8a6a3a'; CTX.fillRect(x - 7, gy - 98, 14, 10);
    var fl = Math.sin(t * 0.3 + d.x) * 4;
    CTX.fillStyle = 'rgba(255,150,50,.25)';
    CTX.beginPath(); CTX.arc(x, gy - 108, 34 + fl, 0, 7); CTX.fill();
    CTX.fillStyle = '#ff9d3c';
    CTX.beginPath(); CTX.ellipse(x, gy - 108, 8, 14 + fl * 0.6, 0, 0, 7); CTX.fill();
    CTX.fillStyle = '#ffe08a';
    CTX.beginPath(); CTX.ellipse(x, gy - 104, 4, 8, 0, 0, 7); CTX.fill();
  } else if (d.type === 'billboard'){
    var bw = 320, bh = 66, bx = x - bw / 2, by = gy + 10;
    CTX.fillStyle = 'rgba(14,5,9,.92)';
    rrect(bx, by, bw, bh, 8); CTX.fill();
    CTX.strokeStyle = '#e84142'; CTX.lineWidth = 2.5;
    rrect(bx, by, bw, bh, 8); CTX.stroke();
    drawPharLogo(bx + 34, by + 33, 44);
    CTX.textAlign = 'left'; CTX.textBaseline = 'middle';
    CTX.fillStyle = '#ffd976';
    CTX.font = 'bold 19px "Trebuchet MS",Verdana,sans-serif';
    CTX.fillText('PHARAOH EXCHANGE', bx + 64, by + 21);
    CTX.font = 'bold 11px "Trebuchet MS",Verdana,sans-serif';
    CTX.fillStyle = '#f2f2f2';
    CTX.fillText('THE NATIVE LIQUIDITY LAYER ON', bx + 64, by + 45);
    var tw2 = CTX.measureText('THE NATIVE LIQUIDITY LAYER ON').width;
    CTX.fillStyle = '#e84142';
    CTX.fillText('AVAX', bx + 70 + tw2, by + 45);
    drawAvaxIcon(bx + 70 + tw2 + 36, by + 45, 8);
  } else if (d.type === 'logo'){
    drawPharLogo(x, gy + 58, 84);
  } else if (d.type === 'sign'){
    var msg = (d.text || 'PHAR.GG').replace(/<>/g,'⇄').replace(/>/g,'→').replace(/ - /g,' · ');
    CTX.font = 'bold 15px "Trebuchet MS",Verdana,sans-serif';
    var tw = CTX.measureText(msg).width;
    var pw = tw + 34, ph = 28, px = x - pw / 2, py = gy + 18;
    CTX.fillStyle = 'rgba(16,6,10,.90)';
    rrect(px, py, pw, ph, 7); CTX.fill();
    CTX.strokeStyle = '#e84142'; CTX.lineWidth = 2;
    rrect(px, py, pw, ph, 7); CTX.stroke();
    CTX.fillStyle = '#e84142';
    CTX.beginPath();
    CTX.moveTo(px + 12, py + 7); CTX.lineTo(px + 19, py + 21); CTX.lineTo(px + 5, py + 21);
    CTX.closePath(); CTX.fill();
    CTX.fillStyle = '#ffd976'; CTX.textAlign = 'left'; CTX.textBaseline = 'middle';
    CTX.fillText(msg, px + 25, py + ph / 2 + 1);
  } else if (d.type === 'sarcophagus'){
    CTX.fillStyle = '#7a5a9a';
    CTX.beginPath();
    CTX.moveTo(x - 16, gy); CTX.lineTo(x - 16, gy - 70);
    CTX.quadraticCurveTo(x, gy - 96, x + 16, gy - 70);
    CTX.lineTo(x + 16, gy); CTX.closePath(); CTX.fill();
    CTX.strokeStyle = '#f5c542'; CTX.lineWidth = 3; CTX.stroke();
    CTX.fillStyle = '#f5c542';
    drawGlyphIcon('ankh', x, gy - 44, 20);
  }
  CTX.restore();
}

/* ---------- objek ---------- */
function drawCoin(x, y, t, ph){
  var s = Math.abs(Math.cos(t * 0.08 + ph));
  CTX.save(); CTX.translate(x, y);
  CTX.fillStyle = '#f5c542'; CTX.strokeStyle = '#8a5a10'; CTX.lineWidth = 2;
  CTX.beginPath(); CTX.ellipse(0, 0, 12 * Math.max(0.15, s), 12, 0, 0, 7);
  CTX.fill(); CTX.stroke();
  if (s > 0.4){ /* glyph piramida kecil = token PHAR */
    CTX.fillStyle = '#8a5a10';
    CTX.beginPath();
    CTX.moveTo(0, -7); CTX.lineTo(6, 6); CTX.lineTo(-6, 6);
    CTX.closePath(); CTX.fill();
  }
  CTX.restore();
}

function drawAnkhItem(x, y, t){
  CTX.save(); CTX.translate(x, y + Math.sin(t * 0.06) * 4);
  CTX.fillStyle = 'rgba(245,197,66,.22)';
  CTX.beginPath(); CTX.arc(0, 0, 26, 0, 7); CTX.fill();
  CTX.fillStyle = '#ffd976'; CTX.strokeStyle = '#8a5a10'; CTX.lineWidth = 2;
  drawGlyphIcon('ankh', 0, 0, 30);
  CTX.restore();
}

function drawGemItem(x, y, t){ /* kristal AVAX */
  CTX.save(); CTX.translate(x, y + Math.sin(t * 0.05 + 1) * 4);
  CTX.fillStyle = 'rgba(232,65,66,.25)';
  CTX.beginPath(); CTX.arc(0, 0, 24, 0, 7); CTX.fill();
  CTX.fillStyle = '#e84142'; CTX.strokeStyle = '#7d1420'; CTX.lineWidth = 2;
  CTX.beginPath();
  CTX.moveTo(0, -15); CTX.lineTo(13, 9); CTX.lineTo(-13, 9);
  CTX.closePath(); CTX.fill(); CTX.stroke();
  CTX.fillStyle = '#ffffff';
  CTX.beginPath();
  CTX.moveTo(4, -3); CTX.lineTo(9, 6); CTX.lineTo(1, 6);
  CTX.closePath(); CTX.fill();
  CTX.restore();
}

/* ---------- piramida merah: gerbang finish ---------- */
function drawPyramid(x, gy){
  if (!pyramidImage || !pyramidImage.complete || !pyramidImage.width) return;
  var h = 290, w = h * pyramidImage.width / pyramidImage.height;
  var cx = x + 90; /* pintu sejajar pusat piramida */
  CTX.save();
  CTX.shadowColor = 'rgba(232,65,66,.55)'; CTX.shadowBlur = 26;
  CTX.drawImage(pyramidImage, cx - w/2, gy - h + 6, w, h); /* dasar tertanam 6px di tanah */
  CTX.restore();
  /* pintu gerbang bercahaya */
  var pulse = 0.75 + Math.sin(G.t * 0.08) * 0.25;
  var pw = 34, ph = 54;
  var g = CTX.createLinearGradient(0, gy - ph, 0, gy);
  g.addColorStop(0, 'rgba(255,224,140,' + (0.95 * pulse) + ')');
  g.addColorStop(1, 'rgba(255,110,40,' + (0.85 * pulse) + ')');
  CTX.fillStyle = g;
  CTX.beginPath();
  CTX.moveTo(cx - pw/2, gy + 6);
  CTX.lineTo(cx - pw/2, gy - ph + 12);
  CTX.quadraticCurveTo(cx, gy - ph - 8, cx + pw/2, gy - ph + 12);
  CTX.lineTo(cx + pw/2, gy + 6);
  CTX.closePath(); CTX.fill();
  CTX.strokeStyle = '#ffd976'; CTX.lineWidth = 2; CTX.stroke();
}

function drawFlag(x, gy){
  var top = gy - 5 * TILE;
  CTX.fillStyle = '#d8b271'; CTX.fillRect(x - 3, top, 6, 5 * TILE);
  CTX.fillStyle = '#f5c542';
  CTX.beginPath(); CTX.arc(x, top, 9, 0, 7); CTX.fill();
  var wv = Math.sin(G.t * 0.1) * 4;
  CTX.fillStyle = '#e84142'; CTX.strokeStyle = '#7d1420'; CTX.lineWidth = 2;
  CTX.beginPath();
  CTX.moveTo(x + 3, top + 6);
  CTX.lineTo(x + 64 + wv, top + 22);
  CTX.lineTo(x + 3, top + 40);
  CTX.closePath(); CTX.fill(); CTX.stroke();
  /* logo segitiga Avalanche */
  CTX.fillStyle = '#ffffff';
  CTX.beginPath();
  var fx = x + 26 + wv * 0.4, fy = top + 23;
  CTX.moveTo(fx, fy - 9); CTX.lineTo(fx + 8, fy + 6); CTX.lineTo(fx - 8, fy + 6);
  CTX.closePath(); CTX.fill();
}

/* ---------- musuh (sprite AI) ---------- */
var enemyImgs = {};
Object.keys(ENEMY_ART).forEach(function(k){
  var im = new Image(); im.src = ENEMY_ART[k].src; enemyImgs[k] = im;
});
/* ---------- simbol brand (vektor, selalu tajam) ---------- */
function drawPharLogo(cx, cy, sz){
  CTX.save();
  CTX.shadowColor = 'rgba(232,65,66,.55)'; CTX.shadowBlur = 10;
  CTX.fillStyle = '#e84142';
  var n = 7, bw = sz / n;
  for (var i = 0; i < n; i++){
    var hgt = sz * (1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 + 0.55));
    CTX.fillRect(cx - sz / 2 + i * bw + bw * 0.18, cy + sz / 2 - hgt, bw * 0.64, hgt);
  }
  CTX.restore();
}
function drawAvaxIcon(x, y, r){
  CTX.fillStyle = '#e84142';
  CTX.beginPath(); CTX.arc(x, y, r, 0, 7); CTX.fill();
  CTX.fillStyle = '#ffffff';
  CTX.beginPath();
  CTX.moveTo(x, y - r * 0.62); CTX.lineTo(x + r * 0.6, y + r * 0.5); CTX.lineTo(x - r * 0.6, y + r * 0.5);
  CTX.closePath(); CTX.fill();
  CTX.fillStyle = '#e84142';
  CTX.beginPath();
  CTX.moveTo(x + r * 0.18, y - r * 0.05); CTX.lineTo(x + r * 0.52, y + r * 0.5); CTX.lineTo(x + r * 0.05, y + r * 0.5);
  CTX.closePath(); CTX.fill();
}
function drawBird(){
  var b = G.bird;
  if (!b || !b.on) return;
  var sd = b.vx > 0 ? 1 : -1;
  CTX.save(); CTX.translate(b.x, b.y);
  var wv = Math.sin(b.t * 0.12) * 3;
  CTX.fillStyle = '#69121b'; CTX.strokeStyle = '#e84142'; CTX.lineWidth = 2;
  CTX.beginPath();
  CTX.moveTo(-sd * 10, 2); CTX.lineTo(-sd * 96, 6 + wv);
  CTX.lineTo(-sd * 96, 28 + wv); CTX.lineTo(-sd * 10, 24);
  CTX.closePath(); CTX.fill(); CTX.stroke();
  CTX.fillStyle = '#ffd976';
  CTX.font = 'bold 13px "Trebuchet MS",Verdana,sans-serif';
  CTX.textAlign = 'center'; CTX.textBaseline = 'middle';
  CTX.fillText('PHAR.GG', -sd * 53, 16 + wv * 0.5);
  CTX.strokeStyle = '#d9b48a'; CTX.lineWidth = 1.5;
  CTX.beginPath();
  CTX.moveTo(0, -2); CTX.lineTo(-sd * 10, 3);
  CTX.moveTo(0, -2); CTX.lineTo(-sd * 94, 7 + wv);
  CTX.stroke();
  var fl = Math.sin(b.t * 0.3) * 9;
  CTX.fillStyle = '#33203a';
  CTX.beginPath(); CTX.ellipse(0, 0, 14, 8, 0, 0, 7); CTX.fill();
  CTX.beginPath(); CTX.arc(sd * 12, -4, 6, 0, 7); CTX.fill();
  CTX.fillStyle = '#f5c542';
  CTX.beginPath(); CTX.moveTo(sd * 17, -5); CTX.lineTo(sd * 24, -3); CTX.lineTo(sd * 17, -1);
  CTX.closePath(); CTX.fill();
  CTX.fillStyle = '#ffffff';
  CTX.beginPath(); CTX.arc(sd * 13, -5, 1.8, 0, 7); CTX.fill();
  CTX.strokeStyle = '#33203a'; CTX.lineWidth = 4;
  CTX.beginPath(); CTX.moveTo(-2, -2); CTX.quadraticCurveTo(-12, -12 - fl, -22, -8 - fl); CTX.stroke();
  CTX.beginPath(); CTX.moveTo(2, -2); CTX.quadraticCurveTo(-2, -16 - fl, -8, -14 - fl); CTX.stroke();
  CTX.restore();
}

function drawEnemy(e){
  var img = enemyImgs[e.type === 'B' ? 'b' : e.type];
  if (!img || !img.width) return;
  CTX.save();
  var cx = e.x + e.w / 2;
  if (e.dead){
    CTX.globalAlpha = Math.max(0, 1 - e.deadT / 30);
    CTX.translate(cx, e.y + e.h);
    CTX.scale(1, 0.4);
    CTX.translate(-cx, -(e.y + e.h));
  }
  CTX.translate(cx, e.y + e.h);
  CTX.scale(e.vx < 0 ? -1 : 1, 1);
  var h = e.type === 's' ? e.h * 1.3 : (e.type === 'B' ? e.h * 1.06 : e.h * 1.15);
  var w = h * img.width / img.height;
  if (e.type === 'B' && e.charge > 0){
    CTX.shadowColor = 'rgba(232,65,66,.9)'; CTX.shadowBlur = 26;
  }
  CTX.drawImage(img, -w / 2, -h, w, h);
  CTX.shadowBlur = 0;
  if (e.type === 'B'){
    /* mahkota nemes firaun di kepala bear */
    var hx = w * 0.14, hy = -h + 4, cw = 46, chh = 26;
    CTX.fillStyle = '#f5c542';
    CTX.beginPath();
    CTX.moveTo(hx - cw/2, hy + chh);
    CTX.lineTo(hx - cw*0.30, hy);
    CTX.lineTo(hx + cw*0.30, hy);
    CTX.lineTo(hx + cw/2, hy + chh);
    CTX.closePath(); CTX.fill();
    CTX.fillStyle = '#e84142';
    for (var st2 = -2; st2 <= 2; st2++) CTX.fillRect(hx + st2*8 - 2, hy + 3, 4, chh - 6);
    if (e.flash > 0){
      CTX.globalAlpha = 0.55;
      CTX.fillStyle = '#ffffff';
      CTX.beginPath(); CTX.ellipse(0, -h/2, w*0.55, h*0.55, 0, 0, 7); CTX.fill();
    }
  }
  CTX.restore();
}

/* ---------- pemain ---------- */
var charImgs = [];
CHARACTERS.forEach(function(c){
  var im = new Image(); im.src = c.src; charImgs.push(im);
});

/* Indeks adegan: 0 diam, 1 lari, 2 serang, 3 bertahan, 4 super, 5 terkena */
function drawPlayer(){
  var P = G.P;
  if (P.invincibleT > 0 && (G.t % 8 < 4) && !G.dying && P.hurtT <= 0) return;

  /* mengecil saat masuk piramida finish */
  var ent = (G.enterT > 0) ? Math.max(0, 1 - G.enterT / 45) : 1;
  if (ent <= 0.02) return;

  /* bayangan */
  CTX.fillStyle = 'rgba(0,0,0,' + (0.25 * ent) + ')';
  CTX.beginPath(); CTX.ellipse(P.x + P.w / 2, P.groundY, 20 * ent, 6 * ent, 0, 0, 7); CTX.fill();

  var idx;
  if (G.dying || P.hurtT > 0)            idx = 5; /* terkena */
  else if (P.defending)                  idx = 3; /* bertahan */
  else if (P.attackT > 0)                idx = 2; /* serang */
  else if (P.powerT > 0)                 idx = 4; /* super */
  else if (!P.grounded || Math.abs(P.vx) > 0.5) idx = 1; /* lari */
  else                                   idx = 0; /* diam */

  /* aura kekuatan ankh (mode super) */
  if (P.powerT > 0){
    var r = 48 + Math.sin(G.t * 0.2) * 6;
    var g = CTX.createRadialGradient(P.x + P.w/2, P.y + P.h/2, 8, P.x + P.w/2, P.y + P.h/2, r);
    g.addColorStop(0, 'rgba(255,120,60,.45)');
    g.addColorStop(1, 'rgba(255,120,60,0)');
    CTX.fillStyle = g;
    CTX.beginPath(); CTX.arc(P.x + P.w/2, P.y + P.h/2, r, 0, 7); CTX.fill();
    if (P.powerT < 120 && G.t % 10 < 5) return; /* berkedip mau habis */
  }

  var img = charImgs[idx];
  CTX.save();
  CTX.translate(P.x + P.w / 2, P.y + P.h);
  CTX.scale((P.face < 0 ? -1 : 1) * ent, ent);
  if (!P.grounded) CTX.rotate(P.face * -0.06);
  var h = P.h + 2, w = h * img.width / img.height;
  w = Math.min(w, 96);
  CTX.drawImage(img, -w / 2, -h, w, h);
  CTX.restore();
}

/* ---------- tembakan energi ---------- */
function drawShot(s){
  var dir = s.vx > 0 ? 1 : -1;
  var glow = s.sup ? 'rgba(255,140,60,.45)' : 'rgba(90,200,255,.40)';
  var core = s.sup ? '#ffd976' : '#d8f6ff';
  CTX.save();
  CTX.strokeStyle = glow; CTX.lineWidth = 4;
  CTX.beginPath();
  CTX.moveTo(s.x - dir * s.r * 2.2, s.y);
  CTX.lineTo(s.x - dir * (s.r * 2.2 + 30), s.y);
  CTX.stroke();
  CTX.fillStyle = glow;
  CTX.beginPath(); CTX.ellipse(s.x, s.y, s.r * 2.4, s.r * 1.4, 0, 0, 7); CTX.fill();
  CTX.fillStyle = core;
  CTX.beginPath(); CTX.ellipse(s.x, s.y, s.r * 1.5, s.r * 0.7, 0, 0, 7); CTX.fill();
  CTX.restore();
}

/* ---------- teks timbul (skor melayang) ---------- */
function drawPops(){
  G.fx.forEach(function(f){
    CTX.globalAlpha = Math.max(0, 1 - f.t / f.life);
    CTX.fillStyle = f.color || '#ffd976';
    CTX.font = 'bold ' + (f.size || 16) + 'px "Trebuchet MS",sans-serif';
    CTX.textAlign = 'center';
    CTX.fillText(f.txt, f.x - G.camX, f.y);
    CTX.globalAlpha = 1;
  });
}
