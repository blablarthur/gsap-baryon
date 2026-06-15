<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
<script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>

<script>
  //SCRIPT POUR VIDEO PLAYER
document.addEventListener('DOMContentLoaded', () => {

  const root     = document.querySelector('[data-lightbox="root"]');
  if (!root) return;

  const overlay  = root.querySelector('[data-lightbox="overlay"]');
  const closeBtn = root.querySelector('[data-lightbox="close"]');
  const mount    = root.querySelector('[data-lightbox="player"]');

  let player = null;
  let isOpen = false;

  // --- Parsing YouTube : accepte un ID nu ou n'importe quel format d'URL ---
  function parseYouTubeId(input) {
    const str = input.trim();

    // Déjà un ID nu (11 caractères [A-Za-z0-9_-])
    if (/^[\w-]{11}$/.test(str)) return str;

    // watch?v=, youtu.be/, /shorts/, /embed/, /live/
    const match = str.match(
      /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? match[1] : null;
  }

  // --- Nettoyage synchrone : détruit le player et vide le mount, immédiatement ---
  function destroyPlayer() {
    if (player) {
      try { player.destroy(); } catch (e) { /* embed pas prêt, on ignore */ }
      player = null;
    }
    mount.innerHTML = '';
  }

  function openLightbox(videoId) {
    // Tue tout fade en cours (et son onComplete) pour éviter
    // qu'une fermeture en vol ne sabote cette ouverture
    gsap.killTweensOf(root);
    destroyPlayer();

    isOpen = true;

    // L'iframe YouTube n'est créée qu'ici → zéro coût au chargement de page
    mount.innerHTML = `<div data-plyr-provider="youtube" data-plyr-embed-id="${videoId}"></div>`;
    player = new Plyr(mount.firstElementChild, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      youtube: { noCookie: true, rel: 0, modestbranding: 1 },
      autoplay: true
    });

    gsap.set(root, { display: 'flex' });
    gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
    document.body.style.overflow = 'hidden';
    root.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!isOpen) return;
    isOpen = false;

    // Destruction immédiate (synchrone) : coupe le son tout de suite,
    // et surtout ne laisse aucun travail différé dans le onComplete
    destroyPlayer();
    gsap.killTweensOf(root);

    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.25,
      ease: 'power1.in',
      onComplete: () => gsap.set(root, { display: 'none' })
    });
    document.body.style.overflow = '';
    root.setAttribute('aria-hidden', 'true');
  }

  // --- Délégation : capte les clics sur tous les boutons "Regarder" ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.player-button[data-video-id]');
    if (!btn) return;
    e.preventDefault();

    const videoId = parseYouTubeId(btn.dataset.videoId);
    if (!videoId) {
      console.warn('URL YouTube invalide :', btn.dataset.videoId);
      return;
    }
    openLightbox(videoId);
  });

  overlay.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

});
</script>
