// ==========================================================================
// Serreos × Vollbild-Einstieg: Kantenloses Dämmerung→Tageslicht-Morphing
// + Logo-Übergang in die schwebende Navigation (transition-test.js)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('home');
  const stage = document.getElementById('trOpeningStage');
  const header = document.querySelector('.hr-header');
  const scrollHint = document.querySelector('.tr-scroll-hint');
  const heroHeading = document.querySelector('#heroStatement h1');

  if (!track || !stage) return;

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  /** Kubisches Smoothstep-Easing zwischen [edge0, edge1]. */
  const smoothstep = (edge0, edge1, x) => {
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };

  let ticking = false;

  const applyVars = (p) => {
    const dayOp = smoothstep(0.06, 0.54, p);
    const logoOp = 1 - smoothstep(0.06, 0.44, p);
    const logoShift = smoothstep(0.02, 0.48, p);
    const navShow = smoothstep(0.24, 0.62, p);
    const veilOp = smoothstep(0.52, 0.92, p);
    const solidOp = smoothstep(0.76, 0.99, p);
    const cueOp = 1 - smoothstep(0.01, 0.14, p);

    stage.style.setProperty('--tr-hero-p', p.toFixed(4));
    stage.style.setProperty('--tr-day-op', dayOp.toFixed(4));
    stage.style.setProperty('--tr-logo-op', logoOp.toFixed(4));
    stage.style.setProperty('--tr-logo-shift', logoShift.toFixed(4));
    stage.style.setProperty('--tr-veil-op', veilOp.toFixed(4));
    stage.style.setProperty('--tr-solid-op', solidOp.toFixed(4));
    stage.style.setProperty('--tr-cue-op', cueOp.toFixed(4));

    if (header) {
      const navOpen = document.body.classList.contains('nav-open');
      const finalNav = navOpen ? 1 : navShow;
      header.style.setProperty('--tr-nav-show', finalNav.toFixed(4));
      header.classList.toggle('is-nav-visible', finalNav > 0.22);
    }
  };

  const updateOpeningTransition = () => {
    ticking = false;
    if (prefersReducedMotion) {
      stage.style.setProperty('--tr-hero-p', '0');
      stage.style.setProperty('--tr-day-op', '0');
      stage.style.setProperty('--tr-logo-op', '1');
      stage.style.setProperty('--tr-logo-shift', '0');
      stage.style.setProperty('--tr-veil-op', '0');
      stage.style.setProperty('--tr-solid-op', '0');
      stage.style.setProperty('--tr-cue-op', '1');
      if (header) {
        header.style.setProperty('--tr-nav-show', '1');
        header.classList.add('is-nav-visible');
      }
      return;
    }

    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, track.offsetHeight - window.innerHeight);
    const p = clamp01(-rect.top / travel);
    applyVars(p);
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateOpeningTransition);
    }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', updateOpeningTransition);

  if (scrollHint && heroHeading) {
    scrollHint.addEventListener('click', (event) => {
      event.preventDefault();
      const targetTop = heroHeading.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  updateOpeningTransition();
});
