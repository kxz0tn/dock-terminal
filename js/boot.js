/* DOCK TERMINAL — boot.js
   Three lines, then DOCK>. Tap / Enter / Space skips. */

(function (D) {
  "use strict";

  var LINES = [
    "Dock up.",
    "Gate armed.",
    "Ask."
  ];

  function reduced() {
    return !!(D.state && D.state.reducedMotion);
  }

  D.boot = function (printLine, done) {
    var skipped = false;
    var i = 0;
    var timer = null;
    var charTimer = null;
    var onSkip = null;

    function cleanup() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (charTimer) { clearTimeout(charTimer); charTimer = null; }
      if (onSkip) {
        document.removeEventListener("keydown", onSkip, true);
        document.removeEventListener("pointerdown", onSkip, true);
      }
    }

    function finish() {
      cleanup();
      setTimeout(done, 40);
    }

    function dumpRest() {
      while (i < LINES.length) {
        printLine("boot", LINES[i]);
        i++;
      }
      finish();
    }

    onSkip = function (ev) {
      if (skipped) return;
      var k = ev.type === "keydown" ? ev.key : "";
      if (ev.type === "keydown" && k !== "Enter" && k !== " " && k !== "Escape") return;
      if (ev.type === "keydown") ev.preventDefault();
      if (ev.stopPropagation) ev.stopPropagation();
      skipped = true;
      dumpRest();
    };

    document.addEventListener("keydown", onSkip, true);
    document.addEventListener("pointerdown", onSkip, true);

    function typeLine(text, then) {
      if (reduced() || skipped) {
        printLine("boot", text);
        then();
        return;
      }
      var acc = "";
      var p = 0;
      function tick() {
        if (skipped) return;
        if (p >= text.length) {
          printLine("boot", text);
          then();
          return;
        }
        acc += text.charAt(p);
        p++;
        printLine("boot-live", acc);
        charTimer = setTimeout(tick, 6);
      }
      tick();
    }

    function next() {
      if (skipped) return;
      if (i >= LINES.length) { finish(); return; }
      var line = LINES[i];
      i++;
      typeLine(line, function () {
        if (skipped) return;
        timer = setTimeout(next, reduced() ? 0 : 36);
      });
    }

    if (reduced()) {
      dumpRest();
      return;
    }
    next();
  };
})(window.DOCK = window.DOCK || {});
