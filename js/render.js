/* DOCK TERMINAL — render.js
   Transcript stream. Prompt sits as the next command line. */

(function (D) {
  "use strict";

  var logEl, streamEl, tideWordEl, cargoEl, clockEl;

  function qs(id) {
    return document.getElementById(id);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function scrollLog() {
    var box = streamEl || logEl;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }

  function bind() {
    logEl = qs("log");
    streamEl = qs("stream");
    tideWordEl = qs("tide-word");
    cargoEl = qs("cargo-count");
    clockEl = qs("clock");
  }

  function print(kind, text) {
    if (!logEl) return;
    if (kind === "boot-live") {
      var live = logEl.querySelector(".boot-live");
      if (!live) {
        live = el("pre", "line boot boot-live");
        logEl.appendChild(live);
      }
      live.textContent = text;
      scrollLog();
      return live;
    }
    if (kind === "boot") {
      var liveBoot = logEl.querySelector(".boot-live");
      if (liveBoot) {
        liveBoot.classList.remove("boot-live");
        liveBoot.textContent = text;
        scrollLog();
        return liveBoot;
      }
    }
    var liveOld = logEl.querySelector(".boot-live");
    if (liveOld) liveOld.classList.remove("boot-live");

    var node = el("pre", "line " + (kind || "sys"));
    node.textContent = text;
    logEl.appendChild(node);
    scrollLog();
    return node;
  }

  function clearLog() {
    if (!logEl) return;
    logEl.textContent = "";
  }

  function setTide(t) {
    if (tideWordEl) tideWordEl.textContent = t.word;
  }

  function setCargo(n) {
    if (cargoEl) cargoEl.textContent = String(n);
  }

  function setClock(s) {
    if (clockEl) clockEl.textContent = s;
  }

  D.render = {
    bind: bind,
    print: print,
    clearLog: clearLog,
    setTide: setTide,
    setCargo: setCargo,
    setClock: setClock,
    scrollLog: scrollLog,
    examples: [
      "does my cat respect me",
      "is cereal a soup",
      "why does the moon follow me",
      "why is the sky dark at night",
      "are you alive",
      "rate my day /10",
      "what is luck",
      "i feel bored"
    ]
  };
})(window.DOCK = window.DOCK || {});
