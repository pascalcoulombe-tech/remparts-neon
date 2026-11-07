# Toy blasters implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Le Bâton, La Pelle-fusil, and L'Onde with original plastic toy blasters that all launch visible foam darts, without breaking ids, saves, or the rest of the game.

**Architecture:** Pure shot planning lives in `js/weapons.mjs` (no Three.js) so node tests can lock counts, damage, and ids. `js/main.js` turns that plan into pooled dart meshes and keeps combat, shop, and waves. Copy for cards and radio stays in `js/text.js`. The static server accepts the GitHub Pages base `/remparts-neon/` and the existing `/` URLs.

**Tech Stack:** Vanilla ES modules, Three.js r170 already in `vendor/`, Node test runner, Playwright for the browser bots.

## Global Constraints

- Source copy revision `8ce6e169fd13ae4461118bf2364c19fd64e4ae74`. Do not write to `passcool17/remparts-neon`.
- Save key stays `remparts-neon-v1`. Path ids stay `baton`, `pelle`, `onde`. Upgrade ids stay `b_dmg`, `b_arc`, `b_puck`, `b_leech`, `p_dmg`, `p_rate`, `p_burst`, `p_pierce`, `o_dmg`, `o_rad`, `o_pulse`, `o_chain`.
- Damage, fire rate, arc, range, pierce, blast radius, pulse radius, costs, and caps stay on the formulas already in `computeStats`.
- No new mesh simulation, no new image/audio files, no new network services, no commercial logo, no player-facing "Nerf".
- Orange plastic tip color `#ff6a00` / `0xff6a00`.
- Phone frame time is not measured here. Keep the existing `?q=low` path and sparse dart trails.
- Do not merge and do not deploy Pages.

---

### Task 1: Pure foam-shot planner

**Files:**
- Create: `js/weapons.js`
- Test: `tools/weapons.test.mjs`
- Modify: `js/text.js` (names only, after the test is red)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `SAVE_KEY` string `'remparts-neon-v1'`
  - `PATH_IDS` `['baton','pelle','onde']`
  - `ORANGE` number `0xff6a00`
  - `WEAPON_UPGRADES` array of `{id,path,name,desc,max,cost,c}`
  - `weaponStats(path, lv) -> object` with the fields `computeStats` already assigns per path, including `altName`
  - `buildFoamShots(path, st, alt, rand=Math.random) -> { shots, pulse, reflectArc }`
  - each shot: `{kind:'dart', foam:true, orange:true, hitscan:false, path, yaw, pitch, world, speed, life, dmg, pierce, r, scale, boom, heavy, visual, group, band}`

- [ ] **Step 1: Write the failing test**

Create `tools/weapons.test.mjs` that imports `../js/weapons.js` and `../js/text.js` and asserts the behavior in the spec: save key, ids, orange, upgrade names, card copy mentions mousse or fléchette, every primary shot is a foam dart, bâton fan is 5 darts (8 with three arc ranks) sharing `group` and `band === 3.6`, heavy dart pierce is 2, pelle alt length equals `pellets`, onde primary `boom` equals `radius`, onde alt shots are visual with `dmg === 0` and `pulse.radius === 7.5`. Also read `index.html` and `README.md` and assert they no longer say the stick is mêlée.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tools/weapons.test.mjs`

Expected: FAIL because `js/weapons.js` does not exist, then after a stub, FAIL because shots are not foam darts or copy is still the hockey stick.

- [ ] **Step 3: Write `js/weapons.js` and the copy edits**

`weaponStats` copies the numeric formulas. `buildFoamShots` implements the fan, the repeater, the burst, the popping dart, and the visual souffle ring. `WEAPON_UPGRADES` uses the new French names and the old costs. `text.js` `PATHS` and `LINES.path` use the new names. Help and README drop mêlée wording.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tools/weapons.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/weapons.js js/text.js tools/weapons.test.mjs index.html README.md
git commit -m "feat: plan foam dart shots for the three toy blasters"
```

### Task 2: Launch the darts from the game

**Files:**
- Modify: `js/main.js` (imports, upgrades list, `computeStats`, viewmodel, `attack`, projectile update, test API)
- Modify: `js/audio.js` `shoot`
- Test: `tools/darts.js` (browser)

**Interfaces:**
- Consumes: `buildFoamShots`, `weaponStats`, `WEAPON_UPGRADES`, `SAVE_KEY`, `ORANGE`
- Produces: `attack(alt)` spawns pooled dart groups; `window.__game.attack`, `window.__game.foamLaunched`, `window.__game.viewmodel`

- [ ] **Step 1: Write `tools/darts.js` and run it against the current melee game**

The script serves the game, opens `/?bot=1&q=low`, and for each of `baton`, `pelle`, `onde` calls `startRun`, spawns a cone in front of the player, calls `attack(false)`, and expects a live `foam` dart plus a drop in enemy hp. It then sets `G.state = 'shop'`, gives cash, buys the first weapon upgrade, and expects the level to increment. It also calls `attack(true)` and expects either a heavy/volley dart or, for `onde`, `foamLaunched` to increase.

Expected before the wiring: FAIL (no `attack` on the API, or a shot with no foam dart).

- [ ] **Step 2: Wire `main.js`**

- `SAVE_KEY` comes from `weapons.js`.
- Weapon rows in `UPG` are `WEAPON_UPGRADES`.
- `computeStats` `Object.assign`s `weaponStats(p, lv)`.
- `buildViewmodel` builds three plastic blasters. Each has a mesh with `userData.orangeTip = true` and material color `ORANGE`. No swing trail.
- `addDart` pools a group: body box plus orange tip box. `freeProj` uses `p.pool`.
- `attack` calls `buildFoamShots`, applies beat multiplier to `dmg` and the 1.35 onde radius bonus, assigns one `group` id per volley when `shot.group` is set, and spawns darts. `reflectArc` keeps the existing retour-à-l'envoyeur loop. `pulse` keeps the existing souffle damage and projectile clear.
- `updProjs`: darts `lookAt` their velocity. `visual` darts do not collide. `band` hits use horizontal distance and `e.y <= band`. A `group` hit marks `e.hitGroups` so one volley damages an enemy once. `boom` still calls `explode`.
- All three weapons set a short muzzle flash and recoil.
- Increment `G.foamLaunched` per spawned dart.
- Export `attack` and `viewmodel: () => vm` on `API`.

`shoot()` in `audio.js` becomes short plastic pops and air puffs for the same kind strings.

- [ ] **Step 3: Run `node tools/darts.js`**

Expected: PASS, zero page errors, all three paths hit and upgrade.

- [ ] **Step 4: Commit**

```bash
git add js/main.js js/audio.js tools/darts.js
git commit -m "feat: fire foam darts from all three toy blasters"
```

### Task 3: Pages base path

**Files:**
- Modify: `tools/serve.js`
- Test: `tools/serve.test.mjs`

**Interfaces:**
- Produces: `mapUrl(url) -> relative path string or null`

- [ ] **Step 1: Write `tools/serve.test.mjs`**

Assert `mapUrl('/remparts-neon/') === 'index.html'`, `mapUrl('/remparts-neon/js/main.js') === 'js/main.js'`, `mapUrl('/js/main.js') === 'js/main.js'`, and `mapUrl('/remparts-neon/../../etc/passwd')` does not leave the tree (`etc/passwd` or null, never an absolute path).

- [ ] **Step 2: Run it and confirm FAIL** (`mapUrl` missing).

- [ ] **Step 3: Implement `mapUrl` and use it in the request handler with `path.relative` so resolved files stay under the repo root.**

- [ ] **Step 4: PASS `node --test tools/serve.test.mjs`.**

- [ ] **Step 5: Commit** `fix: serve the game under /remparts-neon as well as /`

### Task 4: Make the existing bots runnable here

**Files:**
- Modify: `tools/bot.js`, `tools/touch.js`, `tools/smoke.js`, `tools/shots.js`, `tools/survie_shots.js`, `tools/render_audio.js`
- Create: `package.json`

**Interfaces:**
- Consumes: `playwright` package, `serve()`
- Produces: bots write screenshots under `shots/` relative to the repo, and open `/remparts-neon/`

- [ ] **Step 1: Point every Playwright require at `playwright`. Point `bot.js` shot dir at `path.join(__dirname, '..', 'shots')`. Point smoke screenshots at that folder. Add `package.json` with `playwright` as a devDependency and `"test": "node --test tools/weapons.test.mjs tools/serve.test.mjs"`.**

- [ ] **Step 2: `npm install`. Install the Chromium browser Playwright asks for.**

- [ ] **Step 3: In `bot.js`, keep the mêlée spacing for `baton` (short range). Goto `http://localhost:${PORT}/remparts-neon/?bot=1`. Same base in `touch.js`.**

- [ ] **Step 4: Commit** `chore: run bots against the Pages base path`

### Task 5: GAME.md

**Files:**
- Create: `GAME.md`

Document state machine (`title`, `paths`, `play`, `shop`, `pause`, `dead`, `win`, records), controls (keyboard, pad, touch), the three toy weapons and their ids, progression (four quartiers, three waves, dépanneur, survie), and four next ideas that are not implemented. State that a real phone was not tested and frame time was not measured.

Commit: `docs: describe game state, controls, and toy weapons`

### Task 6: Full verification

- [ ] `node --test tools/weapons.test.mjs tools/serve.test.mjs`
- [ ] `node tools/darts.js`
- [ ] `node tools/touch.js`
- [ ] `Q=low PORT=8771 node tools/bot.js baton`
- [ ] `Q=low PORT=8772 node tools/bot.js pelle`
- [ ] `Q=low PORT=8773 node tools/bot.js onde`
- [ ] Browser at `/remparts-neon/`: title, weapon select, and one shot of each blaster with a dart visible. No JS errors and no failed document requests.
- [ ] Focused review of the diff against this plan.

Expected bot result: `won: true`, `errors` length 0, exit code 0.

## Spec coverage

- All three launch foam darts: Task 1 planner + Task 2 spawn.
- Stick is not invisible mêlée: fan of darts, no swing damage, test asserts `hitscan: false` and `kind === 'dart'`.
- Roles and numbers: `weaponStats` copies formulas; volley dedupe keeps boss damage at one hit; pelle pierce and burst count stay; onde `boom` and pulse stay.
- Copy, shop, help, sounds: Tasks 1 and 2.
- Ids and saves: `SAVE_KEY`, `PATH_IDS`, upgrade ids tested.
- Waves, maps, music, enemies: not edited except shot sounds.
- Base path: Task 3 and bot URLs.
- Touch and full wins: Task 6.
- No Pages deploy: stop after the PR.

## Placeholder scan

No TBD steps. Numeric formulas and file paths are the ones above.

## Type consistency

`buildFoamShots` shot fields match `addDart`. `weaponStats` `altName` values are `GROSSE FLÈCHE`, `VOLÉE`, `SOUFFLE`. `pulse` is `{radius, dmg}` only for onde alt, otherwise null. `reflectArc` is true only for baton primary.
