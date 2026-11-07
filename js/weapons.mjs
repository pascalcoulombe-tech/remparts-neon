// Plan des fléchettes en mousse. Aucun Three.js ici : les tests node lisent ce module.
export const SAVE_KEY = 'remparts-neon-v1';
export const PATH_IDS = ['baton', 'pelle', 'onde'];
export const ORANGE = 0xff6a00;

const shot = (path, extra) => Object.assign({
  kind: 'dart', foam: true, orange: true, hitscan: false, path,
  yaw: 0, pitch: 0, world: false, speed: 20, life: 1, dmg: 0, pierce: 1, r: 0.2,
  scale: 1, boom: 0, heavy: false, visual: false, group: false, band: 0,
}, extra);

export const WEAPON_UPGRADES = [
  { id: 'b_dmg', path: 'baton', name: 'Mousse dense', desc: '+25 % de dégâts', max: 5, cost: [40, 60, 90, 130, 170], c: '#ff3fd2' },
  { id: 'b_arc', path: 'baton', name: 'Bec élargi', desc: 'Éventail plus large et plus long', max: 3, cost: [45, 80, 130], c: '#ffd23a' },
  { id: 'b_puck', path: 'baton', name: 'Grosse fléchette', desc: 'Spécial : recharge −25 %, perce +1', max: 3, cost: [45, 80, 130], c: '#2bf0ff' },
  { id: 'b_leech', path: 'baton', name: 'Ventouses', desc: '+3 PV par élimination', max: 3, cost: [40, 75, 120], c: '#8dff3a' },
  { id: 'p_dmg', path: 'pelle', name: 'Pointe lestée', desc: '+20 % de dégâts', max: 5, cost: [40, 60, 90, 130, 170], c: '#ffb43a' },
  { id: 'p_rate', path: 'pelle', name: 'Ressort tendu', desc: '+15 % de cadence', max: 5, cost: [40, 60, 90, 130, 170], c: '#ff3fd2' },
  { id: 'p_burst', path: 'pelle', name: 'Volée chargée', desc: 'Clic droit : +3 fléchettes, recharge −15 %', max: 3, cost: [45, 80, 130], c: '#2bf0ff' },
  { id: 'p_pierce', path: 'pelle', name: 'Fléchettes longues', desc: 'Les tirs traversent 1 ennemi de plus', max: 2, cost: [70, 135], c: '#8dff3a' },
  { id: 'o_dmg', path: 'onde', name: 'Mousse boréale', desc: '+20 % de dégâts', max: 5, cost: [40, 60, 90, 130, 170], c: '#2bf0ff' },
  { id: 'o_rad', path: 'onde', name: 'Éclatement', desc: 'Explosions plus grosses', max: 4, cost: [45, 75, 110, 160], c: '#ff3fd2' },
  { id: 'o_pulse', path: 'onde', name: 'Souffle chargé', desc: 'Clic droit : recharge −20 %, +30 % de dégâts', max: 3, cost: [45, 80, 130], c: '#ffd23a' },
  { id: 'o_chain', path: 'onde', name: 'Fléchettes satellites', desc: 'Chaque explosion frappe +1 ennemi proche', max: 3, cost: [50, 90, 140], c: '#8dff3a' },
];

export function weaponStats(path, lv) {
  if (path === 'baton') return {
    dmg: 30 * (1 + 0.25 * lv('b_dmg')), rate: 0.42, range: 2.9 + 0.35 * lv('b_arc'),
    arc: (100 + 18 * lv('b_arc')) * Math.PI / 180,
    altCd: 2.4 * Math.pow(0.75, lv('b_puck')),
    altDmg: 55 * (1 + 0.25 * lv('b_dmg')) * (1 + 0.2 * lv('b_puck')),
    pierce: 2 + lv('b_puck'), leech: 1 + 3 * lv('b_leech'), altName: 'GROSSE FLÈCHE',
  };
  if (path === 'pelle') return {
    dmg: 8.5 * (1 + 0.2 * lv('p_dmg')), rate: 1 / (7.5 * (1 + 0.15 * lv('p_rate'))), spread: 0.014,
    pierce: 1 + lv('p_pierce'),
    altCd: 1.6 * Math.pow(0.85, lv('p_burst')), pellets: 9 + 3 * lv('p_burst'),
    altDmg: 9 * (1 + 0.2 * lv('p_dmg')), leech: 0, altName: 'VOLÉE',
  };
  return {
    dmg: 24 * (1 + 0.2 * lv('o_dmg')), rate: 1 / 3.2, radius: 2.4 + 0.6 * lv('o_rad'), chain: lv('o_chain'),
    altCd: 5 * Math.pow(0.8, lv('o_pulse')),
    altDmg: 45 * (1 + 0.3 * lv('o_pulse')) * (1 + 0.2 * lv('o_dmg')),
    pulseR: 7.5 + lv('o_pulse'), leech: 0, altName: 'SOUFFLE',
  };
}

export function buildFoamShots(path, st, alt, rand = Math.random) {
  const shots = [];
  let pulse = null;
  let reflectArc = false;
  if (path === 'baton') {
    if (!alt) {
      reflectArc = true;
      const n = 5 + Math.round((st.arc * 180 / Math.PI - 100) / 18);
      const speed = 22;
      const life = (st.range + 0.85) / speed;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : (i / (n - 1) - 0.5);
        shots.push(shot(path, { yaw: t * st.arc, speed, life, dmg: st.dmg, pierce: 1, r: 0.28, scale: 1, group: true, band: 3.6 }));
      }
    } else {
      shots.push(shot(path, { speed: 42, life: 1.6, dmg: st.altDmg, pierce: st.pierce, r: 0.36, scale: 1.75, heavy: true }));
    }
  } else if (path === 'pelle') {
    const n = alt ? st.pellets : 1;
    const spread = alt ? 0.085 : st.spread;
    const speed = alt ? 46 : 62;
    const dist = alt ? 22 : 60;
    for (let k = 0; k < n; k++) {
      shots.push(shot(path, {
        yaw: (rand() - 0.5) * spread * 2, pitch: (rand() - 0.5) * spread * 2,
        speed, life: dist / speed, dmg: alt ? st.altDmg : st.dmg,
        pierce: alt ? 1 : st.pierce, r: alt ? 0.16 : 0.2, scale: alt ? 0.8 : 1,
      }));
    }
  } else if (!alt) {
    shots.push(shot(path, { speed: 30, life: 1.8, dmg: st.dmg, pierce: 1, r: 0.28, scale: 1.15, boom: st.radius }));
  } else {
    pulse = { radius: st.pulseR, dmg: st.altDmg };
    const n = 12;
    for (let i = 0; i < n; i++) {
      shots.push(shot(path, {
        yaw: (i / n) * Math.PI * 2, world: true, speed: 16, life: 0.45,
        dmg: 0, pierce: 0, r: 0.12, scale: 0.75, visual: true,
      }));
    }
  }
  return { shots, pulse, reflectArc };
}
