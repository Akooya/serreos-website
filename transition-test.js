(() => {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const wipeStage = document.getElementById('trWipeStage');
  const badgeBefore = document.querySelector('.tr-badge-before');
  const badgeAfter = document.querySelector('.tr-badge-after');
  const reattachBtn = document.getElementById('trReattachBtn');

  let scrollSyncActive = !prefersReducedMotion;
  let currentSplit = 0.5;
  let isDragging = false;

  function applySplit(ratio, smooth) {
    const safeRatio = clamp(ratio, 0.04, 0.96);
    currentSplit = safeRatio;
    if (!wipeStage) return;

    wipeStage.classList.toggle('is-smooth', Boolean(smooth) && !prefersReducedMotion);
    wipeStage.style.setProperty('--tr-split', `${(safeRatio * 100).toFixed(2)}%`);
    wipeStage.setAttribute('aria-valuenow', String(Math.round(safeRatio * 100)));

    // Gently fade corner badge when wipe line reaches its edge
    if (badgeBefore) {
      badgeBefore.style.opacity = safeRatio < 0.16 ? '0.25' : '1';
    }
    if (badgeAfter) {
      badgeAfter.style.opacity = safeRatio > 0.84 ? '0.25' : '1';
    }
  }

  function showReattachPill(visible) {
    if (reattachBtn) {
      reattachBtn.classList.toggle('is-visible', visible && !prefersReducedMotion);
    }
  }

  function updateScrollDrivenWipe() {
    if (!wipeStage || !scrollSyncActive || isDragging) return;
    const rect = wipeStage.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);
    const stageCenter = rect.top + rect.height * 0.5;
    const p = clamp((vh * 0.9 - stageCenter) / (vh * 0.76), 0, 1);
    const split = 0.84 - p * 0.68;
    applySplit(split, false);
  }

  function setSplitFromClientX(clientX) {
    if (!wipeStage) return;
    const rect = wipeStage.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    applySplit(ratio, false);
  }

  if (wipeStage) {
    wipeStage.addEventListener('pointerdown', (e) => {
      if (e.target === reattachBtn || (e.button !== undefined && e.button !== 0)) return;
      isDragging = true;
      scrollSyncActive = false;
      showReattachPill(true);
      wipeStage.classList.add('is-dragging');
      setSplitFromClientX(e.clientX);
      if (wipeStage.setPointerCapture && e.pointerId !== undefined) {
        try {
          wipeStage.setPointerCapture(e.pointerId);
        } catch (err) {
          // Optional capture
        }
      }
    });

    wipeStage.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      setSplitFromClientX(e.clientX);
    });

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      wipeStage.classList.remove('is-dragging');
    };

    wipeStage.addEventListener('pointerup', stopDrag);
    wipeStage.addEventListener('pointercancel', stopDrag);

    wipeStage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollSyncActive = false;
        showReattachPill(true);
        applySplit(currentSplit - 0.08, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollSyncActive = false;
        showReattachPill(true);
        applySplit(currentSplit + 0.08, true);
      }
    });
  }

  if (reattachBtn) {
    reattachBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollSyncActive = true;
      showReattachPill(false);
      if (wipeStage) wipeStage.classList.add('is-smooth');
      updateScrollDrivenWipe();
    });
  }

  let rafPending = false;
  const requestUpdate = () => {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(() => {
      rafPending = false;
      updateScrollDrivenWipe();
    });
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { passive: true });

  updateScrollDrivenWipe();
})();
