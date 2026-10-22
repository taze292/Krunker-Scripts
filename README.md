# Krunker Scripts

An unofficial SDK and client API reference for experimenting with Krunker browser scripts.

## What's included

- **SDK.js** — dynamically captures the game's main objects and exposes them through `window.KrunkerSDK`.
- **Documentation/** — a browsable API reference, machine-readable JSON, and an API explorer userscript.

Open [the documentation](Documentation/Krunker-Client-API.html) locally in your browser after downloading or cloning the repository.

## Getting started

Load [SDK.js](SDK.js) in the page context **before the game initializes**. In Tampermonkey, use it as an `@require` dependency with `@run-at document-start`, `@sandbox raw`, and `@grant none`. SDK.js is a library, so it is not installed as a standalone userscript.

Once the SDK is loaded, your script can wait for the shared instance:

```js
window.KrunkerSDK.Ready.then(SDK => {
    const Game = SDK.Game;
    const Players = SDK.Players;
    const Controls = SDK.Controls;

    SDK.Log(SDK.GetPlayerNames());
}).catch(Error => {
    window.KrunkerSDK.Log(Error);
});
```

`Ready` means the game references are available; a match or local player may not exist yet. Game updates can change internal APIs, and some documented behavior is based on static inspection rather than live testing.

## Contributing

Issues and pull requests are welcome. You can help by fixing documentation, verifying API behavior, reporting broken SDK captures, or adding clear examples.

For bug reports, include reproduction steps, your browser and userscript manager, relevant errors, and the game build if available. For API changes, explain what you observed and distinguish tested behavior from assumptions. Keep pull requests focused, and leave out credentials and personal data.

## Disclaimer

This project is not affiliated with Krunker. Use it responsibly and follow the game's rules.

