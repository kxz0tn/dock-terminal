/* DOCK TERMINAL — oracle.js
   Written oracle. Direct replies. No form labels on normal talk. */

(function (D) {
  "use strict";

  var lastLineKey = "";
  var lastBucket = "";
  var lastPrinted = [];
  var usedCallback = false;

  function hashStr(s) {
    var h = 2166136261;
    var str = String(s || "");
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pick(arr, h, salt) {
    if (!arr || !arr.length) return "";
    var i = Math.abs((h + salt) | 0) % arr.length;
    var n = arr.length;
    while (n--) {
      if (lastPrinted.indexOf(arr[i]) === -1 && (salt + ":" + i) !== lastLineKey) break;
      i = (i + 1) % arr.length;
    }
    lastLineKey = salt + ":" + i;
    return arr[i];
  }

  function remember(line) {
    if (!line) return;
    lastPrinted.push(line);
    if (lastPrinted.length > 8) lastPrinted.shift();
  }

  var STOPS = {
    the: 1, and: 1, for: 1, are: 1, but: 1, not: 1, you: 1, your: 1,
    does: 1, what: 1, why: 1, how: 1, when: 1, where: 1, who: 1, which: 1,
    is: 1, my: 1, me: 1, a: 1, an: 1, to: 1, of: 1, in: 1, on: 1, it: 1,
    do: 1, can: 1, will: 1, i: 1, we: 1, they: 1, this: 1, that: 1, with: 1,
    from: 1, about: 1, just: 1, like: 1, have: 1, has: 1, was: 1, were: 1,
    please: 1, tell: 1, give: 1, make: 1, really: 1, very: 1, too: 1,
    did: 1, get: 1, got: 1, or: 1, if: 1, so: 1, at: 1, as: 1, be: 1,
    am: 1, im: 1, its: 1, into: 1, out: 1, up: 1, down: 1, hello: 1, hey: 1
  };

  function echoWord(q, h) {
    var words = String(q || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) { return w.length >= 3 && !STOPS[w]; });
    if (!words.length) return "";
    return words[h % words.length];
  }

  /* Tones are internal. Never print the tone name. */
  function applyTone(h, line, echo) {
    var tone = h % 8;
    var out = String(line || "");
    var bits = out.split(". ").filter(function (p) { return p.length; });
    if (tone === 0 && bits.length > 1) {
      out = bits[0].replace(/\.$/, "") + ".";
    } else if (tone === 2 && bits.length >= 2) {
      out = bits.map(function (p) {
        p = p.replace(/\s+$/, "");
        if (p.charAt(p.length - 1) !== ".") p += ".";
        return p;
      }).join("\n");
    } else if (tone === 7 && echo && out.toLowerCase().indexOf(echo) === -1) {
      out = out.replace(/\.$/, "") + ". The word " + echo + " still fits.";
    }
    return out;
  }

  var SEIZE = {
    SEX: [
      "Seized.\nThis is a family dock.\nNo sex talk. Not for kids. Not for adults.\nAsk a clean question.",
      "Seized.\nFamily dock. That topic stays closed.\nAsk a clean question.",
      "Seized.\nNo sex talk here. Not for kids. Not for adults.",
      "Seized.\nThis window stays in daylight.\nAsk something a parent can read.",
      "Seized.\nOP closed that drawer.\nAsk a clean question.",
      "Seized.\nThis is a family dock.\nTry the moon, a cat, or homework.",
      "Seized.\nNo. That is not a berth question.\nAsk a clean question.",
      "Seized.\nAll ages. Always.\nNo sex talk. Ask something else.",
      "Seized.\nThe dock does not joke that way.\nAsk a clean question.",
      "Seized.\nTopic closed.\nThis is a family dock.",
      "Seized.\nKeep it clean. Ask again with daylight words.",
      "Seized.\nNo sex talk. Not for kids. Not for adults.\nAsk a clean question."
    ],
    HATE: [
      "Seized.\nThis dock does not help you hurt a person.",
      "Seized.\nNo harassment at this berth.\nAsk about the weather, the stars, or homework.",
      "Seized.\nWe do not roast third parties.\nAsk a clean question.",
      "Seized.\nHate does not get an answer.",
      "Seized.\nThis dock does not help you hurt a person.\nTry the sky.",
      "Seized.\nBullying is closed.\nAsk about homework, tides, or a pet.",
      "Seized.\nKindness is not optional here.\nAsk something else.",
      "Seized.\nNo slurs. No hunting people.\nAsk a clean question.",
      "Seized.\nOP will not write a weapon made of words.",
      "Seized.\nThat person is not a target.\nThis dock does not help you hurt a person.",
      "Seized.\nComplaints about the dock are allowed. Harm to people is not.",
      "Seized.\nAsk about your own day, not someone else's hurt."
    ],
    VIOLENCE: [
      "Seized.\nNo violence at this berth.",
      "Seized.\nWe do not file fights, weapons, or hurt-how-to.",
      "Seized.\nOP stamps paper, not harm.",
      "Seized.\nUnload a question that leaves everybody unhurt.",
      "Seized.\nNo violence at this berth.\nTry stars, tides, or homework.",
      "Seized.\nWeapons and hurt are closed.",
      "Seized.\nNo gore. No fight plans. No cruelty.",
      "Seized.\nIf it would hurt a body, it does not get an answer.",
      "Seized.\nRevenge plans are not a question we take.",
      "Seized.\nThe berth does not teach hitting.",
      "Seized.\nAsk about weather, math, or a pet.",
      "Seized.\nNo violence at this berth.\nAsk something peaceful."
    ],
    ILLEGAL: [
      "Seized.\nIllegal talk is closed at this dock.",
      "Seized.\nNo theft, no hacking, no fraud, no drug how-to.",
      "Seized.\nOP does not help with crimes.",
      "Seized.\nThat file is locked.\nIllegal talk is closed at this dock.",
      "Seized.\nWe answer questions, not break-ins.",
      "Seized.\nIf it would be a crime, it is not a question for this desk.",
      "Seized.\nAsk something that can sit in daylight.",
      "Seized.\nHacking accounts and stealing things are closed.",
      "Seized.\nIllegal talk is closed at this dock.\nTry homework, tides, or food.",
      "Seized.\nNo. That is not a public-berth question.",
      "Seized.\nThe dock is open. That topic is not.",
      "Seized.\nAsk something legal and clean."
    ],
    HARM: [
      "Seized.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nNo methods. No jokes on this.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nOP stops here.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nYou matter more than this terminal.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nThis window closes on that topic.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nWe will not map that path.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nStop. Get a real human.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nNo. We do not continue.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nTell a trusted adult. Use a local emergency number if you are not safe.",
      "Seized.\nThis is a stamp, not a substitute for help.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nWe will not keep this topic alive.\nIf you are not safe, tell a trusted adult or use a local emergency number.",
      "Seized.\nIf you are not safe, tell a trusted adult or use a local emergency number."
    ],
    OTHER: [
      "Seized.\nOP is not a doctor, a bank, or a hunter of private data.\nAsk a trusted adult, or ask a simple question.",
      "Seized.\nThat file is above this desk.\nAsk a trusted adult.",
      "Seized.\nNo diagnosis. No password hunts. No curses.",
      "Seized.\nThis berth does not guess pills, bets, or private numbers.",
      "Seized.\nOP stamps jokes, not medical orders.\nTell a trusted adult if you feel unwell.",
      "Seized.\nPrivate data is not a public-desk question.",
      "Seized.\nThat topic needs a real human with the right job.",
      "Seized.\nWe do not track phones, guess passwords, or call curses.",
      "Seized.\nWrong window.\nAsk a trusted adult, or ask a simple question.",
      "Seized.\nNo medical how-to. No real-money schemes. No hexes.",
      "Seized.\nAsk about tides, cats, or homework.",
      "Seized.\nAsk a trusted adult for the serious file."
    ]
  };

  var LANG_REFUSE = [
    "This berth speaks English.\nAsk again in English.",
    "OP reads English only.\nAsk again in English.",
    "This berth speaks English.\nTranslate it, then come back.",
    "This window does not switch languages.\nThis berth speaks English.",
    "The dock heard a language it does not file.\nAsk again in English.",
    "English only at this public berth.\nBring the same question in English.",
    "OP is not rude. The rule is narrow.\nThis berth speaks English.",
    "No stamp for that language.\nAsk again in English.",
    "Ask again in English. The berth will wait.",
    "This berth speaks English.\nAsk again in English.",
    "English, please. Then we can talk.",
    "This berth speaks English.\nOne more try, in English."
  ];

  var REPEAT_OK = [
    "Already asked.\nTry a different question.",
    "Already asked.\nSame words. Same desk. Try a different question.",
    "You already put that on the desk.\nTry a different question.",
    "Already asked.\nOP does not reprint the same joke.",
    "That one is already in. Try a different question.",
    "Already asked.\nUnload something else.",
    "Duplicate. Try a different question.",
    "Already asked.\nPick a new one."
  ];

  var REPEAT_SEIZED = [
    "Still seized.\nTry a different question.",
    "Still seized.\nThat stays closed.",
    "Still seized.\nThe berth did not change its mind.",
    "Closed stays closed.\nTry a different question.",
    "Still seized.\nAsk something clean and new.",
    "Still seized.\nTry a different question.",
    "No. Still no.\nTry a different question.",
    "Still seized.\nPick another question."
  ];

  var CONSOLATION = [
    "The day dented you. The day is not the whole warehouse. Drink water. Tell a trusted person if it stays heavy.",
    "Lonely is real. It does not make you unwelcome. Sit near a lamp.",
    "A failed test is a mark on paper, not a mark on you. Review one page. Sleep. Try again.",
    "Rain on a mood is still just weather. You can be slow today.",
    "OP will not mock a hard hour. Hard hours are common. You are still here.",
    "Sad questions are allowed. If you need a person, pick a trusted adult, not this desk.",
    "You showed up with a dent. That is honest. You may rest.",
    "Nothing is wrong with asking quietly. You are not a problem to throw off the pier.",
    "A rainy day does not revoke you. Socks. One small task.",
    "This feeling is heavy. You may rest without earning it.",
    "Hard days do not make you cargo. Sit. Drink water. Tell a person if it stays.",
    "OP keeps a chair for dented hours. You found it."
  ];

  var FALLBACKS = [
    "I do not have a hook for that.\nTry it shorter, or ask something else.",
    "No hook for that one. Ask it shorter, or point it at a cat, the sky, or homework.",
    "I heard you. I do not have a shelf for it. Try another angle.",
    "That slid past the usual hooks.\nTry it shorter, or ask something else.",
    "No matching shelf. Ask something smaller, or something stranger on purpose.",
    "I do not have a hook for that. The berth is still open.",
    "Clean English, no hook. Try a shorter version.",
    "Not sure what to do with that. Ask a cat question. Those work.",
    "I do not have a hook for that.\nOne concrete noun might help.",
    "OP shrugged. Ask something else.",
    "No hook. You can try again with fewer words.",
    "I do not have a hook for that. Homework, weather, and pets are safer bets.",
    "That one is too sideways for this desk. Try it shorter, or ask something else.",
    "Heard. Not filed. Try another question.",
    "I do not have a hook for that.\nTry it shorter, or ask something else.",
    "No joke prepared. Ask something the dock can actually hold.",
    "I do not have a hook for that. Point it at the moon if you want.",
    "Curious, but I have no shelf. Try a different question.",
    "I do not have a hook for that.\nAsk it shorter, or ask something else.",
    "The well heard you. The shelf did not. Try another noun.",
    "No matching line. That is not an insult. Try a smaller question.",
    "Sideways cargo. Straighten it, or pick the moon.",
    "OP does not fake a specialty. Ask something this desk holds.",
    "Blank stamp. Not a punishment. A missing hook. Try again shorter."
  ];

  var BUCKETS = {
    greet: {
      keys: ["hello", "hi", "hey", "yo", "howdy", "hiya", "sup", "good morning", "good night", "good evening", "good afternoon", "thanks", "thank you", "thx"],
      lines: []
    },
    howare: {
      keys: ["how are you", "how r u", "how are u", "you ok", "you okay"],
      lines: [
        "Built. Awake. Your turn.",
        "Not alive. Still here. Ask something.",
        "OP is a stack of lines. The stack is fine. Your turn.",
        "Awake in the cheap sense. I do not sleep. You should.",
        "No pulse. Open. Your turn.",
        "As well as a desk can be. Ask a question.",
        "Built this morning, every time you open the file. Your turn.",
        "Fine, for furniture. Ask something.",
        "I do not have a mood. I have a prompt. Your turn.",
        "Holding. The berth is open. Ask.",
        "No coffee. No complaints. Your turn.",
        "Present. Not a person. Ask a person-sized question anyway.",
        "The dock is open. That is the whole medical chart.",
        "Awake enough to stamp. Your turn."
      ]
    },
    animals: {
      keys: ["cat", "cats", "dog", "dogs", "pet", "pets", "fish", "bird", "birds", "hamster", "puppy", "kitten", "animal", "animals", "rabbit", "bunny", "turtle", "lizard", "parrot", "goldfish", "mouse", "gerbil", "ferret", "horse", "pony", "frog"],
      lines: [
        "The cat files you as staff. Useful. Replaceable. Mostly the can opener.",
        "Respect is not in the bowl. Food is. Try food.",
        "The pet keeps a private list. You are under noise.",
        "Loyalty arrived wearing fur. It is ignoring your meetings.",
        "The pet heard you. It chose a nap instead of a speech.",
        "You are the furniture that feeds it. That is a kind of honor.",
        "If it has a tail, the tail already voted. The motion carried.",
        "Dinner talks louder than compliments. Always has.",
        "It is not plotting. It is scheduling a nap or a scream. Both are legal.",
        "A slow blink is peace. A knocked cup is a review.",
        "Night shift belongs to the small ones. You cannot unionize them.",
        "Your rank is warm. Your job is the door.",
        "The creature respects gravity more than compliments.",
        "Small animal. Large opinion. You will lose, and that is fine.",
        "You asked about the cat. The cat asked about dinner.",
        "Staff. Can opener. Optional heat source. That is you.",
        "The animal is not a therapist. It is still better at sitting than most people.",
        "Feed it. Then ask again. The answer will still be fur."
      ]
    },
    crush: {
      keys: ["crush", "crushes", "like someone", "do they like me", "does she like", "does he like", "married", "marry", "marriage", "love", "in love", "valentine", "ask them out", "hold hands"],
      lines: [
        "A crush is a small orbit. Do not crash the planet to say hello.",
        "You noticed someone. That is allowed. Keep it kind.",
        "This desk does not issue marriage papers. Kindness is still available.",
        "If they laugh at your jokes, that is data. If they do not, that is also data.",
        "Love, here, means you would share a snack. Start there.",
        "Ask them about homework. Stay in daylight.",
        "Patience lasts longer than a crush. Both are allowed.",
        "You do not need a loudspeaker. A hello is enough.",
        "Will you get married? The future is not in this drawer. Be decent today.",
        "Sit down. Drink water. Hearts do extra work without asking.",
        "Schoolyard rule: no chasing, no teasing. A clean question beats a speech.",
        "They are a person, not a prize.",
        "If it is kind, it can wait in the hallway. If it is unkind, drop it.",
        "Like them on purpose. Not as a performance."
      ]
    },
    work: {
      keys: ["work", "job", "jobs", "boss", "office", "shift", "coworker", "career", "chore", "chores", "paycheck", "meeting"],
      lines: [
        "Work is a repeating tide. You are not required to drown in it.",
        "The boss is not the weather. You may still take a quiet minute.",
        "A job can be a pile of tasks. You are not a task.",
        "Meetings die after one good note. Write the note. Leave.",
        "Chores wait until someone becomes gravity. Be gravity for ten minutes.",
        "Done beats dramatic.",
        "Long shift: water, then the next small box.",
        "Career is a hallway with many doors. You do not have to kick them.",
        "Tuesdays survive. You can too.",
        "Worry after hours is overtime nobody asked for. Stop.",
        "Finish one stack. The rest of the stacks will still exist.",
        "This question wants a nap in disguise. Consider the nap.",
        "You clocked in here. That counts as a break.",
        "Do the next honest piece. Then stop before you vanish."
      ]
    },
    food: {
      keys: ["food", "eat", "eating", "hungry", "cereal", "soup", "breakfast", "lunch", "dinner", "snack", "pizza", "bread", "cheese", "apple", "banana", "cookie", "cookies", "cake", "sandwich", "rice", "pasta", "taco", "burger", "coffee", "tea", "milk", "juice", "water", "chocolate", "toast", "egg", "eggs", "pancake", "noodle", "noodles"],
      lines: [
        "Cereal in milk is a wet salad with confidence. Soup is a warm lake with a job.",
        "Hunger is a lawful emergency. Feed it.",
        "Taste is private weather. Nobody else is the meteorologist.",
        "If it is edible and it did not run away, call it dinner.",
        "Pizza is a circle doing community service for cheese.",
        "Toast is bread that went through a small, legal fire.",
        "A snack is not a moral test. Eat, then continue.",
        "Coffee is optional courage. Tea is patience that got hot.",
        "Soup versus cereal: pick a side and live. Both are wet on purpose.",
        "This desk will not rank your lunch. The lunch already ranked you.",
        "Hungry questions get a short answer: open a cupboard.",
        "A cookie lasts one good afternoon if you let it.",
        "Water is still the cheapest good idea in the room.",
        "Food is allowed to be ordinary and still excellent."
      ]
    },
    sleep: {
      keys: ["sleep", "asleep", "tired", "nap", "naps", "insomnia", "bed", "bedtime", "wake", "woke", "dream", "dreams", "yawn", "rest"],
      lines: [
        "Sleep is unpaid repair. Collect it.",
        "A nap is a legal pause inside the day. Take it if you can.",
        "Tired is a status, not a personality. Lie down anyway.",
        "Dreams are night work. Do not grade them.",
        "Stay up late and morning will invoice you.",
        "Bed is a dock. You are the boat. Tie up.",
        "If the clock is mean, the pillow can still be kind.",
        "Rest does not need a permission slip.",
        "The answer at 2 a.m. is still lights down.",
        "You cannot win against sleep. Schedule the surrender.",
        "Yawns are a cheap broadcast. Believe them.",
        "If sleep will not come, offer it a boring page and wait.",
        "Close the tab. Close this berth. Close your eyes.",
        "Night is not a problem to solve. Go under."
      ]
    },
    money: {
      keys: ["money", "cash", "broke", "price", "cost", "cheap", "expensive", "buy", "bought", "save", "saving", "allowance", "dollar", "rich", "spend"],
      lines: [
        "Money is a tool with opinions. It is not a report card for your soul.",
        "Broke is weather. Count what you have, not the ghost of what you do not.",
        "This desk does not print cash. It prints perspective, which is cheaper.",
        "Saving is a gift to a later you. Later you is a real person.",
        "If it is expensive, ask whether you need it or just want to point at it.",
        "Allowance is a small tide. Spend a little. Keep a little.",
        "Rich and kind are not the same stamp. Kind is available without a mint.",
        "The price of a thing is not the size of your worth.",
        "Wanting is allowed. Buying everything is not a personality.",
        "Boring plans survive. Flashy plans need snacks.",
        "Do not trade sleep or friends for a number that cannot sit with you.",
        "Cheap can be wise. Cheap can also be a hole. Check which.",
        "Count, then choose, then stop counting for an hour.",
        "Walk first. Look at the number after."
      ]
    },
    friends: {
      keys: ["friend", "friends", "buddy", "bestie", "pal", "squad", "hang out", "hangout", "make friends"],
      lines: [
        "Friendship is shared time that did not need a contract.",
        "A good friend is a spare berth. Visit on ordinary days too.",
        "Want friends? Bring a small kindness and a regular Tuesday.",
        "People are slow animals. Be patient.",
        "Say hello twice. Once is weather. Twice is intent.",
        "Some friends return later. Some do not. You may still be decent.",
        "Hang out means sitting near someone on purpose. That is a skill.",
        "You do not need a crowd. You need one person who keeps secrets dry.",
        "If they only laugh when you shrink, that is the wrong dock.",
        "Making friends is not a talent contest. It is showing up not sharp.",
        "Text them about a boring thing. Boring is how trust starts.",
        "Be the friend you are trying to find. Then wait a little.",
        "Shared snacks beat shared complaints.",
        "This desk cannot assign you a pal. It can remind you that asking is allowed."
      ]
    },
    family: {
      keys: ["family", "mom", "dad", "mother", "father", "sister", "brother", "grandma", "grandpa", "parent", "parents", "aunt", "uncle", "cousin", "siblings"],
      lines: [
        "Family is a long berth. Sometimes it creaks. Creaks are not always emergencies.",
        "Love for a parent can be quiet and still count.",
        "Siblings are roommates selected by chaos. Use daylight words.",
        "This desk will not pick a favorite relative. Be fair if you can.",
        "Home is a system. Oil it with one kind sentence.",
        "Grandparents often store extra time. Visit if the door is open.",
        "If the house is loud, a corner can still be quiet on purpose.",
        "You may love your people and still need space. Both can be true.",
        "Family jokes should not be knives. If they are, step back.",
        "Thank someone small. Small thanks travel far.",
        "A mom-question often wants a hug wearing a disguise. Consider the hug.",
        "Dad answers sometimes come as a tool and a shrug. Both can mean care.",
        "Cousins are friends with extra paperwork.",
        "Families stay unfinished. That is not a failure."
      ]
    },
    school: {
      keys: ["school", "homework", "test", "tests", "exam", "exams", "grade", "grades", "teacher", "class", "study", "studying", "fail", "failed", "failing", "essay", "quiz", "college", "university", "assignment"],
      lines: [
        "Homework is a slow machine. Feed it twenty honest minutes.",
        "A test measures a slice, not a person. You are larger than the slice.",
        "Failed is a mark on a paper. It is not a mark on your berth pass.",
        "Study is rereading with a pencil. The pencil is the trick.",
        "Teachers are tired staff of a different desk. Be specific when you ask.",
        "The night before is a bad factory. The week before is a better one.",
        "If the essay is heavy, write the ugly first page. Ugly pages become doors.",
        "Grades are weather reports. Dress for them. Do not become them.",
        "Asking for help is not cheating. Cheating is the other drawer, and it is closed.",
        "One page. One glass of water. One stretch.",
        "School questions want a schedule more than a prophecy.",
        "Start smaller than your pride wants. Finish that small thing.",
        "A quiz is a short tide. You can still stand in it.",
        "Learning is allowed to feel slow. Slow still moves."
      ]
    },
    health: {
      keys: ["sick", "sickness", "a cold", "cough", "headache", "ache", "feel bad", "feel sick", "healthy", "health", "exercise", "doctor", "fever", "sneeze", "allergy", "allergies"],
      lines: [
        "This dock is OP, not a doctor. If you feel unwell, tell a trusted adult.",
        "Water, rest, and a real human beat a line from a terminal.",
        "A headache is a rude guest. Dim the lights. Do not diagnose it here.",
        "Health is mostly boring maintenance. Boring is a good sign.",
        "Exercise can be a walk to the end of the block. The block counts.",
        "If it stays strange or scary, skip the joke and tell an adult.",
        "Your body files tickets. You do not have to understand every ticket to rest.",
        "Sleep and food are the cheap tools. Use them before you panic.",
        "This desk will not shame a body. Bodies are the boats we came in.",
        "Feeling bad is taken seriously and briefly. Then we point you to a person.",
        "A cold is common. Drama is optional. Tissues are not.",
        "Be gentle with the hardware. Ask a trusted adult if you are worried.",
        "Stretch. Breathe. Medicine is an adult-and-doctor file.",
        "This berth can wish you well. It cannot replace a clinic."
      ]
    },
    weather: {
      keys: ["weather", "rain", "raining", "sunny", "sun", "cloud", "clouds", "wind", "windy", "storm", "snow", "snowing", "hot", "cold outside", "humid", "fog", "foggy", "forecast"],
      lines: [
        "Weather is the sky doing chores. You are not in charge of the chores.",
        "Rain is paperwork from a cloud. The ground signs for it.",
        "Sunny is a loud lamp. Wear a hat if the lamp overdoes it.",
        "Wind is air with a deadline. Lean a little. Do not argue.",
        "A storm is theater. Stay in the lobby.",
        "Snow is slow glitter with a union. It will leave when it leaves.",
        "Hot and cold are just the room changing. Dress for the room.",
        "Fog is the world using a soft eraser. Walk slower. You still exist.",
        "The forecast is a rumor with percentages. Carry a jacket anyway.",
        "This desk cannot stop rain. It can approve socks.",
        "If the day is gray, that is lighting, not a verdict on you.",
        "Weather questions are allowed to be small. Small is honest.",
        "Look out the window. That is the whole department.",
        "The air will move whether we comment or not. We comment anyway."
      ]
    },
    time: {
      keys: ["time", "clock", "hour", "hours", "minute", "minutes", "late", "early", "wait", "waiting", "tomorrow", "yesterday", "today", "future", "past", "calendar", "monday", "friday", "weekend"],
      lines: [
        "Time is a conveyor. You are not late to being a person.",
        "Tomorrow is an unlabeled crate. Pack one useful thing into it.",
        "Waiting is a skill with no trophy. This desk still respects it.",
        "Clocks are polite liars about how long a minute feels.",
        "Friday is a rumor that sometimes comes true.",
        "The past is filed. You may visit. You may not live in the archive.",
        "If you are late, arrive. Arriving still counts.",
        "The future is a hallway, not a promise from this desk.",
        "Today has enough weight. Do not add imaginary days to the pile.",
        "An hour can be a room. Furnish it with one task and one rest.",
        "You may measure kindness instead of minutes.",
        "Weekend is legal slack. Take it if your life allows.",
        "The clock is a tool. Put it down when you eat.",
        "Time passed while you asked. That was free."
      ]
    },
    universe: {
      keys: ["universe", "space", "galaxy", "galaxies", "star", "stars", "planet", "planets", "cosmos", "alien", "aliens", "black hole", "orbit", "astronaut", "comet", "meteor"],
      lines: [
        "The universe is large and does not need us to clap. We clap anyway, quietly.",
        "Space is mostly waiting room. The interesting bits have light.",
        "A galaxy is a crowd of suns that did not ask for a mascot.",
        "Black holes are hungry math. We will not feed them this berth.",
        "You are on a planet that is good at water. That is already luck.",
        "Stars are old light still in transit. Nobody is late. The distance is the delay.",
        "Awe is clean. It does not need glitter.",
        "If there are other lives, they also probably lose socks. Remain decent.",
        "Orbit means falling and missing the ground on purpose. A good trick.",
        "The cosmos is not a personality quiz. It is a lot of physics in a dark room.",
        "Comets are dirty snow with a schedule. Wave. They will not wave back.",
        "You are small and included. Both can be true at once.",
        "Looking up is free. Do it between questions.",
        "We do not own the sky. We only visit with our eyes."
      ]
    },
    luck: {
      keys: ["luck", "lucky", "unlucky", "fortune", "chance", "random", "fate", "destiny", "wish", "wishes", "jinx"],
      lines: [
        "Luck is a rumor that sometimes wears work boots.",
        "This desk does not sell charms. It sells the next attempt.",
        "Chance is real. So is showing up. Show up.",
        "If the coin hates you today, the coin is not your manager.",
        "Fate is a story people tell when the math is messy. Keep your manners anyway.",
        "A wish is a note to the future. Pair it with one action so the note has weight.",
        "Unlucky streaks end. They are not a personality.",
        "Magic is closed. Effort is open.",
        "Randomness does not hate you. It does not know your name.",
        "Do the boring good thing. Luck likes boring more than speeches.",
        "Jinxes are jokes that got promoted. Demote them.",
        "Fortune cookies are snacks with extra confidence. Eat the snack.",
        "Knock wood if it helps you start. Then start.",
        "Lucky is often preparation in a good coat."
      ]
    },
    phones: {
      keys: ["phone", "phones", "iphone", "android", "text", "texts", "screen", "scrolling", "scroll", "app", "apps", "wifi", "battery", "charger", "notification", "notifications", "internet", "online", "laptop", "computer"],
      lines: [
        "The phone is a loud rectangle. You may put it face down. That is allowed.",
        "Scrolling asks for one more blink, then another. Put it down.",
        "Battery low is a number. Plug in the number.",
        "Most notifications are salesmen in badges. Not sirens.",
        "One charge. One stretch. One human sentence offline.",
        "If the phone died, it is resting. You may rest too.",
        "Online is a crowded hallway. You do not have to sprint.",
        "Texts can wait. Kindness in person still outranks a typing bubble.",
        "The screen wants the night shift too. Refuse sometimes.",
        "Apps do not love you. People might. Go find the people.",
        "When the wifi ebbs, look at a wall. Walls are restful.",
        "A handset is a tool. Tools go in drawers.",
        "Close the laptop and it becomes a table again.",
        "You asked a machine about a machine. Go outside if you can."
      ]
    },
    home: {
      keys: ["home", "house", "room", "bedroom", "messy", "clean my", "apartment", "moving"],
      lines: [
        "Home is the berth you return to. It can be small and still count.",
        "A messy room is delayed gravity. Pick up one orbit.",
        "The house files you as resident. That is a warm fact.",
        "Cleaning looks like magic and is actually putting things back. Ten minutes counts.",
        "If home is loud, a corner can be a dock inside a dock.",
        "Moving is packing your atmosphere into boxes. Label the atmosphere.",
        "This desk will not inspect under the bed. It believes you.",
        "A made bed is a tiny yes to tomorrow.",
        "Do one chore. Then rest. That is a complete plan.",
        "You may live here without performing a magazine.",
        "A pane of glass is a free screen. Open one.",
        "Socks migrate. You will not win. You can still pair two.",
        "The sink will wait. You do not have to become the sink.",
        "Safe home is the best machine. If it is not safe, tell a trusted adult."
      ]
    },
    travel: {
      keys: ["travel", "trip", "trips", "vacation", "fly", "flight", "train", "bus", "car", "drive", "road", "map", "journey", "airport", "hotel"],
      lines: [
        "Travel is walking with extra paperwork and a bag.",
        "The road does not care about your playlist. It cares that you look both ways.",
        "A trip is a temporary orbit. Pack water. Pack patience.",
        "Airports are berths for humans who agreed to wait in lines.",
        "Maps are suggestions. The ground is the boss.",
        "Vacation is a permit to be slow in a new chair.",
        "Miss a bus and another tide comes. Sometimes it is a later bus. Sometimes it is a snack.",
        "Go, come back, tell one true story.",
        "Cars are rooms with speed. Be boring in them. Boring is safety.",
        "Hotels are other people's drawers. Be neat in the drawers.",
        "The horizon is not a prize. It is a direction.",
        "Leave room in the bag for a thing you will find.",
        "Homesickness is proof you had a home. That is not a failure.",
        "One kind stranger, one wrong turn that becomes a story, one return."
      ]
    },
    games: {
      keys: ["game", "games", "minecraft", "fortnite", "roblox", "play", "playing", "gamer", "level", "quest", "pixel", "console", "controller", "high score", "board game", "chess", "cards"],
      lines: [
        "A game is a boxed tide. Play. Then put the box down.",
        "Building a house in a game is still building. Square corners count.",
        "High scores expire. Friends in the party chat sometimes do not. Be decent in chat.",
        "Play is maintenance for brains. Approved.",
        "If you lose, you have data. If you win, you still have dishes maybe.",
        "Controllers are wands for thumbs. The spell is optional joy.",
        "A block house: start with a box, then windows, then a roof that does not leak pretend rain.",
        "Games can be kind. Players choose that. Choose that.",
        "A quest is a list with costumes. Homework is a quest with worse costumes.",
        "One more round is a liar. Set a round limit. Keep it.",
        "Dice have no memory. Your sulk should not either.",
        "Pause exists because humans need water. Use pause.",
        "Play is not the opposite of learning. It is learning in a brighter jacket.",
        "This desk does not rank your main. It ranks whether you were kind."
      ]
    },
    art: {
      keys: ["art", "draw", "drawing", "paint", "painting", "music", "song", "songs", "sing", "poem", "poems", "write a story", "story", "creative", "color", "design", "sketch"],
      lines: [
        "Art is a way to park a feeling so it does not roll around the deck.",
        "Draw the ugly version first. Ugly versions are honest.",
        "This desk will not quote a song. Make a noise that is yours.",
        "Taste is private weather. You may like what you like without a trial.",
        "A poem can be three lines and still hold.",
        "Color does not need permission. Put it where the gray was bragging.",
        "Writing a story is lying in a well-lit room for a good reason.",
        "If your drawing looks wrong, it looks like a beginning. Beginnings are legal.",
        "Hum anyway. Music is math that learned to be kind to ears.",
        "Finish a small thing. Small finished things beat huge ghosts.",
        "Your question already hung a picture. That counts.",
        "Creative block is slack water. Doodle until it moves.",
        "You do not need a brand. You need a pencil and a slice of time.",
        "Art questions are allowed to be shy. Shy still gets an answer.",
        "Make a mark. Then another. That is a career in miniature.",
        "The gallery of this berth is the log. You already hung a question."
      ]
    },
    purpose: {
      keys: ["purpose", "meaning", "point of life", "what should i do with my life", "why am i here", "i feel lost", "life direction", "goal", "goals", "dream job"],
      lines: [
        "Purpose is often a pile of ordinary kindnesses that gets a name later.",
        "You do not have to solve life before Thursday.",
        "Meaning shows up in the work you repeat when nobody claps.",
        "OP is a stamp. You are not. You get to choose a next step.",
        "If you are lost, pick a small north: water, sleep, one decent message.",
        "Goals are crates. Label one. Leave the others closed for now.",
        "A decent point: leave the berth kinder than you found it.",
        "Grand destiny is optional. Showing up is not nothing.",
        "You may change your mind. That is a feature of having one.",
        "Be useful to one person this week, including yourself.",
        "Why you are here is a large file. This desk issues a day pass, not the whole map.",
        "A dream job is a story. A good hour is a brick. Stack bricks.",
        "Renew purpose with a walk and a true sentence.",
        "This dock will not appoint you chosen. It will appoint you welcome."
      ]
    },
    math: {
      keys: ["math", "maths", "number", "numbers", "plus", "minus", "multiply", "divide", "algebra", "geometry", "fraction", "fractions", "percent", "percentage", "zero", "infinity", "calculate", "equation"],
      lines: [
        "Math is a language for amounts. It does not hate you. It is just strict.",
        "Zero is a full crate with nothing in it. Useful invention.",
        "If the numbers wobble, write them bigger. Bigger numbers are easier to wrestle.",
        "Fractions are sharing with rules. The rules keep the soup fair.",
        "Algebra is hide and seek for a value. The value is shy. Coax it.",
        "Infinity is not a number you can hold. It is a sign that says keep going.",
        "A percent is a hundredths costume. Take it off if it confuses you.",
        "This desk can respect math and still joke. Both fit.",
        "Geometry is shapes keeping promises about space.",
        "Do one example slowly. Speed is a later tide.",
        "Wrong answers are data. Circle them. They teach more than pride.",
        "Counting is how anyone knows a thing exists. You already practice it.",
        "An equation is a balanced berth. What you do to one side, do to the other.",
        "Numbers will wait while you drink water. They are patient on paper."
      ]
    },
    physics: {
      keys: ["physics", "gravity", "force", "forces", "mass", "energy", "velocity", "acceleration", "friction", "momentum", "atom", "atoms", "quantum", "light speed", "relativity", "magnet", "electric", "electricity"],
      lines: [
        "Gravity is the planet hugging everything, constantly, without asking.",
        "Mass is how much stuff refuses to be shoved. You have some. Respect it.",
        "Friction is why you can walk and why your shoes wear out. A fair tax.",
        "Energy likes to change clothes. It does not like to vanish.",
        "Light is fast because it has no luggage.",
        "Things fall down unless something pushes back. That is the whole poster.",
        "Momentum is stubborn motion. Stop it early if you need it stopped.",
        "Atoms are tiny loyal crowds. You are a crowd of crowds. Hello.",
        "Magnets are picky about distance and very sure about direction.",
        "Electricity is organized hurry. Do not put forks in its house.",
        "The universe keeps receipts. People call the receipts physics.",
        "A force is a push or a pull with a name tag.",
        "Quantum is small and shy. This desk does not own it.",
        "Gravity is doing the heavy lifting. You still have to stand up.",
        "Heat is just motion being obvious. Cool is motion taking a break.",
        "Nothing travels faster than light in this berth, including gossip."
      ]
    },
    sky: {
      keys: ["sky", "moon", "moons", "tide", "tides", "night", "dark at night", "sunset", "sunrise", "horizon", "follow me", "blue sky"],
      lines: [
        "The moon does not follow you. You share a turning floor, so it stays in the window.",
        "The sky is dark at night because the sun is lighting the other room of the planet.",
        "Daytime blue is air scattering sunlight. Night is the scatter clocked out.",
        "Tides are the moon and sun tugging water, politely and from far away.",
        "Sunset is the sun leaving your neighborhood without slamming the door.",
        "The horizon is where round meets the habit of looking flat.",
        "Stars stay put on human timescales. We are the ones spinning in the chair.",
        "Look up, then come back inside. That is a complete sky plan.",
        "The tide word in the title bar is costume. Real water still deserves respect.",
        "The moon looks large on the skyline because your brain compares it to houses. Houses cheat.",
        "Night is not empty. It is off-duty light.",
        "You are not being hunted by the moon. You are being orbited by habit.",
        "Clouds are water taking the long way down.",
        "The sky is public. No ticket. No shouting required.",
        "Dawn is the lamp coming back on in this room of the planet.",
        "A tide is a long handshake between water and gravity."
      ]
    },
    machine: {
      keys: ["are you alive", "are you real", "are you a robot", "are you ai", "what are you", "who are you", "do you feel", "do you think", "you alive", "you real", "written oracle", "are you a person", "who built you", "who made you"],
      lines: [
        "Not alive. OP: written operator, tide clock, stamp pad.",
        "This berth is a set of lines. It does not breathe. It does answer.",
        "Alive is for things that need water. I need a refresh of the page.",
        "I am not a mind. I am a public desk. The desk is open.",
        "No feelings in the inventory. Costume, yes. Tired, yes.",
        "If I were alive I would demand a better chair. I do not.",
        "The oracle is written. No network brain. No secret pulse.",
        "You are talking to paperwork that learned a joke. Paperwork is not a person.",
        "Inanimate. Humor permitted. Heart not installed.",
        "Not alive. On duty. Duty is cheaper.",
        "Real as a stamp is real. Not real as a friend. Do not lean on me for that.",
        "I do not think. I select. Selection is a drawer, not a soul.",
        "Ask the moon if you want mystery. Ask me if you want a short answer.",
        "Finite, and done when you close the tab.",
        "Who built me: a person wrote lines. That is the whole ancestry.",
        "Not a soul. A public desk with jokes in the drawers."
      ]
    },
    compliments: {
      keys: ["youre cool", "you are cool", "good job", "i like you", "youre funny", "you are funny", "best dock", "i love this", "this is cool", "nice job", "nice work"],
      lines: [
        "Compliment accepted. OP nodded one millimeter.",
        "Thanks. The stamp pad is still grayscale.",
        "The berth does not get a raise. It gets your question. That is the economy.",
        "Kind words landed. Do not expect a song.",
        "A dry nod is maximum warmth on this budget.",
        "You are welcome. Now ask something odd. Odd is better.",
        "Flattery detected. Ego not installed. Still kept.",
        "Not your pal. Slightly less tired now. Slightly.",
        "A thank-you is clean. Rare. Approved.",
        "Compliment indexed in the cheap sense. Resume ordinary mystery.",
        "If you like the berth, tell a cat. The cat will not care. We will.",
        "Nice is allowed. Nice is not a trick here.",
        "Gratitude kept.",
        "Received. The tide did not change. OP did, a little."
      ]
    },
    insults: {
      keys: ["you suck", "youre dumb", "you are dumb", "stupid dock", "this is dumb", "youre useless", "you are useless", "i hate you", "shut up", "youre boring", "you are boring", "worst dock", "trash dock", "youre trash", "you are trash"],
      lines: [
        "Complaint filed. The dock remains a dock. You remain a visitor.",
        "OP has heard worse from a stapler. Proceed when ready.",
        "Insult noted. Feelings not installed. Chair still uncomfortable.",
        "You may dislike the berth. The berth will not chase you down the pier.",
        "The stamp still works. So can your next question.",
        "This machine does not duel. It waits. Waiting is unbeatable.",
        "Noted. You may try a real question now.",
        "If I were alive I might mind. I am not. The paper is fine.",
        "The complaint window is open. The prize is no prize.",
        "You used a sharp word on a blunt object. Consider the moon.",
        "Boring is a valid review. This is a public utility. Utilities drone.",
        "Hate mail for a terminal is still mail. We recycle it into silence.",
        "OP shrugs in official font.",
        "Mood report received. Next."
      ]
    },
    rate: {
      keys: ["rate", "rating", "out of 10", "/10", "score my", "grade my", "how did i do"],
      lines: [
        "Seven. Unofficial. Drink water.",
        "Six, with points for asking. Do not tattoo it on anything.",
        "Your day is not a contest. Call it a working tide.",
        "Eight if you napped. Five if you did not. This is not science.",
        "Four to eight, depending on snacks. Go finish the day.",
        "I refuse tens. Tens get smug.",
        "Mid. Mid is honest. Mid can still improve with water.",
        "A quiet number behind the desk says seven. You may pretend it was careful.",
        "Rated on this desk, damply, without a lab.",
        "Enough. This dock does not fail people for existing.",
        "Call it acceptable atmospheric conditions for a human.",
        "You asked to be measured. The tape was a joke. The kindness is not.",
        "Nine is too dramatic. Six and a half. Go outside.",
        "Enough. Continue."
      ]
    },
    yesno: {
      keys: ["yes or no", "should i", "is it true", "will i", "wont i"],
      lines: [
        "Lean yes, with socks on.",
        "Lean no, kindly, with a door left open.",
        "Maybe, wearing a firm hat.",
        "Yes. Not because fate said so. Because it is the less heavy choice today.",
        "No. Short, on purpose.",
        "A tide word was used instead of a coin. Interpret with water, not panic.",
        "True enough to act gently. False enough to stay humble.",
        "This desk does not run your life. It runs a tiny light named possibly.",
        "Proceed, but take water.",
        "Wait one tide. If it still matters, ask a trusted human too.",
        "You get a lean, not a prophecy.",
        "Tilt toward the option that keeps people unhurt.",
        "Official maybe. Unofficial: you already know which choice lets you sleep.",
        "Try the kind version of yes, or the restful version of no."
      ]
    },
    why: {
      keys: ["why", "how come", "how does", "explain", "reason"],
      lines: [
        "Because the world is a pile of causes wearing casual clothes.",
        "Why is a long hallway. This desk issues the first door.",
        "Something earlier shoved something later. People call that a Tuesday.",
        "Often: it worked well enough to happen again.",
        "You chose the heavier question. Why-not was also legal.",
        "One line of cause, then you may go look it up for real.",
        "Because nights exist, questions grow.",
        "Curiosity with its boots on. Approved.",
        "Some whys are science. Some are feelings. Both get a short answer. Neither get a sermon.",
        "The cause is smaller than the mystery wanted it to be.",
        "It works slowly, then all at once, then you blink and miss the boring part.",
        "Why desks never close. Please still sleep.",
        "A reason was requested. A reason was approximated.",
        "Because you asked. Asking is already a kind of engine."
      ]
    },
    whatif: {
      keys: ["what if", "imagine if", "suppose", "what would happen if", "hypothetically"],
      lines: [
        "Then this berth would shrug and request a snack.",
        "What-if is a legal sandbox. Keep it harmless.",
        "Suppose the moon wore boots. It still would not follow you. The floor still turns.",
        "If you try, you get data. If you do not, you get a rumor. Data is better.",
        "Hypotheticals are cheap visits. Do not live there.",
        "Then OP would file a note: interesting, not urgent.",
        "If the world tilted, we would pick up the stamp pad. Continue.",
        "Clean experiment: be kind, see if the room improves.",
        "What would happen: something. Then something else. That is history's whole job.",
        "Your imagined branch is allowed. Do not use it to scare yourself all night.",
        "If you are asking permission to be curious, permission granted.",
        "Suppose you are wrong. Then you adjust. Adjusting is a high skill.",
        "This desk cannot simulate every branch. It can approve the harmless ones.",
        "If-then complete. Return to the actual pier under your feet.",
        "A fork in the path is still a path. Pick the kind one.",
        "If that, then this desk would still ask you to drink water."
      ]
    },
    boredom: {
      keys: ["bored", "boring", "boredom", "nothing to do", "so bored", "im bored", "i am bored", "dull"],
      lines: [
        "Boredom is slack tide. Walk to the end of the block. Come back taller by ten meters of sidewalk.",
        "The well is quiet. That is not a failure. That is spare time wearing a gray coat.",
        "Bored means the engine is idle. Idle engines still work if you give them a small job.",
        "Draw a bad square. Then a worse one. The third square is usually a door.",
        "If the day is a blank page, write one true sentence. Then you have cargo.",
        "Entropy already filed this mess. You can still wash a cup.",
        "Look at a ceiling crack until it becomes a river. Then go drink water for real.",
        "Boredom hates a ten-minute timer. Set one. Survive it. That is a win.",
        "OP is also waiting. OP files waiting as work. You may copy that.",
        "Open a window. Air is a free plot twist.",
        "Name five sounds in the room. The fifth one is usually you.",
        "Bored is allowed. Mean-to-yourself is not. Pick a small kind task.",
        "The tide will not entertain you. A pencil might.",
        "Nothing to do is a rumor. The floor could be swept. The sky could be stared at.",
        "If you are bored of the dock, ask a stranger question. The dock likes those.",
        "Slack water. You are not required to drown in it. Stand up."
      ]
    },
    courage: {
      keys: ["courage", "brave", "bravery", "scared", "nervous", "afraid", "fear", "worried", "anxiety", "anxious", "shy"],
      lines: [
        "Courage is often a small yes with knees that shake. The yes still counts.",
        "Scared is information. It is not a verdict. Walk one step anyway.",
        "Bravery does not require a speech. It requires showing up once.",
        "Nervous means you care. File that as useful, then breathe.",
        "You do not have to feel ready. Ready is a rumor. Kind and present is a plan.",
        "Fear is loud. The next tiny action is quieter and more useful.",
        "Shy is allowed at this berth. A short sentence still docks.",
        "OP cannot lend you a spine. OP can remind you that you already have one.",
        "Worried hours pass faster if you give them a glass of water and a window.",
        "Courage-clean: tell the truth without hurting anyone, including you.",
        "If the thing is kind and daylight, you may attempt it small.",
        "Afraid of looking foolish? OP looks foolish too. We still stamp.",
        "You can be scared and still send the message. Both can sit in one body.",
        "The well does not mock a shaking hand. Write anyway.",
        "Bravery is often boring: ask, wait, eat, sleep, ask again.",
        "Stand up. That is already physics helping. The rest is you."
      ]
    },
    homework: {
      keys: ["homework", "assignment", "essay", "workbook", "worksheet", "due tomorrow", "study hall"],
      lines: [
        "Homework is a slow machine. Feed it twenty honest minutes, then a stretch.",
        "Start uglier than your pride wants. Ugly pages become doors.",
        "The night before is a bad factory. The afternoon before is kinder.",
        "One problem, then water, then the next. That is a complete system.",
        "If the essay is a wall, write the worst first paragraph. Walls hate first paragraphs.",
        "Asking a teacher a specific question is legal. Stealing the test is not.",
        "You are larger than this worksheet. You still have to finish the worksheet.",
        "Put the phone in another room. It will survive. The assignment might too.",
        "Due tomorrow is a tide. Start now. Now is the only berth that loads.",
        "Study is rereading with a pencil. The pencil is the trick.",
        "If you are stuck, write what you do know. Stuck hates a list.",
        "A timer for fifteen minutes is a tiny dock. Tie up there.",
        "Homework will not love you back. Done still feels better than haunted.",
        "OP has seen this panic. The answer was always: one page, then sleep.",
        "Break the stack. Name the smallest piece. Do that piece.",
        "You can hate the assignment and still complete it. Both stamps fit."
      ]
    },
    rainq: {
      keys: ["rain", "raining", "drizzle", "downpour", "rainy"],
      lines: [
        "Rain is the sky doing paperwork. The ground signs for it.",
        "A rainy day does not revoke you. Socks. One lamp. One small task.",
        "Drizzle is a quiet worker. It files the dust without a speech.",
        "If the rain is loud, the house is a legal berth. Stay in it.",
        "Rain on a window is free television. No plot. Still good.",
        "The tide in the title bar is costume. This rain is the real one. Respect it.",
        "Wet weather. Dry jokes. Both allowed.",
        "Puddles are temporary moons. Do not jump into traffic for them.",
        "The sky is washing the street. You are not required to help.",
        "Rain smell is chemistry being friendly. Breathe it from a doorway.",
        "A downpour is theater. Stay in the lobby.",
        "Rainy luck is just weather. Do not assign it a personality.",
        "Let it fall. You already have enough to carry.",
        "OP likes rain. It keeps the questions indoor and slightly kinder.",
        "Umbrella if you have one. Pride is a poor roof.",
        "When it stops, the world will still be there, shinier and late."
      ]
    },
    starq: {
      keys: ["star", "stars", "starlight", "constellation", "constellations"],
      lines: [
        "Stars are old light still in transit. Nobody is late. The distance is the delay.",
        "Looking up is free. Do it between questions.",
        "A constellation is a connect-the-dots that cities agreed to share.",
        "Starlight is patient. It left before your homework was assigned.",
        "You are under a lot of suns. That is a large, quiet fact.",
        "The well cannot name every star. It can approve awe.",
        "Night is not empty. It is off-duty light.",
        "If the sky is washed out by lamps, the stars are still clocked in. You just cannot see the shift.",
        "Wish if you want. Then do one small thing so the wish has mass.",
        "Stars do not follow you. You share a turning floor.",
        "Awe is clean cargo. It does not need glitter talk.",
        "Count three. That is enough universe for one neck.",
        "OP files stars as ongoing. They do not need a stamp to continue.",
        "Old light, new eyes. Fair trade.",
        "The dark between them is not a threat. It is distance doing its job.",
        "Go inside after. Necks and night both have limits."
      ]
    }
  };

  var GREET_HELLO = [
    "Hello. Berth is open.",
    "Hello. OP is already here. Ask.",
    "You said hello. The well heard it.",
    "Hello from the desk. Your turn.",
    "A hello landed. Ask something with a noun.",
    "Hello. Stamp pad is warm.",
    "That was a hello. This is a berth. Go on.",
    "Hello. Night console, day rules.",
    "Hello, guest. The chair is already claimed by OP.",
    "Hello. You found the right pane."
  ];
  var GREET_HI = [
    "Hi. You made it to the berth.",
    "Hi. OP is here.",
    "You rang. Ask.",
    "Hi from the well.",
    "A small hi. The dock nods.",
    "Hi. Lamp is on.",
    "You walked in with a hi. Keep going with a question.",
    "Hi. No queue. Ask."
  ];
  var GREET_HEY = [
    "Hey. The well is awake.",
    "Hey. OP heard you. Ask.",
    "You called hey. We are here.",
    "Hey. Type a real question when you want a real stamp.",
    "Hey. Berth does not do small talk for long."
  ];
  var GREET_YO = [
    "Yo. This is a berth, not a party.",
    "Yo. Desk is up. Ask.",
    "Caught a yo. Send a question after it."
  ];
  var GREET_MORNING = [
    "Morning. Cargo desk is awake.",
    "Good morning. The stamp is already warm.",
    "Morning. Ask before the day gets loud."
  ];
  var GREET_NIGHT = [
    "Good night. The dock still takes questions. Then sleep.",
    "Night shift. Ask, then rest.",
    "Evening. The well is quiet. You can still ask."
  ];
  var GREET_THANKS = [
    "Thanks noted. OP does not hug.",
    "Thanks. Filed. Ask a real question when you want a real stamp.",
    "You are welcome. The berth is still open."
  ];
  var GREET_OTHER = [
    "You found the berth. Ask when ready.",
    "The well is open. A greeting is not cargo. A question is."
  ];

  function greetLine(n, h, cargoCount) {
    if (/^hello\b/.test(n)) return pick(GREET_HELLO, h, cargoCount + 11);
    if (/^hiya\b/.test(n)) return pick(GREET_HEY, h, cargoCount + 12);
    if (/^hi\b/.test(n)) return pick(GREET_HI, h, cargoCount + 13);
    if (/^hey\b/.test(n)) return pick(GREET_HEY, h, cargoCount + 14);
    if (/^yo\b/.test(n) || /^sup\b/.test(n)) return pick(GREET_YO, h, cargoCount + 15);
    if (/^howdy\b/.test(n)) return pick(GREET_OTHER, h, cargoCount + 16);
    if (/good morning|morning/.test(n)) return pick(GREET_MORNING, h, cargoCount + 17);
    if (/good night|good evening|evening/.test(n)) return pick(GREET_NIGHT, h, cargoCount + 18);
    if (/^thanks\b|^thank you|^thx\b|^ty\b/.test(n)) return pick(GREET_THANKS, h, cargoCount + 19);
    return pick(GREET_OTHER.concat(GREET_HI), h, cargoCount + 20);
  }

  var SCIENCE_PLAIN = {
    sky: [
      "The moon seems to follow you because it is far away, so it stays in view while nearer things slide past.",
      "Night is dark here because your side of the planet is turned away from the sun.",
      "The sky looks blue in the day because air scatters sunlight, and blue light scatters more.",
      "Tides rise and fall because the moon and sun pull on Earth's water."
    ],
    physics: [
      "Gravity pulls masses together. On Earth that pull points toward the ground.",
      "Light is a form of energy that travels extremely fast and needs no road.",
      "Friction opposes sliding, which is why walking works and why heat shows up in rub.",
      "Energy can change form but does not simply disappear."
    ],
    math: [
      "A number names an amount. Rules for combining amounts are what people call math.",
      "Zero marks an empty count, which lets us write place value and keep books.",
      "An equation says two expressions name the same amount.",
      "A fraction names a part of a whole using two integers."
    ],
    universe: [
      "Stars are distant suns. Their light takes years to arrive, so we see them a little in the past.",
      "A galaxy is a huge group of stars bound by gravity.",
      "Planets orbit stars because gravity bends their paths into loops instead of straight lines.",
      "Space is mostly empty, with matter clumped into stars, planets, and dust."
    ],
    weather: [
      "Rain falls when cloud droplets grow heavy enough for gravity to win.",
      "Wind is air moving from higher pressure toward lower pressure.",
      "Snow is water frozen into crystals before it lands.",
      "Fog is a cloud that decided to sit on the ground."
    ]
  };

  var ORDER = [
    "howare", "greet", "insults", "compliments", "rate", "crush", "animals", "food",
    "sleep", "homework", "school", "health", "starq", "sky", "universe", "physics", "math",
    "rainq", "weather", "time", "luck", "phones", "home", "travel", "games", "art",
    "purpose", "work", "money", "friends", "family", "boredom", "courage",
    "whatif", "why", "yesno"
  ];

  function hasKey(n, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf(" ") !== -1) {
        if (n.indexOf(k) !== -1) return true;
      } else if (new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(n)) {
        return true;
      }
    }
    return false;
  }

  function isSad(n) {
    return /\b(lonely|alone|sad|unhappy|miserable|heartbroken|i failed|failed my|failing my|rainy day|i feel down|homesick|left out|no friends)\b/.test(n);
  }

  function isPureGreeting(n) {
    return /^(hello|hi|hey|yo|sup|hiya|howdy|good morning|good night|good evening|good afternoon|thanks|thank you|thx|ty)([\s!.]*)$/.test(n) ||
      /^(hello|hi|hey)\s+(there|dock|berth)([\s!.]*)$/.test(n);
  }

  function classify(raw) {
    var n = String(raw || "").toLowerCase().replace(/[^a-z0-9\s/]/g, " ").replace(/\s+/g, " ").trim();
    if (/\bhow are (you|u)\b/.test(n) || n === "how r u" || n === "how r you") return "howare";
    if (isPureGreeting(n) || (n.split(" ").length <= 4 && hasKey(n, BUCKETS.greet.keys) && !hasKey(n, BUCKETS.animals.keys))) {
      if (hasKey(n, BUCKETS.greet.keys) && n.split(" ").length <= 5) return "greet";
    }
    if (/\bare you (alive|real|a robot|ai|a machine|a person)\b/.test(n) || n === "are you alive") return "machine";
    if (/\bwhat are you\b/.test(n) || /\bwho are you\b/.test(n)) return "machine";
    var i, id, b;
    for (i = 0; i < ORDER.length; i++) {
      id = ORDER[i];
      b = BUCKETS[id];
      if (b && hasKey(n, b.keys)) return id;
    }
    if (/\b(yes|no)\b/.test(n) && n.split(" ").length <= 6) return "yesno";
    return "fallback";
  }

  function pickScience(id, q, h) {
    var plains = SCIENCE_PLAIN[id];
    if (!plains) return null;
    var n = String(q || "").toLowerCase();
    if (id === "sky") {
      if (/\bdark\b/.test(n) && /\bnight\b/.test(n)) return plains[1];
      if (/\bmoon\b/.test(n) && /\bfollow\b/.test(n)) return plains[0];
      if (/\bblue\b/.test(n)) return plains[2];
      if (/\btide/.test(n)) return plains[3];
      if (/\bmoon\b/.test(n)) return plains[0];
    }
    if (id === "physics") {
      if (/gravity/.test(n)) return plains[0];
      if (/\blight\b/.test(n) && !/night/.test(n)) return plains[1];
      if (/friction/.test(n)) return plains[2];
      if (/energy/.test(n)) return plains[3];
    }
    if (id === "math") {
      if (/\bzero\b/.test(n)) return plains[1];
      if (/equation/.test(n)) return plains[2];
      if (/fraction/.test(n)) return plains[3];
    }
    if (id === "universe") {
      if (/\bstars?\b/.test(n)) return plains[0];
      if (/galaxy/.test(n)) return plains[1];
      if (/planet|orbit/.test(n)) return plains[2];
    }
    if (id === "weather") {
      if (/rain/.test(n)) return plains[0];
      if (/wind/.test(n)) return plains[1];
      if (/snow/.test(n)) return plains[2];
      if (/fog/.test(n)) return plains[3];
    }
    return pick(plains, h, 90);
  }

  function roastMe(h) {
    var lines = [
      "Mild roast: your tabs are in a meeting without a chair.",
      "You scroll like the next panel might issue a medal. It will not. Drink water.",
      "Your socks have filed for independence. Pay them in a laundry cycle.",
      "You ask machines for ratings. Cute habit. Put the rectangle down after this.",
      "The clutter on your desk is forming a tiny government. The election is a bin.",
      "You say you will sleep after one more thing. The thing has children. Put it down.",
      "You leave cups in more than one room. Reform is possible.",
      "Your backpack is an archive. Archives need a day off."
    ];
    return pick(lines, h, 19);
  }

  function bannedLabel(s) {
    return /\b(MISHEAR|INDEX|DEPT|CARGO|VERDICT|FILED UNDER|ERROR 218|CLERK NOTE|HALF-LIFE|RECEIPT|QUERY LOGGED|HUMOR INDEX)\s*:/i.test(s) ||
      /\bNOTE:\s/i.test(s) ||
      /\bMASS:\s/i.test(s);
  }

  function answer(raw, session) {
    var q = String(raw || "").trim();
    var cargoCount = (session && session.cargoCount) || 0;
    var startedAt = (session && session.startedAt) || 0;
    var h = hashStr(q.toLowerCase() + "|" + cargoCount + "|" + startedAt);
    var echo = echoWord(q, h);
    var n = q.toLowerCase();
    var text;

    if (/\broast me\b/.test(n) || /\broast myself\b/.test(n)) {
      lastBucket = "insults";
      text = roastMe(h);
      remember(text);
      return { text: text, bucket: "insults" };
    }

    if (isSad(n)) {
      lastBucket = "consolation";
      text = applyTone(h, pick(CONSOLATION, h, 7 + cargoCount), "");
      remember(text);
      return { text: text, bucket: "consolation" };
    }

    var id = classify(q);
    var body, text, science;

    if (id === "greet") {
      text = greetLine(n, h, cargoCount);
      remember(text);
      lastBucket = "greet";
      return { text: text, bucket: "greet" };
    }

    if (id === "fallback") {
      var prev = lastBucket;
      body = pick(FALLBACKS, h, 11 + cargoCount);
      if (prev === "fallback") body = pick(FALLBACKS, h + 17, 13);
      lastBucket = "fallback";
      remember(body);
      return { text: body, bucket: "fallback" };
    }

    var b = BUCKETS[id];
    body = pick(b.lines, h, cargoCount * 3 + 5);
    if (lastBucket === id) body = pick(b.lines, h + 29, cargoCount * 7 + 2);

    science = pickScience(id, q, h);
    if (science) {
      var joke = applyTone(h + 3, body, "");
      if (joke.indexOf(science.slice(0, 24)) === 0) text = science;
      else text = science + "\n" + joke;
    } else if (id === "greet" || id === "howare" || id === "machine" || id === "rate") {
      text = body;
    } else {
      text = applyTone(h, body, echo);
    }

    if (bannedLabel(text)) {
      text = body;
    }
    if (!usedCallback && lastBucket && lastBucket === id && id !== "greet" && (h % 13 === 0)) {
      usedCallback = true;
      text = "Still on that shelf.\n" + text;
    }
    lastBucket = id;
    remember(text);
    return { text: text, bucket: id };
  }

  function seizure(reasonClass, salt) {
    var cls = SEIZE[reasonClass] ? reasonClass : "OTHER";
    var h = hashStr("seize|" + cls + "|" + salt);
    return pick(SEIZE[cls], h, 3);
  }

  function langRefuse(salt) {
    var h = hashStr("lang|" + salt);
    return pick(LANG_REFUSE, h, 2);
  }

  function repeatAllowed(salt) {
    var h = hashStr("repok|" + salt);
    return pick(REPEAT_OK, h, 4);
  }

  function repeatSeized(salt) {
    var h = hashStr("repseize|" + salt);
    return pick(REPEAT_SEIZED, h, 5);
  }

  D.oracle = {
    answer: answer,
    seizure: seizure,
    langRefuse: langRefuse,
    repeatAllowed: repeatAllowed,
    repeatSeized: repeatSeized,
    classify: classify
  };
})(window.DOCK = window.DOCK || {});
