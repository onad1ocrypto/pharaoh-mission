/* Node harness: jalankan logika game tanpa browser untuk verifikasi. */
'use strict';
const fs = require('fs');
const vm = require('vm');

const js = fs.readFileSync('/home/user/build/combined.js', 'utf8');

function gradStub(){ return { addColorStop(){} }; }
const ctxStub = {
  canvas:null, fillStyle:null, strokeStyle:null, lineWidth:1, font:'', textAlign:'', textBaseline:'',
  globalAlpha:1, shadowColor:'', shadowBlur:0,
  fillRect(){}, strokeRect(){}, clearRect(){}, beginPath(){}, closePath(){}, moveTo(){}, lineTo(){},
  arc(){}, ellipse(){}, fill(){}, stroke(){}, quadraticCurveTo(){}, arcTo(){}, save(){}, restore(){},
  translate(){}, scale(){}, rotate(){}, drawImage(){}, fillText(){}, strokeText(){}, measureText:(t)=>({width:(t||'').length*8}),
  createLinearGradient:gradStub, createRadialGradient:gradStub,
};
const canvasEl = {
  style:{}, width:960, height:560,
  getContext:()=>ctxStub,
  addEventListener(){},
  getBoundingClientRect:()=>({ left:0, top:0, width:960, height:560 }),
};
const elStub = { style:{}, classList:{ add(){}, remove(){} }, getAttribute:()=>'left', addEventListener(){}, focus(){} };

const listeners = {};
const sandbox = {
  console, Math, JSON, performance:{ now:()=>Date.now() },
  requestAnimationFrame(){},
  localStorage:{ _d:{}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); } },
  navigator:{ maxTouchPoints:0 },
  Image: class { constructor(){ this.src=''; this.width=100; this.height=200; this.complete=true; } },
  document:{
    getElementById:(id)=> id === 'game' ? canvasEl : elStub,
    querySelectorAll:()=>[],
  },
  setInterval:()=>0, clearInterval(){}, setTimeout:(f)=>0, clearTimeout(){},
};
sandbox.window = sandbox;
sandbox.window.addEventListener = (t,f)=>{ (listeners[t] = listeners[t] || []).push(f); };
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(js, sandbox, { filename:'combined.js' });

const run = (code)=> vm.runInContext(code, sandbox, { filename:'test.js' });

let fails = 0;
function check(name, cond){
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name);
  if (!cond) fails++;
}

/* ---- struktur level ---- */
check('3 level terdefinisi', run('LEVELS.length') === 3);
check('build level 1 lebar 150', run('buildLevel(0).width') === 150);
check('level 2 punya platform gerak', run('buildLevel(1).mplats.length') === 3);
check('level 3 punya 7 platform gerak', run('buildLevel(2).mplats.length') === 7);

/* ---- mulai game ---- */
run('startGame(0)');
check('screen play', run('G.screen') === 'play');
check('lives 3', run('G.lives') === 3);

/* ---- gerak kanan ---- */
const x0 = run('G.P.x');
run('keys.right = true; for (var i=0;i<90;i++) updatePlay();');
const x1 = run('G.P.x');
check('pemain bergerak ke kanan (' + x0.toFixed(1) + ' -> ' + x1.toFixed(1) + ')', x1 > x0 + 50);
run('keys.right = false;');

/* ---- lompat ---- */
run('pressed.jump = true; updatePlay(); pressed.jump = false; keys.jump = true;');
const vy = run('G.P.vy');
check('vy negatif saat lompat', vy < 0);
run('for (var i=0;i<80;i++) updatePlay(); keys.jump=false;');
check('mendarat kembali (grounded)', run('G.P.grounded') === true);
check('tidak NaN posisi', Number.isFinite(run('G.P.x')) && Number.isFinite(run('G.P.y')));

/* ---- ambil koin ---- */
run('G.P.x = 12*TILE; G.P.y = 6*TILE; G.P.vy=0; var c0=G.coins; for (var i=0;i<30;i++) updatePlay();');
check('koin bertambah', run('G.coins') > run('0') && run('G.coins') >= 1);

/* ---- stomp musuh ---- */
run('var e = G.L.enemies[0]; e.vx = 0; G.P.x = e.x + 4; G.P.y = e.y - 120; G.P.vy = 4; for (var i=0;i<60 && !e.dead;i++) updatePlay();');
check('musuh pertama mati diinjak', run('G.L.enemies[0].dead') === true);

/* ---- blok ? (hantam samping dari atas platform) ---- */
run("G.P.x = 10*TILE+2; G.P.y = 8*TILE-62; G.P.vy = 0; keys.right = true; var s0=G.score; for (var i=0;i<25;i++) updatePlay(); keys.right=false;");
check('blok ? jadi terpakai', run("G.L.grid[7][11] === 'U'") === true);
check('skor naik dari blok ?', run('G.score') > run('s0'));

/* ---- tembakan energi ---- */
run('var e2 = G.L.enemies[2]; e2.vx = 0; G.P.x = e2.x - 160; G.P.y = e2.y; G.P.vy = 0; G.camX = G.P.x - 400; pressed.attack = true; updatePlay(); pressed.attack = false; for (var i=0;i<80 && !e2.dead;i++) updatePlay();');
check('tembakan energi mengalahkan musuh', run('G.L.enemies[2].dead') === true);

/* ---- bertahan menahan musuh ---- */
run('keys.defend = true; G.P.invincibleT = 0; G.P.powerT = 0; var e3 = G.L.enemies[3]; e3.gone = false; e3.dead = false; e3.y = G.L.ground*TILE - 30; e3.vx = -1.2; e3.x = G.P.x + 150; G.P.y = G.L.ground*TILE - 62; G.P.vy = 0; var lv = G.lives; for (var i=0;i<150;i++) updatePlay(); keys.defend = false;');
check('bertahan: nyawa tidak berkurang', run('G.lives') === run('lv'));
check('musuh mental saat ditangkis', run('G.L.enemies[3].vx') > 0);

/* ---- ankh power-up ---- */
run('G.P.x = 46*TILE; G.P.y = 7*TILE; for (var i=0;i<20;i++) updatePlay();');
check('power ankh aktif', run('G.P.powerT') > 0);

/* ---- jurang -> respawn ---- */
run('var l0=G.lives; G.P.x = 31*TILE; G.P.y = 12*TILE; for (var i=0;i<40;i++) updatePlay();');
check('jatuh ke jurang mengurangi nyawa', run('G.lives') < run('3'));

/* ---- bendera selesai ---- */
run('G.P.x = (G.L.flag-2)*TILE; G.P.y = (G.L.ground)*TILE - 64; keys.right = true; for (var i=0;i<60;i++) updatePlay(); keys.right = false;');
check('bendera memicu selesai', run('G.done') === true);
run('for (var i=0;i<160;i++) updatePlay();');
check('naik ke level 2', run('G.levelIdx') === 1);

/* ---- game over ---- */
run('G.lives = 1; startDie(); for (var i=0;i<120;i++) updatePlay();');
check('screen game over', run('G.screen') === 'over');

/* ---- layar menu ---- */
run("pressed.enter = true; updateMenus();");
check('over + enter -> pulang ke home (flow baru)', run('G.screen') === 'title');

/* ---- beruang market tak bisa diinjak ---- */
run('loadLevel(0); var eb = G.L.enemies.filter(function(e){return e.type==="b";})[0]; eb.vx = 0; eb.x = 96*TILE; G.lives = 3; G.P.invincibleT = 0; G.P.powerT = 0; G.P.x = eb.x + 6; G.P.y = eb.y - 120; G.P.grounded = false; G.P.vy = 4; for (var i=0;i<60;i++) updatePlay();');
check('beruang tidak mati diinjak', run('G.L.enemies.filter(function(e){return e.type==="b";})[0].dead') === false);
check('pemain kena damage oleh beruang', run('G.lives') < 3);

/* ---- double jump ---- */
run('startGame(); G.P.x = 200;');
run('keys.jump = true; pressed.jump = true; updatePlay(); pressed.jump = false; for (var i=0;i<25;i++) updatePlay(); keys.jump = false;');
run('keys.jump = true; pressed.jump = true; updatePlay(); pressed.jump = false; keys.jump = false;');
check('double jump: ketuk 2x naik lagi', run('G.P.jumps') === 2 && run('G.P.vy') < 0);
run('for (var i=0;i<70;i++) updatePlay();');

/* ---- musuh berbalik di tepi jurang ---- */
run('loadLevel(0); var es = G.L.enemies[1]; es.x = 28*TILE; es.vx = 1.2; es.vy = 0; for (var i=0;i<300;i++) updatePlay();');
check('musuh tidak jatuh ke jurang', run('G.L.enemies[1].gone') !== true && run('G.L.enemies[1].y') <= 440);

/* ---- leaderboard (fallback lokal di node) ---- */
run('openBoard();');
check('board fallback lokal berisi array', Array.isArray(run('G.boardData')));
run("G.screen='board'; __pq.render(); G.screen='title';");
check('render board tanpa error', true);

/* ---- tuning level ---- */
check('L2: semua jurang <=3', run('LEVELS[1].pits.every(function(p){return p[1]-p[0]+1<=3;})') === true);
check('L3: semua jurang <=4', run('LEVELS[2].pits.every(function(p){return p[1]-p[0]+1<=4;})') === true);

/* ---- boss fight ---- */
run('loadLevel(2); var bo=null; G.L.enemies.forEach(function(e){ if(e.type==="B") bo=e; });');
check('boss ada di level 3', run('G.L.enemies.some(function(e){return e.type==="B";})') === true);
check('boss hp 6', run('G.L.enemies.filter(function(e){return e.type==="B";})[0].hp') === 6);
run('G.P.x = (G.L.flag-2)*TILE; G.P.y = G.L.ground*TILE-64; keys.right = true; for (var i=0;i<40;i++) updatePlay(); keys.right = false;');
check('flag terkunci selama boss hidup', run('G.done') === false);
run('var bo2 = G.L.enemies.filter(function(e){return e.type==="B";})[0]; G.P.x = bo2.x - 120; G.P.y = G.L.ground*TILE - 64; G.P.face = 1; G.camX = G.P.x - 300; bo2.chargeT = 99999; bo2.vx = 0; bo2.dir = 0; G.P.invincibleT = 99999; G.P.hp = 3;');
run('for (var k=0;k<10;k++){ var bb = G.L.enemies.filter(function(e){return e.type==="B";})[0]; if (bb.dead) break; pressed.attack = true; updatePlay(); pressed.attack = false; for (var i=0;i<45;i++) updatePlay(); }');
check('6 tembakan menumbangkan boss', run('G.L.enemies.filter(function(e){return e.type==="B";})[0].dead') === true);
run('G.P.x = (G.L.flag-2)*TILE; G.P.y = G.L.ground*TILE-64; G.P.invincibleT = 99999; keys.right = true; for (var i=0;i<60;i++) updatePlay(); keys.right = false;');
check('flag terbuka setelah boss kalah', run('G.done') === true);

/* ---- tombol leaderboard di title ---- */
run("G.screen='title'; canvasClick(LEADER_BTN.x + 10, LEADER_BTN.y + 10);");
check('tombol HALL OF FAME membuka board', run('G.screen') === 'board');
run("G.screen='title';");

/* ---- piramida finish & alur pulang ke home ---- */
check('aset piramida finish termuat (data URI png)', run('typeof pyramidImage !== "undefined" && !!pyramidImage && String(pyramidImage.src).indexOf("data:image/png") === 0'));
check('kain burung bertuliskan PHAR.GG (bukan pharaoh.gg)', String(run('String(drawBird)')).indexOf('PHAR.GG') >= 0 && String(run('String(drawBird)')).indexOf('PHARAOH.GG') < 0);
run('loadLevel(0); G.done = true; G.doneT = 0; G.enterT = 0; G.P.x = G.L.flag*TILE + 90 - 34; G.P.y = G.L.ground*TILE - 64;');
run('for (var i=0;i<30;i++) updatePlay();');
check('pemain menyusut masuk piramida (enterT naik)', run('G.enterT') > 0);
run('for (var i=0;i<120;i++) updatePlay();');
check('setelah masuk piramida lanjut level berikutnya', run('G.levelIdx') === 1);
run('G.screen = "over"; G.endT = 0; G.submitted = true;');
run('for (var i=0;i<310;i++) __pq.step();');
check('game over otomatis berhenti & pulang ke home', run('G.screen') === 'title');
check('panel leaderboard home terisi setelah pulang', run('Array.isArray(G.titleTop)'));
run('G.screen = "over"; G.endT = 0; pressed.enter = true; updateMenus();');
check('ENTER/tap di game over langsung pulang (bukan restart)', run('G.screen') === 'title');
run('G.screen = "complete"; G.endT = 0;');
run('for (var i=0;i<370;i++) __pq.step();');
check('quest complete otomatis pulang ke home', run('G.screen') === 'title');
run('G.screen = "play"; loadLevel(0);');

/* ---- render semua layar (deteksi error runtime di kode gambar) ---- */
try {
  run('var render = __pq.render;');
  run("G.screen='title'; render();");
  check('render title tanpa error', true);
  run("G.screen='intro'; render();");
  check('render intro tanpa error', true);
  run("G.bird = {on:true, t:10, vx:2.4, x:400, y:100}; startGame(0); G.screen='play'; render();");
  check('render play tanpa error', true);
  run("for (var i=0;i<240;i++) updatePlay(); render();");
  check('render play setelah 4 detik tanpa error', true);
  run("G.paused=true; render(); G.paused=false;");
  check('render pause tanpa error', true);
  run("G.done=true; G.doneT=40; render();");
  check('render overlay level selesai tanpa error', true);
  run("loadLevel(2); render();");
  check('render level 3 (tema makam+obor) tanpa error', true);
  run("loadLevel(1); render();");
  check('render level 2 (tema reruntuhan) tanpa error', true);
  run("G.screen='over'; render();");
  check('render game over tanpa error', true);
  run("G.screen='complete'; render();");
  check('render tamat tanpa error', true);
} catch (e) {
  check('render tanpa error: ' + e.message, false);
}

console.log(fails === 0 ? '\nSEMUA TEST LOLOS' : '\n' + fails + ' TEST GAGAL');
process.exit(fails === 0 ? 0 : 1);
