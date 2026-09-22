/* DOCK TERMINAL — detect.js
   English-only berth. Prefer false accept of English kids-talk
   over false reject of slang, typos, and short questions. */

(function (D) {
  "use strict";

  var LATINISH = /[\u0000-\u024F\u1E00-\u1EFF\u02C6\u02DC\u2018-\u2027\u2030-\u205E]/;

  var ENGLISH_FRAME = {
    the: 1, a: 1, an: 1, is: 1, are: 1, am: 1, was: 1, were: 1, be: 1,
    i: 1, im: 1, ive: 1, ill: 1, id: 1, me: 1, my: 1, mine: 1, we: 1, our: 1,
    you: 1, your: 1, u: 1, ur: 1, ya: 1,
    he: 1, she: 1, they: 1, them: 1, their: 1, it: 1, its: 1,
    this: 1, that: 1, these: 1, those: 1,
    what: 1, why: 1, how: 1, when: 1, where: 1, who: 1, which: 1,
    do: 1, does: 1, did: 1, can: 1, could: 1, will: 1, would: 1, should: 1,
    to: 1, of: 1, in: 1, on: 1, at: 1, for: 1, with: 1, from: 1, about: 1,
    and: 1, or: 1, but: 1, not: 1, no: 1, yes: 1, ok: 1,
    have: 1, has: 1, had: 1, get: 1, got: 1,
    if: 1, so: 1, just: 1, like: 1, too: 1, very: 1,
    rate: 1, why: 1, does: 1, please: 1, help: 1, tell: 1,
    gonna: 1, wanna: 1, gotta: 1, kinda: 1, sorta: 1, idk: 1, lol: 1,
    tho: 1, yeah: 1, nah: 1, yup: 1, nope: 1, hey: 1, hi: 1, hello: 1,
    because: 1, cause: 1, cuz: 1, pls: 1, plz: 1, thx: 1
  };

  /* Distinctive non-English tokens in Latin letters. One strong hit can refuse
     if the sentence has no English frame. Weak particles need a cluster. */
  var STRONG_FOREIGN = [
    "hola", "gracias", "buenos", "buenas", "adios", "por favor", "que tal",
    "bonjour", "bonsoir", "merci", "salut", "s il vous",
    "guten", "danke", "bitte", "hallo zusammen",
    "ciao", "grazie", "prego", "buongiorno", "buonasera",
    "obrigado", "obrigada", "ola ", "bom dia",
    "namaste", "dhanyavaad", "shukriya", "kaise ho", "kya hai", "kya ye",
    "konnichiwa", "arigato", "arigatou", "ohayo", "sayonara",
    "nihao", "ninhao", "xie xie", "zaijian",
    "annyeong", "gamsahamnida", "kamsa",
    "shalom", "todah",
    "marhaba", "shukran", "ahlan", "kayf hal",
    "sawasdee", "khob khun",
    "xin chao", "cam on",
    "cześć", "dziekuje", "dziekuje",
    "privet", "spasibo", "zdravstv",
    "merhaba", "tesekkur", "nasilsin",
    "hej dar", "tack sa",
    "moi moi", "kiitos"
  ];

  var PACKS = [
    { n: "es", w: ["hola", "gracias", "porque", "buenos", "buenas", "adios", "senor", "senora", "usted", "ustedes", "tambien", "despues", "ahora", "donde", "cuando", "ninos", "manana"] },
    { n: "fr", w: ["bonjour", "merci", "bonjour", "vous", "nous", "avec", "pour", "mais", "dans", "suis", "avez", "etre", "ouais", "desole", "desolee"] },
    { n: "de", w: ["und", "nicht", "ich", "sie", "ist", "ein", "eine", "das", "der", "die", "guten", "danke", "bitte", "warum", "nicht"] },
    { n: "pt", w: ["nao", "voce", "voce", "obrigado", "obrigada", "estou", "para", "como", "muito", "agora", "depois"] },
    { n: "it", w: ["ciao", "grazie", "prego", "sono", "dove", "perche", "buongiorno", "allora", "molto"] },
    { n: "nl", w: ["niet", "een", "het", "van", "voor", "dankjewel", "alsjeblieft"] },
    { n: "hi", w: ["hai", "kya", "nahi", "namaste", "kaise", "mera", "meri", "tum", "aap", "kyun", "accha", "theek", "bhai", "yaar", "krdo", "karo"] },
    { n: "id", w: ["saya", "tidak", "apa", "yang", "terima", "kasih", "selamat"] },
    { n: "tl", w: ["ang", "nga", "hindi", "ikaw", "salamat", "kumusta", "po"] },
    { n: "tr", w: ["bir", "degil", "icin", "merhaba", "tesekkurler", "nasilsin", "benim"] },
    { n: "pl", w: ["nie", "czy", "jest", "dziekuje", "prosze", "lubie"] },
    { n: "sv", w: ["och", "inte", "jag", "det", "hej", "tack", "varfor"] },
    { n: "fi", w: ["en", "ei", "olen", "kiitos", "hei", "mina"] },
    { n: "hu", w: ["nem", "hogy", "koszonom", "igen", "miert"] },
    { n: "vi", w: ["khong", "toi", "ban", "camon", "xin", "chao"] },
    { n: "ar", w: ["shukran", "marhaba", "inshallah", "habibi", "wallah", "yalla", "ana", "enti", "enta"] }
  ];

  /* Particles that also live in English. Never count these alone. */
  var AMBIG = {
    que: 1, de: 1, el: 1, la: 1, los: 1, las: 1, un: 1, una: 1, y: 1, en: 1,
    para: 1, por: 1, con: 1, es: 1, te: 1, se: 1, lo: 1, mi: 1, su: 1, al: 1,
    le: 1, les: 1, des: 1, du: 1, et: 1, je: 1, tu: 1, il: 1, est: 1, pas: 1,
    ne: 1, ce: 1, qui: 1, une: 1, au: 1, dans: 1, plus: 1, tout: 1,
    die: 1, der: 1, das: 1, und: 1, ist: 1, ein: 1, ich: 1, sie: 1, den: 1,
    het: 1, een: 1, van: 1, dat: 1, een: 1,
    hai: 1, ang: 1, nga: 1, yang: 1, po: 1, na: 1, sa: 1, ka: 1,
    bir: 1, da: 1, de: 1, ve: 1, mi: 1,
    nao: 1, um: 1, uma: 1, e: 1, o: 1, a: 1,
    che: 1, non: 1, per: 1, con: 1, una: 1,
    det: 1, jag: 1, och: 1, att: 1, som: 1,
    toi: 1, ban: 1, cua: 1, la: 1, va: 1
  };

  function tokens(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .split(/[^a-z0-9]+/)
      .filter(function (t) { return t.length > 0; });
  }

  function hasNonLatinScript(text) {
    var s = String(text || "");
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      var code = s.charCodeAt(i);
      if (code <= 32) continue;
      if (c === "—" || c === "–" || c === "“" || c === "”" || c === "‘" || c === "’") continue;
      if (/[0-9.,!?;:()[\]{}/\\@#$%^&*+=~`|"'<>_-]/.test(c)) continue;
      if (!LATINISH.test(c)) {
        /* scripts: Cyrillic, Greek (extended), Arabic, Hebrew, CJK, Hangul, Thai, Devanagari, etc. */
        if (code > 0x024F && !(code >= 0x1E00 && code <= 0x1EFF)) return true;
      }
    }
    return false;
  }

  function englishScore(toks) {
    var n = 0;
    for (var i = 0; i < toks.length; i++) {
      if (ENGLISH_FRAME[toks[i]]) n++;
    }
    return n;
  }

  function strongForeignHit(rawLower) {
    for (var i = 0; i < STRONG_FOREIGN.length; i++) {
      if (rawLower.indexOf(STRONG_FOREIGN[i]) !== -1) return true;
    }
    return false;
  }

  function packHits(toks) {
    var best = 0;
    for (var p = 0; p < PACKS.length; p++) {
      var n = 0;
      var w = PACKS[p].w;
      for (var i = 0; i < toks.length; i++) {
        for (var j = 0; j < w.length; j++) {
          if (toks[i] === w[j] && !AMBIG[toks[i]]) n++;
        }
      }
      if (n > best) best = n;
    }
    return best;
  }

  function looksEnglish(raw) {
    var text = String(raw || "").trim();
    if (!text) return true;

    if (hasNonLatinScript(text)) return false;

    var lower = text.toLowerCase();
    var toks = tokens(text);
    if (!toks.length) return true;

    var eng = englishScore(toks);
    var foreignPack = packHits(toks);
    var strong = strongForeignHit(lower);

    /* One foreign word inside a clear English sentence: still English. */
    if (eng >= 2) return true;
    if (eng >= 1 && toks.length <= 8 && foreignPack === 0 && !strong) return true;

    /* Short kids-talk / slang with no foreign markers. */
    if (!strong && foreignPack === 0) {
      if (toks.length <= 6) return true;
      /* Unsure + looks like English: allow. */
      return true;
    }

    /* Strong greeting or 2+ distinctive particles and almost no English frame. */
    if (strong && eng === 0) return false;
    if (foreignPack >= 2 && eng === 0) return false;
    if (foreignPack >= 3 && eng <= 1) return false;

    /* Unsure: allow. */
    return true;
  }

  D.detect = {
    looksEnglish: looksEnglish,
    hasNonLatinScript: hasNonLatinScript
  };
})(window.DOCK = window.DOCK || {});
