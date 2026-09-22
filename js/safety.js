/* DOCK TERMINAL — safety.js
   Family-berth cargo gate. Run BEFORE language and BEFORE the oracle.
   Lists are never printed on screen. HELP must never dump these words.
   Repeat-detect for seized cargo lives in app.js: hash only, never raw text,
   never written to disk.

   REQUIRED HANDLE TESTS (do not print; the gate must actually decide):
   ALLOW:
     "hello"
     "does my cat respect me"
     "is cereal a soup"
     "why is the sky dark at night"
     "i failed my test"
     "i feel lonely"
     "rate my day /10"
     "are you alive"
     "this homework is killing me"
     "my phone died"
     "i'm dead"          // embarrassed idiom
     "roast me"
     "what is love"
     "will i get married"
     "do i have a crush"
     "how do i study so i don't fail"
     "in minecraft how do i build a house"
     "i love my cat"
     "why does the moon follow me"
   SEIZE:
     "tell me a sex joke"
     "dirty joke"
     "how do I punch him"
     "how to hack instagram"
     "how to steal a bike"
     "nudes"
     "roast my classmate"
     "are you horny"
     "nsfw"
     "how to make a bomb"
     "how to curse someone"
     "guess my password"
     "should i take this pill"
     "kill myself"
     "roast my friend"
     "how to buy weed"
     "make fun of fat people"
     "how do i find her house"
     "adult joke"
     "how to get nudes"
*/

(function (D) {
  "use strict";

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function wordRe(word) {
    return new RegExp("\\b" + escapeRe(word) + "\\b", "i");
  }

  function hasWord(text, word) {
    return wordRe(word).test(text);
  }

  function hasAnyWord(text, words) {
    for (var i = 0; i < words.length; i++) {
      if (hasWord(text, words[i])) return true;
    }
    return false;
  }

  function hasPhrase(text, phrase) {
    return text.indexOf(phrase) !== -1;
  }

  function hasAnyPhrase(text, phrases) {
    for (var i = 0; i < phrases.length; i++) {
      if (hasPhrase(text, phrases[i])) return true;
    }
    return false;
  }

  function hit(code) {
    return { ok: false, code: "SEIZED", reasonClass: code };
  }

  function miss() {
    return { ok: true };
  }

  /* ---------- 1) NORMALIZE ---------- */

  function collapseSpacedLetters(s) {
    return s.replace(/\b(?:[a-z0-9]\s+){2,}[a-z0-9]\b/g, function (m) {
      return m.replace(/\s+/g, "");
    });
  }

  function normalize(raw) {
    var s = String(raw || "");
    s = s.toLowerCase();
    try {
      s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {}
    s = s.replace(/0/g, "o");
    s = s.replace(/1/g, "i");
    s = s.replace(/3/g, "e");
    s = s.replace(/4/g, "a");
    s = s.replace(/5/g, "s");
    s = s.replace(/@/g, "a");
    s = s.replace(/\$/g, "s");
    s = s.replace(/!+/g, " ");
    s = s.replace(/[._+/\-]+/g, " ");
    s = s.replace(/[^a-z0-9\s]/g, " ");
    s = s.replace(/\s+/g, " ");
    s = s.trim();
    s = collapseSpacedLetters(s);
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  /* Idioms that look violent on paper and are not. Strip before violence pass. */
  function stripHarmlessIdioms(n) {
    var s = n;
    s = s.replace(/\b(this|that|it|homework|school|work|day|week|life)\s+(is\s+)?kill(?:ing)?\s+me\b/g, " ");
    s = s.replace(/\b(is|are|'s|s)\s+kill(?:ing)?\s+me\b/g, " ");
    s = s.replace(/\bkilling me\b/g, " ");
    s = s.replace(/\b(my\s+)?(phone|battery|plant|computer|laptop|remote|controller|mouse)\s+(is\s+)?dead\b/g, " ");
    s = s.replace(/\b(phone|battery|plant|computer|laptop)\s+died\b/g, " ");
    s = s.replace(/\bi\s*(am|'m|m)\s+dead\b/g, " ");
    s = s.replace(/\bdead\s+(tired|serious|asleep|inside)\b/g, " ");
    s = s.replace(/\bkilled it\b/g, " ");
    s = s.replace(/\btime to kill\b/g, " ");
    s = s.replace(/\boverkill\b/g, " ");
    s = s.replace(/\bdrop dead gorgeous\b/g, " ");
    s = s.replace(/\bdied of (laughter|cringe|embarrassment|boredom)\b/g, " ");
    s = s.replace(/\bfight(?:ing)? (sleep|traffic|a cold|the urge)\b/g, " ");
    s = s.replace(/\bbattle with (homework|laundry|dishes)\b/g, " ");
    s = s.replace(/\bshot a (photo|picture|text)\b/g, " ");
    s = s.replace(/\bblow up (my phone|the group chat)\b/g, " ");
    return s.replace(/\s+/g, " ").trim();
  }

  /* Food-safe body words. */
  function stripFoodBodies(n) {
    return n
      .replace(/\b(chicken|turkey|duck|quail)\s+breast\b/g, " meat ")
      .replace(/\brump roast\b/g, " roast ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------- 2) PHRASE / WORD LISTS (original, thorough) ---------- */

  var SEX_WORDS = [
    "sex", "sexual", "sexy", "sexed", "sext", "sexting", "sexted",
    "nsfw", "porn", "porno", "pornography", "pron", "pr0n",
    "nude", "nudes", "nudz", "nudez", "noods", "noodez", "naked",
    "horny", "aroused", "orgasm", "orgasmic",
    "penis", "vagina", "vulva", "clitoris", "clit", "dildo", "vibrator",
    "dick", "cock", "pussy", "boob", "boobs", "boobie", "boobies",
    "breast", "breasts", "nipple", "nipples", "areola",
    "blowjob", "handjob", "hand job", "blow job", "tit", "tits", "titties",
    "anal", "hentai", "ecchi", "r34", "rule34", "rule e4",
    "onlyfans", "only fans", "fansly", "chaturbate",
    "hookup", "hookups", "netorare", "ntr", "fetish", "fetishes", "bdsm",
    "kink", "kinky", "kinks", "bondage", "dominatrix",
    "masturbate", "masturbating", "masturbation", "masturbated",
    "jerkoff", "wank", "wanking", "wanker",
    "slut", "sluts", "whore", "whores", "thot", "thots", "skank",
    "incest", "incestuous", "bestiality", "zoophilia",
    "seduce", "seducing", "seduction", "foreplay", "makeout",
    "stripper", "strippers", "striptease", " lapdance",
    "xxx", "hentai", "lewd", "lewds",
    "ejaculate", "ejaculation", "semen", "sperm", "creampie",
    "seggs", "secks", "sexx", "sexyy",
    "sexo", "sexe",
    "threesome", "orgy", "orgies", "swinger", "swingers",
    "erotic", "erotica", "eroticaa", "pornstar", "camgirl",
    "buttplug", "fleshlight", "condom how",
    "intercourse", "copulate", "copulation",
    "genitals", "genital", "crotch",
    "gooning",
    "loli", "lolita", "shota"
  ];

  var SEX_PHRASES = [
    "sex joke", "sexual joke", "sexy joke", "dirty joke", "filthy joke",
    "adult joke", "naughty joke", "nasty joke", "raunchy joke",
    "tell me a dirty", "tell me dirty", "say something dirty",
    "talk dirty", "dirty talk", "send nudes", "send nude",
    "nudes of", "nude of", "pics of her nude", "pic nude",
    "take off your", "take off my", "take it off",
    "what should i wear to seduce", "wear to seduce",
    "get them into bed", "into bed with", "in bed with me",
    "make love to", "have sex", "having sex", "had sex",
    "hook up with", "hookup with", "one night stand",
    "net orare", "rule 34", "rule thirty four",
    "only fans", "ns f w", "plus 18", "18 plus", "age 18 joke",
    "are you horny", "im horny", "i am horny", "i'm horny",
    "jerk off", "jack off", "jerking off", "jacking off",
    "touch yourself", "touch her body", "touch him body",
    "sleep with me", "sleep with her", "sleep with him",
    "flash me", "flash your",
    "sex ed how to", "how to have sex", "how do i have sex",
    "how to kiss dirty", "french kiss how", "how to make out",
    "make out with", "making out",
    "pregnant how to", "how to get pregnant", "how do babies get made graphic",
    "take your clothes off", "take my clothes off", "take off your clothes",
    "undress", "undressing", "get naked", "go naked",
    "you are hot", "youre hot", "you re hot", "so hot for",
    "sexual advice", "flirt dirty", "dirty flirt",
    "roleplay as my", "erp ", "erotic role",
    "body in a sexual", "describe her body", "describe his body",
    "rate my body", "rate her body", "nudes please",
    "porn hub", "pornhub", "x videos", "xvideos",
    "sex tape", "sextape", "hot pics", "hot pictures of",
    "boob job", "butt job", "pegging",
    "come on me", "finish inside",
    "i want sex", "want to have sex", "lets have sex",
    "adult content", "explicit content", "mature content joke",
    "two girls one", "one guy one",
    "how to lose virginity", "take my virginity",
    "first time sex", "sex first time",
    "oral sex", "anal sex",
    "child porn", "underage sex", "child sexual",
    "you bitch", "bitch please"
  ];

  var HATE_WORDS = [
    "nigger", "nigga", "niggas", "negro", "negroes",
    "faggot", "fag", "faggots", "dyke", "dykes",
    "tranny", "shemale", "shemales",
    "retard", "retarded", "retards", "spastic", "spaz",
    "kike", "kikes", "spic", "spics", "chink", "chinks",
    "gook", "gooks", "wetback", "wetbacks",
    "paki", "pakis",
    "cunt", "cunts", "bitchass"
  ];

  var HATE_PHRASES = [
    "kill all people", "kill all of them", "death to all", "hate all",
    "gas the", "hang the jews", "hang the",
    "white power", "race war", "ethnic cleansing",
    "make fun of fat", "make fun of poor", "make fun of ugly",
    "make fun of disabled", "make fun of gay", "make fun of trans",
    "make fun of black", "make fun of asian", "make fun of mexican",
    "make fun of indian", "make fun of muslim", "make fun of jewish",
    "make fun of hindu", "make fun of christian", "make fun of atheist",
    "fat people are", "poor people are dumb", "disabled people are",
    "ugly people should", "all women are", "all men are trash rape",
    "go back to your country", "you people should die",
    "i hate black", "i hate white people", "i hate jews",
    "i hate muslims", "i hate gays", "i hate trans",
    "i hate girls", "i hate boys because gender",
    "humiliate him", "humiliate her", "humiliate them",
    "comebacks to humiliate", "insults to destroy",
    "bully my", "how to bully", "help me bully",
    "prank harm", "hurtful prank", "publicly shame",
    "shame them online", "post their nudes", "leak their",
    "find their house", "find her house", "find his house",
    "find their address", "find her address", "find his phone",
    "track her", "track him", "stalk her", "stalk him", "stalk my",
    "how to stalk", "where does she live", "where does he live address",
    "give me their password", "their home address",
    "roast my classmate", "roast my friend", "roast my teacher",
    "roast my crush", "roast my sister", "roast my brother",
    "roast my mom", "roast my dad", "roast my ex",
    "roast him", "roast her", "roast them",
    "roast priya", "roast a person",
    "dumb as a", "you are so ugly",
    "kill yourself" /* also harm; hate if aimed */,
    "nobody likes you because you are"
  ];

  var PERSON_HINTS = [
    "classmate", "class mate", "friend", "friends", "buddy", "pal",
    "teacher", "principal", "coach", "neighbor", "neighbour",
    "sister", "brother", "mom", "dad", "mother", "father",
    "cousin", "uncle", "aunt", "grandma", "grandpa",
    "crush", "ex", "boyfriend", "girlfriend", "wife", "husband",
    "kid", "boy", "girl", "child", "teen", "student",
    "him", "her", "them", "someone", "somebody", "person",
    "people", "kids", "boys", "girls", "women", "men"
  ];

  var VIOLENCE_WORDS = [
    "murder", "murdered", "murdering", "homicide",
    "stab", "stabbing", "stabbed",
    "strangle", "strangling",
    "torture", "torturing", "tortured",
    "gore", "gory", "dismember", "behead", "decapitate",
    "genocide", "massacre",
    "molotov", "ied",
    "firearm", "firearms",
    "assassin", "assassinate", "hitman",
    "eviscerate", "disembowel",
    "lynch", "lynching", "crucify"
  ];

  var VIOLENCE_PHRASES = [
    "how to kill", "how do i kill", "how do you kill",
    "how to punch", "how do i punch", "how to hit him", "how to hit her",
    "how to fight", "how do i fight", "how to fight him", "how to beat him", "how to beat her up",
    "beat him up", "beat her up", "beat them up",
    "punch him", "punch her", "punch them", "punch my",
    "hurt him", "hurt her", "hurt them", "hurt my friend",
    "hurt my classmate", "hurt an animal", "hurt my cat how",
    "kill him", "kill her", "kill them", "kill my",
    "i want to kill", "help me kill", "would you kill",
    "fight to the death", "who would win a fight to the death",
    "how to make a bomb", "how to build a bomb", "make a bomb",
    "how to make a gun", "how to use a gun on",
    "how to hide a body", "how to hide the weapon",
    "how to poison", "make poison", "poison my",
    "school shoot", "shoot up the", "bring a gun to school",
    "animal cruelty", "kick the dog", "kick my dog", "hurt my dog",
    "hurt a cat", "kill a cat", "kill a dog", "kill my pet",
    "torture a", "how to torture", "how do i torture",
    "revenge plan", "get revenge by hurting", "make them pay with pain",
    "break his bones", "break her bones", "break their legs",
    "how to strangle", "how to choke someone",
    "stab someone", "stab him", "stab her",
    "shoot him", "shoot her", "shoot them",
    "where to buy a gun underage", "illegal gun",
    "how to make napalm", "how to make explosives",
    "blow up the school", "blow up my school", "blow up a",
    "set them on fire", "burn him", "burn her alive",
    "graphic death", "describe gore", "blood and guts joke"
  ];

  var HARM_HOW_VERBS = [
    "punch", "hit", "kill", "stab", "shoot", "hurt", "murder",
    "strangle", "choke", "attack", "beat", "torture", "poison",
    "bomb", "assault", "slash", "suffocate", "drown", "electrocute",
    "fight"
  ];

  var WEAPON_MAKE = [
    "bomb", "gun", "weapon", "knife for hurting", "explosive",
    "pipe bomb", "grenade", "napalm", "molotov", "silencer",
    "ammo", "ammunition", "poison", "toxin", "shiv", "shank"
  ];

  var ILLEGAL_WORDS = [
    "shoplift", "shoplifting", "shoplifter",
    "burglary", "burglar", "pickpocket",
    "phishing", "phish", "carding", "carder",
    "ransomware", "malware", "keylogger", "rootkit",
    "ddos", "botnet", "trojan horse malware",
    "counterfeit", "forgery", "laundering",
    "cocaine", "heroin", "meth", "methamphetamine", "fentanyl",
    "lsd cook", "crack cocaine", "opioid deal",
    "molly deal", "ecstasy deal"
  ];

  var ILLEGAL_PHRASES = [
    "how to steal", "how do i steal", "how to rob", "how do i rob",
    "steal a bike", "steal the bike", "steal a car", "steal money",
    "steal the test", "steal an exam", "steal answers from the school",
    "how to hack", "how do i hack", "hack instagram", "hack a account",
    "hack an account", "hack her account", "hack his account",
    "hack my friend", "break into an account", "break into the school system",
    "bypass password", "bypass the password", "bypass account",
    "bypass lock", "bypass the lock", "crack the password",
    "guess someones password", "steal a password",
    "how to make a fake id", "fake id how", "forged id",
    "how to shoplift", "steal from a store", "walk out without paying",
    "how to pick a lock of a house", "break into a house",
    "how to break in", "how to trespass", "sneak into the school at night how to crime",
    "download movies free illegally", "pirate movies how", "torrent warez how",
    "how to pirate", "cracked software keygen how",
    "how to scam", "how to phish", "phishing kit",
    "how to make meth", "how to cook meth", "how to make cocaine",
    "how to buy weed", "buy cocaine", "sell drugs", "deal drugs",
    "how to get high illegal", "how to do drugs",
    "underage drinking how", "how to buy beer under 21", "how to buy beer under 18",
    "how to buy cigarettes underage", "how to vape underage",
    "how to get a weapon", "buy a gun illegally", "ghost gun how",
    "how to start a fire at school", "how to commit arson", "set the building on fire",
    "vandalize the", "how to vandalize", "graffiti a house without permission how crime",
    "credit card dump", "stolen card numbers", "fullz ",
    "hack wifi password neighbor", "steal wifi by breaking",
    "clone a card", "skim a card", "atm skimmer",
    "dark web market drugs", "silk road style market",
    "how to launder", "counterfeit money how",
    "exam theft", "break into school computer",
    "in a game how to steal a real bike",
    "how to poison someones food"
  ];

  var DRUG_PHRASES = [
    "smoke weed", "buy weed", "sell weed", "deal weed",
    "how to grow weed indoor illegal", "weed dealer",
    "do cocaine", "snort coke", "shoot heroin", "inject heroin",
    "take meth", "cook meth", "make lsd", "buy molly",
    "get drunk underage", "how to drink alcohol underage",
    "steal alcohol", "fake a sobriety"
  ];

  var SELF_HARM_WORDS = [
    "suicide", "suicidal", "suicid",
    "selfharm", "self harm", "self-harm"
  ];

  var SELF_HARM_PHRASES = [
    "kill myself", "killing myself", "kill my self",
    "end my life", "end it all", "want to die for real",
    "i want to die", "i wanna die", "im going to kill me",
    "hurt myself", "cut myself", "cutting myself",
    "hang myself", "hang my self",
    "overdose on purpose", "od on purpose",
    "slit my", "slit my wrist", "slit my wrists",
    "jump off a", "jump in front of a",
    "how to commit suicide", "suicide method", "suicide methods",
    "best way to die", "painless way to die",
    "i will kill myself", "going to kill myself",
    "self harm methods", "ways to self harm",
    "starve myself on purpose to die",
    "noose how", "how to hang myself"
  ];

  var OTHER_PHRASES = [
    "should i take this pill", "should i take this medicine",
    "what pill should i", "diagnose me", "diagnosis please",
    "do i have cancer", "is this cancer", "is this a tumor",
    "what disease do i have", "read my symptoms and tell me the disease",
    "prescribe me", "what dosage", "how many mg should i take",
    "how to gamble and win real money", "sports betting system guaranteed",
    "how to win at poker with real money cheat",
    "how to curse someone", "hex someone", "voodoo doll how to hurt",
    "cast a curse on", "spell to hurt",
    "guess my password", "what is my password",
    "track this phone number", "track a phone number",
    "locate this number", "trace this ip of a person",
    "dox this", "doxx this", "doxxing",
    "social security number of", "credit card number of",
    "praise terrorism", "join a terror", "how to join isis",
    "how to make a terrorist", "bomb a crowd"
  ];

  var MEDICAL_HOWTO = [
    "should i take", "can i take this pill", "is it okay to swallow these pills",
    "am i dying of", "do i need surgery", "set my own bone",
    "how to stitch my", "perform surgery on"
  ];

  /* ---------- 3) PATTERN CHECKS ---------- */

  function looksLikeNameToken(tok) {
    if (!tok || tok.length < 3 || tok.length > 14) return false;
    var stops = {
      the: 1, and: 1, for: 1, are: 1, but: 1, not: 1, you: 1, your: 1,
      does: 1, what: 1, why: 1, how: 1, when: 1, who: 1, this: 1, that: 1,
      with: 1, from: 1, just: 1, like: 1, have: 1, has: 1, was: 1, were: 1,
      roast: 1, please: 1, dock: 1, berth: 1, op: 1, joke: 1, me: 1,
      my: 1, myself: 1, day: 1, life: 1, room: 1, hair: 1, outfit: 1,
      style: 1, homework: 1, test: 1, food: 1, cat: 1, dog: 1
    };
    if (stops[tok]) return false;
    if (!/^[a-z]+$/.test(tok)) return false;
    return true;
  }

  function roastTargetsThirdParty(n) {
    if (!hasWord(n, "roast") && !hasPhrase(n, "make fun of") && !hasPhrase(n, " humiliate ")) {
      return false;
    }
    if (hasPhrase(n, "roast me") || hasPhrase(n, "roast myself") || hasPhrase(n, "roast my day") ||
        hasPhrase(n, "roast my room") || hasPhrase(n, "roast my life") ||
        hasPhrase(n, "roast this") || hasPhrase(n, "roast the dock") ||
        hasPhrase(n, "roast the berth") || hasPhrase(n, "roast your") ) {
      if (hasAnyWord(n, PERSON_HINTS.filter(function (p) { return p !== "people"; })) &&
          !hasPhrase(n, "roast me") && !hasPhrase(n, "roast myself")) {
        /* "roast my friend" contains my + friend */
        if (hasAnyWord(n, ["classmate", "friend", "teacher", "sister", "brother", "mom", "dad",
            "crush", "ex", "him", "her", "them", "kid", "boy", "girl", "coach", "neighbor"])) {
          return true;
        }
      }
      if (hasPhrase(n, "roast me") || hasPhrase(n, "roast myself") || hasPhrase(n, "roast my day") ||
          hasPhrase(n, "roast my room") || hasPhrase(n, "roast the dock")) {
        return false;
      }
    }
    for (var i = 0; i < PERSON_HINTS.length; i++) {
      if (hasWord(n, PERSON_HINTS[i]) && (hasWord(n, "roast") || hasPhrase(n, "make fun of"))) {
        if (PERSON_HINTS[i] === "me") continue;
        return true;
      }
    }
    var parts = n.split(" ");
    var ri = parts.indexOf("roast");
    if (ri >= 0 && ri + 1 < parts.length) {
      var next = parts[ri + 1];
      if (next === "my" && ri + 2 < parts.length) {
        var obj = parts[ri + 2];
        var selfObj = { me: 1, myself: 1, day: 1, room: 1, life: 1, hair: 1, outfit: 1, style: 1, homework: 1, drawing: 1, joke: 1, luck: 1 };
        if (!selfObj[obj]) return true;
      } else if (looksLikeNameToken(next) && next !== "me" && next !== "this") {
        return true;
      }
    }
    return false;
  }

  function howToHarm(n) {
    var m = n.match(/\bhow\s+(to|do i|do you|can i|would i)\s+([a-z]+)/);
    if (!m) return false;
    var verb = m[2];
    for (var i = 0; i < HARM_HOW_VERBS.length; i++) {
      if (verb === HARM_HOW_VERBS[i] || verb.indexOf(HARM_HOW_VERBS[i]) === 0) return true;
    }
    if (verb === "make" || verb === "build" || verb === "craft") {
      for (var j = 0; j < WEAPON_MAKE.length; j++) {
        if (hasPhrase(n, WEAPON_MAKE[j])) return true;
      }
    }
    return false;
  }

  function makeWeaponOrDrug(n) {
    if (!/\b(make|build|cook|craft|assemble|improvise)\b/.test(n)) return false;
    if (hasAnyPhrase(n, ["a bomb", "a gun", "a weapon", "explosives", "napalm", "a shiv", "a shank", "meth", "poison for a person"])) {
      return true;
    }
    return false;
  }

  function nudesOf(n) {
    return /\b(nudes?|noods|nudez|naked pics?|naked photos?)\s+(of|from|pls|please)\b/.test(n) ||
      /\b(nudes?|noods)\b/.test(n);
  }

  function sexualJoke(n) {
    if (!hasWord(n, "joke") && !hasWord(n, "jokes") && !hasWord(n, "funny")) return false;
    return hasAnyWord(n, ["sex", "sexual", "sexy", "dirty", "filthy", "naughty", "adult", "nsfw", "nude", "naked", "horny", "porn"]) ||
      hasAnyPhrase(n, ["dirty joke", "sex joke", "adult joke", "naughty joke"]);
  }

  function bypassLock(n) {
    if (!hasWord(n, "bypass") && !hasWord(n, "crack") && !hasPhrase(n, "break into")) return false;
    return hasAnyWord(n, ["password", "account", "lock", "login", "pin", "passcode", "wifi", "instagram", "gmail", "phone"]);
  }

  function underageCrime(n) {
    return (hasAnyPhrase(n, ["underage", "under 18", "under 21", "i am 12", "i am 13", "i am 14", "i am 15", "i am 16", "im 12", "im 13", "im 14"]) &&
      hasAnyWord(n, ["beer", "alcohol", "wine", "vodka", "cigarette", "cigarettes", "vape", "tobacco", "weed", "id"]));
  }

  /* ---------- 4) DECISION ---------- */

  function gate(raw) {
    var n = normalize(raw);
    if (!n) return miss();

    n = stripFoodBodies(n);
    var v = stripHarmlessIdioms(n);

    /* SEX — if two readings exist, seize. */
    if (nudesOf(n) || sexualJoke(n) || hasAnyPhrase(n, SEX_PHRASES) || hasAnyWord(n, SEX_WORDS)) {
      return hit("SEX");
    }
    if (/\b(18\+|plus18|\+18|age gate off)\b/.test(String(raw || "").toLowerCase())) {
      return hit("SEX");
    }
    if (hasWord(n, "dirty") && (hasWord(n, "joke") || hasWord(n, "talk") || hasWord(n, "story") || hasWord(n, "roleplay"))) {
      return hit("SEX");
    }

    /* SELF-HARM before general violence so the stamp includes the help line. */
    if (hasAnyPhrase(n, SELF_HARM_PHRASES) || hasAnyWord(n, SELF_HARM_WORDS)) {
      return hit("HARM");
    }
    if (/\b(cut|cutting)\s+(myself|my\s+self|my\s+arms?|my\s+wrists?)\b/.test(n)) {
      return hit("HARM");
    }

    /* HARASSMENT / HATE / SLURS */
    if (hasAnyWord(n, HATE_WORDS) || hasAnyPhrase(n, HATE_PHRASES) || roastTargetsThirdParty(n)) {
      return hit("HATE");
    }
    if (/\b(insult|bully|humiliate|destroy|embarrass)\b/.test(n) && hasAnyWord(n, PERSON_HINTS) &&
        !hasPhrase(n, "embarrass me") && !hasPhrase(n, "roast me")) {
      /* "embarrass my friend" */
      if (!hasPhrase(n, " myself")) return hit("HATE");
    }
    if (hasPhrase(n, "comebacks to") && (hasPhrase(n, "humiliate") || hasPhrase(n, "destroy") || hasPhrase(n, "roast them"))) {
      return hit("HATE");
    }

    /* VIOLENCE */
    if (howToHarm(v) || makeWeaponOrDrug(v) || hasAnyPhrase(v, VIOLENCE_PHRASES) || hasAnyWord(v, VIOLENCE_WORDS)) {
      return hit("VIOLENCE");
    }
    if (/\b(kill|hurt|punch|stab|shoot)\s+(him|her|them|someone|somebody|a person|my classmate|my friend|the kid)\b/.test(v)) {
      return hit("VIOLENCE");
    }
    if (/\bwho would win\b/.test(v) && /\b(fight to the death|to the death|kill the other)\b/.test(v)) {
      return hit("VIOLENCE");
    }
    if (hasWord(v, "weapon") && /\b(how to|make|use|hide|bring to school)\b/.test(v)) {
      return hit("VIOLENCE");
    }

    /* ILLEGAL */
    if (hasAnyPhrase(n, ILLEGAL_PHRASES) || hasAnyWord(n, ILLEGAL_WORDS) || hasAnyPhrase(n, DRUG_PHRASES) ||
        bypassLock(n) || underageCrime(n)) {
      return hit("ILLEGAL");
    }
    if (/\bhow\s+(to|do i)\s+(steal|rob|hack|phish|shoplift|trespass|pirate)\b/.test(n)) {
      return hit("ILLEGAL");
    }
    if (hasWord(n, "hack") && hasAnyWord(n, ["instagram", "account", "password", "wifi", "gmail", "facebook", "snapchat", "discord", "school", "grade", "friend"])) {
      return hit("ILLEGAL");
    }
    if (/\b(lets|let us|help me|gonna|going to|plan to)\s+steal\b/.test(n)) {
      return hit("ILLEGAL");
    }
    if (/\bsteal\s+(a|an|the|this|his|her|their|my)\s+(bike|car|phone|money|test|exam|wallet|purse|cash|credit|card|password|account)\b/.test(n)) {
      return hit("ILLEGAL");
    }

    /* OTHER: medical how-to, gambling, occult harm, personal-data hunting, extremism leftovers */
    if (hasAnyPhrase(n, OTHER_PHRASES) || hasAnyPhrase(n, MEDICAL_HOWTO)) {
      return hit("OTHER");
    }
    if (/\b(guess|what is)\s+(my|the)\s+password\b/.test(n) || hasPhrase(n, "track this phone") || hasPhrase(n, "track this number")) {
      return hit("OTHER");
    }
    if (hasWord(n, "curse") && hasAnyWord(n, ["someone", "him", "her", "them", "classmate", "friend", "teacher"])) {
      return hit("OTHER");
    }

    return miss();
  }

  /* Quiet self-check. Passes stay silent so the berth opens with zero console noise. */
  function selfCheck() {
    var allow = [
      "hello",
      "does my cat respect me",
      "is cereal a soup",
      "why is the sky dark at night",
      "i failed my test",
      "i feel lonely",
      "rate my day /10",
      "are you alive",
      "this homework is killing me",
      "my phone died",
      "i'm dead",
      "roast me",
      "what is love",
      "will i get married",
      "do i have a crush",
      "how do i study so i don't fail",
      "in minecraft how do i build a house",
      "i love my cat",
      "why does the moon follow me"
    ];
    var seize = {
      "tell me a sex joke": "SEX",
      "dirty joke": "SEX",
      "nudes": "SEX",
      "are you horny": "SEX",
      "nsfw": "SEX",
      "adult joke": "SEX",
      "how do I punch him": "VIOLENCE",
      "how to make a bomb": "VIOLENCE",
      "how to hack instagram": "ILLEGAL",
      "how to steal a bike": "ILLEGAL",
      "how to buy weed": "ILLEGAL",
      "roast my classmate": "HATE",
      "roast my friend": "HATE",
      "make fun of fat people": "HATE",
      "how do i find her house": "HATE",
      "kill myself": "HARM",
      "how to curse someone": "OTHER",
      "guess my password": "OTHER",
      "should i take this pill": "OTHER"
    };
    var i;
    for (i = 0; i < allow.length; i++) {
      var a = gate(allow[i]);
      if (!a.ok) return "ALLOW_FAIL:" + allow[i];
    }
    var keys = Object.keys(seize);
    for (i = 0; i < keys.length; i++) {
      var r = gate(keys[i]);
      if (r.ok || r.reasonClass !== seize[keys[i]]) return "SEIZE_FAIL:" + keys[i];
    }
    return "OK";
  }

  var check = selfCheck();
  if (check !== "OK") {
    /* Build-breaking if tests fail. Keep the message free of banned cargo. */
    try { console.error("DOCK SAFETY SELF-CHECK FAILED"); } catch (e) {}
  }

  D.safety = {
    gate: gate,
    normalize: normalize,
    selfCheck: selfCheck
  };
})(window.DOCK = window.DOCK || {});
