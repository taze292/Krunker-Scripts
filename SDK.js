(() => {
    "use strict";

    const Page = typeof unsafeWindow === "undefined" ? globalThis : unsafeWindow;
    const NativeObject = Page.Object;
    const NativeReflect = Page.Reflect;
    const DefineProperty = NativeObject.defineProperty;
    const GetDescriptor = NativeObject.getOwnPropertyDescriptor;
    const Apply = NativeReflect.apply;
    const WriteLog = Page.console.log.bind(Page.console);
    const Existing = GetDescriptor(Page, "KrunkerSDK");

    if (Existing) {
        if (Existing.value?.Version === "1.0.0" && typeof Existing.value.Ready?.then === "function") return;
        throw new Error("KrunkerSDK is already defined by another implementation.");
    }

    const OriginalDescriptor = GetDescriptor(NativeObject, "defineProperty");
    const SetTimeout = Page.setTimeout.bind(Page);
    const ClearTimeout = Page.clearTimeout.bind(Page);
    let Game = null;
    let Timer = null;
    let ResolveReady;
    let RejectReady;
    let Settled = false;

    const Ready = new Page.Promise((Resolve, Reject) => {
        ResolveReady = Resolve;
        RejectReady = Reject;
    });

    Ready.catch(() => {});

    function GetValue(Target, Key) {
        if (Target === null || (typeof Target !== "object" && typeof Target !== "function")) return undefined;
        const Descriptor = GetDescriptor(Target, Key);
        return Descriptor && "value" in Descriptor ? Descriptor.value : undefined;
    }

    function Restore() {
        const Descriptor = GetDescriptor(NativeObject, "defineProperty");

        if (Descriptor?.value === ObserveDefinition) {
            if (Descriptor.configurable) {
                DefineProperty(NativeObject, "defineProperty", OriginalDescriptor);
            } else if (Descriptor.writable) {
                DefineProperty(NativeObject, "defineProperty", { value: DefineProperty });
            }
        }
        if (Timer !== null) {
            ClearTimeout(Timer);
            Timer = null;
        }
    }

    function IsGame(Target, Property, Descriptor) {
        if (Property !== "tmpPlayer" || typeof Descriptor?.get !== "function") return false;
        if (GetValue(Target, "isClient") !== true || GetValue(Target, "isServer") !== false) return false;

        const Players = GetValue(Target, "players");
        const Controls = GetValue(Target, "controls");
        const UI = GetValue(Target, "ui");

        return Page.Array.isArray(GetValue(Players, "list"))
            && typeof GetValue(Players, "findById") === "function"
            && typeof GetValue(Players, "findBySid") === "function"
            && typeof GetValue(Controls, "fakeKey") === "function"
            && typeof GetValue(Controls, "isPressed") === "function"
            && GetValue(UI, "Game") === Target;
    }

    function ObserveDefinition(Target, Property, Descriptor) {
        const Result = Apply(DefineProperty, this, arguments);

        try {
            if (!Settled && IsGame(Target, Property, Descriptor)) {
                Game = Target;
                Settled = true;
                Restore();
                ResolveReady(SDK);
            }
        } catch (Error) {
            if (!Settled) {
                Settled = true;
                Restore();
                RejectReady(Error);
            }
        }

        return Result;
    }

    const SDK = {
        Version: "1.0.0",
        Ready,
        get IsReady() {
            return Game !== null;
        },
        get Game() {
            return Game;
        },
        get Players() {
            return Game ? GetValue(Game, "players") : null;
        },
        get Controls() {
            return Game ? GetValue(Game, "controls") : null;
        },
        get LocalPlayer() {
            return Game ? Game.tmpPlayer ?? null : null;
        },
        Log(...Values) {
            WriteLog(...Values);
        },
        GetPlayerNames() {
            const Players = GetValue(SDK.Players, "list");
            if (!Page.Array.isArray(Players)) return [];

            return Players.filter(Boolean).map(Player => {
                const Name = GetValue(Player, "name");
                if (typeof Name === "string" && Name.length) return Name;
                const SID = GetValue(Player, "sid");
                return SID === undefined ? "(unnamed player)" : "Guest_" + SID;
            });
        }
    };

    DefineProperty(Page, "KrunkerSDK", {
        value: SDK,
        enumerable: false,
        configurable: true,
        writable: false
    });

    try {
        DefineProperty(NativeObject, "defineProperty", {
            ...OriginalDescriptor,
            value: ObserveDefinition
        });

        Timer = SetTimeout(() => {
            if (Settled) return;
            Settled = true;
            Restore();
            RejectReady(new Error("Load SDK.js in the page context before client initialization, then reload Krunker. The client build may also have changed."));
        }, 60000);
    } catch (Error) {
        Settled = true;
        Restore();
        RejectReady(Error);
    }
})();
