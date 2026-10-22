// ==UserScript==
// @name         Krunker client API explorer
// @namespace    local.krunker.client-reference
// @version      1.0.0
// @description  Inspect exposed client functions and match metadata
// @match        https://krunker.io/*
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  const page = unsafeWindow;
  const names = ['getGameActivity', 'setSetting', 'getSavedVal',
    'pressButton', 'releaseButton', 'SOUND', 'GUI',
    'game', 'players', 'controls'];

  // Writes into this userscript's panel only. Never calls getters.
  function show(title, value) {
    document.getElementById('krunker-api-explorer')?.remove();
    const box = document.createElement('div');
    box.id = 'krunker-api-explorer';
    Object.assign(box.style, {position:'fixed', inset:'8% 12%',
      zIndex:'2147483647', background:'#111827', color:'#e5e7eb',
      padding:'24px', border:'1px solid #6ee7b7', overflow:'auto',
      font:'14px/1.5 monospace', pointerEvents:'auto'});
    const close = document.createElement('button');
    close.textContent = 'Close'; close.onclick = () => box.remove();
    const heading = document.createElement('h2'); heading.textContent = title;
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap'; pre.textContent = JSON.stringify(value,null,2);
    box.append(close,heading,pre); document.body.append(box);
  }
  GM_registerMenuCommand('Inspect Krunker globals', () => {
    show('Exposed globals', names.map(name => {
      const d = Object.getOwnPropertyDescriptor(page,name);
      return !d ? {name,state:'absent'} : 'value' in d
        ? {name,type:typeof d.value,writable:d.writable}
        : {name,type:'accessor'};
    }));
  });
  GM_registerMenuCommand('Read Krunker activity', () => {
    try {
      if (typeof page.getGameActivity !== 'function')
        throw new Error('The activity function is not ready yet.');
      show('Match metadata',page.getGameActivity());
    } catch(error) { show('Not ready',{message:String(error)}); }
  });
})();
