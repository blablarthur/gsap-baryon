  //SCRIPT GSAP POUR LE DEFILEMENT AUTOMATIQUE DES TABS
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') return;
  const DURATION = 5; // durée (en secondes) avant de passer au tab suivant

  gsap.utils.toArray('[data-accordion]').forEach(initAccordion);

  function initAccordion(root) {
    const items = gsap.utils.toArray('[data-accordion-item]', root);
    if (!items.length) return;

    // --- Détection des médias (adaptative) ---------------------------------
    // Mode "par item" (mobile) : chaque item contient son propre
    //   [data-accordion-visual]. On l'associe directement à l'item.
    // Mode "panneau partagé" (desktop, ancien markup) : les visuels vivent
    //   dans un [data-accordion-media] commun, alignés sur l'ordre des items.
    // Le même script couvre les deux configs sans changer le markup, donc
    //   data-accordion-media n'est plus obligatoire.
    let perItemMedia = true;
    const medias = items.map((item) => {
      const m = item.querySelector('[data-accordion-visual]');
      if (!m) perItemMedia = false;
      return m;
    });

    // Fallback panneau partagé si aucun visuel n'est trouvé dans les items
    if (!perItemMedia) {
      let shared = gsap.utils.toArray('[data-accordion-visual]', root);
      if (!shared.length) shared = gsap.utils.toArray('[data-accordion-media] > *', root);
      if (!shared.length) {
        const scope = root.closest('.faq3_component, .faq3_wrapper, section') || document;
        shared = gsap.utils.toArray('[data-accordion-visual]', scope);
        if (!shared.length) shared = gsap.utils.toArray('[data-accordion-media] > *', scope);
      }
      if (!shared.length) {
        console.warn('[FAQ] Aucun visuel trouvé. Ajoute [data-accordion-visual] dans chaque item (mobile) ou dans [data-accordion-media] (desktop).');
      }
      // On remplace la liste alignée-par-item par la liste partagée
      medias.length = 0;
      shared.forEach((m) => medias.push(m));
    }

    gsap.set(medias.filter(Boolean), { autoAlpha: 0 });

    let current = -1;
    let progressTween;

    items.forEach((item) => {
      gsap.set(item.querySelector('[data-accordion-body]'), { height: 0, overflow: 'hidden' });
    });

    // Ferme tout : aucun item actif, barres remises à zéro, médias masqués
    function close() {
      if (progressTween) progressTween.kill();
      progressTween = null;

      items.forEach((item) => {
        const body = item.querySelector('[data-accordion-body]');
        const fill = item.querySelector('[data-accordion-fill]');
        const icon = item.querySelector('[data-accordion-icon]');
        item.classList.remove('is-active');
        gsap.to(body, { height: 0, duration: 0.45, ease: 'power2.inOut' });
        gsap.to(icon, { rotation: 0, duration: 0.35, ease: 'power2.out' });
        gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      });

      medias.forEach((media) => {
        if (media) gsap.to(media, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' });
      });

      current = -1;
    }

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
        if (media) gsap.to(media, { autoAlpha: i === index ? 1 : 0, duration: 0.5, ease: 'power2.out' });
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

    // 3. Clic manuel → toggle : ouvre l'item, ou le ferme s'il est déjà ouvert
    items.forEach((item, i) => {
      item.querySelector('[data-accordion-header]')
          .addEventListener('click', () => {
            if (i === current) {
              close(); // reclic sur l'item actif → fermeture + reset barre
            } else {
              open(i, false); // ouverture manuelle (stoppe l'autoplay)
            }
          });
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
