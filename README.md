<div align="center">

![Peitho, weighing a single word against a coin as borrowed lines turn to ash](assets/hero.png)

# PEITHO: Positioning Earned, Instinct Tested, Hype Omitted

*Every AI tool writes you marketing copy. PEITHO refuses to ship a line a competitor could have written.*

[![License: MIT](https://img.shields.io/badge/License-MIT-E8A23D.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-2C7A7B.svg)](package.json)
[![tests](https://img.shields.io/badge/tests-27%2F27-2C7A7B.svg)](benchmarks/run.js)

</div>

**Every AI tool writes you marketing copy. PEITHO refuses to ship a line a competitor could have written.**

> I am Peitho. Persuasion was my domain. I never mistook it for volume.

*Positioning Earned, Instinct Tested, Hype Omitted.*

Copy generators are a commodity. Every model writes a passable landing page. That is not the hard part, and it never was. The hard part is refusing the line that sounds fine and means nothing. I do that mechanically, and I do not let you write a headline before you know why anyone should choose you.

## Before and after

**Your AI, asked for a landing page:**

> We help teams work smarter.

**PEITHO, handed the same line:**

```
$ peitho line "We help teams work smarter."

[blocking] generic-anywhere: cliche: matches \bwe help (?:teams|companies|businesses|people)\b
    fix: Rewrite until the line could only belong to this offer.
```

It never reaches a page. Neither does an em dash, neither does `unleash`, and neither does a headline written before the positioning exists.

## The proof, not the promise

I was tested against the thing I claim to beat. Same product, same brief. One landing page written by a single-shot "write me a landing page" prompt. One written through my pipeline: position, offer, assets, gate.

Two independent critics scored both. Neither knew how either page was made. They were shown the pages **in opposite orders** to control for position bias.

| | one-shot | PEITHO pipeline |
|---|---|---|
| Critic 1 (control first) | 6/10 | **8/10** |
| Critic 2 (pipeline first) | 6/10 | **8/10** |
| Deterministic gate | 7 blocking findings, 10 em dashes | **passed clean** |
| Chosen by | | **both critics** |

**The honest caveat:** one of the two critics still passed the one-shot page, weakly, calling it "a strong 40-line page wearing a 114-line page." So "the one-shot fails" held for one critic of two, not both. The pipeline won on every measure taken. It did not annihilate the control, and I will not tell you it did.

## The five laws

1. **Nothing generic.** If a line could run unchanged on a competitor's page, it fails. Checked against a cliche corpus and a specificity test, not against my feelings.
2. **Positioning before copy.** No hooks, no headlines, no ads until the wedge exists. `peitho check` returns BLOCKED until all five positioning components are present, every angle carries a test, and the offer is priced.
3. **Every angle carries its cheapest test.** Name the two angles you would bet budget on, how to test each this week, and the metric that decides. An untested angle is a guess wearing a suit.
4. **The customer's words, not yours.** Lead with the outcome they want, in their language. Features are not benefits.
5. **Hype omitted.** Zero hype vocabulary. Zero em dashes. Checked, not trusted.

And one structural law: **I never grade my own pitch.** The ship-gate hands the copy to ZOILUS (where does a skeptical reader drop off) and VERITAS (anti-slop). A seller marking its own homework is how generic copy ships.

## A gate that knows what it does not know

The gate separates two things on purpose:

- **Blocking**: a demonstrable cliche, hype vocabulary, an em dash. Provable. Stops the ship.
- **Flag**: low specificity. A heuristic. It warns, it does not block.

Because a rule that blocks real copy on a guess is worse than the generic line it was hunting. The test suite pins this: `It never sees who wrote the code.` flags but does not block, while `We help companies save time and money.` blocks.

## Install for your agent

PowerShell:
```powershell
git clone https://github.com/eragonlonelyboy-lab/peitho; cd peitho; node bin/peitho.js setup
```
bash:
```bash
git clone https://github.com/eragonlonelyboy-lab/peitho && cd peitho && node bin/peitho.js setup
```

Copy the folder into `~/.claude/skills/peitho/` and invoke with `/peitho`. Zero config. The CLI is the deterministic half:

```
peitho gate <copy.md>        the anti-generic gate on a whole page
peitho line "<one line>"     gate a single line
peitho hype <file>           scan for hype vocabulary
peitho check <state.json>    may we produce assets yet?
peitho position <state.json> are all five Dunford components present?
peitho bets <state.json>     does every angle carry a cheapest test?
```

## Not for you if

- You want copy fast and you do not care whether anyone could tell it apart from your competitor's.
- You want a tool that tells you the copy will convert. It cannot, and it says so.
- You want to skip positioning. `peitho check` will not let you, and that is the product.

## FAQ

**"So it is a copywriter."**
No. Every model is a copywriter. I am the thing that refuses what the copywriter produced.

**"Can you prove your copy sells more?"**
No, and be suspicious of anyone who says they can without a real test. I can prove copy clears a gate. Claiming a conversion lift without running the experiment is precisely what I exist to prevent. Before any numeric claim ships, it passes PYRRHO.

**"Your cliche list will go stale."**
It will. Language moves and a finite corpus lags it. See [HONEST-NUMBERS](docs/HONEST-NUMBERS.md), where I list what I miss.

**"Why can't I write the headline first?"**
Because a headline written before the wedge is decoration. `peitho check` returns BLOCKED and names what is missing. It is a return value, not advice.

## The family

**ATHENA** decides whether to enter the market. **PEITHO** executes the go-to-market once the decision is made. **ZOILUS** judges the copy as an artifact. **VERITAS** cleans the prose. **CALLIOPE** designs the frame, I write the words, in that order. **PYRRHO** owns what the numbers say, so no conversion claim ships without passing it.

**HORKOS** proves the campaign shipped. **MONETA** budgets the loop. **CHIRON** turns a repeated rejection into a rule.

## Verify me

```bash
node benchmarks/run.js   # 27/27
```

If PEITHO stops one borrowed line from reaching your landing page, star it. If it does not, do not.

MIT. Copyright (c) 2026 Lee Jun Ying. Built by Eragon Lee.

*Named for Peitho, Greek goddess of persuasion and charming speech.*
