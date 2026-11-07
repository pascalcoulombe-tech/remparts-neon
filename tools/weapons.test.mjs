import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SAVE_KEY, PATH_IDS, ORANGE, WEAPON_UPGRADES, weaponStats, buildFoamShots } from '../js/weapons.mjs';

const lv0 = () => 0;
const lvOf = map => id => map[id] || 0;

test('save key and path ids stay compatible', () => {
  assert.equal(SAVE_KEY, 'remparts-neon-v1');
  assert.deepEqual(PATH_IDS, ['baton', 'pelle', 'onde']);
  assert.equal(ORANGE, 0xff6a00);
});

test('upgrade ids stay and the copy describes foam toys', () => {
  const ids = WEAPON_UPGRADES.map(u => u.id);
  assert.deepEqual(ids, ['b_dmg', 'b_arc', 'b_puck', 'b_leech', 'p_dmg', 'p_rate', 'p_burst', 'p_pierce', 'o_dmg', 'o_rad', 'o_pulse', 'o_chain']);
  for (const u of WEAPON_UPGRADES) {
    const text = `${u.name} ${u.desc}`;
    assert.match(text, /mousse|fléchette|ressort|bec|ventouse|pointe|volée|éclat|souffle|satellite|boréal/i);
    assert.doesNotMatch(text, /hockey|rondelle|pelle-fusil|condensateur|grenaille|friction|mêlée/i);
  }
});

test('cards, radio, help, and readme describe foam darts', () => {
  const copy = fs.readFileSync(new URL('../js/text.js', import.meta.url), 'utf8');
  for (const name of ['Le Bâton-mousse', 'La Pelle-mousse', 'Éclateur']) assert.ok(copy.includes(name), name);
  assert.match(copy, /mousse|fléchette/i);
  assert.doesNotMatch(copy, /hockey|mêlée|corps à corps|pelle-fusil|rondelle/i);
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(html, /fléchette/i);
  assert.doesNotMatch(html, /frappe ou tire/i);
  assert.match(readme, /fléchette en mousse/i);
  assert.doesNotMatch(readme, /hockey, mêlée/i);
});

test('level 0 formulas match the original weapon numbers', () => {
  const b = weaponStats('baton', lv0);
  assert.equal(b.dmg, 30);
  assert.equal(b.rate, 0.42);
  assert.equal(b.range, 2.9);
  assert.ok(Math.abs(b.arc - 100 * Math.PI / 180) < 1e-9);
  assert.equal(b.altDmg, 55);
  assert.equal(b.pierce, 2);
  assert.equal(b.leech, 1);
  assert.equal(b.altName, 'GROSSE FLÈCHE');
  const p = weaponStats('pelle', lv0);
  assert.equal(p.dmg, 8.5);
  assert.ok(Math.abs(p.rate - 1 / 7.5) < 1e-9);
  assert.equal(p.spread, 0.014);
  assert.equal(p.pierce, 1);
  assert.equal(p.pellets, 9);
  assert.equal(p.altDmg, 9);
  assert.equal(p.altName, 'VOLÉE');
  const o = weaponStats('onde', lv0);
  assert.equal(o.dmg, 24);
  assert.ok(Math.abs(o.rate - 1 / 3.2) < 1e-9);
  assert.equal(o.radius, 2.4);
  assert.equal(o.chain, 0);
  assert.equal(o.altDmg, 45);
  assert.equal(o.pulseR, 7.5);
  assert.equal(o.altName, 'SOUFFLE');
});

test('one damage rank keeps the old multiplier', () => {
  const b = weaponStats('baton', lvOf({ b_dmg: 1 }));
  assert.equal(b.dmg, 37.5);
  const p = weaponStats('pelle', lvOf({ p_dmg: 1, p_rate: 1, p_burst: 1, p_pierce: 1 }));
  assert.equal(p.dmg, 8.5 * 1.2);
  assert.equal(p.pellets, 12);
  assert.equal(p.pierce, 2);
});

function primaries(path, st) {
  const plan = buildFoamShots(path, st, false, () => 0.5);
  assert.ok(plan.shots.length >= 1);
  for (const s of plan.shots) {
    assert.equal(s.kind, 'dart');
    assert.equal(s.foam, true);
    assert.equal(s.orange, true);
    assert.equal(s.hitscan, false);
    assert.equal(s.visual, false);
    assert.equal(s.path, path);
  }
  return plan;
}

test('the old stick launches a short foam fan, not a melee hit', () => {
  const st = weaponStats('baton', lv0);
  const plan = primaries('baton', st);
  assert.equal(plan.shots.length, 5);
  assert.equal(plan.reflectArc, true);
  assert.equal(plan.pulse, null);
  for (const s of plan.shots) {
    assert.equal(s.group, true);
    assert.equal(s.band, 3.6);
    assert.equal(s.dmg, 30);
    assert.equal(s.knock, 9);
    assert.ok(Math.abs(s.speed * s.life - (st.range + 0.85)) < 1e-9);
  }
  const wide = weaponStats('baton', lvOf({ b_arc: 3 }));
  assert.equal(buildFoamShots('baton', wide, false).shots.length, 8);
  const alt = buildFoamShots('baton', st, true, () => 0.5);
  assert.equal(alt.shots.length, 1);
  assert.equal(alt.shots[0].heavy, true);
  assert.equal(alt.shots[0].pierce, 2);
  assert.equal(alt.shots[0].dmg, 55);
  assert.equal(alt.shots[0].kind, 'dart');
  assert.equal(alt.reflectArc, false);
});

test('the repeater and the popper launch foam darts', () => {
  const pelle = weaponStats('pelle', lv0);
  const one = primaries('pelle', pelle);
  assert.equal(one.shots.length, 1);
  assert.equal(one.shots[0].pierce, 1);
  assert.equal(one.shots[0].dmg, 8.5);
  assert.equal(one.shots[0].knock, 1.5);
  assert.ok(Math.abs(one.shots[0].speed * one.shots[0].life - 60) < 1e-9);
  const burst = buildFoamShots('pelle', pelle, true, () => 0.5);
  assert.equal(burst.shots.length, 9);
  assert.ok(burst.shots.every(s => s.kind === 'dart' && s.foam && s.orange && s.dmg === 9 && s.knock === 6));
  const onde = weaponStats('onde', lv0);
  const pop = primaries('onde', onde);
  assert.equal(pop.shots.length, 1);
  assert.equal(pop.shots[0].boom, 2.4);
  assert.equal(pop.shots[0].dmg, 24);
  const alt = buildFoamShots('onde', onde, true, () => 0.5);
  assert.equal(alt.pulse.radius, 7.5);
  assert.equal(alt.pulse.dmg, 45);
  assert.equal(alt.shots.length, 12);
  assert.ok(alt.shots.every(s => s.visual && s.dmg === 0 && s.foam && s.orange && s.kind === 'dart'));
});
