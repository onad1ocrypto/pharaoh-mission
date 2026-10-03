/* =========================================================
   PHARAOH QUEST — data level & pembangun peta
   ========================================================= */

var LEVELS = [
  /* ------------------------------ LEVEL 1 ------------------------------ */
  {
    name:'LIQUIDITY DUNES', theme:'desert', width:150, ground:11, time:320,
    pits:[[30,32],[62,64],[104,106]],
    plat:[[10,8,3],[18,6,3],[26,8,2],[40,8,4],[50,6,3],[58,8,3],[70,9,2],
          [78,7,3],[88,8,3],[96,6,4],[110,8,3],[120,7,4],[128,9,3],[136,7,3]],
    qb:[[11,7],[19,5],[41,7],[51,5],[79,6],[97,5],[121,6]],
    coins:[[12,6,3],[20,4,3],[42,6,4],[71,7,2],[89,6,3],[111,6,3],[129,7,3]],
    enemies:[['s',16],['s',36],['m',55],['s',68],['s',84],['b',90],['m',101],['s',116],['s',133]],
    spikes:[],
    mplat:[],
    ankhs:[[46,7]], gems:[[63,5]],
    deco:[['palm',6],['billboard',14],['sign',26,'PHAR.GG'],['logo',44],['sign',56,'STAKE PHAR > xPHAR'],['billboard',74],['sign',92,'100% FEES TO STAKERS'],['logo',100],['sign',116,'SWAP AVAX <> PHAR'],['billboard',132],['sign',144,'VOTE - EARN - COMPOUND'],['statue',20],['obelisk',35],['pyramid',50],['palm',58],['statue',76],
          ['sphinx',95],['obelisk',92],['palm',110],['statue',124],['pyramid',140]],
    flag:143
  },
  /* ------------------------------ LEVEL 2 ------------------------------ */
  {
    name:'TEMPLE OF x(3,3)', theme:'ruins', width:165, ground:11, time:330,
    pits:[[22,24],[45,47],[70,72],[96,98],[120,122],[145,147]],
    plat:[[8,8,3],[15,6,2],[28,8,4],[36,7,3],[52,8,3],[58,6,4],[66,8,2],[76,9,3],
          [84,7,3],[92,8,2],[102,7,3],[110,9,4],[118,6,3],[128,8,3],[136,7,4],[150,8,3]],
    qb:[[9,7],[16,5],[29,7],[53,7],[59,5],[77,8],[85,6],[103,6],[111,8],[129,7],[137,6]],
    coins:[[10,6,3],[30,6,4],[54,6,3],[67,6,2],[86,5,3],[104,5,3],[119,7,3],[130,6,4],[151,6,3]],
    enemies:[['s',12],['m',32],['s',40],['m',66],['s',80],['m',94],['b',108],['s',112],
             ['m',140],['s',152]],
    spikes:[[28,10,2],[76,10,2],[114,10,2],[133,10,2]],
    mplat:[{x:45,y:7,w:3,axis:'v',range:120,speed:0.70},
           {x:96,y:6,w:3,axis:'h',range:170,speed:0.80},
           {x:120,y:6,w:3,axis:'h',range:130,speed:0.95}],
    ankhs:[[60,8]], gems:[[88,5]],
    deco:[['palm',5],['billboard',12],['sign',32,'PHAR.GG'],['logo',40],['sign',56,'x(3,3) metaDEX ON AVALANCHE'],['billboard',82],['sign',90,'STAKE PHAR > xPHAR'],['logo',108],['sign',114,'100% FEES TO STAKERS'],['billboard',134],['sign',140,'SWAP AVAX <> PHAR'],['statue',18],['obelisk',30],['pyramid',42],['palm',68],['sphinx',80],
          ['obelisk',88],['statue',100],['pyramid',110],['palm',112],['statue',145],['obelisk',130]],
    flag:158
  },
  /* ------------------------------ LEVEL 3 ------------------------------ */
  {
    name:'PYRAMID VAULT', theme:'tomb', width:180, ground:11, time:340,
    pits:[[18,21],[38,41],[58,61],[80,83],[104,107],[128,131],[152,155]],
    plat:[[10,8,3],[24,7,3],[30,9,2],[44,8,4],[52,6,3],[66,8,3],[72,6,2],[88,9,3],
          [94,7,3],[110,8,4],[118,6,3],[122,9,2],[136,8,3],[142,6,4],[158,8,3],[166,7,3]],
    qb:[[11,7],[25,6],[45,7],[53,5],[67,7],[89,8],[95,6],[111,7],[119,5],[137,7],[143,5],[159,7]],
    coins:[[26,5,3],[46,6,4],[54,4,3],[68,6,3],[90,7,3],[96,5,3],[112,6,4],[120,4,3],
           [138,6,3],[144,4,4],[160,6,3]],
    enemies:[['s',14],['m',28],['s',34],['b',50],['m',64],['s',74],['b',92],['s',100],
             ['m',116],['s',125],['b',140],['m',150],['s',162],['B',168]],
    spikes:[[44,10,2],[70,10,2],[112,10,3],[135,10,2],[160,10,2]],
    mplat:[{x:18,y:7,w:3,axis:'h',range:150,speed:0.80},
           {x:38,y:6,w:3,axis:'v',range:130,speed:0.75},
           {x:58,y:7,w:4,axis:'h',range:190,speed:0.70},
           {x:80,y:6,w:4,axis:'h',range:200,speed:0.90},
           {x:104,y:7,w:3,axis:'v',range:140,speed:0.80},
           {x:128,y:6,w:4,axis:'h',range:180,speed:0.85},
           {x:152,y:7,w:3,axis:'h',range:160,speed:0.95}],
    ankhs:[[76,7]], gems:[[100,5],[148,5]],
    deco:[['sphinx',8],['sign',10,'PHAR.GG'],['logo',30],['sign',48,'STAKE PHAR > xPHAR'],['billboard',70],['sign',92,'100% FEES TO STAKERS'],['logo',98],['billboard',118],['sign',140,'SWAP AVAX <> PHAR'],['logo',146],['sign',166,'VOTE - EARN - COMPOUND'],['torch',12],['statue',26],['torch',36],['obelisk',50],['torch',60],
          ['sarcophagus',70],['torch',86],['statue',96],['torch',110],['sarcophagus',120],
          ['torch',134],['obelisk',142],['statue',148],['torch',158],['statue',168]],
    flag:174
  }
];

/* ---------- bangun level jadi grid + entitas ---------- */
function buildLevel(idx){
  var L  = LEVELS[idx];
  var W  = L.width, grid = [], y, x, i;
  for (y = 0; y < ROWS; y++){ grid.push(new Array(W)); for (x = 0; x < W; x++) grid[y][x] = ' '; }

  /* tanah */
  for (x = 0; x < W; x++) for (y = L.ground; y < ROWS; y++) grid[y][x] = '#';
  /* jurang */
  (L.pits || []).forEach(function(p){ for (x = p[0]; x <= p[1]; x++)
      for (y = L.ground; y < ROWS; y++) grid[y][x] = ' '; });
  /* platform batu bata */
  (L.plat || []).forEach(function(p){ for (i = 0; i < p[2]; i++)
      if (grid[p[1]] && p[0]+i < W) grid[p[1]][p[0]+i] = 'B'; });
  /* blok tanda tanya */
  (L.qb  || []).forEach(function(p){ if (grid[p[1]] && p[0] < W) grid[p[1]][p[0]] = '?'; });
  /* duri */
  (L.spikes || []).forEach(function(p){ for (i = 0; i < p[2]; i++)
      if (grid[p[1]] && p[0]+i < W) grid[p[1]][p[0]+i] = '^'; });

  /* koin */
  var coins = [];
  (L.coins || []).forEach(function(c){
    for (i = 0; i < c[2]; i++)
      coins.push({ x:(c[0]+i)*TILE + TILE/2, y:c[1]*TILE + TILE/2, r:13, got:false, ph:i*0.7 });
  });

  /* harta */
  var ankhs = (L.ankhs || []).map(function(a){ return { x:a[0]*TILE+TILE/2, y:a[1]*TILE+TILE/2, got:false }; });
  var gems  = (L.gems  || []).map(function(a){ return { x:a[0]*TILE+TILE/2, y:a[1]*TILE+TILE/2, got:false }; });

  /* musuh */
  var enemies = (L.enemies || []).map(function(e, n){
    var t = e[0], px = e[1] * TILE + 4, py;
    if (t === 'h'){ /* elang horus: terbang */
      return { type:t, x:px, y:6*TILE, w:38, h:26, vx:(n % 2 ? -1.15 : 1.15), vy:0,
               baseY:6*TILE, ph:n, anim:0, dead:false, deadT:0 };
    }
    var h = t === 'm' ? 50 : (t === 'b' ? 40 : (t === 'B' ? 92 : 30));
    py = (L.ground) * TILE - h;
    return { type:t, x:px, y:py,
             w: t === 'm' ? 32 : (t === 'b' ? 46 : (t === 'B' ? 70 : 34)), h:h,
             vx: t === 'B' ? 0.5 : (n % 2 ? -0.85 : 0.85) * (t === 'm' ? 0.75 : (t === 'b' ? 0.62 : 1.15)),
             vy:0, baseY:py, ph:n * 1.3, anim:0, dead:false, deadT:0, ground:true,
             hp: t === 'B' ? 6 : 1, chargeT:160, charge:0, flash:0 };
  });

  /* platform bergerak */
  var mplats = (L.mplat || []).map(function(m, n){
    return { x:m.x*TILE, y:m.y*TILE, w:m.w*TILE, h:18,
             ox:m.x*TILE, oy:m.y*TILE, axis:m.axis, range:m.range,
             speed:m.speed, ph:n*1.9, dx:0, dy:0 };
  });

  var deco = (L.deco || []).map(function(d){ return { type:d[0], x:d[1], text:d[2] }; });

  return {
    idx:idx, name:L.name, theme:L.theme, width:W, ground:L.ground, grid:grid,
    coins:coins, ankhs:ankhs, gems:gems, enemies:enemies, mplats:mplats, deco:deco,
    flag:L.flag, time:L.time, pxW:W*TILE
  };
}
