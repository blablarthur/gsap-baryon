<script>
  //SCRIPT GSAP POUR VIDEO CARD
document.addEventListener('DOMContentLoaded', () => {

  gsap.utils.toArray('[data-video="list"]').forEach(initVideoCards);

  function initVideoCards(list) {
    const items = gsap.utils
      .toArray('.w-dyn-item', list)
      .filter(item => item.querySelector('[data-video="card"]'));

    if (!items.length) return;

    const DURATION = 0.8;
    const EASE = 'power3.inOut';
    const SNAP_AT = 0.4;   // instant du snap d'alignement (pic de vélocité) — baisse à 0.3 si tu préfères

    const getReveal   = (item) => item.querySelectorAll('[data-video="reveal"]');
    const getCollapse = (item) => item.querySelectorAll('[data-video="collapse"]');
    const getLeft     = (item) => item.querySelector('.video_card-content-left');

    // Les deux blocs de contenu de la card : [0] = titre, [1] = bouton
    const getBlocks = (item) => {
      const card = item.querySelector('[data-video="card"]');
      const z = card.querySelectorAll(':scope > .z-index-2');
      return { card, main: z[0], side: z[1] };
    };

    // Mémorise le gap naturel du bloc gauche (pour le restaurer à l'ouverture)
    items.forEach(item => {
      const left = getLeft(item);
      if (left) left.dataset.gap = getComputedStyle(left).rowGap;
    });

    const mm = gsap.matchMedia();

    mm.add('(min-width: 992px)', () => {

      let current = null;
      const controller = new AbortController();

      function setState(item, isOpen) {
        const left = getLeft(item);
        const { card, main, side } = getBlocks(item);

        card.classList.toggle('is-open', isOpen);

        gsap.set(item, { flexGrow: isOpen ? 1 : 0 });
        gsap.set(getReveal(item),   { autoAlpha: isOpen ? 1 : 0 });
        gsap.set(getCollapse(item), { autoAlpha: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0, minHeight: 0 });
        if (left) gsap.set(left, {
          rowGap: isOpen ? left.dataset.gap : 0,
          alignItems: isOpen ? 'flex-start' : 'center'
        });

        // Centrage du titre
        gsap.set(main, { flexGrow: isOpen ? 1 : 0, minWidth: 0, textAlign: isOpen ? 'left' : 'center' });
        gsap.set(side, { width: isOpen ? 'auto' : 0, overflow: 'hidden', flexShrink: 0 });
        gsap.set(card, { columnGap: isOpen ? '1rem' : '0rem' });
      }

      function openItem(item) {
        if (item === current) return;
        const prev = current;
        current = item;

        const tl = gsap.timeline({ defaults: { duration: DURATION, ease: EASE } });

        if (prev) {
          const pLeft = getLeft(prev);
          const p = getBlocks(prev);

          p.card.classList.remove('is-open');

          tl.to(getReveal(prev),   { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, 0)
            .to(getCollapse(prev), { autoAlpha: 0, height: 0, duration: 0.3, ease: 'power2.out' }, 0)
            .to(prev,   { flexGrow: 0 }, 0)
            .to(p.main, { flexGrow: 0 }, 0)
            .to(p.side, { width: 0 }, 0)
            .to(p.card, { columnGap: '0rem' }, 0)
            .set(p.main, { textAlign: 'center' }, SNAP_AT);
          if (pLeft) {
            tl.to(pLeft, { rowGap: 0, duration: 0.3, ease: 'power2.out' }, 0)
              .set(pLeft, { alignItems: 'center' }, SNAP_AT);
          }
        }

        const nLeft = getLeft(item);
        const n = getBlocks(item);

        n.card.classList.add('is-open');

        tl.to(item,   { flexGrow: 1 }, 0)
          .to(n.main, { flexGrow: 1 }, 0)
          .to(n.side, { width: 'auto' }, 0)
          .to(n.card, { columnGap: '1rem' }, 0)
          .set(n.main, { textAlign: 'left' }, SNAP_AT)
          .to(getReveal(item),   { autoAlpha: 1, duration: 0.4, ease: 'power1.in' }, '-=0.35')
          .to(getCollapse(item), { autoAlpha: 1, height: 'auto', duration: 0.4, ease: 'power2.out' }, '-=0.4');
        if (nLeft) {
          tl.to(nLeft, { rowGap: nLeft.dataset.gap, duration: 0.4, ease: 'power2.out' }, '-=0.4')
            .set(nLeft, { alignItems: 'flex-start' }, SNAP_AT);
        }
      }

      // Init : première card ouverte
      items.forEach((item, i) => setState(item, i === 0));
      current = items[0];

      items.forEach(item => {
        item.addEventListener('click', (e) => {
          if (item !== current && e.target.closest('a')) e.preventDefault();
          openItem(item);
        }, { signal: controller.signal });
      });

      return () => {
        controller.abort();
        items.forEach(item => {
          const { card, main, side } = getBlocks(item);
          card.classList.remove('is-open');
          gsap.set(
            [item, card, main, side, getLeft(item), ...getReveal(item), ...getCollapse(item)].filter(Boolean),
            { clearProps: 'all' }
          );
        });
      };
    });
  }

});
</script>
