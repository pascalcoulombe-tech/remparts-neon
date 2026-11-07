# Toy blasters — design

**Status:** Approved task « Remplace les trois armes par des jouets style Nerf, avec des fléchettes en mousse. » Written for the copy in this repository. Source revision `8ce6e169fd13ae4461118bf2364c19fd64e4ae74`.

## Goal

Replace all three weapons with original bright plastic toy blasters that launch visible foam darts. Keep the neon Québec game: waves, maps, music, radio, enemies, and progression. Keep save ids. No commercial logo and no trademark word in player-facing copy.

## Current behavior

| id | Name today | Role | Attack |
| --- | --- | --- | --- |
| `baton` | Le Bâton | Close, wide, more life, faster | Instant melee cone. Right click: piercing puck mesh. |
| `pelle` | La Pelle-fusil | Fast repeater | Hitscan pellets and a shotgun burst. Tracers only. |
| `onde` | L'Onde | Slow explosive area | Energy orb projectile. Right click: instant pulse. |

Ids and upgrade ids live in `localStorage` key `remparts-neon-v1` and in survival records (`p: 'baton' | 'pelle' | 'onde'`).

## Approaches

1. **Rename and recolor only.** Rejected. The stick would stay an invisible melee swing.
2. **Hitscan with dart-shaped tracers.** Rejected. The pellets would not be launched darts, and the stick would still hit instantly with no projectile.
3. **Kinematic foam darts (chosen).** Every primary shot, the stick's fan, the repeater, the burst, and the heavy dart are pooled meshes with an orange tip. Damage numbers stay the ones already tuned. The stick's cone becomes a short fan of darts that can hit each enemy only once per volley, so a crowd still clears and a boss is not struck five times. The explosive shot is a foam dart that uses the existing blast. The pulse keeps its numbers and throws a visible ring of darts.

## Weapons

Player-facing copy says mousse and fléchettes. It does not say Nerf, and it draws no brand mark.

| id | Name | Tag | Role | Primary | Special |
| --- | --- | --- | --- | --- | --- |
| `baton` | Le Bâton-mousse | Fléchettes courtes | Close fan, 125 PV, faster | 5 foam darts across the old arc (more and farther with Bec élargi). Each enemy takes one hit of the old swing damage. Darts fly about `range + 0.85` at speed 22. Vertical reach stays the old melee band (`y <= 3.6`) so drones in the fan still count. | One heavy foam dart. Same damage, pierce, and cooldown as the old puck. HUD: GROSSE FLÈCHE. Enemy projectiles in the arc still bounce back. |
| `pelle` | La Pelle-mousse | Rafale | Fast precise darts | One foam dart, speed 62, reach 60, same damage, spread, and pierce as the hitscan shot. | `pellets` foam darts, spread 0.085, reach 22, same damage as the old burst. HUD: VOLÉE. |
| `onde` | L'Éclateur | Zone de mousse | Slow popping dart | One foam dart, speed 30, life 1.8, same blast radius, damage, and chain as the orb. | Same instant souffle as the old pulse, plus 12 visual foam darts in a ring (they do not add damage). HUD: SOUFFLE. |

Upgrade **ids, costs, caps, and multipliers stay**. Only the French names and descriptions change, so a save that bought `b_arc` still widens the fan.

| id | New name | Effect (unchanged) |
| --- | --- | --- |
| `b_dmg` | Mousse dense | +25 % de dégâts |
| `b_arc` | Bec élargi | Éventail plus large et plus long |
| `b_puck` | Grosse fléchette | Spécial : recharge −25 %, perce +1 |
| `b_leech` | Ventouses | +3 PV par élimination |
| `p_dmg` | Pointe lestée | +20 % de dégâts |
| `p_rate` | Ressort tendu | +15 % de cadence |
| `p_burst` | Volée chargée | Clic droit : +3 fléchettes, recharge −15 % |
| `p_pierce` | Fléchettes longues | Les tirs traversent 1 ennemi de plus |
| `o_dmg` | Mousse boréale | +20 % de dégâts |
| `o_rad` | Éclatement | Explosions plus grosses |
| `o_pulse` | Souffle chargé | Clic droit : recharge −20 %, +30 % de dégâts |
| `o_chain` | Fléchettes satellites | Chaque explosion frappe +1 ennemi proche |

Shop, weapon cards, help, alt HUD, radio lines, and record names use this copy. Help says « tire » on the beat.

## Look and sound

Each viewmodel is a low-poly plastic blaster in that weapon's existing neon color, with a bright orange muzzle (`#ff6a00`), no logo, and the same gloves. Upgrade rings sit on the body. Recoil replaces the stick swing.

A foam dart is two pooled boxes: a colored body and an orange tip. No gravity, no soft body, no new textures on disk, no new network. Trails stay sparse (about one burst in four) so a volley stays cheap on a phone-class GPU. The existing low-quality path is unchanged.

Sounds stay synthesized in `audio.js`. Each shot is a short plastic pop plus an air puff, still keyed by `baton`, `pelle`, `bordee`, `onde`, `puck`, and `pulse`.

## Compatibility

- `SAVE_KEY` remains `remparts-neon-v1`.
- Path ids and upgrade ids remain.
- Records still store the path id; the table shows the new display name.
- Waves, maps, enemies, music, radio host, dépanneur, beat bonus, and dash are unchanged.
- The static server accepts both `/` and `/remparts-neon/` so GitHub Pages base path and the existing bots both resolve. Relative import maps already work under that base.

## Tests

- `node --test` on pure shot planning: three primaries are foam darts with orange tips, the stick is a fan and not a melee flag, counts follow arc and pellet upgrades, explosive dart carries `boom`, souffle darts deal 0 damage, save key and ids stay.
- `tools/darts.js` in a browser: each blaster switches, fires, hits a spawned enemy, and accepts an upgrade. No page errors.
- `tools/touch.js`: landscape touch layout, look, fire, dash, and a foam dart from the touch fire button.
- `tools/bot.js` for `baton`, `pelle`, and `onde`: full Histoire win, shop purchases, zero JS errors.
- Manual browser check at `http://localhost:<port>/remparts-neon/` with screenshots of all three blasters and visible darts.
- A real phone is not in this environment. Do not claim S20 frame time. The budget is the existing low path plus the dart cap above.

## Out of scope

No merge, no GitHub Pages deploy, no hosting change, no new enemy, no fourth weapon, no external asset host, no trademark assets.
