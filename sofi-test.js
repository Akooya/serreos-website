(() => {
  'use strict';

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SEQ_PHASES = [
    {
      title: '06:30 · Ruhiger Morgen vor Arbeitsbeginn',
      code: 'frame // 01 of 04',
      sub: 'Diskrete Frühreinigung vor dem ersten Kundenbesuch – Staubfreiheit und frische Luft direkt zu Arbeitsbeginn.'
    },
    {
      title: '10:00 · Strahlendes Vormittagslicht',
      code: 'frame // 02 of 04',
      sub: 'Kristallklare Fensterfronten und schlierenfreie Empfangsbereiche für Teams, Mandanten und Gäste.'
    },
    {
      title: '14:00 · Glänzender Travertin im Atrium',
      code: 'frame // 03 of 04',
      sub: 'Materialschonende Öko-Pflege bewahrt den natürlichen Glanz hochwertiger Stein- und Glasflächen.'
    },
    {
      title: '19:00 · Serene Abendruhe & Werterhalt',
      code: 'frame // 04 of 04',
      sub: 'Zuverlässige Nachbereitung am Feierabend, damit Ihr Objekt am nächsten Morgen wieder makellos startet.'
    }
  ];

  const header = document.getElementById('sfHeader');
  const telemetryChapter = document.getElementById('sfTelemetryChapter');
  const telemetryPct = document.getElementById('sfTelemetryPct');
  const chapters = Array.from(document.querySelectorAll('section[data-chapter]'));

  const heroSection = document.getElementById('atelier');
  const heroTitle = document.getElementById('sfHeroTitle');
  const heroObject = document.getElementById('sfHeroObject');

  const morphStage = document.getElementById('morphStage');
  const morphSticky = document.getElementById('sfMorphSticky');
  const morphBgDark = document.getElementById('sfMorphBgDark');
  const morphOverlay = document.getElementById('sfMorphOverlay');
  const morphBadge = document.getElementById('sfMorphBadge');
  const morphSteps = Array.from(document.querySelectorAll('.sf-morph-step[data-step]'));
  const hudCanvas = document.getElementById('sfHudCanvas');
  const hudCtx = hudCanvas ? hudCanvas.getContext('2d') : null;

  const spaceSequence = document.getElementById('spaceSequence');
  const seqLayers = Array.from(document.querySelectorAll('.sf-seq-layer[data-layer]'));
  const phaseBtns = Array.from(document.querySelectorAll('.sf-phase-btn[data-phase]'));
  const seqTitle = document.getElementById('sfSeqTitle');
  const seqCode = document.getElementById('sfSeqCode');
  const seqSub = document.getElementById('sfSeqSub');

  const protoBtns = Array.from(document.querySelectorAll('.sf-proto-tab[data-proto-btn]'));
  const protoViews = Array.from(document.querySelectorAll('.sf-screen-view[data-proto]'));
  const revealItems = Array.from(document.querySelectorAll('.sf-reveal'));

  const contactForm = document.getElementById('sfContactForm');
  const submitBtn = document.getElementById('sfSubmitBtn');
  const feedbackBox = document.getElementById('sfFeedback');

  const darkProbeSections = [
    document.getElementById('spaceSequence'),
    document.getElementById('disciplines'),
    document.getElementById('contact')
  ].filter(Boolean);

  let manualSeqPhase = null;
  let lastHudWidth = 0;
  let lastHudHeight = 0;
  let lastHudRatio = -1;
  let lastHudDark = null;

  function computeStickyProgress(sectionEl) {
    if (!sectionEl) return 0;
    const rect = sectionEl.getBoundingClientRect();
    const scrollable = sectionEl.offsetHeight - window.innerHeight;
    if (scrollable <= 1) return rect.top <= window.innerHeight * 0.35 ? 1 : 0;
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function scrollToStickyFraction(sectionEl, fraction) {
    if (!sectionEl) return;
    const rect = sectionEl.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollable = Math.max(0, sectionEl.offsetHeight - window.innerHeight);
    const targetY = sectionTop + clamp(fraction, 0, 1) * scrollable;
    window.scrollTo({
      top: targetY,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  function drawHudCanvas(wipeRatio, isObsidian) {
    if (!hudCanvas || !hudCtx) return;
    const cssWidth = hudCanvas.clientWidth;
    const cssHeight = hudCanvas.clientHeight;
    if (cssWidth < 2 || cssHeight < 2) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(cssWidth * dpr);
    const targetH = Math.round(cssHeight * dpr);

    if (
      lastHudWidth === targetW &&
      lastHudHeight === targetH &&
      Math.abs(lastHudRatio - wipeRatio) < 0.002 &&
      lastHudDark === isObsidian
    ) {
      return;
    }

    if (hudCanvas.width !== targetW || hudCanvas.height !== targetH) {
      hudCanvas.width = targetW;
      hudCanvas.height = targetH;
    }

    lastHudWidth = targetW;
    lastHudHeight = targetH;
    lastHudRatio = wipeRatio;
    lastHudDark = isObsidian;

    hudCtx.save();
    hudCtx.scale(dpr, dpr);
    hudCtx.clearRect(0, 0, cssWidth, cssHeight);

    const cx = cssWidth * 0.5;
    const cy = cssHeight * 0.5;
    const minDim = Math.min(cssWidth, cssHeight);
    const outerRadius = Math.max(24, minDim * 0.43);
    const innerRadius = Math.max(18, minDim * 0.355);

    // Subtle orbital guide circle
    hudCtx.beginPath();
    hudCtx.setLineDash([3, 7]);
    hudCtx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    hudCtx.lineWidth = 1;
    hudCtx.strokeStyle = isObsidian
      ? 'rgba(148, 210, 255, 0.24)'
      : 'rgba(15, 23, 42, 0.14)';
    hudCtx.stroke();
    hudCtx.setLineDash([]);

    // Inner calibration ring ticks (every 45 deg)
    hudCtx.lineWidth = 1;
    hudCtx.strokeStyle = isObsidian
      ? 'rgba(186, 230, 253, 0.28)'
      : 'rgba(15, 23, 42, 0.16)';
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      const r1 = innerRadius - 4;
      const r2 = innerRadius + 3;
      hudCtx.beginPath();
      hudCtx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      hudCtx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      hudCtx.stroke();
    }

    // Active scrub arc + orbital indicator dot
    const startAngle = -Math.PI / 2;
    const activeSweep = clamp(wipeRatio, 0.03, 1) * Math.PI * 2;
    const endAngle = startAngle + activeSweep;

    hudCtx.beginPath();
    hudCtx.arc(cx, cy, outerRadius, startAngle, endAngle);
    hudCtx.lineWidth = 1.75;
    hudCtx.strokeStyle = isObsidian
      ? 'rgba(103, 212, 180, 0.72)'
      : 'rgba(21, 94, 117, 0.55)';
    hudCtx.stroke();

    const dotX = cx + Math.cos(endAngle) * outerRadius;
    const dotY = cy + Math.sin(endAngle) * outerRadius;
    hudCtx.beginPath();
    hudCtx.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
    hudCtx.fillStyle = isObsidian ? '#67d4b4' : '#155e75';
    hudCtx.fill();

    hudCtx.restore();
  }

  function updateMorphStage() {
    if (!morphStage || !morphSticky) return false;
    const p = computeStickyProgress(morphStage);
    const wipeRatio = clamp((p - 0.08) / 0.77, 0, 1);
    const wipeRightPct = (1 - wipeRatio) * 100;
    const darkRatio = clamp((p - 0.12) / 0.68, 0, 1);
    const isObsidian = darkRatio > 0.48;

    if (morphBgDark) {
      morphBgDark.style.opacity = darkRatio.toFixed(3);
    }
    morphSticky.classList.toggle('is-obsidian', isObsidian);

    if (morphOverlay) {
      morphOverlay.style.clipPath = `inset(0 ${wipeRightPct.toFixed(2)}% 0 0)`;
    }

    const activeStepIdx = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
    morphSteps.forEach((stepEl, idx) => {
      const stepNum = Number(stepEl.getAttribute('data-step'));
      const matched = Number.isNaN(stepNum) ? idx === activeStepIdx : stepNum === activeStepIdx;
      stepEl.classList.toggle('is-active', matched);
    });

    if (morphBadge) {
      const pct = Math.round(wipeRatio * 100);
      if (wipeRatio <= 0.04) {
        morphBadge.textContent = 'Light · 0 %';
      } else if (wipeRatio >= 0.96) {
        morphBadge.textContent = 'Obsidian · 100 %';
      } else {
        morphBadge.textContent = `Morph · ${pct} %`;
      }
    }

    drawHudCanvas(wipeRatio, isObsidian);
    return isObsidian;
  }

  function updateSpaceSequence() {
    if (!spaceSequence || seqLayers.length === 0) return;

    const scrollable = spaceSequence.offsetHeight - window.innerHeight;
    const useManual = scrollable <= 1 && manualSeqPhase !== null;
    const p = useManual
      ? manualSeqPhase / Math.max(1, seqLayers.length - 1)
      : computeStickyProgress(spaceSequence);

    const activeIdx = useManual
      ? manualSeqPhase
      : p < 0.24
      ? 0
      : p < 0.56
      ? 1
      : p < 0.86
      ? 2
      : 3;

    if (useManual) {
      seqLayers.forEach((layerEl, idx) => {
        const layerIdx = Number(layerEl.getAttribute('data-layer'));
        const resolvedIdx = Number.isNaN(layerIdx) ? idx : layerIdx;
        const opacity = resolvedIdx <= activeIdx ? 1 : 0;
        layerEl.style.opacity = opacity.toFixed(3);
        layerEl.style.transform = resolvedIdx === activeIdx ? 'scale(1)' : 'scale(1.02)';
      });
    } else {
      const opacities = [
        1,
        clamp((p - 0.14) / 0.2, 0, 1),
        clamp((p - 0.46) / 0.2, 0, 1),
        clamp((p - 0.76) / 0.2, 0, 1)
      ];

      seqLayers.forEach((layerEl, idx) => {
        const layerIdx = Number(layerEl.getAttribute('data-layer'));
        const resolvedIdx = Number.isNaN(layerIdx) ? idx : layerIdx;
        const opacity = opacities[resolvedIdx] ?? 0;
        const scale = prefersReducedMotion ? 1 : 1 + 0.025 * (1 - opacity);
        layerEl.style.opacity = opacity.toFixed(3);
        layerEl.style.transform = `scale(${scale.toFixed(4)})`;
      });
    }

    phaseBtns.forEach((btn, idx) => {
      const phaseIdx = Number(btn.getAttribute('data-phase'));
      const active = (Number.isNaN(phaseIdx) ? idx : phaseIdx) === activeIdx;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const meta = SEQ_PHASES[activeIdx] || SEQ_PHASES[0];
    if (seqTitle && seqTitle.textContent !== meta.title) seqTitle.textContent = meta.title;
    if (seqCode && seqCode.textContent !== meta.code) seqCode.textContent = meta.code;
    if (seqSub && seqSub.textContent !== meta.sub) seqSub.textContent = meta.sub;
  }

  function updateHeroParallax() {
    if (prefersReducedMotion || !heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const hp = clamp(-rect.top / Math.max(1, rect.height), 0, 1);
    if (heroTitle) {
      heroTitle.style.transform = `translate3d(0, ${(hp * 32).toFixed(1)}px, 0)`;
    }
    if (heroObject) {
      heroObject.style.transform = `translate3d(0, ${(hp * -20).toFixed(1)}px, 0) scale(${(
        1 +
        hp * 0.035
      ).toFixed(4)})`;
    }
  }

  function updateTelemetryAndHeader(isMorphObsidian) {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = Math.round(clamp(window.scrollY / maxScroll, 0, 1) * 100);
    if (telemetryPct) {
      telemetryPct.textContent = `${String(pct).padStart(2, '0')}%`;
    }

    if (telemetryChapter && chapters.length > 0) {
      const triggerY = window.innerHeight * 0.45;
      let currentChapter = chapters[0].getAttribute('data-chapter') || '';
      for (const sec of chapters) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= triggerY) {
          currentChapter = sec.getAttribute('data-chapter') || currentChapter;
        }
      }
      if (telemetryChapter.textContent !== currentChapter) {
        telemetryChapter.textContent = currentChapter;
      }
    }

    if (header) {
      const hRect = header.getBoundingClientRect();
      const probeY = hRect.top + hRect.height * 0.5;
      let isDarkUnderHeader = false;

      for (const darkEl of darkProbeSections) {
        const r = darkEl.getBoundingClientRect();
        if (r.top <= probeY && r.bottom >= probeY) {
          isDarkUnderHeader = true;
          break;
        }
      }

      if (!isDarkUnderHeader && morphStage && isMorphObsidian) {
        const mr = morphStage.getBoundingClientRect();
        if (mr.top <= probeY && mr.bottom >= probeY) {
          isDarkUnderHeader = true;
        }
      }

      header.classList.toggle('is-dark', isDarkUnderHeader);
    }
  }

  function renderFrame() {
    const isMorphObsidian = updateMorphStage();
    updateSpaceSequence();
    updateHeroParallax();
    updateTelemetryAndHeader(isMorphObsidian);
  }

  let rafPending = false;
  function requestRender() {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(() => {
      rafPending = false;
      renderFrame();
    });
  }

  // Click handlers: Morph step cards scroll to exact morph progression
  const MORPH_SLICE_TARGETS = [0.04, 0.5, 0.94];
  morphSteps.forEach((stepEl, idx) => {
    stepEl.addEventListener('click', () => {
      const stepIdx = Number(stepEl.getAttribute('data-step'));
      const resolvedIdx = Number.isNaN(stepIdx) ? idx : stepIdx;
      const frac = MORPH_SLICE_TARGETS[resolvedIdx] ?? 0.5;
      scrollToStickyFraction(morphStage, frac);
    });
  });

  // Click handlers: Sequence phase buttons scroll (or switch on short viewports)
  const SEQ_SLICE_TARGETS = [0.05, 0.38, 0.69, 0.96];
  phaseBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const phaseIdx = Number(btn.getAttribute('data-phase'));
      const resolvedIdx = Number.isNaN(phaseIdx) ? idx : phaseIdx;
      manualSeqPhase = resolvedIdx;
      if (spaceSequence && spaceSequence.offsetHeight - window.innerHeight > 1) {
        manualSeqPhase = null;
        scrollToStickyFraction(spaceSequence, SEQ_SLICE_TARGETS[resolvedIdx] ?? 0);
      } else {
        requestRender();
      }
    });
  });

  // Protocol tabs in Chapter 05
  protoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetProto = btn.getAttribute('data-proto-btn');
      protoBtns.forEach((b) => {
        const active = b.getAttribute('data-proto-btn') === targetProto;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      protoViews.forEach((view) => {
        view.classList.toggle('is-active', view.getAttribute('data-proto') === targetProto);
      });
    });
  });

  // Reveal observer
  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // FormSubmit AJAX handler (same endpoint as main site)
  if (contactForm && submitBtn && feedbackBox) {
    const defaultBtnLabel = submitBtn.textContent;
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';
      feedbackBox.classList.remove('is-success', 'is-error');
      feedbackBox.textContent = '';

      const payload = {};
      new FormData(contactForm).forEach((value, key) => {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      });
      if (!payload._subject) {
        payload._subject = 'Neue Objektanfrage (Sofi-Prototyp) · Serreos Website';
      }

      try {
        const response = await fetch(
          'https://formsubmit.co/ajax/serreos.raumpflegeservice@web.de',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === 'false' || data.success === false) {
          throw new Error('Submission rejected');
        }

        feedbackBox.textContent =
          'Vielen Dank! Ihre Objektanfrage wurde übermittelt. Wir melden uns kurzfristig mit einem Terminvorschlag.';
        feedbackBox.classList.add('is-success');
        contactForm.reset();
      } catch (err) {
        feedbackBox.textContent =
          'Direkte Übertragung derzeit nicht möglich. Bitte schreiben Sie uns an serreos.raumpflegeservice@web.de oder rufen Sie uns unter +49 176 47949788 an.';
        feedbackBox.classList.add('is-error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultBtnLabel;
      }
    });
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  window.addEventListener('load', renderFrame, { passive: true });

  renderFrame();
})();
