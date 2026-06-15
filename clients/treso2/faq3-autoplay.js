<!--
  SCRIPT GSAP — ACCORDÉON 2 COLONNES (FAQ / IMAGE) avec autoplay + barre de progression
  ------------------------------------------------------------------------------------
  Côté Webflow :
   - Chaque image/visuel porte l'attribut  data-accordion-visual  (même ordre que les questions).
     (fallback supporté : un wrapper  data-accordion-media  dont on anime les enfants directs)
   - Chaque item d'accordéon : data-accordion-item
       > data-accordion-header (cliquable)
           > data-accordion-icon
           > data-accordion-fill  (la barre orange qui se remplit)
       > data-accordion-body
   - Le conteneur : data-accordion
-->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') return;
  const DURATION = 5; // durée (en secondes) avant de passer au tab suivant

  // On initialise CHAQUE accordéon de la page indépendamment
  gsap.utils.toArray('[data-accordion]').forEach(initAccordion);

  function initAccordion(root) {
    // 2e argument = scope : on ne récupère QUE les enfants de CE root
    const items = gsap.utils.toArray('[data-accordion-item]', root);
    if (!items.length) return;

    // Médias : on cherche [data-accordion-visual] (puis fallback ancien markup).
    // En layout 2 colonnes, les images sont souvent EN DEHORS de [data-accordion] :
    // si on ne trouve rien dans le root, on élargit la recherche au parent commun.
    function findMedias(scope) {
      let m = gsap.utils.toArray('[data-accordion-visual]', scope);
      if (!m.length) m = gsap.utils.toArray('[data-accordion-media] > *', scope);
      return m;
    }
    let medias = findMedias(root);
    if (!medias.length) {
      // On remonte vers un parent qui contient à la fois questions ET images
      const shared = root.closest('.faq3_component, .faq3_wrapper, section') || document;
      medias = findMedias(shared);
    }
    if (!medias.length) {
      console.warn('[FAQ] Aucun [data-accordion-visual] trouvé. Vérifie l\'attribut sur les images.');
    }

    gsap.set(medias, { autoAlpha: 0 }); // anti-flash, scopé à ce root

    // Variables LOCALES à chaque accordéon → état isolé
    let current = -1;
    let progressTween;

    // 1. État fermé au démarrage
    items.forEach((item) => {
      gsap.set(item.querySelector('[data-accordion-body]'), { height: 0, overflow: 'hidden' });
    });

    // 2. Ouvrir l'item "index"
    function open(index) {
      if (progressTween) progressTween.kill();

      items.forEach((item, i) => {
        const body = item.querySelector('[data-accordion-body]');
        const fill = item.querySelector('[data-accordion-fill]');
        const icon = item.querySelector('[data-accordion-icon]');
        const isActive = i === index;
        item.classList.toggle('is-active', isActive);
        gsap.to(body, { height: isActive ? 'auto' : 0, duration: 0.45, ease: 'power2.inOut' });
        gsap.to(icon, { rotation: isActive ? 45 : 0, duration: 0.35, ease: 'power2.out' });
        gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      });

      // Crossfade du visuel correspondant
      medias.forEach((media, i) => {
        gsap.to(media, { autoAlpha: i === index ? 1 : 0, duration: 0.5, ease: 'power2.out' });
      });

      current = index;

      // Barre de progression de l'item actif, puis enchaînement automatique
      const activeFill = items[index].querySelector('[data-accordion-fill]');
      progressTween = gsap.fromTo(activeFill,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: DURATION,
          ease: 'none',
          onComplete: () => open((index + 1) % items.length) // boucle sur CE root uniquement
        }
      );
    }

    // 3. Clic manuel
    items.forEach((item, i) => {
      item.querySelector('[data-accordion-header]')
          .addEventListener('click', () => open(i));
    });

    // 4. Pause au survol — scopée au root
    root.addEventListener('mouseenter', () => progressTween && progressTween.pause());
    root.addEventListener('mouseleave', () => progressTween && progressTween.resume());

    // 5. Recalcul de la hauteur de l'item ouvert après chargement images/polices
    window.addEventListener('load', () => {
      if (current < 0) return;
      const body = items[current].querySelector('[data-accordion-body]');
      if (body) gsap.set(body, { height: 'auto' });
    });

    // 6. Démarrage
    open(0);
  }
});
</script>
