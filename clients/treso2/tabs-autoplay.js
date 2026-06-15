  //SCRIPT GSAP POUR LE DEFILEMENT AUTOMATIQUE DES TABS
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') return;
  const DURATION = 5; // durée (en secondes) avant de passer au tab suivant

  gsap.utils.toArray('[data-accordion]').forEach(initAccordion);

  function initAccordion(root) {
    const items = gsap.utils.toArray('[data-accordion-item]', root);
    if (!items.length) return;

    function findMedias(scope) {
      let m = gsap.utils.toArray('[data-accordion-visual]', scope);
      if (!m.length) m = gsap.utils.toArray('[data-accordion-media] > *', scope);
      return m;
    }
    let medias = findMedias(root);
    if (!medias.length) {
      const shared = root.closest('.faq3_component, .faq3_wrapper, section') || document;
      medias = findMedias(shared);
    }
    if (!medias.length) {
      console.warn('[FAQ] Aucun [data-accordion-visual] trouvé. Vérifie l\'attribut sur les images.');
    }

    gsap.set(medias, { autoAlpha: 0 });

    let current = -1;
    let progressTween;

    items.forEach((item) => {
      gsap.set(item.querySelector('[data-accordion-body]'), { height: 0, overflow: 'hidden' });
    });

    // autoplay = true par défaut (démarrage + enchaînement auto)
    function open(index, autoplay = true) {
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

      medias.forEach((media, i) => {
        gsap.to(media, { autoAlpha: i === index ? 1 : 0, duration: 0.5, ease: 'power2.out' });
      });

      current = index;

      // Barre de progression UNIQUEMENT en mode auto
      if (autoplay) {
        const activeFill = items[index].querySelector('[data-accordion-fill]');
        progressTween = gsap.fromTo(activeFill,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: DURATION,
            ease: 'none',
            onComplete: () => open((index + 1) % items.length)
          }
        );
      } else {
        progressTween = null; // stop définitif du défilement
        // Barre de l'item ouvert remplie à 100 %
        const activeFill = items[index].querySelector('[data-accordion-fill]');
        gsap.to(activeFill, { scaleX: 1, duration: 0.4, ease: 'power2.out' });
      }
    }

    // 3. Clic manuel → stoppe l'autoplay
    items.forEach((item, i) => {
      item.querySelector('[data-accordion-header]')
          .addEventListener('click', () => open(i, false));
    });

    // 4. Pause au survol (utile tant que l'autoplay tourne)
    root.addEventListener('mouseenter', () => progressTween && progressTween.pause());
    root.addEventListener('mouseleave', () => progressTween && progressTween.resume());

    // 5. Recalcul de hauteur après chargement images/polices
    window.addEventListener('load', () => {
      if (current < 0) return;
      const body = items[current].querySelector('[data-accordion-body]');
      if (body) gsap.set(body, { height: 'auto' });
    });

    // 6. Démarrage en mode auto
    open(0);
  }
});
