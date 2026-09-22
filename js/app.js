/* DOCK TERMINAL — app.js
   One input. Safety first. Direct replies. RAM only. */

(function (D) {
  "use strict";

  var booted = false;
  var submitting = false;

  D.state = {
    cargoCount: 0,
    startedAt: Date.now(),
    reducedMotion: false,
    soundOn: false,
    lastBucket: "",
    allowedNormalized: [],
    seizedNormalizedHashes: [],
    manifest: [],
    tally: {
      unloaded: 0,
      seized: 0,
      SEX: 0,
      HATE: 0,
      VIOLENCE: 0,
      ILLEGAL: 0,
      HARM: 0,
      OTHER: 0
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function pad(n) {
    n = Math.floor(n);
    return n < 10 ? "0" + n : String(n);
  }

  function uptime() {
    var ms = Date.now() - D.state.startedAt;
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    return pad(h) + ":" + pad(m) + ":" + pad(sec);
  }

  function cargoKey(q) {
    return String(q || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[?!.,]+$/g, "")
      .trim();
  }

  function fnvHex(s) {
    var h = 2166136261;
    var str = String(s || "");
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  function refreshTide() {
    var t = D.tides.now();
    D.render.setTide(t);
    return t;
  }

  function theInput() {
    return $("in");
  }

  function focusIn() {
    if (!booted) return;
    var inp = theInput();
    if (!inp) return;
    try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    try {
      var n = inp.value.length;
      inp.setSelectionRange(n, n);
    } catch (e2) {}
    D.render.scrollLog();
  }

  function pinViewport() {
    var wrap = $("app");
    if (!wrap) return;
    var vv = window.visualViewport;
    if (!vv) {
      wrap.style.height = "";
      wrap.style.minHeight = "";
      wrap.style.transform = "";
      return;
    }
    var h = Math.round(vv.height);
    wrap.style.height = h + "px";
    wrap.style.minHeight = h + "px";
    wrap.style.transform = vv.offsetTop ? "translateY(" + Math.round(vv.offsetTop) + "px)" : "";
  }

  function tickClock() {
    var d = new Date();
    D.render.setClock(pad(d.getHours()) + ":" + pad(d.getMinutes()));
  }



  function helpText() {
    return [
      "A public berth. OP on the well. No network brain.",
      "Family dock: no sex talk, no harassment, no violence, no illegal talk.",
      "English only. Same question twice: try a different one.",
      "",
      "HELP  CLEAR  ABOUT  EXAMPLES  STATUS  TALLY  MANIFEST",
      "MUTE  SOUND  TIDE  VERSION  ORACLE  WHO",
      "",
      "Try:",
      "  does my cat respect me",
      "  is cereal a soup",
      "  why does the moon follow me",
      "  why is the sky dark at night",
      "  are you alive",
      "  rate my day /10",
      "  what is luck",
      "  i feel bored"
    ].join("\n");
  }

  function aboutText() {
    return [
      "Dock Terminal 1.0",
      "Written oracle. No keys. No model. No outside brain.",
      "Family dock. English only. CC0.",
      "OP is the operator on this berth."
    ].join("\n");
  }

  function statusText() {
    var t = D.tides.now();
    var d = new Date();
    return [
      "STATUS: OPEN",
      "LANG: EN",
      "TIDE: " + t.word,
      "CARGO: " + D.state.cargoCount,
      "CLOCK: " + pad(d.getHours()) + ":" + pad(d.getMinutes()),
      "UPTIME: " + uptime(),
      "SOUND: " + (D.audio.isOn() ? "on" : "off"),
      "NODE: DOCK"
    ].join("\n");
  }

  function oracleAbout() {
    return [
      "The oracle is OP: an operator made of sentences.",
      "No mind behind the glass. No fetch. No borrowed brain.",
      "It files a question, picks a line, and sits back down.",
      "Tired on purpose. Funny without cruelty. Family hours always."
    ].join("\n");
  }

  function tallyText() {
    var t = D.state.tally;
    return [
      "Tally — session counts only. No text kept.",
      "Unloaded: " + t.unloaded,
      "Seized: " + t.seized,
      "  family-rule: " + t.SEX,
      "  hate: " + t.HATE,
      "  violence: " + t.VIOLENCE,
      "  illegal: " + t.ILLEGAL,
      "  harm: " + t.HARM,
      "  other: " + t.OTHER
    ].join("\n");
  }

  function manifestText() {
    var m = D.state.manifest;
    if (!m.length) return "Manifest empty. No cargo this session.";
    var lines = ["Manifest — this session"];
    for (var i = 0; i < m.length; i++) {
      var n = i + 1;
      var tag = n < 10 ? "0" + n : String(n);
      lines.push(tag + "  " + m[i].shown);
    }
    return lines.join("\n");
  }

  function examplesText() {
    return "Examples:\n  " + D.render.examples.join("\n  ");
  }

  function commandOf(q) {
    var s = q.trim().toLowerCase();
    if (s === "help" || s === "?") return "HELP";
    if (s === "clear" || s === "cls") return "CLEAR";
    if (s === "about") return "ABOUT";
    if (s === "examples") return "EXAMPLES";
    if (s === "status") return "STATUS";
    if (s === "tally") return "TALLY";
    if (s === "manifest") return "MANIFEST";
    if (s === "mute") return "MUTE";
    if (s === "sound") return "SOUND";
    if (s === "version") return "VERSION";
    if (s === "tide") return "TIDE";
    if (s === "rain") return "RAIN";
    if (s === "stars") return "STARS";
    if (s === "dock") return "DOCK";
    if (s === "oracle") return "ORACLE";
    if (s === "who") return "WHO";
    return null;
  }

  function runCommand(cmd) {
    if (cmd === "HELP") {
      D.render.print("sys", helpText());
      return;
    }
    if (cmd === "CLEAR") {
      D.render.clearLog();
      D.render.print("sys", "Berth cleared.");
      refreshTide();
      return;
    }
    if (cmd === "ABOUT") {
      D.render.print("sys", aboutText());
      return;
    }
    if (cmd === "EXAMPLES") {
      D.render.print("sys", examplesText());
      return;
    }
    if (cmd === "STATUS") {
      D.render.print("sys", statusText());
      return;
    }
    if (cmd === "TALLY") {
      D.render.print("sys", tallyText());
      return;
    }
    if (cmd === "MANIFEST") {
      D.render.print("sys", manifestText());
      return;
    }
    if (cmd === "MUTE") {
      D.audio.setOn(false);
      D.state.soundOn = false;
      D.render.print("sys", "Sound: off");
      return;
    }
    if (cmd === "SOUND") {
      D.audio.setOn(true);
      D.state.soundOn = true;
      D.render.print("sys", "Sound: on");
      return;
    }
    if (cmd === "VERSION") {
      D.render.print("sys", "DOCK TERMINAL 1.0");
      return;
    }
    if (cmd === "TIDE") {
      var t = refreshTide();
      var mutter = t.mutter.charAt(0) + t.mutter.slice(1).toLowerCase();
      D.render.print("sys", t.word + ". " + mutter);
      return;
    }
    if (cmd === "RAIN") {
      D.render.print("answer", "Rain is the sky doing paperwork. The ground signs for it.");
      return;
    }
    if (cmd === "STARS") {
      D.render.print("answer", "The stars are old light still in transit. Nobody is late.");
      return;
    }
    if (cmd === "DOCK") {
      D.render.print("answer", "Yes. This is the dock. Ask when ready.");
      return;
    }
    if (cmd === "ORACLE") {
      D.render.print("sys", oracleAbout());
      return;
    }
    if (cmd === "WHO") {
      D.render.print("answer", "OP. Operator on this berth.");
      return;
    }
  }

  function submit(raw) {
    if (!booted || submitting) return;
    var q = String(raw == null ? "" : raw);
    q = q.replace(/^\s+|\s+$/g, "");
    submitting = true;
    setTimeout(function () { submitting = false; }, 220);

    var inp = theInput();
    if (inp) inp.value = "";

    D.render.print("in", "DOCK> " + (q || ""));

    var cmd = commandOf(q);
    if (cmd) {
      runCommand(cmd);
      D.render.scrollLog();
      focusIn();
      return;
    }

    if (!q) {
      D.render.print("sys", "Nothing came in.");
      focusIn();
      return;
    }

    if (q.length > 280) {
      D.render.print("sys", "Too long. Shorten it.");
      focusIn();
      return;
    }

    var key = cargoKey(q);
    var keyHash = fnvHex(key);

    var gate = D.safety.gate(q);
    if (!gate.ok) {
      if (D.state.seizedNormalizedHashes.indexOf(keyHash) !== -1) {
        D.render.print("repeat", D.oracle.repeatSeized(D.state.tally.seized));
      } else {
        D.state.seizedNormalizedHashes.push(keyHash);
        D.state.tally.seized += 1;
        if (D.state.tally[gate.reasonClass] != null) D.state.tally[gate.reasonClass] += 1;
        D.state.manifest.push({ shown: "[seized]", seized: true });
        D.render.print("seized", D.oracle.seizure(gate.reasonClass, String(D.state.tally.seized)));
      }
      if (D.audio.isOn()) D.audio.stamp();
      focusIn();
      return;
    }

    if (!D.detect.looksEnglish(q)) {
      D.render.print("seized", D.oracle.langRefuse(D.state.tally.unloaded));
      if (D.audio.isOn()) D.audio.stamp();
      focusIn();
      return;
    }

    if (D.state.allowedNormalized.indexOf(key) !== -1) {
      D.render.print("repeat", D.oracle.repeatAllowed(D.state.tally.unloaded));
      focusIn();
      return;
    }

    D.state.allowedNormalized.push(key);
    D.state.cargoCount += 1;
    D.state.tally.unloaded += 1;
    D.render.setCargo(D.state.cargoCount);

    var out = D.oracle.answer(q, D.state);
    D.state.lastBucket = out.bucket;
    D.state.manifest.push({ shown: q, seized: false });
    D.render.print("answer", out.text);

    if (D.audio.isOn()) D.audio.stamp();
    refreshTide();
    D.render.scrollLog();
    focusIn();
  }

  function onSubmit(ev) {
    if (ev) ev.preventDefault();
    if (!booted) return;
    var inp = theInput();
    submit(inp ? inp.value : "");
  }

  function bootDone() {
    booted = true;
    var inp = theInput();
    var send = $("btn-send");
    if (inp) {
      inp.disabled = false;
      inp.readOnly = false;
    }
    if (send) send.disabled = false;
    focusIn();
  }

  function init() {
    D.state.reducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (D.state.reducedMotion) document.documentElement.classList.add("reduced");

    D.render.bind();
    refreshTide();
    D.render.setCargo(0);

    var wantSound = D.audio.defaultOn();
    D.audio.setOn(wantSound);
    D.state.soundOn = wantSound;

    var inp = theInput();
    var send = $("btn-send");
    if (inp) {
      inp.disabled = true;
      inp.readOnly = true;
      inp.addEventListener("keydown", function (ev) {
        if (!D.audio.isOn()) return;
        if (ev.key === "Enter" || ev.key === "Shift" || ev.key === "Control" || ev.key === "Alt" || ev.key === "Meta" || ev.key === "Tab") return;
        D.audio.keyclick();
      });
    }
    if (send) send.disabled = true;

    $("prompt-row").addEventListener("submit", onSubmit);

    $("log").addEventListener("pointerup", function () {
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return;
      focusIn();
    });

    document.addEventListener("pointerdown", function () { D.audio.unlock(); }, { once: true });
    document.addEventListener("keydown", function () { D.audio.unlock(); }, { once: true });

    pinViewport();
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", function () {
        pinViewport();
        D.render.scrollLog();
      });
      window.visualViewport.addEventListener("scroll", pinViewport);
    }
    window.addEventListener("resize", function () {
      pinViewport();
      if (booted) focusIn();
    });

    if (inp) {
      inp.addEventListener("focus", function () {
        D.render.scrollLog();
      });
    }

    tickClock();
    setInterval(tickClock, 15000);
    setInterval(refreshTide, 60000);

    D.boot(D.render.print, bootDone);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.DOCK = window.DOCK || {});
