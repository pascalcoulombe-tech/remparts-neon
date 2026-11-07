# Remparts Néon

*Trance, tuques et formulaires.* Un jeu de survie par vagues à la première personne, dans un Québec néon et satirique, qui tourne dans le navigateur.

Les cônes orange ont pris vie, les bureaucrates zombies remplissent des formulaires, les consultants lancent des factures et les déneigeuses-bots chargent à minuit. Choisis ton arme, tiens les remparts et écoute Ti-Guy Néon sur CNÉO 88,8 FM.

- **3 armes** : Le Bâton-mousse (fléchettes courtes), La Pelle-mousse (rafale), L'Éclateur (fléchette en mousse qui éclate en zone).
- **La musique mène la danse** : trance générée en direct ; le build-up monte, le drop lâche la horde, le breakdown te laisse souffler.
- **Sur le beat** : attaque quand les barres se rejoignent au centre du viseur pour faire plus de dégâts (aucune pénalité sinon).
- **4 quartiers** : Vieux-Québec néon, Saint-Roch néon, Limoilou néon, Le Pont de glace, chacun avec 3 vagues et un boss.
- **Dépanneur Néon** : dépense tes piasses néon entre les vagues.
- Clavier/souris, manette et écran tactile.
- **Plein écran** : bouton ⛶ en haut à droite (aussi dans le menu titre et le menu pause) ou touche **F**. Sur iPhone, Safari ne permet pas le vrai plein écran d'une page : le jeu passe en « pseudo plein écran » et, pour cacher la barre de Safari, il faut l'ajouter à l'écran d'accueil (Partager ▸ Sur l'écran d'accueil), où il se lance en plein écran.

Tous les personnages sont fictifs.

## Lancer
Servir le dossier avec n'importe quel serveur statique (les modules ES ne marchent pas en `file://`) :
```
node tools/serve.js 8765   # puis http://localhost:8765/remparts-neon/
```
Le même serveur répond aussi à la racine. Paramètres d'URL : `?q=low` ou `?q=high` (qualité), `?touch` (forcer les contrôles tactiles).

## Tests
`npm test` vérifie le plan de fléchettes et le préfixe `/remparts-neon/`. `node tools/darts.js` prouve que les trois blasters lancent une fléchette en mousse, touchent et s'améliorent. `node tools/bot.js [baton|pelle|onde]` joue une partie complète. `node tools/touch.js` vérifie la disposition tactile. Playwright est une dépendance de développement (`npm install`, puis `npx playwright install chromium`).

## Crédits
- [Three.js](https://threejs.org) r170 (licence MIT, `vendor/THREE-LICENSE`), copié dans `vendor/`.
- Polices Jersey 10 et Press Start 2P (SIL Open Font License, `assets/fonts/`).
- Code, musique, textes et graphismes : originaux, générés par le code.
- Copie du dépôt public [passcool17/remparts-neon](https://github.com/passcool17/remparts-neon) à la révision `8ce6e169fd13ae4461118bf2364c19fd64e4ae74`. Voir `PROVENANCE.md`. Le dépôt d'origine n'a pas été modifié.
