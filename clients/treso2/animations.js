/**
 * Treso2 — animations custom Webflow
 *
 * Dépendances chargées avant ce fichier dans le footer Webflow :
 *   - gsap (core)
 *   - lib/gsap-helpers.js
 *
 * À ajouter ici au fur et à mesure : scroll reveal, hero load, etc.
 */

document.addEventListener("DOMContentLoaded", function () {
  // FAQ accordéon exclusif
  // Le CSS associé (.faq4_accordion, .faq4_accordion.is-open, etc.) est
  // dans le head custom code de la page Webflow, car il utilise les
  // variables de design system du projet.
  BaryonGSAP.initFAQ({
    accordionSelector: ".faq4_accordion",
    questionSelector: ".faq4_question",
    answerSelector: ".faq4_answer",
    iconSelector: ".faq4_icon-wrappper", // typo "wrappper" du DOM Webflow — à fixer côté Webflow
    exclusive: true,
    duration: 0.4,
    ease: "power2.inOut",
    iconRotation: 45, // "+" devient "×"
  });
});
