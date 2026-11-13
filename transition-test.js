(() => {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const wipeCard = document.getElementById('trWipeCard');
  const wipeStage = document.getElementById('trWipeStage');
  const wipeKnob = document.getElementById('trWipeKnob');
  const wipeBtns = Array.from(document.querySelectorAll('.tr-wipe-btn'));
  const wipeStatus = document.getElementById('trWipeStatus');

  const processSec = document.getElementById('process');
  const contactSec = document.getElementById('contact');

  let scrollSyncActive = !prefersReducedMotion;
  let currentSplit = 0.5;
  let isDragging = false;

  function applySplit(ratio, smooth) {
    const safeRatio = clamp(ratio, 0.04, 0.96);
    currentSplit = safeRatio;
    if (wipeCard) {
      wipeCard.classList.toggle('is-smooth', Boolean(smooth) && !prefersReducedMotion);
    }
    if (wipeStage) {
      wipeStage.style.setProperty('--tr-split', `${(safeRatio * 100).toFixed(2)}%`);
      wipeStage.setAttribute('aria-valuenow', String(Math.round(safeRatio * 100)));
    }
    if (wipeStatus) {
      const cleanPct = Math.round((1 - safeRatio) * 100);
      wipeStatus.textContent = scrollSyncActive
        ? `Beim Scrollen · ${cleanPct} % streifenfrei aufgedeckt`
        : `Manuell · ${cleanPct} % streifenfrei aufgedeckt`;
    }
  }

  function updatePresetButtons(activeBtn) {
    wipeBtns.forEach((btn) => {
      const matched = btn === activeBtn;
      btn.classList.toggle('is-active', matched);
      btn.setAttribute('aria-pressed', matched ? 'true' : 'false');
    });
  }

  function updateScrollDrivenWipe() {
    if (!wipeStage || !scrollSyncActive || isDragging) return;
    const rect = wipeStage.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);
    const stageCenter = rect.top + rect.height * 0.5;
    // Sweep smoothly as the card moves from lower viewport (0.90*vh) to upper viewport (0.14*vh)
    const p = clamp((vh * 0.9 - stageCenter) / (vh * 0.76), 0, 1);
    const split = 0.84 - p * 0.68;
    applySplit(split, false);
  }

  function updateDuskBridge() {
    if (!processSec || !contactSec) return;
    const contactRect = contactSec.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);

    // Dusk wash rises seamlessly on #process as #contact approaches viewport
    const washProgress = clamp((vh * 1.15 - contactRect.top) / (vh * 0.72), 0, 1);
    processSec.style.setProperty('--tr-dusk', washProgress.toFixed(3));
    processSec.classList.toggle('is-dusk-cue', washProgress > 0.42);

    // Fade serene dusk glass lobby gently behind the contact section
    const contactReveal = clamp((vh - contactRect.top) / (vh * 0.65), 0, 1);
    contactSec.style.setProperty('--tr-contact-dusk', contactReveal.toFixed(3));
  }

  function setSplitFromClientX(clientX) {
    if (!wipeStage) return;
    const rect = wipeStage.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    applySplit(ratio, false);
  }

  if (wipeStage) {
    const startDrag = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      isDragging = true;
      scrollSyncActive = false;
      wipeStage.classList.add('is-dragging');
      updatePresetButtons(null);
      setSplitFromClientX(e.clientX);
      if (wipeStage.setPointerCapture && e.pointerId !== undefined) {
        try {
          wipeStage.setPointerCapture(e.pointerId);
        } catch (err) {
          // Pointer capture optional
        }
      }
    };

    const moveDrag = (e) => {
      if (!isDragging) return;
      setSplitFromClientX(e.clientX);
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      wipeStage.classList.remove('is-dragging');
    };

    wipeStage.addEventListener('pointerdown', startDrag);
    wipeStage.addEventListener('pointermove', moveDrag);
    wipeStage.addEventListener('pointerup', stopDrag);
    wipeStage.addEventListener('pointercancel', stopDrag);

    wipeStage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollSyncActive = false;
        updatePresetButtons(null);
        applySplit(currentSplit - 0.08, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollSyncActive = false;
        updatePresetButtons(null);
        applySplit(currentSplit + 0.08, true);
      }
    });
  }

  wipeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      const targetSplit = Number(btn.getAttribute('data-split'));
      if (mode === 'scroll') {
        scrollSyncActive = true;
        updatePresetButtons(btn);
        if (wipeCard) wipeCard.classList.add('is-smooth');
        updateScrollDrivenWipe();
      } else if (!Number.isNaN(targetSplit)) {
        scrollSyncActive = false;
        updatePresetButtons(btn);
        applySplit(targetSplit, true);
      }
    });
  });

  let rafPending = false;
  const onFrame = () => {
    rafPending = false;
    updateScrollDrivenWipe();
    updateDuskBridge();
  };

  const requestUpdate = () => {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(onFrame);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { passive: true });

  onFrame();
})();
