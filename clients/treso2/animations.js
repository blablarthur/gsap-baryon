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
  // FAQ4 — accordéon exclusif
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

  // FAQ3 — variante utilisée sur d'autres pages (même comportement,
  // classes différentes côté Webflow). Avant de publier, supprimer
  // l'interaction Webflow native attachée à .faq3_question — elle
  // applique un rotateZ(180deg) inline qui se bat avec GSAP.
  //
  // Le CSS associé (héritage de bordure animée vers
  // var(--_primitives---colors--primary--600) à l'ouverture) est posé
  // dans le head custom code de la page Webflow, pas dans ce fichier,
  // pour rester piloté par les variables du design system.
  BaryonGSAP.initFAQ({
    accordionSelector: ".faq3_accordion",
    questionSelector: ".faq3_question",
    answerSelector: ".faq3_answer",
    iconSelector: ".faq3_icon-wrapper",
    exclusive: true,
    duration: 0.4,
    ease: "power2.inOut",
    iconRotation: 45,
  });
});
