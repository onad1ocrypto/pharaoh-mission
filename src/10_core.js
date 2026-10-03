/* =========================================================
   PHARAOH QUEST — core: konstanta, aset, input, audio
   ========================================================= */
'use strict';

var CV  = document.getElementById('game');
var CTX = CV.getContext('2d');

var VW = 960, VH = 560, TILE = 40, ROWS = 14;

var CHARACTERS = __CHARACTERS__;
var TITLE_ART  = __TITLE_ART__;
var ENEMY_ART  = __ENEMY_ART__;

var artImage = null;
if (TITLE_ART) { artImage = new Image(); artImage.src = TITLE_ART; }

/* ---------- util ---------- */
function rnd(i){ var x = Math.sin(i * 127.1 + 11.7) * 43758.5453; return x - Math.floor(x); }
function clamp(v,a,b){ return v < a ? a : (v > b ? b : v); }
function lerp(a,b,t){ return a + (b - a) * t; }
function aabb(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

/* ---------- layar ---------- */
var IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (IS_TOUCH) document.getElementById('touch').style.display = 'flex';

function fitCanvas(){
  var pad = IS_TOUCH ? 130 : 24;
  var s = Math.min(window.innerWidth / VW, (window.innerHeight - pad) / VH);
  s = Math.max(0.25, s);
  CV.style.width  = Math.floor(VW * s) + 'px';
  CV.style.height = Math.floor(VH * s) + 'px';
}
window.addEventListener('resize', fitCanvas);
window.addEventListener('orientationchange', fitCanvas);
fitCanvas();

/* ---------- input ---------- */
var keys    = { left:false, right:false, jump:false, duck:false };
var pressed = {};
var CODEMAP = { ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right',
                Space:'jump', ArrowUp:'jump', KeyW:'jump', ArrowDown:'duck', KeyS:'duck',
                KeyJ:'attack', KeyX:'attack', KeyK:'defend', KeyC:'defend' };

window.addEventListener('keydown', function(e){
  SFX.unlock();
  var a = CODEMAP[e.code];
  if (a){ if(!keys[a]) pressed[a] = true; keys[a] = true; e.preventDefault(); }
  switch(e.code){
    case 'Enter': case 'NumpadEnter': pressed.enter = true; e.preventDefault(); break;
    case 'Escape': pressed.esc = true; break;
    case 'KeyP': pressed.p = true; break;
    case 'KeyM': pressed.m = true; break;
    case 'KeyR': pressed.r = true; break;
    case 'KeyC': pressed.c = true; break;
  }
});
window.addEventListener('keyup', function(e){
  var a = CODEMAP[e.code];
  if (a){ keys[a] = false; e.preventDefault(); }
});
window.addEventListener('blur', function(){ for (var k in keys) keys[k] = false; });

/* tombol layar (HP) */
var btns = document.querySelectorAll('.btn');
for (var i = 0; i < btns.length; i++){
  (function(b){
    var k = b.getAttribute('data-k');
    function on(ev){ ev.preventDefault(); SFX.unlock(); if(!keys[k]) pressed[k] = true; keys[k] = true; b.classList.add('press'); }
    function off(ev){ ev.preventDefault(); keys[k] = false; b.classList.remove('press'); }
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('pointerleave', off);
  })(btns[i]);
}
CV.addEventListener('pointerdown', function(e){
  SFX.unlock();
  var r = CV.getBoundingClientRect();
  canvasClick((e.clientX - r.left) * VW / r.width, (e.clientY - r.top) * VH / r.height);
});

/* ---------- audio (semua di-sintesis, tanpa file luar) ---------- */
var SFX = {
  ac:null, master:null, busSfx:null, busMus:null,
  musicOn:true, sfxOn:true, timer:null, step:0, nextT:0, bpm:104,

  unlock:function(){
    if (!this.ac){
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ac = new AC();
        this.master = this.ac.createGain();  this.master.gain.value = 0.7;
        this.busSfx = this.ac.createGain();  this.busSfx.gain.value = 0.55;
        this.busMus = this.ac.createGain();  this.busMus.gain.value = 0.0;
        this.master.connect(this.ac.destination);
        this.busSfx.connect(this.master);
        this.busMus.connect(this.master);
        this.startMusic();
      } catch(e){ this.ac = null; }
    }
    if (this.ac && this.ac.state === 'suspended') this.ac.resume();
  },

  tone:function(f, dur, type, vol, slideTo, when, bus){
    if (!this.ac) return;
    if (bus === 'mus' ? !this.musicOn : !this.sfxOn) return;
    var A = this.ac, t = when || A.currentTime;
    var o = A.createOscillator(), g = A.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus === 'mus' ? this.busMus : this.busSfx);
    o.start(t); o.stop(t + dur + 0.06);
  },

  noise:function(dur, vol, when, hp, bus){
    if (!this.ac || (!this.sfxOn && bus !== 'mus')) return;
    var A = this.ac, t = when || A.currentTime;
    var n = Math.max(1, Math.floor(A.sampleRate * dur));
    var buf = A.createBuffer(1, n, A.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = A.createBufferSource(); s.buffer = buf;
    var f = A.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 1500;
    var g = A.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(bus === 'mus' ? this.busMus : this.busSfx);
    s.start(t);
  },

  jump:function(){ this.tone(300, 0.20, 'square', 0.16, 720); },
  coin:function(){ var t = this.ac ? this.ac.currentTime : 0;
    this.tone(988, 0.07, 'square', 0.16, null, t);
    this.tone(1319, 0.24, 'square', 0.16, null, t + 0.06); },
  stomp:function(){ this.noise(0.13, 0.22, null, 900); this.tone(230, 0.13, 'triangle', 0.18, 80); },
  bump:function(){ this.tone(150, 0.10, 'square', 0.16, 110); },
  power:function(){ var t = this.ac ? this.ac.currentTime : 0, s = [523, 659, 784, 1047];
    for (var i = 0; i < s.length; i++) this.tone(s[i], 0.14, 'triangle', 0.20, null, t + i * 0.06); },
  hurt:function(){ this.tone(400, 0.25, 'sawtooth', 0.18, 120); },
  die:function(){ var t = this.ac ? this.ac.currentTime : 0;
    this.tone(523, 0.14, 'sawtooth', 0.18, 400, t);
    this.tone(392, 0.14, 'sawtooth', 0.18, 300, t + 0.14);
    this.tone(262, 0.55, 'sawtooth', 0.20, 70,  t + 0.28); },
  blip:function(){ this.tone(760, 0.05, 'square', 0.12, 900); },
  shot:function(){ this.tone(950, 0.18, 'sawtooth', 0.15, 220); },
  shieldS:function(){ this.tone(300, 0.10, 'triangle', 0.10, 240); },
  fanfare:function(){ var t = this.ac ? this.ac.currentTime : 0, s = [523,659,784,1047,784,1047,1319];
    for (var i = 0; i < s.length; i++) this.tone(s[i], 0.22, 'triangle', 0.22, null, t + i * 0.13); },
  sad:function(){ var t = this.ac ? this.ac.currentTime : 0, s = [392,349,311,262];
    for (var i = 0; i < s.length; i++) this.tone(s[i], 0.34, 'triangle', 0.20, null, t + i * 0.19); },

  /* ---------- musik: tangga nada double-harmonic (nuansa Mesir/Timur Tengah) ---------- */
  SCALE:[0,1,4,5,7,8,11],
  deg:function(i){ var o = Math.floor(i / 7), k = ((i % 7) + 7) % 7;
    return 62 + this.SCALE[k] + 12 * o; },
  MEL:[7,null,6,5,null,4,5,null, 4,null,2,1,0,null,null,null,
       2,null,4,5,null,6,7,null, 6,5,4,null,2,1,0,null],
  BASS:[0,null,null,0,null,null,-3,null, 3,null,null,3,null,null,0,null,
        0,null,null,0,null,null,-3,null, 3,null,4,null,3,null,0,null],

  startMusic:function(){
    if (!this.ac || this.timer) return;
    var self = this;
    this.step = 0;
    this.nextT = this.ac.currentTime + 0.2;
    this.timer = setInterval(function(){ self.schedule(); }, 25);
  },
  schedule:function(){
    if (!this.ac) return;
    var A = this.ac;
    while (this.nextT < A.currentTime + 0.25){
      this.playStep(this.step, this.nextT);
      this.nextT += 60 / this.bpm / 4;
      this.step = (this.step + 1) % 32;
    }
  },
  playStep:function(i, t){
    var m = this.MEL[i];
    if (m !== null) this.tone(this.deg(m), 0.24, 'triangle', 0.13, null, t, 'mus');
    var b = this.BASS[i];
    if (b !== null) this.tone(this.deg(b) - 24, 0.34, 'sine', 0.30, null, t, 'mus');
    if (i % 8 === 0) this.noise(0.06, 0.10, t, 5000, 'mus');
    if (i % 8 === 4) this.noise(0.13, 0.09, t, 320, 'mus');
    if (i % 16 === 12) this.noise(0.05, 0.07, t, 6000, 'mus');
  },
  setMusic:function(on){
    this.musicOn = on;
    if (this.ac && this.busMus){
      var t = this.ac.currentTime;
      this.busMus.gain.cancelScheduledValues(t);
      this.busMus.gain.setTargetAtTime(on ? 0.19 : 0.0, t, 0.15);
    }
  },
  toggleMusic:function(){ this.setMusic(!this.musicOn); return this.musicOn; }
};
