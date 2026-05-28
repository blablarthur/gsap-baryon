# baryon-webflow-code

Repo de code custom Baryon Studio pour projets Webflow : helpers GSAP réutilisables (`lib/`) et scripts spécifiques par client (`clients/`). Servis via jsDelivr (CDN GitHub) ou Netlify (live-reload après chaque push).

## Structure

```
baryon-webflow-code/
├── lib/
│   └── gsap-helpers.js        Helpers globaux (FAQ accordéon, scroll reveal, hero load)
└── clients/
    └── _example/
        └── animations.js      Modèle à dupliquer pour chaque nouveau client
```

## Workflow nouveau client

1. Dupliquer `clients/_example/` en `clients/nom-client/`
2. Ajuster les sélecteurs et options dans `animations.js` selon les classes du projet Webflow
3. Push sur `main`
4. Coller dans le footer custom code de la page Webflow concernée :

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/SplitText.min.js"></script>
<script src="<URL_DE_VOTRE_CDN>/lib/gsap-helpers.js"></script>
<script src="<URL_DE_VOTRE_CDN>/clients/nom-client/animations.js"></script>
```

Voir la section URLs ci-dessous pour les valeurs concrètes.

## URLs CDN

### jsDelivr (CDN public GitHub)

Tag de version stable (recommandé pour la prod cliente) :
```
https://cdn.jsdelivr.net/gh/blablarthur/gsap-baryon@v0.1.0/lib/gsap-helpers.js
```

Dernier commit (cache 24h max, plus court qu'avec `@main`) :
```
https://cdn.jsdelivr.net/gh/blablarthur/gsap-baryon@latest/lib/gsap-helpers.js
```

Pour forcer la purge d'un fichier en cache :
```
https://purge.jsdelivr.net/gh/blablarthur/gsap-baryon@main/lib/gsap-helpers.js
```

### Netlify (live-reload ~15 sec après push)

URL principale du site (toujours = dernier déploiement) :
```
https://gsap-baryon.netlify.app/lib/gsap-helpers.js
https://gsap-baryon.netlify.app/clients/nom-client/animations.js
```

Piège à éviter : les URLs Netlify avec un hash devant (type `https://6a184d3c685f8200...--gsap-baryon.netlify.app/`) sont des deploy previews figés sur un déploiement précis. Ne les utilise jamais dans Webflow — elles ne suivront pas tes futurs pushes.

## Stratégie cache : quand utiliser quoi

| Contexte | URL à utiliser | Pourquoi |
|---|---|---|
| Dev actif sur une page client | Netlify ou jsDelivr `@latest` | Modifs visibles vite après push |
| Mise en prod stable | jsDelivr `@vX.Y.Z` (tag) | Cache long = perf max, version figée |
| Urgence en prod | `purge.jsdelivr.net/...` puis re-bump tag | Invalider le cache CDN immédiatement |

## Helpers disponibles dans `lib/gsap-helpers.js`

- `BaryonGSAP.initFAQ(options)` — accordéon FAQ exclusif, hauteur animée vers `auto`, classe `.is-open` pilotée pour le style
- `BaryonGSAP.initScrollReveal(options)` — apparition au scroll avec stagger (ScrollTrigger requis)
- `BaryonGSAP.initHeroLoad(options)` — hero animé au chargement, SplitText sur le titre si disponible

Chaque fonction accepte des options pour personnaliser sélecteurs, durées, eases et comportement. Voir les commentaires en tête de chaque fonction dans `lib/gsap-helpers.js`.

## Versioning

Sortir une version stable : créer un tag git puis push.

```bash
git tag v1.0.0
git push origin v1.0.0
```

jsDelivr indexera le tag automatiquement dans les minutes qui suivent.
