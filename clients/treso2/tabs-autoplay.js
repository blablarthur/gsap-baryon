//SCRIPT GSAP — DÉFILEMENT AUTO DES TABS (panneau desktop + visuels mobile)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') return;
  const DURATION = 5; // secondes avant de passer au tab suivant

  gsap.utils.toArray('[data-accordion]').forEach(initAccordion);

  function initAccordion(root) {
    const items = gsap.utils.toArray('[data-accordion-item]', root);
    if (!items.length) return;

    // --- Scope ÉLARGI : on remonte au conteneur qui englobe À LA FOIS -----
    // le panneau desktop ([data-accordion-media]) ET la liste ([data-accordion]).
    // Sans ça, les visuels desktop (siblings de la liste) ne sont jamais trouvés.
    const scope = root.closest('.faq3_content, .faq3_component, .faq3_wrapper, section') || document;

    // Association visuels ↔ items PAR VALEUR d'index.
    // data-accordion-visual="0" desktop ET ="0" mobile → même groupe, togglés ensemble.
    const allVisuals = gsap.utils.toArray('[data-accordion-visual]', scope);

    const hasExplicitIndex = allVisuals.some(
      (v) => v.getAttribute('data-accordion-visual') !== ''
    );

    let mediaGroups; // mediaGroups[i] = [tous les visuels de l'item i]

    if (hasExplicitIndex) {
      mediaGroups = items.map((_, i) =>
        allVisuals.filter(
          (v) => Number(v.getAttribute('data-accordion-visual')) === i
        )
      );
    } else {
      console.warn('[FAQ] Pas de valeur sur data-accordion-visual : fallback positionnel.');
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

    function setGroupAlpha(group, alpha) {
      group.forEach((media) => {
        gsap.to(media, { autoAlpha: alpha, duration: 0.5, ease: 'power2.out' });
      });
    }

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

    items.forEach((item, i) => {
      item.querySelector('[data-accordion-header]')
          .addEventListener('click', () => {
            if (i === current) close();
            else open(i, false);
          });
    });

    root.addEventListener('mouseenter', () => progressTween && progressTween.pause());
    root.addEventListener('mouseleave', () => progressTween && progressTween.resume());

    window.addEventListener('load', () => {
      if (current < 0) return;
      const body = items[current].querySelector('[data-accordion-body]');
      if (body) gsap.set(body, { height: 'auto' });
    });

    open(0);
  }
});
