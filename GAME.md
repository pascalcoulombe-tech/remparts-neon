# Remparts Néon

Jeu de vagues à la première personne. Les cônes, les formulaires et la trance restent. Les trois armes sont des blasters en plastique qui lancent des fléchettes en mousse.

Ce fichier décrit l'état du jeu, les contrôles, et des idées non faites. Un vrai téléphone n'a pas été testé ici, et le temps d'image n'a pas été mesuré.

## État

La partie passe par ces écrans. `G.state` suit la même liste.

| État | Écran | Ce qui se passe |
| --- | --- | --- |
| `title` | Menu | Jouer, records Survie, aide, options, plein écran. |
| `paths` | Choix | Arme, mode Histoire ou Survie, difficulté, quartier de départ si déjà débloqué. |
| `play` | Jeu | Carte du quartier, puis vagues. La musique décide le build-up, le drop et le répit. |
| `shop` | Dépanneur Néon | Entre les vagues. Les achats restent dans la partie. |
| `pause` | Pause | Continuer, options, plein écran, menu. |
| `dead` | K.-O. | Histoire : recommencer la vague. Survie : la partie s'arrête et le pointage peut entrer dans le top 10. |
| `win` | Victoire | Les quatre quartiers sont tenus. |

La sauvegarde navigateur `remparts-neon-v1` garde le volume, la qualité, la sensibilité, le quartier débloqué et les records. Elle ne garde pas les améliorations d'une partie. Les records stockent l'id d'arme (`baton`, `pelle`, `onde`), pas le nom affiché.

## Contrôles

| Action | Clavier / souris | Manette | Tactile |
| --- | --- | --- | --- |
| Bouger | WASD / ZQSD | Stick gauche | Pouce gauche |
| Viser | Souris | Stick droit | Glisser à droite |
| Tir | Clic gauche | RT | FEU, ou tir auto |
| Spécial | Clic droit / E | LT | SPÉCIAL |
| Esquive | Espace / Maj | A | ESQUIVE |
| Pause | Échap / P | Start | ⏸ |
| Plein écran | F | — | Bouton ⛶ |

Tirer quand les barres du viseur se rejoignent donne des dégâts bonus. Rater le beat ne punit pas. L'esquive rend intouchable un court instant. Une esquive juste avant un coup est une esquive parfaite.

## Armes

Les ids n'ont pas changé. Chacune a un bec orange et des fléchettes en mousse. Pas de logo de marque.

| Id | Nom | Rôle | Tir | Spécial |
| --- | --- | --- | --- | --- |
| `baton` | Le Bâton-mousse | Court, large, plus de vie, plus rapide | Éventail de fléchettes. Chaque ennemi ne prend qu'un coup par volée. | GROSSE FLÈCHE, une fléchette lourde qui perce. |
| `pelle` | La Pelle-mousse | Rafale | Une fléchette rapide. Les améliorations la font traverser. | VOLÉE, plusieurs fléchettes. |
| `onde` | L'Éclateur | Zone | Une fléchette qui éclate. | SOUFFLE, l'onde de choc d'avant, avec un anneau de fléchettes visibles. |

Les améliorations d'arme gardent leurs ids (`b_dmg`, `b_arc`, `b_puck`, `b_leech`, `p_dmg`, `p_rate`, `p_burst`, `p_pierce`, `o_dmg`, `o_rad`, `o_pulse`, `o_chain`). Leurs prix et leurs bonus de dégâts, de cadence, de zone et de perçage sont ceux d'avant.

## Progression

Histoire : quatre quartiers (Vieux-Québec néon, Saint-Roch néon, Limoilou néon, Le Pont de glace), trois vagues chacun, un boss à la troisième. Le Dépanneur ouvre entre les vagues. Survie : les vagues continuent, un boss toutes les cinq vagues, et le tableau des records retient dix pointages.

La musique, la radio CNÉO 88,8, les ennemis et les cartes ne changent pas avec les blasters.

## Idées suivantes

Ces idées ne sont pas dans le jeu.

1. Un stand de tir au Dépanneur pour essayer le spécial sans attendre une vague.
2. Une fléchette rayée, en plus du bec orange, pour la lire sans se fier à la couleur.
3. Un rappel visuel quand l'éventail du Bâton-mousse arrive au bout de sa courte portée.
4. Mesurer le jeu sur un téléphone réel, qualité basse, et seulement ensuite décider si les volées doivent être plus courtes.
