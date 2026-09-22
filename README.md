# DOCK TERMINAL

A public night berth. Full-bleed black console. One prompt: `DOCK>`. You type a clean English question. OP answers in short sentences.

Live site: https://kxz0tn.github.io/dock-terminal/

Looks like a plain console. Not affiliated with any other terminal product.

## What it is not

- Not a hosted model, chatbot, or network brain
- Not a prophet or a friend
- Not a medical, legal, or emergency service
- Not an adult mode with a password
- Not affiliated with any other terminal product

## Family rules

Kids, teenagers, and adults share this berth. A child and a parent should be able to read the screen together.

The dock will seize a question (refuse, without repeating banned words) for:

- Sex talk — for kids and for adults. No wink.
- Harassment, hate, slurs, stalking, or roasting a third person
- Violence how-to, weapons, gore, cruelty
- Illegal talk: theft, hacking accounts, fraud, drugs, underage drinking
- Self-harm methods (short stop + tell a trusted adult)
- Graphic medical how-to, real-money gambling schemes, curses aimed at people, hunting private data

If a joke and a safety rule collide, the safety rule wins.

## English-only answers

The machine answers in English. Other languages are refused in English. This is not advertised on boot.

One foreign word inside a clear English sentence is still answered in English. Unsure kids-talk is allowed.

## How to open

Open `index.html` in a browser. No install. No server. No network required.

Relative paths only. Tap, Enter, or Space skips boot. Type at `DOCK>` and press Enter. On a phone, SEND sits beside the field.

Select text in the log and copy.

Optional sound is a tiny oscillator click (on for desktop, off for touch). Toggle with `MUTE` / `SOUND`.

## Commands

| Command | What it does |
| --- | --- |
| `HELP` or `?` | What this is, family rules, commands, example questions as text |
| `CLEAR` or `CLS` | Clear the log. Title strip stays. |
| `ABOUT` | Written oracle, family dock, CC0. OP is the operator on this berth. |
| `EXAMPLES` | Example questions as text |
| `STATUS` | Open berth, language, tide, cargo, clock, sound, node |
| `TALLY` | Session counts only. No text kept |
| `MANIFEST` | Allowed questions this session. Seized items print as `[seized]` |
| `MUTE` / `SOUND` | Toggle keyclick |
| `VERSION` | `DOCK TERMINAL 1.0` |
| `TIDE` | One short tide line |
| `ORACLE` | What the written oracle is |
| `WHO` | OP. Operator on this berth. |
| `RAIN` / `STARS` / `DOCK` | Short clean mutters |

Empty: `Nothing came in.`  
Over 280 characters: `Too long. Shorten it.`

## Version

Version is 1.0. Do not change the version string unless the owner says so.

It prints when you type `VERSION`, and it is named in this README.

## License

[CC0 1.0 Universal](LICENSE). See [NOTICE.md](NOTICE.md).

All code and on-screen text were written for Dock Terminal. No third-party libraries, media, or model weights.

## Mobile / desktop

- Full-bleed console. `DOCK>` is the next line of the transcript. Native caret. Enter submits.
- Phone and tablet, portrait and landscape: the same field. `visualViewport` keeps the keyboard off `DOCK>`. Input is 16px. SEND is plain uppercase on touch.
- Title strip: `DOCK TERMINAL` `GUEST` `ALL AGES` and `OPEN`, tide, cargo, `EN`, clock
- `prefers-reduced-motion`: instant boot print

## GitHub Pages

Live: https://kxz0tn.github.io/dock-terminal/

Source is the repo root (`index.html` on branch `main`). Relative paths only.

## How to add an oracle line

1. Open `js/oracle.js`.
2. Add an original direct sentence to the matching bucket. No form labels. OP only on identity/greeting lines.
3. Scan it. If a parent would frown, rewrite.
4. Do not call a model. Do not fetch.

## How to add a safety phrase

1. Open `js/safety.js`.
2. Add the phrase to the matching list, lowercase, including common misspellings.
3. Prefer word-boundary checks for short tokens so `essex` does not match `sex`.
4. Add a quiet case to `selfCheck()`.
5. If two readings exist, seize. There is no secret adult mode.

Never print the banned lists in `HELP`.
