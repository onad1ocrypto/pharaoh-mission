/* =========================================================
   PHARAOH QUEST — loop utama
   ========================================================= */
(function(){
  var last = performance.now(), acc = 0, STEP = 1000 / 60;

  function step(){
    if (G.screen === 'play') updatePlay();
    else { G.t++; updateMenus(); }
  }

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
