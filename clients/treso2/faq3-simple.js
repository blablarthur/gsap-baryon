<!--
  ====== WEBFLOW : à faire dans le Designer ======
  1. Sur chaque IMAGE (ou son wrapper) de ta zone visuelle, ajoute l'attribut :
        data-accordion-visual
     dans le MÊME ORDRE que les questions (1re image = 1re question, etc.).
  2. Les images sont empilées au même endroit (position: absolute dans un
     wrapper en position: relative) — voir le CSS ci-dessous.
-->

<!-- ====== HEAD custom code ====== -->
<style>
  /* Bordure colorée sur l'item ouvert */
  .faq3_accordion { transition: border-color 0.35s ease; }
  .faq3_accordion.is-active {
    border-color: var(--_primitives---colors--primary--600, #FF7424);
  }

  /* Images empilées : toutes au même endroit, on gère la visibilité en JS */
  [data-accordion-visual] {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;        /* à retirer si ce ne sont pas des <img> plein cadre */
  }
  /* Le parent direct des images doit être en position: relative
     (à mettre sur ton wrapper visuel dans Webflow, ou décommente : ) */
  /* .faq3_visual-wrapper { position: relative; } */
</style>

<!-- ====== AVANT </body> (après le CDN GSAP) ====== -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') return;

  const items   = gsap.utils.toArray('[data-accordion-item]');
  const visuals = gsap.utils.toArray('[data-accordion-visual]'); // images, même ordre

  // Affiche l'image correspondant à l'index (crossfade), masque les autres
  function showVisual(index) {
    visuals.forEach((vis, i) => {
      gsap.to(vis, { opacity: i === index ? 1 : 0, duration: 0.5, ease: 'power2.out' });
    });
  }

  // Ouvre l'item "index" et ferme les autres (accordéon exclusif)
  function open(index) {
    items.forEach((item, i) => {
      const body = item.querySelector('[data-accordion-body]');
      const icon = item.querySelector('[data-accordion-icon]');
      const isActive = i === index;
      item.classList.toggle('is-active', isActive);
      gsap.to(body, { height: isActive ? 'auto' : 0, duration: 0.4, ease: 'power2.inOut' });
      gsap.to(icon, { rotation: isActive ? 45 : 0, duration: 0.35, ease: 'power2.out' });
    });
    showVisual(index);
  }

  // Setup : tout fermé, hauteurs à 0, puis on ouvre l'item .is-active (ou le 1er)
  items.forEach((item) => {
    const body = item.querySelector('[data-accordion-body]');
    const icon = item.querySelector('[data-accordion-icon]');
    gsap.set(body, { height: 0, overflow: 'hidden' });
    gsap.set(icon, { rotation: 0, transformOrigin: '50% 50%' });
  });

  let startIndex = items.findIndex((it) => it.classList.contains('is-active'));
  if (startIndex < 0) startIndex = 0;

  // Clic : ouvre l'item cliqué
  items.forEach((item, i) => {
    const header = item.querySelector('[data-accordion-header]');
    if (header) header.addEventListener('click', () => open(i));
  });

  open(startIndex);

  // Recalcule la hauteur de l'item ouvert une fois images/polices chargées
  window.addEventListener('load', () => {
    const openBody = document.querySelector('.faq3_accordion.is-active [data-accordion-body]');
    if (openBody) gsap.set(openBody, { height: 'auto' });
  });
});
</script>
