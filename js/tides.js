/* DOCK TERMINAL — tides.js
   Costume tide clock. Hour of day only. Not astronomy. */

(function (D) {
  "use strict";

  var WORDS = ["LOW", "EBB", "SLACK", "NEAP", "FLOOD", "HIGH"];

  var MUTTERS = [
    "The void is quiet. The clock is not.",
    "Night ink is still wet.",
    "The berth hums. Nobody asked it to.",
    "Low water. High paperwork.",
    "OP counts hours the way a pier counts waves.",
    "Fog on the glass. Not on the rules.",
    "A thin tide. A thick stamp pad.",
    "The harbor is a rumor. The desk is a fact.",
    "Slack water. The questions keep moving.",
    "The lamp is off. The type is on.",
    "Neap tide. Small drama. Same OP.",
    "Midday ghosts file nothing.",
    "The sun is a rumor on this side of the glass.",
    "Flood tide. Cargo may arrive in clumps.",
    "The pier boards tick. That is heat, not fate.",
    "High water. Keep the question light.",
    "Shift change in the sky. Not at this desk.",
    "The void weather is even and unhelpful.",
    "Ebb tide. Take the joke and go home on time.",
    "The moon is doing math. We are doing stamps.",
    "Black water. White type. Same berth.",
    "The clock lies politely about how long a minute is.",
    "Last hours. The stamp still works.",
    "The dock keeps open. The tide does not ask."
  ];

  var IDLE = [
    "OP waits.",
    "Tide on the well.",
    "No cargo yet.",
    "The stamp pad is patient.",
    "Night holds the glass.",
    "Ask when ready.",
    "The well is quiet on purpose.",
    "One question will do.",
    "The berth does not hurry you.",
    "Phosphor waiting."
  ];

  function hour() {
    return new Date().getHours();
  }

  function wordAt(h) {
    return WORDS[h % WORDS.length];
  }

  function mutterAt(h) {
    return MUTTERS[h % MUTTERS.length];
  }

  function idleAt(n) {
    return IDLE[Math.abs(n) % IDLE.length];
  }

  function now() {
    var h = hour();
    return {
      hour: h,
      word: wordAt(h),
      mutter: mutterAt(h)
    };
  }

  D.tides = {
    now: now,
    wordAt: wordAt,
    mutterAt: mutterAt,
    idleAt: idleAt,
    idle: IDLE
  };
})(window.DOCK = window.DOCK || {});
