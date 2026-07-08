#!/usr/bin/env node
'use strict';
// peitho, the go-to-market god. Deterministic CLI half (zero-LLM): the
// anti-generic gate, the positioning-before-copy check, the every-angle-has-a-test
// check. The persuasion is skill-driven (SKILL.md); this is what refuses to ship.
const fs = require('fs');
const { gateCopy, gateLine, scanHype } = require('../lib/gate');
const { canProduceAssets, validatePositioning, validateAngles } = require('../lib/pipeline');
const pkg = require('../package.json');

const args = process.argv.slice(2);
const cmd = args[0];
const out = (s) => process.stdout.write(s + '\n');
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

switch (cmd) {
  case '--version': case '-v': out(`peitho ${pkg.version}`); break;

  case 'gate': {
    const file = args[1];
    if (!file || !fs.existsSync(file)) { out('usage: peitho gate <copy.md>'); process.exit(1); }
    const r = gateCopy(fs.readFileSync(file, 'utf8'));
    if (r.pass) { out('PASS: no generic lines, no hype, no em dashes.'); break; }
    out(`FAIL: ${r.blocking} blocking finding(s).\n`);
    for (const l of r.perLine) {
      out(`  line ${l.line}: ${l.text}`);
      for (const f of l.findings) out(`    [${f.severity}] ${f.id}: ${f.summary}\n      fix: ${f.fix}`);
    }
    process.exit(1);
    break;
  }

  case 'line': {
    const line = args.slice(1).join(' ');
    if (!line) { out('usage: peitho line "<one line of copy>"'); process.exit(1); }
    const r = gateLine(line);
    if (r.pass) { out('PASS'); break; }
    for (const f of r.findings) out(`[${f.severity}] ${f.id}: ${f.summary}\n    fix: ${f.fix}`);
    process.exit(1);
    break;
  }

  case 'hype': {
    const file = args[1];
    const text = file && fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : args.slice(1).join(' ');
    const hits = scanHype(text);
    out(hits.length ? 'hype words: ' + hits.join(', ') : 'no hype words.');
    process.exit(hits.length ? 1 : 0);
    break;
  }

  case 'check': {
    // peitho check state.json  -> may we produce assets yet?
    const file = args[1];
    if (!file || !fs.existsSync(file)) { out('usage: peitho check <state.json>'); process.exit(1); }
    const r = canProduceAssets(readJson(file));
    if (r.allowed) { out('ALLOWED: positioning locked, every angle carries a test, offer priced. Assets may be produced.'); break; }
    out('BLOCKED: you do not get a headline yet.');
    for (const b of r.blockers) out('  - ' + b);
    process.exit(1);
    break;
  }

  case 'position': {
    const file = args[1];
    if (!file || !fs.existsSync(file)) { out('usage: peitho position <positioning.json | state.json>'); process.exit(1); }
    const doc = readJson(file);
    const r = validatePositioning(doc && doc.positioning ? doc.positioning : doc); // accept a full state file too
    out(r.ok ? 'OK: all five positioning components present.' : 'INCOMPLETE: missing ' + r.missing.join(', '));
    process.exit(r.ok ? 0 : 1);
    break;
  }

  case 'bets': {
    const file = args[1];
    if (!file || !fs.existsSync(file)) { out('usage: peitho bets <angles.json | state.json>'); process.exit(1); }
    const doc = readJson(file);
    const r = validateAngles(Array.isArray(doc) ? doc : (doc && doc.angles)); // accept a full state file too
    out(r.ok ? `OK: ${r.count} angle(s), every one carries a test and a metric.` : `FAIL: angles without a cheapest test: ${r.untested.join(', ')}`);
    process.exit(r.ok ? 0 : 1);
    break;
  }

  case 'setup': {
    out('PEITHO setup check');
    out('------------------');
    out(`  SKILL.md : ${fs.existsSync(__dirname + '/../SKILL.md') ? 'yes' : 'MISSING'}`);
    out('');
    out('PEITHO is skill-first: invoke it with /peitho or "position and launch this".');
    out('This CLI is the deterministic half: the anti-generic gate and the positioning-before-copy law.');
    out('PEITHO writes. ZOILUS judges the copy. VERITAS cleans it. CALLIOPE designs the frame.');
    out('It never grades its own pitch.');
    break;
  }

  default:
    out(`peitho ${pkg.version}, positioning earned, instinct tested, hype omitted`);
    out('');
    out('  peitho gate <copy.md>        the anti-generic gate on a whole page');
    out('  peitho line "<one line>"     gate a single line');
    out('  peitho hype <file|text>      scan for hype vocabulary');
    out('  peitho check <state.json>    may we produce assets yet? (positioning first)');
    out('  peitho position <p.json>     are all five Dunford components present?');
    out('  peitho bets <angles.json>    does every angle carry a cheapest test?');
    out('  peitho setup');
}
