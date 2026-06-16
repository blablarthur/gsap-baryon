  // SCRIPT GSAP POUR FAQ
document.addEventListener("DOMContentLoaded", () => {
  const accordions = gsap.utils.toArray(".faq4_accordion");
  // Fonctions utilitaires pour ouvrir / fermer un item
  const open = (accordion) => {
    gsap.to(accordion.querySelector(".faq4_answer"), { height: "auto", duration: 0.4, ease: "power2.inOut" });
    gsap.to(accordion.querySelector(".faq4_icon-wrappper"), { rotation: 90, duration: 0.3, ease: "power2.out" });
    accordion.classList.add("is-open");   // ← ajout de la classe
    accordion._isOpen = true;
  };
  const close = (accordion) => {
    gsap.to(accordion.querySelector(".faq4_answer"), { height: 0, duration: 0.4, ease: "power2.inOut" });
    gsap.to(accordion.querySelector(".faq4_icon-wrappper"), { rotation: 0, duration: 0.3, ease: "power2.out" });
    accordion.classList.remove("is-open");   // ← retrait de la classe
    accordion._isOpen = false;
  };
  accordions.forEach((accordion, index) => {
    const question = accordion.querySelector(".faq4_question");
    // Premier item ouvert par défaut (état immédiat, sans animation)
    if (index === 0) {
      gsap.set(accordion.querySelector(".faq4_answer"), { height: "auto" });
      gsap.set(accordion.querySelector(".faq4_icon-wrappper"), { rotation: 90 });
      accordion.classList.add("is-open");   // ← cohérence avec l'état ouvert
      accordion._isOpen = true;
    } else {
      accordion._isOpen = false;
    }
    question.addEventListener("click", () => {
      if (accordion._isOpen) {
        // L'item cliqué est ouvert → on le ferme
        close(accordion);
      } else {
        // On ferme tous les autres, puis on ouvre celui-ci
        accordions.forEach((other) => {
          if (other !== accordion && other._isOpen) {
            close(other);
          }
        });
        open(accordion);
      }
    });
  });
});
