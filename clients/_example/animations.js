/**
 * Exemple d'usage côté client.
 *
 * 1. Copier ce dossier en `clients/nom-du-client/`
 * 2. Ajuster les sélecteurs et options selon le projet Webflow
 * 3. Dans Webflow → Page Settings → Custom Code Footer, coller :
 *
 *    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
 *    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
 *    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/SplitText.min.js"></script>
 *    <script src="https://<URL_CDN>/lib/gsap-helpers.js"></script>
 *    <script src="https://<URL_CDN>/clients/nom-du-client/animations.js"></script>
 */

document.addEventListener("DOMContentLoaded", function () {
  // --- Hero au load ---------------------------------------------------
  BaryonGSAP.initHeroLoad({
    headingSelector: ".hero_heading",
    visualSelector: ".hero_visual",
    subtitleSelector: ".hero_subtitle",
    ctaSelector: ".hero_cta",
    splitType: "words",
  });

  // --- Cartes qui apparaissent au scroll ------------------------------
  BaryonGSAP.initScrollReveal({
    targetSelector: ".feature_card",
    triggerSelector: ".feature_list",
    stagger: 0.12,
    start: "top 80%",
  });

  // --- Accordéon FAQ --------------------------------------------------
  BaryonGSAP.initFAQ({
    accordionSelector: ".faq_accordion",
    questionSelector: ".faq_question",
    answerSelector: ".faq_answer",
    iconSelector: ".faq_icon-wrapper",
    exclusive: true,
  });
});
