/**
 * Baryon GSAP Helpers
 * --------------------
 * Lib réutilisable pour les animations Webflow récurrentes.
 * Charger après le CDN GSAP (et ScrollTrigger / SplitText si utilisés).
 *
 * Usage Webflow (footer custom code) :
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/SplitText.min.js"></script>
 *   <script src="https://<CDN>/lib/gsap-helpers.js"></script>
 *   <script>
 *     BaryonGSAP.initFAQ();
 *     BaryonGSAP.initScrollReveal();
 *     BaryonGSAP.initHeroLoad();
 *   </script>
 *
 * Les sélecteurs et options sont configurables pour chaque projet client.
 */

(function (global) {
  "use strict";

  if (typeof gsap === "undefined") {
    console.warn("[BaryonGSAP] gsap n'est pas chargé. Helpers désactivés.");
    return;
  }

  // -----------------------------------------------------------------
  // 1. Accordéon FAQ exclusif
  // -----------------------------------------------------------------
  // Anime la hauteur du panneau via height: "auto" (GSAP mesure puis fige).
  // GSAP gère hauteur + rotation icône. Le visuel (fond, bordure) est porté
  // par une classe `.is-open` en CSS — donc rien à coder en dur côté JS.
  //
  // HTML attendu (adaptable via options) :
  //   .faq_accordion
  //     .faq_question
  //     .faq_answer (caché par défaut, height: 0 ou overflow:hidden)
  //       .faq_icon-wrapper
  //
  // Options :
  //   accordionSelector — sélecteur du conteneur (défaut .faq_accordion)
  //   questionSelector  — élément cliquable (défaut .faq_question)
  //   answerSelector    — panneau qui s'ouvre (défaut .faq_answer)
  //   iconSelector      — icône à rotater (défaut .faq_icon-wrapper)
  //   openClass         — classe ajoutée quand ouvert (défaut is-open)
  //   exclusive         — n'autorise qu'un accordéon ouvert (défaut true)
  //   duration / ease   — réglages d'anim
  //   iconRotation      — angle final de l'icône (défaut 45°)
  function initFAQ(options) {
    var opts = Object.assign(
      {
        accordionSelector: ".faq_accordion",
        questionSelector: ".faq_question",
        answerSelector: ".faq_answer",
        iconSelector: ".faq_icon-wrapper",
        openClass: "is-open",
        exclusive: true,
        duration: 0.4,
        ease: "power2.inOut",
        iconRotation: 45,
      },
      options || {}
    );

    var accordions = gsap.utils.toArray(opts.accordionSelector);
    if (!accordions.length) return [];

    accordions.forEach(function (accordion) {
      var question = accordion.querySelector(opts.questionSelector);
      var answer = accordion.querySelector(opts.answerSelector);
      var icon = accordion.querySelector(opts.iconSelector);

      if (!question || !answer) return;

      // État initial posé par GSAP, pas par le CSS. Évite que le dev ait à
      // configurer height:0 + overflow:hidden côté projet, et neutralise une
      // éventuelle interaction native Webflow / Relume qui aurait laissé
      // l'élément ouvert au load.
      //
      // Pré-requis : l'answer ne doit PAS être en `display: none` (GSAP ne
      // peut pas animer la hauteur d'un élément hors du flow). Si tu as du
      // padding sur l'answer, mets-le sur un enfant interne — sinon le
      // padding restera visible quand le panneau est "fermé".
      var isOpenByDefault = accordion.classList.contains(opts.openClass);
      gsap.set(answer, {
        overflow: "hidden",
        height: isOpenByDefault ? "auto" : 0,
      });

      var tl = gsap.timeline({
        paused: true,
        reversed: true,
        onReverseComplete: function () {
          accordion.classList.remove(opts.openClass);
        },
      });

      tl.to(answer, { height: "auto", duration: opts.duration, ease: opts.ease }, 0);
      if (icon) {
        // transformOrigin "50% 50%" force la rotation autour du centre visuel
        // de l'élément. Sans ça, le wrapper tourne autour de son coin haut-gauche
        // par défaut, ce qui donne une impression d'arc de cercle au lieu d'une
        // rotation sur place. Pré-requis CSS côté projet : le wrapper doit être
        // en display block/inline-block et carré (width = height) pour un rendu
        // parfaitement propre.
        tl.to(
          icon,
          {
            rotation: opts.iconRotation,
            transformOrigin: "50% 50%",
            duration: opts.duration,
            ease: opts.ease,
          },
          0
        );
      }

      // Si l'accordéon est marqué .is-open au load, on avance la timeline
      // à 100% pour caler l'état (icône tournée, hauteur auto stable) et
      // on bascule reversed:false pour que le prochain clic ferme bien.
      if (isOpenByDefault) {
        tl.progress(1).pause();
        tl.reversed(false);
      }

      accordion._baryonTl = tl;

      question.addEventListener("click", function () {
        if (tl.reversed()) {
          if (opts.exclusive) {
            accordions.forEach(function (other) {
              if (other !== accordion && other._baryonTl && !other._baryonTl.reversed()) {
                other._baryonTl.reverse();
              }
            });
          }
          accordion.classList.add(opts.openClass);
          tl.play();
        } else {
          tl.reverse();
        }
      });
    });

    // Recalcul après chargement des polices/images : si un accordéon ouvert
    // par défaut voit son contenu changer de hauteur, on re-synchronise.
    window.addEventListener("load", function () {
      accordions.forEach(function (accordion) {
        if (accordion.classList.contains(opts.openClass)) {
          var answer = accordion.querySelector(opts.answerSelector);
          if (answer) gsap.set(answer, { height: "auto" });
        }
      });
    });

    return accordions.map(function (a) {
      return a._baryonTl;
    });
  }

  // -----------------------------------------------------------------
  // 2. Révélation au scroll avec stagger
  // -----------------------------------------------------------------
  // Anime y + opacity (composités GPU). once:true = ne rejoue pas
  // en remontant. Nécessite ScrollTrigger.
  //
  // Options :
  //   targetSelector  — éléments à animer (ex. .feature_card)
  //   triggerSelector — élément qui déclenche le scroll (ex. .feature_list)
  //                     si null, chaque élément se déclenche sur lui-même
  //   y, opacity      — état de départ
  //   duration, ease, stagger
  //   start           — position ScrollTrigger (défaut "top 80%")
  //   once            — défaut true
  function initScrollReveal(options) {
    var opts = Object.assign(
      {
        targetSelector: ".reveal",
        triggerSelector: null,
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
        start: "top 80%",
        once: true,
      },
      options || {}
    );

    if (typeof ScrollTrigger === "undefined") {
      console.warn("[BaryonGSAP] ScrollTrigger requis pour initScrollReveal.");
      return null;
    }
    gsap.registerPlugin(ScrollTrigger);

    var targets = gsap.utils.toArray(opts.targetSelector);
    if (!targets.length) return null;

    var tween;

    if (opts.triggerSelector) {
      // Un seul trigger global : tout le batch part en cascade
      tween = gsap.from(targets, {
        y: opts.y,
        opacity: opts.opacity,
        duration: opts.duration,
        ease: opts.ease,
        stagger: opts.stagger,
        scrollTrigger: {
          trigger: opts.triggerSelector,
          start: opts.start,
          once: opts.once,
        },
      });
    } else {
      // Chaque élément se déclenche individuellement quand il entre en vue
      tween = targets.map(function (el, i) {
        return gsap.from(el, {
          y: opts.y,
          opacity: opts.opacity,
          duration: opts.duration,
          ease: opts.ease,
          delay: i * opts.stagger,
          scrollTrigger: {
            trigger: el,
            start: opts.start,
            once: opts.once,
          },
        });
      });
    }

    // Recalcule après chargement polices/images
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });

    return tween;
  }

  // -----------------------------------------------------------------
  // 3. Hero animé au chargement
  // -----------------------------------------------------------------
  // Timeline jouée une fois au load. Combine SplitText (mots) sur le
  // heading et une entrée latérale sur le visuel.
  //
  // Options :
  //   headingSelector  — titre à splitter (défaut .hero_heading)
  //   visualSelector   — élément secondaire (image, illustration) — facultatif
  //   subtitleSelector — sous-titre / paragraphe — facultatif
  //   ctaSelector      — boutons / CTA — facultatif
  //   splitType        — "words" | "lines" | "chars" (défaut words)
  //   revertSplit      — restaure le DOM après l'anim (défaut true)
  function initHeroLoad(options) {
    var opts = Object.assign(
      {
        headingSelector: ".hero_heading",
        visualSelector: ".hero_visual",
        subtitleSelector: ".hero_subtitle",
        ctaSelector: ".hero_cta",
        splitType: "words",
        revertSplit: true,
        defaults: { ease: "power3.out", duration: 0.7 },
      },
      options || {}
    );

    var heading = document.querySelector(opts.headingSelector);
    var tl = gsap.timeline({ defaults: opts.defaults });

    // 1. Titre — SplitText si dispo, sinon fade simple sur l'élément entier
    var split = null;
    if (heading) {
      if (typeof SplitText !== "undefined") {
        gsap.registerPlugin(SplitText);
        split = new SplitText(heading, {
          type: opts.splitType,
          wordsClass: "hero_word",
          linesClass: "hero_line",
          charsClass: "hero_char",
        });
        var pieces = split[opts.splitType] || split.words;
        tl.from(pieces, { y: 30, opacity: 0, stagger: 0.06 });
      } else {
        tl.from(heading, { y: 30, opacity: 0 });
      }
    }

    // 2. Subtitle (en parallèle avec un léger décalage)
    if (document.querySelector(opts.subtitleSelector)) {
      tl.from(opts.subtitleSelector, { y: 20, opacity: 0 }, "<0.15");
    }

    // 3. CTA
    if (document.querySelector(opts.ctaSelector)) {
      tl.from(opts.ctaSelector, { y: 20, opacity: 0 }, "<0.1");
    }

    // 4. Visuel — entre depuis la droite
    if (document.querySelector(opts.visualSelector)) {
      tl.from(opts.visualSelector, { x: 80, opacity: 0, duration: 0.9 }, "<0.2");
    }

    // Nettoyage SplitText pour ne pas casser la sélection / l'accessibilité
    if (split && opts.revertSplit) {
      tl.eventCallback("onComplete", function () {
        split.revert();
      });
    }

    return tl;
  }

  // -----------------------------------------------------------------
  // Export global
  // -----------------------------------------------------------------
  global.BaryonGSAP = {
    initFAQ: initFAQ,
    initScrollReveal: initScrollReveal,
    initHeroLoad: initHeroLoad,
    version: "0.1.0",
  };
})(window);
