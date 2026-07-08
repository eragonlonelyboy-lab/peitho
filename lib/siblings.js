'use strict';
// siblings.js: Demiurge sibling detection (PEI-10).
// PEITHO writes the words and never grades its own pitch. The ship-gate needs
// ZOILUS; the prose needs VERITAS; a visual surface needs CALLIOPE; any numeric
// claim needs PYRRHO. Those four are the pairs worth recommending.
const fs = require('fs');
const path = require('path');
const os = require('os');

const SIBLINGS = {
  zoilus:   'judges the copy as an artifact (PEITHO never grades its own pitch)',
  veritas:  'anti-slop pass on the prose',
  calliope: 'designs the frame (PEITHO writes the words, in that order)',
  pyrrho:   'owns what the numbers say (no conversion claim ships without it)',
  athena:   'decides whether to enter the market at all (PEITHO executes, it does not decide)',
  chiron:   'turns a repeated rejection into a permanent rule',
  horkos:   'proves the campaign actually shipped',
  moneta:   'budgets the loop',
  hypnos:   'memory consolidation',
  maat:     'the dashboard',
};

// The ship-gate depends on these. Missing any one degrades the gate honestly.
const NATURAL_PAIRS = ['zoilus', 'veritas', 'calliope', 'pyrrho'];

// Which sibling owns a stage of the ship-gate, when installed.
const GATE_ROUTE = {
  'copy-critique': 'zoilus',
  'anti-slop': 'veritas',
  visual: 'calliope',
  'numeric-claim': 'pyrrho',
};

function defaultSearchPaths() {
  return [
    path.join(os.homedir(), '.claude', 'skills'),
    path.join(__dirname, '..', '..'),
  ];
}

function detect(searchPaths) {
  const paths = searchPaths || defaultSearchPaths();
  const found = new Set();
  for (const base of paths) {
    if (!base || !fs.existsSync(base)) continue;
    let entries = [];
    try { entries = fs.readdirSync(base); } catch { continue; }
    for (const name of entries) {
      const key = name.toLowerCase();
      if (SIBLINGS[key] && key !== 'peitho') {
        try { if (fs.statSync(path.join(base, name)).isDirectory()) found.add(key); } catch { /* skip */ }
      }
    }
  }
  const installed = Object.keys(SIBLINGS).filter((k) => found.has(k));
  const missing = Object.keys(SIBLINGS).filter((k) => !found.has(k));
  return { installed, missing };
}

function recommend(installed) {
  const have = new Set(installed || detect().installed);
  return NATURAL_PAIRS.filter((k) => !have.has(k)).map((k) => ({ name: k, why: SIBLINGS[k] }));
}

// Route a ship-gate stage to its owner. Missing sibling degrades honestly: the
// stage is skipped and named, never silently passed.
function routeGate(stage, installed) {
  const have = new Set(installed || detect().installed);
  const god = GATE_ROUTE[stage];
  if (!god) return 'peitho-native';
  return have.has(god) ? god : `SKIPPED (${god} not installed)`;
}

module.exports = { detect, recommend, routeGate, SIBLINGS, NATURAL_PAIRS, GATE_ROUTE };
