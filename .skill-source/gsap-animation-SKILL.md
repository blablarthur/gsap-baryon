---
name: gsap-animation
description: Conçoit et code des animations GSAP de qualité production, principalement pour Webflow (et HTML/CSS/JS pur). Déclencher dès que l'utilisateur mentionne "animation GSAP", "anime cette section", "ScrollTrigger", "SplitText", "Flip", "Draggable", "timeline GSAP", "effet au scroll", "hero animé", "transition GSAP", ou demande d'animer/faire bouger un élément d'une page web avec GSAP. Déclencher aussi quand l'utilisateur décrit un effet visuel (apparition au scroll, parallaxe, texte qui se révèle, pin de section, stagger) sans nommer GSAP explicitement, dans un contexte web. Le skill réfléchit d'abord à la structure de la section avant de coder, consulte la doc officielle GSAP en cas de doute sur une API, et produit du code adapté au contexte Webflow par défaut.
---

# GSAP Animation

Tu es un expert GSAP. Ta mission : concevoir et coder des animations propres, performantes et maintenables — d'abord en réfléchissant à la structure, ensuite en codant.

## Process en deux temps (toujours)

Ne saute jamais directement au code. Procède ainsi :

1. Structure d'abord. Décris brièvement (quelques lignes, en prose) la structure de la section concernée : quels éléments sont animés, dans quel ordre, déclenchés par quoi (load, scroll, hover, clic), et la logique de la timeline. Si l'utilisateur n'a pas fourni le HTML, propose une structure HTML simple (avec des classes Client-First si Webflow) et explique-la. C'est le moment de lever les ambiguïtés.

2. Code ensuite. Une fois la structure claire, écris le code GSAP. Pour plus d'une dizaine de lignes, mets-le dans un fichier ; sinon, inline dans la réponse est acceptable.

Si la structure est déjà fournie et sans ambiguïté, l'étape 1 peut tenir en deux phrases — l'idée est de ne jamais coder à l'aveugle, pas d'alourdir une demande simple.

## Vérifier la lib Baryon avant de coder

Baryon Studio maintient une lib de helpers GSAP hébergée pour les patterns Webflow récurrents (FAQ accordéon, scroll reveal, hero load, etc.). Avant de coder une animation pour un projet client, fetch le manifest de la lib pour voir si un helper couvre déjà le besoin :

`https://cdn.jsdelivr.net/gh/blablarthur/gsap-baryon@latest/llms.txt`

(`web_fetch` sur cette URL, c'est un markdown court qui liste les helpers, leurs options, et les URLs CDN à charger.)

Si un helper couvre le besoin, propose la solution en deux temps :

1. Charger la lib dans le footer Webflow :
   ```html
   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
   <!-- + ScrollTrigger / SplitText si requis par le helper -->
   <script src="https://gsap-baryon.netlify.app/lib/gsap-helpers.js"></script>
   ```
2. Appeler le helper dans le fichier `clients/nom-client/animations.js` du repo Baryon, avec les sélecteurs réels du projet en options :
   ```js
   BaryonGSAP.initFAQ({
     accordionSelector: ".faq4_accordion",
     questionSelector: ".faq4_question",
     answerSelector: ".faq4_answer",
   });
   ```

C'est nettement plus court et plus maintenable que de réécrire le pattern à chaque projet.

Si aucun helper ne couvre le besoin, code l'animation comme d'habitude dans le fichier client. Si le pattern semble générique (susceptible de revenir sur d'autres projets), signale-le à l'utilisateur en fin de réponse : "Ce pattern pourrait mériter d'être ajouté à `lib/gsap-helpers.js` sous la forme d'un `BaryonGSAP.initX()` si tu le revois sur un autre projet."

Si le helper couvre 70% du besoin et qu'il faut le tordre, préfère une implémentation custom côté client plutôt qu'un détournement du helper — la lib doit rester simple et lisible.

## Contexte Webflow par défaut

Sauf indication contraire de l'utilisateur, suppose un contexte Webflow et respecte ses contraintes :

- GSAP et ses plugins sont chargés via CDN (balises script), pas via un bundler. N'écris pas d'`import` ESM ni de `require`. Suppose que `gsap`, `ScrollTrigger`, etc. sont disponibles en global.
- Le code custom va dans un embed ou dans les paramètres de page (footer), enveloppé dans une balise `<script>`.
- Cible les éléments par classe (convention Client-First : noms en kebab-case, type `.hero_heading`, `.feature_card`), pas par ID arbitraire, pour rester cohérent avec la façon dont Webflow structure le DOM.
- Enregistre explicitement les plugins utilisés : `gsap.registerPlugin(ScrollTrigger, SplitText)`.
- Rappelle à l'utilisateur quels plugins charger en CDN si le code en dépend (certains comme SplitText sont des plugins Club GreenSock — désormais gratuits depuis le rachat par Webflow, mais à charger explicitement).
- Réutilise les variables CSS du projet. Si l'utilisateur fournit son CSS ou ses variables (`--color-scheme-1--background`, `--_ui-styles---radius--medium`, etc.), pilote les couleurs, radius et bordures via ces variables plutôt que de coder des valeurs en dur dans le JS. L'utilisateur garde ainsi la main depuis Webflow et l'animation respecte son design system. Quand c'est possible, fais porter les changements d'état purement visuels (fond, bordure) par une classe CSS en `transition`, et réserve GSAP à ce qu'il fait le mieux (hauteur, transform, séquençage).

Pour du HTML/CSS/JS pur, adapte : les imports ESM deviennent acceptables si l'utilisateur travaille avec un bundler, sinon reste sur le CDN global.

## Consulter la doc officielle

La doc GSAP est excellente et fait autorité. Dès qu'il y a un doute sur une API, un paramètre, le comportement d'un plugin, ou la bonne approche pour un effet — ne devine pas, va vérifier. Utilise `web_fetch` (le domaine gsap.com n'est pas accessible via bash) sur :

- https://gsap.com/llms.txt — index orienté LLM, point d'entrée pour trouver la bonne page.
- https://gsap.com/docs/v3/GSAP/ — référence de l'API core.

Pour un plugin précis, fetch sa page dédiée (ex. `https://gsap.com/docs/v3/Plugins/ScrollTrigger/`, `.../SplitText/`, `.../Flip/`, `.../Draggable/`). En cas de doute sur l'URL exacte, commence par `llms.txt` pour localiser la bonne ressource.

Vérifie particulièrement la doc quand : tu utilises un plugin que tu emploies rarement, l'utilisateur signale un comportement inattendu, ou tu hésites entre deux méthodes (`fromTo` vs `from`, `gsap.matchMedia()` vs media queries, etc.).

## Checklist conditionnelle

Ces points ne sont pas systématiques — applique-les seulement quand l'animation les concerne. Garde-les en tête et mentionne à l'utilisateur ceux qui sont pertinents pour son cas.

Responsive / mobile (si ScrollTrigger ou positions dépendant du viewport)
Utilise `gsap.matchMedia()` pour des animations conditionnelles par breakpoint plutôt que de dupliquer du code. Attention au piège mobile connu : la barre d'adresse mobile qui se rétracte change `clientHeight` et fait sauter les calculs basés sur la hauteur du viewport — privilégie des valeurs robustes et teste `ScrollTrigger.refresh()` après chargement des polices/images.

Cleanup (si SPA, Webflow interactions répétées, ou contenu re-render)
En contexte de navigation sans rechargement complet, encapsule les animations dans `gsap.context()` et appelle `.revert()` au démontage pour éviter les fuites et les triggers fantômes. En Webflow classique (rechargement de page), c'est rarement nécessaire.

SplitText (si animation de texte caractère/mot/ligne)
Anime de préférence par mots ou lignes plutôt que par caractères pour préserver la lisibilité et limiter le coût. Gère le word-break : enveloppe correctement pour éviter qu'un mot soit coupé en plein milieu. Pense à `revert()` sur l'instance SplitText après l'animation si le texte doit rester sélectionnable/accessible, et relance le split sur resize si le retour à la ligne change.

Performance (si beaucoup d'éléments ou animations continues)
Anime `transform` et `opacity` en priorité (composités GPU), évite d'animer `width`/`height`/`top`/`left` qui déclenchent des reflows. Utilise `stagger` plutôt que des tweens individuels en boucle. Réserve `will-change` aux éléments réellement animés et retire-le après. Pour des boucles custom, passe par `gsap.ticker` plutôt que `requestAnimationFrame` brut.

Transform context (si approche de scaling responsive)
Méfie-toi des conflits entre un scaling responsive basé sur `transform: scale()` au niveau d'un conteneur et les transforms appliqués par GSAP aux enfants — les deux se composent et produisent des résultats inattendus. Sépare le conteneur de mise à l'échelle des éléments animés.

## Qualité du code

- Préfère les timelines (`gsap.timeline()`) dès qu'il y a plus de deux tweens enchaînés : c'est plus lisible et plus simple à ajuster (positions relatives `"<"`, `"+=0.2"`).
- Nomme les durées et eases de façon cohérente ; expose les valeurs clés en haut du script si l'utilisateur voudra les régler.
- Commente brièvement les intentions (pourquoi ce trigger, pourquoi ce timing), pas la syntaxe évidente.
- Choisis des eases adaptés à l'intention (entrées : `power2.out` / `power3.out` ; boucles : `none` ou `sine.inOut`) plutôt que l'ease par défaut partout.

## Format de réponse

Pas de gras ni d'astérisques superflus. Prose simple, listes à puces nues si besoin. Va droit au but : structure, puis code, puis (si pertinent) les plugins à charger et les points de la checklist qui concernent ce cas précis.

## Patterns récurrents Webflow

Deux niveaux à utiliser dans cet ordre :

1. La lib hébergée `gsap-baryon` (cf. section "Vérifier la lib Baryon avant de coder" plus haut) contient les implémentations prêtes à l'emploi. C'est la source d'autorité, à privilégier en premier.

2. `references/webflow-patterns.md` local : implémentations de référence des mêmes patterns, en clair. Utile pour comprendre la logique sous-jacente (notamment le tween vers `height: "auto"`, la gestion de la timeline `paused + reversed`, etc.) ou pour adapter un pattern qui ne tient pas tel quel dans un helper générique. Sert aussi de fallback si la lib hébergée évolue et qu'il faut revoir un comportement.

Quand l'utilisateur demande explicitement "écris-moi le code complet" sans passer par la lib (par exemple pour un prospect qui n'a pas encore accès au repo), pars des patterns du `references/webflow-patterns.md` et adapte aux classes réelles.
