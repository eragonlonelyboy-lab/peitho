'use strict';
// Deterministic benchmarks. No LLM. These prove the gate rejects the generic
// and, just as importantly, does not reject the specific.
const assert = require('assert');
const { gateLine, gateCopy, zeroContextHandoff, scanHype, hasEmDash, genericAnywhere } = require('../lib/gate');
const { validatePositioning, validateAngles, validateOffer, canProduceAssets, validateIdea, screenIdeas } = require('../lib/pipeline');
const siblings = require('../lib/siblings');
const os = require('os'); const fsx = require('fs'); const pathx = require('path');

let pass = 0, fail = 0;
const tests = [];
const t = (name, fn) => tests.push({ name, fn });

// --- the anti-generic gate ---
t('rejects the canonical generic line', () => {
  const r = gateLine('We help teams work smarter.');
  assert.strictEqual(r.pass, false);
  assert(r.findings.some((f) => f.id === 'generic-anywhere'));
});
t('rejects hype vocabulary', () => {
  assert(gateLine('Unleash your revolutionary workflow.').findings.some((f) => f.id === 'hype-vocabulary'));
  assert.deepStrictEqual(scanHype('This is seamless and cutting-edge'), ['seamless', 'cutting-edge']);
});
t('rejects em dashes', () => {
  assert(hasEmDash('a \u2014 b'));
  assert(gateLine('PEITHO ships fast \u2014 always.').findings.some((f) => f.id === 'em-dash'));
});
t('accepts a line that could only belong to this offer', () => {
  const r = gateLine('PEITHO refuses to ship a line a competitor could have written.');
  assert.strictEqual(r.pass, true, JSON.stringify(r.findings));
});
t('accepts a specific line carrying a number', () => {
  assert.strictEqual(gateLine('Reviews 145 prompts and rejects 35 of them.').pass, true);
});
t('a cliche BLOCKS; mere low specificity only FLAGS (no false blocking)', () => {
  const cliche = genericAnywhere('Designed to help you do more.');
  assert.strictEqual(cliche.blocking, true, 'a cliche must block');
  const lowSpec = genericAnywhere('It never sees who wrote the code.');
  assert.strictEqual(lowSpec.generic, true, 'flagged');
  assert.strictEqual(lowSpec.blocking, false, 'a heuristic must not block real copy');
});
t('an ALL-CAPS brand token counts as specificity, even at line start', () => {
  assert.strictEqual(genericAnywhere('ZOILUS blinds the critic to the maker.').generic, false);
  assert.strictEqual(gateLine('PEITHO refuses to ship a borrowed line.').pass, true);
});
t('gateCopy exempts headings and blank lines, blocks only the cliche line', () => {
  const copy = ['# Our Product', '', 'We help companies save time and money.', 'PYRRHO suspends judgment where the evidence stops.'].join('\n');
  const r = gateCopy(copy);
  assert.strictEqual(r.pass, false);
  assert.strictEqual(r.blocking, 1, 'exactly one blocking finding');
  const blocked = r.perLine.filter((l) => l.findings.some((f) => f.severity === 'blocking'));
  assert.strictEqual(blocked.length, 1);
  assert.strictEqual(blocked[0].line, 3);
});
t('quoted material is exempt: a bad example in a blockquote or code fence does not fail the page', () => {
  const copy = [
    '## Before and after',
    '',
    '> We help teams work smarter.',   // the bad example being mocked
    '',
    '```',
    'We help companies save time and money.',  // sample output, not a claim
    '```',
    '',
    'PEITHO blocks that line before it reaches a page.',
  ].join('\n');
  const r = gateCopy(copy);
  assert.strictEqual(r.pass, true, 'quoted bad examples must not fail your own before-and-after');
  assert.strictEqual(r.blocking, 0);
});
t('a real cliche OUTSIDE a quote still blocks (the exemption is not a loophole)', () => {
  const copy = ['## Why', 'We help teams work smarter.'].join('\n');
  assert.strictEqual(gateCopy(copy).pass, false);
});
t('naming a banned word in an inline code span does not flag it (a lint must not flag its own docs)', () => {
  const doc = 'The gate blocks `unleash` and rejects `We help teams work smarter.` on sight.';
  const r = gateLine(doc);
  assert.strictEqual(r.pass, true, JSON.stringify(r.findings));
});
t('but USING the banned word in prose still blocks (stripping code spans is not a loophole)', () => {
  assert.strictEqual(gateLine('Unleash your workflow today.').pass, false);
  assert.strictEqual(gateLine('We help teams do better work.').pass, false);
});
t('clean copy passes the whole gate', () => {
  const copy = ['## Why', 'ZOILUS rejects at 99 percent where other reviewers approve at 80.', 'It never sees who wrote the code.'].join('\n');
  assert.strictEqual(gateCopy(copy).pass, true);
});
t('zero-context handoff rejects a missing caveat and a wrong promise', () => {
  const expected = { audience: 'parents', promise: 'book a class', proof: 'live demo', action: 'start trial', caveat: 'Kuala Lumpur only' };
  const observed = { audience: 'parents', promise: 'buy a membership', proof: 'live demo', action: 'start trial' };
  const r = zeroContextHandoff(expected, observed);
  assert.strictEqual(r.pass, false);
  assert.deepStrictEqual(r.missing, ['caveat']);
  assert.deepStrictEqual(r.mismatched, ['promise']);
});
t('zero-context handoff passes when a fresh readback recovers all five facts', () => {
  const facts = { audience: 'parents', promise: 'book a class', proof: 'live demo', action: 'start trial', caveat: 'Kuala Lumpur only' };
  assert.strictEqual(zeroContextHandoff(facts, { ...facts }).pass, true);
});

// --- positioning before copy (law 2, mechanical) ---
t('positioning needs all five Dunford components', () => {
  const r = validatePositioning({ alternatives: 'x', uniqueAttributes: 'y' });
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(r.missing, ['value', 'customerSegment', 'marketCategory']);
});
t('complete positioning validates', () => {
  const r = validatePositioning({ alternatives: 'a', uniqueAttributes: 'b', value: 'c', customerSegment: 'd', marketCategory: 'e' });
  assert.strictEqual(r.ok, true);
});
t('an angle without a cheapest test is rejected', () => {
  const r = validateAngles([{ angle: 'speed', test: 'run an ad', metric: 'CTR' }, { angle: 'trust' }]);
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(r.untested, ['trust']);
});
t('zero angles is not "all angles tested"', () => {
  assert.strictEqual(validateAngles([]).ok, false);
});
t('an offer needs a price and its killing objections', () => {
  assert.deepStrictEqual(validateOffer({}).missing, ['price', 'objections']);
  assert.strictEqual(validateOffer({ price: '$29', objections: ['too expensive'] }).ok, true);
});
t('assets are BLOCKED until positioning, angles and offer are all complete', () => {
  const r = canProduceAssets({ positioning: { alternatives: 'a' }, angles: [], offer: {} });
  assert.strictEqual(r.allowed, false);
  assert.strictEqual(r.blockers.length, 3);
  assert(r.blockers.some((b) => /positioning incomplete/.test(b)));
  assert(r.blockers.some((b) => /no angles named/.test(b)));
  assert(r.blockers.some((b) => /offer incomplete/.test(b)));
});
t('assets are ALLOWED once every law is satisfied', () => {
  const r = canProduceAssets({
    positioning: { alternatives: 'a', uniqueAttributes: 'b', value: 'c', customerSegment: 'd', marketCategory: 'e' },
    angles: [{ angle: 'blind review', test: 'landing A/B for one week', metric: 'signup rate' }],
    offer: { price: 'free, MIT', objections: ['another AI tool'] },
  });
  assert.strictEqual(r.allowed, true, JSON.stringify(r.blockers));
});
t('a headline cannot be produced from positioning alone (law 2 holds)', () => {
  const r = canProduceAssets({
    positioning: { alternatives: 'a', uniqueAttributes: 'b', value: 'c', customerSegment: 'd', marketCategory: 'e' },
    angles: [], offer: { price: '$1', objections: ['x'] },
  });
  assert.strictEqual(r.allowed, false);
});


// --- Mode 0: what to sell (PEI-07, harvested from prompt #22) ---
t('an idea without a buyer, unit economics or a cheap risk test is rejected', () => {
  const r = validateIdea({ name: 'x', pitch: 'a thing' });
  assert.strictEqual(r.ok, false);
  assert(r.missing.includes('buyer') && r.missing.includes('unitEconomics') && r.missing.includes('riskTest'));
});
t('a complete idea validates', () => {
  const r = validateIdea({ name: 'x', pitch: 'p', buyer: 'b', firstTen: 'f', cost: 'c', unitEconomics: 'u', risk: 'r', riskTest: 't' });
  assert.strictEqual(r.ok, true);
});
t('screenIdeas names which idea is incomplete and why; zero ideas is not "all valid"', () => {
  const r = screenIdeas([{ name: 'good', pitch: 'p', buyer: 'b', firstTen: 'f', cost: 'c', unitEconomics: 'u', risk: 'r', riskTest: 't' }, { name: 'vague' }]);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.incomplete[0].name, 'vague');
  assert.strictEqual(screenIdeas([]).ok, false);
});

// --- sibling detection + ship-gate routing (PEI-10) ---
t('siblings: detects installed gods, ignores non-gods', () => {
  const tmp = fsx.mkdtempSync(pathx.join(os.tmpdir(), 'peitho-sib-'));
  fsx.mkdirSync(pathx.join(tmp, 'zoilus')); fsx.mkdirSync(pathx.join(tmp, 'not-a-god'));
  const s2 = siblings.detect([tmp]);
  assert(s2.installed.includes('zoilus'));
  assert(!s2.installed.includes('not-a-god'));
  assert(s2.missing.includes('veritas'));
});
t('siblings: recommends only the missing ship-gate pairs', () => {
  const rec = siblings.recommend(['zoilus', 'veritas']).map((r) => r.name);
  assert(!rec.includes('zoilus') && !rec.includes('veritas'));
  assert(rec.includes('calliope') && rec.includes('pyrrho'));
});
t('gate-route: a missing sibling degrades honestly, it is never silently passed', () => {
  assert.strictEqual(siblings.routeGate('copy-critique', ['zoilus']), 'zoilus');
  assert(/SKIPPED \(zoilus not installed\)/.test(siblings.routeGate('copy-critique', [])));
  assert.strictEqual(siblings.routeGate('numeric-claim', ['pyrrho']), 'pyrrho');
});
(async () => {
  for (const { name, fn } of tests) {
    try { await fn(); pass++; console.log('  ok  ' + name); }
    catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + e.message); }
  }
  console.log('\n' + pass + '/' + (pass + fail) + ' passed');
  process.exit(fail ? 1 : 0);
})();
