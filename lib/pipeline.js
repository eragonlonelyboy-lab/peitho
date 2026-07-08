'use strict';
// pipeline.js, Law 2 made mechanical: positioning before copy.
// A model asked to "write a landing page" will happily write one. This refuses
// to let the assets stage run until the wedge exists and every angle carries a test.

// Dunford positioning components. All five, or you do not have positioning,
// you have adjectives.
const POSITIONING_FIELDS = ['alternatives', 'uniqueAttributes', 'value', 'customerSegment', 'marketCategory'];

function validatePositioning(p) {
  const missing = [];
  for (const f of POSITIONING_FIELDS) {
    const v = p ? p[f] : undefined;
    const empty = v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);
    if (empty) missing.push(f);
  }
  return { ok: missing.length === 0, missing };
}

// Law 3: an angle without a cheapest test is a guess wearing a suit.
function validateAngles(angles) {
  const list = Array.isArray(angles) ? angles : [];
  const untested = list.filter((a) => !a || !a.test || !String(a.test).trim() || !a.metric || !String(a.metric).trim());
  return {
    ok: list.length > 0 && untested.length === 0,
    count: list.length,
    untested: untested.map((a) => (a && a.angle) || '(unnamed angle)'),
  };
}

// The offer must carry a price and the objections that would kill it.
function validateOffer(o) {
  const missing = [];
  if (!o || o.price == null || String(o.price).trim() === '') missing.push('price');
  if (!o || !Array.isArray(o.objections) || o.objections.length === 0) missing.push('objections');
  return { ok: missing.length === 0, missing };
}

// Mode 0, what to sell (harvested from prompt #22). An idea without a named
// buyer, a first-ten-customers plan, unit economics and a cheap risk test is a
// daydream. Every field here is something the prompt demands and a founder skips.
const IDEA_FIELDS = ['pitch', 'buyer', 'firstTen', 'cost', 'unitEconomics', 'risk', 'riskTest'];

function validateIdea(idea) {
  const missing = [];
  for (const f of IDEA_FIELDS) {
    const v = idea ? idea[f] : undefined;
    const empty = v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);
    if (empty) missing.push(f);
  }
  return { ok: missing.length === 0, missing, name: (idea && idea.name) || '(unnamed idea)' };
}

// Screen a list of ideas: the ones that survive are the only ones worth positioning.
function screenIdeas(ideas) {
  const list = Array.isArray(ideas) ? ideas : [];
  const results = list.map(validateIdea);
  return {
    ok: list.length > 0 && results.every((r) => r.ok),
    count: list.length,
    incomplete: results.filter((r) => !r.ok).map((r) => ({ name: r.name, missing: r.missing })),
  };
}

// The gate on producing any asset.
function canProduceAssets(state = {}) {
  const pos = validatePositioning(state.positioning);
  const angles = validateAngles(state.angles);
  const offer = validateOffer(state.offer);
  const blockers = [];
  if (!pos.ok) blockers.push(`positioning incomplete: missing ${pos.missing.join(', ')}`);
  if (!angles.ok) blockers.push(angles.count === 0 ? 'no angles named' : `angles without a cheapest test: ${angles.untested.join(', ')}`);
  if (!offer.ok) blockers.push(`offer incomplete: missing ${offer.missing.join(', ')}`);
  return { allowed: blockers.length === 0, blockers, positioning: pos, angles, offer };
}

module.exports = { validatePositioning, validateAngles, validateOffer, canProduceAssets, validateIdea, screenIdeas, POSITIONING_FIELDS, IDEA_FIELDS };
