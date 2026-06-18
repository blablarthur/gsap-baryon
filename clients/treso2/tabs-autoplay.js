//SCRIPT GSAP — DÉFILEMENT AUTO DES TABS (multi-set responsive)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') return;
  const DURATION = 5; // secondes avant de passer au tab suivant

  gsap.utils.toArray('[data-accordion]').forEach(initAccordion);

  function initAccordion(root) {
    const items = gsap.utils.toArray('[data-accordion-item]', root);
    if (!items.length) return;

    // --- Association visuels ↔ items PAR VALEUR D'INDEX -------------------
    // data-accordion-visual="0", "1"... La valeur EST l'index de l'item.
    // Plusieurs visuels peuvent partager le même index (ex: 1 mobile + 1
    // desktop) : ils seront togglés ensemble. Le CSS gère la visibilité
    // selon le breakpoint.
    const allVisuals = gsap.utils.toArray('[data-accordion-visual]', root);

    // Détecte si tu as bien renseigné des valeurs numériques
    const hasExplicitIndex = allVisuals.some(
      (v) => v.getAttribute('data-accordion-visual') !== ''
    );

    let mediaGroups; // tableau de tableaux : mediaGroups[i] = [visuels de l'item i]

    if (hasExplicitIndex) {
      mediaGroups = items.map((_, i) =>
        allVisuals.filter(
          (v) => Number(v.getAttribute('data-accordion-visual')) === i
        )
      );
    } else {
      // Fallback positionnel (un seul set, ancien markup sans valeurs)
      console.warn('[FAQ] Aucune valeur sur data-accordion-visual : fallback positionnel. Mets data-accordion-visual="0", "1"... pour le mode multi-set responsive.');
      mediaGroups = items.map((item, i) => {
        const m = item.querySelector('[data-accordion-visual]') || allVisuals[i];
        return m ? [m] : [];
      });
    }

    const allMediasFlat = mediaGroups.flat();
    gsap.set(allMediasFlat, { autoAlpha: 0 });

    let current = -1;
    let progressTween;

    items.forEach((item) => {
      gsap.set(item.querySelector('[data-accordion-body]'), { height: 0, overflow: 'hidden' });
    });

    // Toggle tous les visuels d'un groupe ensemble
    function setGroupAlpha(group, alpha) {
      group.forEach((media) => {
        gsap.to(media, { autoAlpha: alpha, duration: 0.5, ease: 'power2.out' });
      });
    }

    // Ferme tout
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

      mediaGroups.forEach((group) => setGroupAlpha(group, 0));
      current = -1;
    }

    // autoplay = true par défaut
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

      // Toggle TOUS les visuels de l'item actif (mobile + desktop)
      mediaGroups.forEach((group, i) => setGroupAlpha(group, i === index ? 1 : 0));

      current = index;

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
        progressTween = null;
        const activeFill = items[index].querySelector('[data-accordion-fill]');
        gsap.to(activeFill, { scaleX: 1, duration: 0.4, ease: 'power2.out' });
      }
    }

    // Clic manuel → toggle
    items.forEach((item, i) => {
      item.querySelector('[data-accordion-header]')
          .addEventListener('click', () => {
            if (i === current) {
              close();
            } else {
              open(i, false);
            }
          });
    });

    // Pause au survol
    root.addEventListener('mouseenter', () => progressTween && progressTween.pause());
    root.addEventListener('mouseleave', () => progressTween && progressTween.resume());

    // Recalcul hauteur après chargement images/polices
    window.addEventListener('load', () => {
      if (current < 0) return;
      const body = items[current].querySelector('[data-accordion-body]');
      if (body) gsap.set(body, { height: 'auto' });
    });

    // Démarrage auto
    open(0);
  }
});
