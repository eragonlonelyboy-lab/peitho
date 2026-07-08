# HONEST-NUMBERS

Every claim PEITHO makes about itself, and every one it cannot make. A product whose first law is "nothing generic" does not get to sell itself with a generic claim.

## What is checkable

`node benchmarks/run.js` runs 27 deterministic tests, no model involved. They prove:

- **The gate rejects the demonstrably borrowed.** `We help teams work smarter.` blocks on the cliche corpus. `Unleash your revolutionary workflow.` blocks on hype vocabulary. Any em dash blocks.
- **The gate does not reject the specific.** `PEITHO refuses to ship a line a competitor could have written.` passes. `Reviews 145 prompts and rejects 35 of them.` passes. An ALL-CAPS brand token counts as specificity even at the start of a line.
- **Positioning before copy is a return value.** `canProduceAssets` returns BLOCKED, with the reasons named, until all five Dunford components exist, every angle carries a test and a metric, and the offer has a price and its killing objections. A headline cannot be produced from positioning alone.
- **An angle without a cheapest test is rejected**, and zero angles does not quietly count as "all angles tested."

## The blind A/B, with its caveat

PEITHO's pipeline was tested against a single-shot "write me a landing page" prompt on the same product with the same brief. Two independent critics scored both pages against the ZOILUS copy-critique rubric. Neither knew how either page was produced, and they were shown the pages in opposite orders to control for position bias.

Both critics scored the pipeline page 8/10 and the one-shot 6/10. Both chose the pipeline page. The deterministic gate found 7 blocking findings and 10 em dashes in the one-shot; the pipeline page passed clean.

**The caveat, stated plainly:** one of the two critics still passed the one-shot page, weakly. The intended criterion was "the one-shot does not pass." That held for one critic of two. The pipeline won on every measure taken. It did not annihilate the control.

Two critics is not a study. It is one honest test, run once, reported with its limits.

## What is NOT checkable

**PEITHO cannot prove the copy converts.** It proves copy clears a gate. Conversion is an empirical question about your market, and answering it requires running the test PEITHO tells you to run. Any tool claiming a conversion lift without that test is doing exactly what this one exists to prevent. Before any numeric claim ships, it passes PYRRHO.

**The low-specificity check is a heuristic.** It flags rather than blocks, deliberately, because a rule that blocks real copy on a guess is worse than the generic line it was hunting. It will miss a thoroughly generic line dressed in a proper noun, and it will flag a good short sentence that happens to carry no number or name.

**The cliche corpus is finite and will lag language.** Today's fresh phrasing is next year's entry. The corpus is plain markdown in `lib/gate.js`; when a new cliche escapes it, add it. Absence from the corpus is not proof a line is original.

**Taste is not fully checkable.** The gate catches the provable failures. Whether the copy is actually persuasive, whether the wedge is the right wedge, whether a reader cares: those are judgments. That is why the ship-gate delegates to ZOILUS and VERITAS rather than pretending its own taste is oracle.

**Positioning validation is structural, not semantic.** `peitho position` confirms all five Dunford components are present. It cannot confirm they are true, or that your claimed unique attribute is actually unique. It checks that you did the work, not that the work was right.

## What it costs

Nothing to run the gate. It is a skill and a zero-LLM CLI; the corpus checks and the pipeline validation run locally with no model call. The writing is done by whatever agent invoked the skill, and the ship-gate calls ZOILUS and VERITAS, each of which costs whatever they cost.
