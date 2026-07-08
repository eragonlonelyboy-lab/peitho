'use strict';
// gate.js, the anti-generic gate.
// Law 1: if a line could run unchanged on a competitor's page, it fails.
// Law 5: hype omitted, zero em dashes. Both are checkable, so we check them
// rather than trusting a model to feel bad about writing "unleash".

const HYPE = [
  'unleash', 'game-changer', 'game changer', 'game-changing', 'revolutionary', 'revolutionize',
  'elevate', 'seamless', 'seamlessly', 'cutting-edge', 'state-of-the-art', 'best-in-class',
  'next level', 'next-level', 'supercharge', 'turbocharge', 'delve', 'harness the power',
  'empower', 'synergy', 'paradigm shift', 'disruptive', 'world-changing', 'transformative',
  'work smarter', 'take it to the next level', 'unlock the power', 'navigate the landscape',
  'in today’s world', 'in today\'s world', 'robust solution', 'holistic solution',
];

// Lines that could belong to any company in any industry.
const CLICHE = [
  /\bwe help (?:teams|companies|businesses|people)\b/i,
  /\bwork smarter\b/i,
  /\bsave time and money\b/i,
  /\bbuilt for (?:the )?modern\b/i,
  /\bthe future of\b/i,
  /\ball[- ]in[- ]one (?:platform|solution)\b/i,
  /\bpowerful(?:ly)? (?:simple|easy)\b/i,
  /\bdesigned to help you\b/i,
  /\btake your \w+ to the next level\b/i,
  /\bmade simple\b/i,
];

// CHI-R001: spell the banned characters as escapes so this lint never matches
// itself, and so a bulk "strip the em dashes" pass cannot silently rewrite the
// detector into one that flags ordinary hyphens. (It did, once. Hence the rule.)
const EM_DASH = /[\u2014\u2013]/;

// An inline code span is a quoted token, not shipped prose. Naming the word you
// ban is not using it. Strip `like this` before judging a line, or the gate
// flags your own documentation. Same family as CHI-R001: a lint must never match
// the act of describing what it forbids.
function stripInlineCode(text) {
  return String(text || '').replace(/`[^`]*`/g, ' ');
}

function scanHype(text) {
  const t = stripInlineCode(text).toLowerCase();
  return HYPE.filter((h) => t.includes(h.toLowerCase()));
}

function hasEmDash(text) { return EM_DASH.test(String(text || '')); }

// Specificity signals: a digit, a quoted term, an ALL-CAPS brand token anywhere
// (PEITHO, ZOILUS), or a capitalised word past the first (which would otherwise
// just be the sentence-initial capital).
function hasSpecificity(s) {
  if (/\d/.test(s)) return true;
  if (/["“].+?["”]/.test(s)) return true;
  const words = s.split(/\s+/);
  if (words.some((w) => /^[A-Z]{2,}[A-Z0-9]*[.,!?]?$/.test(w))) return true; // ALL-CAPS brand
  return words.slice(1).some((w) => /^[A-Z][a-zA-Z]{2,}/.test(w));
}

// Two distinct failures, deliberately weighted differently:
//   cliche  -> demonstrable, blocking. The line is provably borrowed.
//   low specificity -> a heuristic, so it flags rather than blocks. A rule that
//   blocks real copy on a guess is worse than the generic line it was hunting.
function genericAnywhere(line) {
  const raw = String(line || '').trim();
  if (!raw) return { generic: false, blocking: false, reasons: [] };
  const s = stripInlineCode(raw).trim(); // a named example is not a shipped claim
  if (!s) return { generic: false, blocking: false, reasons: [] };
  const reasons = [];
  let blocking = false;

  for (const re of CLICHE) {
    if (re.test(s)) { reasons.push(`cliche: matches ${re.source}`); blocking = true; }
  }
  if (!hasSpecificity(s)) {
    reasons.push('low specificity: no number, no proper noun, no quoted term. Check that this line could only belong to this offer.');
  }
  return { generic: reasons.length > 0, blocking, reasons };
}

// Gate a single line. pass = zero BLOCKING findings (flags are advisory).
function gateLine(line) {
  const findings = [];
  const hype = scanHype(line);
  if (hype.length) findings.push({ severity: 'blocking', id: 'hype-vocabulary', summary: `Hype words present: ${hype.join(', ')}`, fix: 'Say the specific thing instead.' });
  if (hasEmDash(line)) findings.push({ severity: 'blocking', id: 'em-dash', summary: 'Em or en dash present.', fix: 'Use a comma, a period, or a colon.' });
  const g = genericAnywhere(line);
  if (g.blocking) {
    findings.push({ severity: 'blocking', id: 'generic-anywhere', summary: g.reasons.filter((r) => r.startsWith('cliche')).join(' | '), fix: 'Rewrite until the line could only belong to this offer.' });
  } else if (g.generic) {
    findings.push({ severity: 'major', id: 'low-specificity', summary: g.reasons.join(' | '), fix: 'Add the number, the name, or the concrete noun that makes this yours.' });
  }
  const blocking = findings.filter((f) => f.severity === 'blocking').length;
  return { pass: blocking === 0, blocking, findings };
}

// Gate a whole block of copy, line by line. Structure and quoted material are
// not claims you are shipping, so they are exempt: blank lines, headings, rules,
// fenced code, and blockquotes. A blockquote is usually the bad example you are
// holding up to mock, and gating it would flag your own before-and-after.
function gateCopy(text) {
  const lines = String(text || '').split('\n');
  const perLine = [];
  let inFence = false;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    if (!line || /^#{1,6}\s/.test(line) || /^[-*_]{3,}$/.test(line) || /^>/.test(line)) return;
    const r = gateLine(line);
    if (r.findings.length) perLine.push({ line: i + 1, text: line, findings: r.findings });
  });
  const blocking = perLine.reduce((n, l) => n + l.findings.filter((f) => f.severity === 'blocking').length, 0);
  const flags = perLine.reduce((n, l) => n + l.findings.filter((f) => f.severity === 'major').length, 0);
  return { pass: blocking === 0, blocking, flags, perLine };
}

module.exports = { gateLine, gateCopy, scanHype, hasEmDash, genericAnywhere, HYPE, CLICHE };
