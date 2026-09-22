/* DOCK TERMINAL — audio.js
   Original oscillator clicks only. No files, no tunes. */

(function (D) {
  "use strict";

  var ctx = null;
  var soundOn = false;
  var unlocked = false;

  function isTouch() {
    try {
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) return true;
      if ("ontouchstart" in window) return true;
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true;
    } catch (e) {}
    return false;
  }

  function getCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    return ctx;
  }

  function unlock() {
    var c = getCtx();
    if (!c) return;
    if (c.state === "suspended") {
      c.resume().catch(function () {});
    }
    unlocked = true;
  }

  function beep(freq, dur, type, vol, slide) {
    if (!soundOn) return;
    var c = getCtx();
    if (!c) return;
    if (c.state === "suspended") {
      c.resume().catch(function () {});
      return;
    }
    var t0 = c.currentTime;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + dur);
    var v = vol == null ? 0.028 : vol;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function keyclick() {
    beep(920, 0.018, "square", 0.02);
  }

  function stamp() {
    beep(180, 0.09, "triangle", 0.04, 90);
    setTimeout(function () { beep(110, 0.07, "square", 0.018); }, 40);
  }

  function setOn(on) {
    soundOn = !!on;
    if (soundOn) unlock();
    return soundOn;
  }

  function toggle() {
    return setOn(!soundOn);
  }

  function isOn() {
    return soundOn;
  }

  D.audio = {
    isTouch: isTouch,
    unlock: unlock,
    keyclick: keyclick,
    stamp: stamp,
    setOn: setOn,
    toggle: toggle,
    isOn: isOn,
    defaultOn: function () { return !isTouch(); }
  };
})(window.DOCK = window.DOCK || {});
