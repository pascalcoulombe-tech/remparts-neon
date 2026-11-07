// Prouve que les trois blasters lancent des fléchettes en mousse, touchent, et acceptent une amélioration.
// usage : node tools/darts.js
const { chromium } = require('playwright');
const serve = require('./serve');
const fs = require('fs');
const path = require('path');
const PORT = +(process.env.PORT || 8791);
const OUT = process.env.DART_SHOTS || path.join(__dirname, '..', 'shots');
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(PORT);
  const b = await chromium.launch({ args: GL });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('requestfailed', r => errs.push('net: ' + r.url() + ' ' + ((r.failure() && r.failure().errorText) || '')));
  p.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()); });
  const failed = [];
  await p.goto(`http://localhost:${PORT}/remparts-neon/?bot=1&q=low`);
  await p.waitForFunction(() => window.__game && __game.G.state === 'title');
  await p.screenshot({ path: path.join(OUT, 'darts_titre.png') });
  await p.click('#bPlay');
  await p.waitForFunction(() => document.querySelectorAll('.pcard').length === 3);
  const names = await p.locator('.pn').allTextContents();
  await p.screenshot({ path: path.join(OUT, 'darts_choix.png') });
  if (names.join(' ').indexOf('mousse') < 0 && names.join(' ').indexOf('Éclateur') < 0) failed.push('noms: ' + names.join('|'));
  const ups = { baton: 'b_dmg', pelle: 'p_dmg', onde: 'o_dmg' };
  const alts = { baton: 'GROSSE FLÈCHE', pelle: 'VOLÉE', onde: 'SOUFFLE' };
  for (const pathId of ['baton', 'pelle', 'onde']) {
    await p.evaluate(id => __game.startRun(id, 0, { mode: 'histoire', diff: 1 }), pathId);
    await p.waitForFunction(() => __game.G.P && __game.G.st);
    const fired = await p.evaluate(async () => {
      const G = __game.G, P = G.P;
      P.yaw = 0; P.pitch = 0; P.fireCd = 0; P.altCd = 0;
      const e = __game.spawn('cone', { x: P.x, z: P.z - 2.2 });
      e.x = P.x; e.z = P.z - 2.2; e.y = 0; e.born = 1; e.mk.root.position.set(e.x, 0, e.z);
      const hp0 = e.hp, kills0 = G.kills, foam0 = G.foamLaunched || 0;
      __game.attack(false);
      const darts = G.projs.filter(pr => pr.kind === 'dart' && pr.foam && pr.orange && !pr.visual);
      let orangeMesh = false;
      for (const pr of darts) pr.m.traverse(o => { if (o.userData && o.userData.orangeTip && o.material && o.material.color && o.material.color.getHex() === 0xff6a00) orangeMesh = true; });
      return { hp0, kills0, darts: darts.length, foam: (G.foamLaunched || 0) - foam0, orangeMesh, alt: G.st.altName, id: e.id };
    });
    if (fired.darts < 1 || fired.foam < 1 || !fired.orangeMesh) failed.push(pathId + ' pas de fléchette ' + JSON.stringify(fired));
    if (fired.alt !== alts[pathId]) failed.push(pathId + ' alt ' + fired.alt);
    const hit = await p.waitForFunction(id => {
      const G = __game.G;
      const e = G.enemies.find(x => x.id === id);
      return G.kills > 0 || (e && e.hp < e.hpMax - 0.4);
    }, fired.id, { timeout: 4000 }).then(() => true).catch(() => false);
    if (!hit) failed.push(pathId + ' aucun dégât');
    const posed = await p.evaluate(() => {
      const G = __game.G, P = G.P;
      P.fireCd = 0; P.yaw = 0; P.pitch = -0.05;
      const before = G.foamLaunched || 0;
      __game.attack(false);
      const live = G.projs.filter(pr => pr.kind === 'dart' && pr.foam && !pr.visual);
      document.getElementById('lvlcard').classList.add('hidden');
      __game.fx.clear();
      for (const e of G.enemies) { e.x += 40; e.z += 40; }
      const show = live.slice(0, 5);
      show.forEach((pr, i) => {
        const mid = (show.length - 1) / 2;
        pr.pos.set(P.x + (i - mid) * 0.15, 1.55 + i * 0.22, P.z - 1.7);
        pr.vel.set(0, 0, 0); pr.life = 30; pr.trail = 0;
        pr.m.rotation.set(0, Math.PI / 2, 0);
      });
      live.slice(5).forEach(pr => { pr.life = 0; });
      let tips = 0; __game.viewmodel().traverse(o => { if (o.userData && o.userData.orangeTip) tips++; });
      return { darts: live.length, tips, added: (G.foamLaunched || 0) - before };
    });
    if (posed.darts < 1 || posed.tips < 1) failed.push(pathId + ' vue ' + JSON.stringify(posed));
    await p.screenshot({ path: path.join(OUT, 'darts_' + pathId + '.png') });
    const alt = await p.evaluate(() => {
      const G = __game.G; G.P.altCd = 0; const n0 = G.foamLaunched || 0; __game.attack(true);
      return { added: (G.foamLaunched || 0) - n0, foam: G.projs.filter(pr => pr.kind === 'dart' && pr.foam).length };
    });
    if (alt.added < 1) failed.push(pathId + ' spécial muet');
    const bought = await p.evaluate(id => {
      const G = __game.G; G.state = 'shop'; G.cash = 800; const d0 = G.st.dmg; const ok = __game.buy(id);
      return { ok, lv: G.up[id] || 0, dmg: G.st.dmg, d0 };
    }, ups[pathId]);
    if (!bought.ok || bought.lv !== 1 || !(bought.dmg > bought.d0)) failed.push(pathId + ' amélioration ' + JSON.stringify(bought));
    console.log(pathId, JSON.stringify({ fired, hit, posed, alt, bought }));
  }
  console.log('NOMS', names.join(' | '));
  console.log('ERREURS', errs.slice(0, 8).join('\n') || 'aucune');
  await b.close(); srv.close();
  if (failed.length || errs.length) { console.log('DARTS FAIL', failed.join(' ; ')); process.exit(1); }
  console.log('DARTS OK');
})().catch(e => { console.error(e); process.exit(1); });
