(() => {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navShell = document.getElementById('hrNavShell');
  const openingStage = document.getElementById('trOpeningStage');
  const slides = Array.from(document.querySelectorAll('.tr-opening-slide'));

  let activeSlide = 0;
  if (slides.length > 1 && !prefersReducedMotion) {
    window.setInterval(() => {
      activeSlide = (activeSlide + 1) % slides.length;
      slides.forEach((img, idx) => img.classList.toggle('is-active', idx === activeSlide));
    }, 6200);
  }

  function updateOpeningTransition() {
    if (!openingStage) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const stageHeight = Math.max(320, openingStage.offsetHeight);
    const p = prefersReducedMotion ? 0 : clamp(y / (stageHeight * 0.62), 0, 1);

    openingStage.style.setProperty('--tr-hero-p', p.toFixed(3));

    if (navShell) {
      const navLogoOpacity = prefersReducedMotion ? 1 : clamp((p - 0.35) / 0.5, 0, 1);
      navShell.style.setProperty('--tr-nav-logo', navLogoOpacity.toFixed(3));
    }
  }

  let rafPending = false;
  const requestUpdate = () => {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(() => {
      rafPending = false;
      updateOpeningTransition();
    });
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { passive: true });

  updateOpeningTransition();
})();
