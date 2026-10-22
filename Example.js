// ==UserScript==
// @name         Krunker SDK Example
// @namespace    https://github.com/taze292/Krunker-Scripts
// @version      1.0.0
// @match        https://krunker.io/*
// @require      https://raw.githubusercontent.com/taze292/Krunker-Scripts/main/SDK.js
// @run-at       document-start
// @sandbox      raw
// @grant        none
// ==/UserScript==

(async () => {
    "use strict";

    try {
        const SDK = await window.KrunkerSDK.Ready;
        SDK.Log("Krunker SDK ready", SDK.Game);

        const Timer = window.setInterval(() => {
            const Player = SDK.LocalPlayer;
            if (!Player?.name) return;

            window.clearInterval(Timer);
            SDK.Log("Current username:", Player.name);
        }, 250);

        window.setTimeout(() => window.clearInterval(Timer), 120000);
    } catch (Error) {
        window.KrunkerSDK.Log(Error);
    }
})();
