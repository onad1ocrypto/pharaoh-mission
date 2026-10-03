/* =========================================================
   PHARAOH QUEST — loop utama
   ========================================================= */
(function(){
  var last = performance.now(), acc = 0, STEP = 1000 / 60;

  function step(){
    if (G.screen === 'play') updatePlay();
    else { G.t++; updateMenus(); }
    if (G.screen === 'over' || G.screen === 'complete'){
      if (!G.submitted){
        G.submitted = true;
        NET.submit(G.score);
      }
      /* game berhenti, lalu otomatis pulang ke home untuk lihat skor */
      G.endT++;
      if ((G.screen === 'over' && G.endT > 300) || (G.screen === 'complete' && G.endT > 360)){
        goTitle();
        SFX.blip();
      }
    }
  }

  /* muat papan skor untuk panel home saat pertama kali */
  NET.board(function(top, online){ G.titleTop = top; G.titleOnline = online; });

  function render(){
    if (G.screen === 'title')        renderTitle();
    else if (G.screen === 'intro')  renderIntro();
    else if (G.screen === 'play'){   renderWorld(); renderHUD(); renderPlayOverlays(); }
    else if (G.screen === 'over')    renderOver();
    else                             renderComplete();
  }

  function loop(now){
    requestAnimationFrame(loop);
    acc += Math.min(120, now - last);
    last = now;
    var n = 0;
    while (acc >= STEP && n < 4){ step(); acc -= STEP; n++; }
    if (n === 4) acc = 0;
    render();
  }
  requestAnimationFrame(loop);
  window.__pq = { step: step, render: render };
})();
