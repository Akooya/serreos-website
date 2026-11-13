// ==========================================================================
// Serreos Raumpflegeservice – Alternativ-Design (HopeRise-Konzept)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer =
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ------------------------------------------------------------------------
  // 1. Scroll-Fortschrittsleiste, Sticky Navbar & Subtiler Bild-Parallax
  // ------------------------------------------------------------------------
  const navShell = document.getElementById('hrNavShell');
  const scrollProgress = document.getElementById('hrScrollProgress');
  const mobileQuickBar = document.getElementById('mobileQuickBar');
  const processSection = document.getElementById('process');
  const contactBackdropImg = document.querySelector('#contactBackdrop img');
  const contactSection = document.getElementById('contact');

  const clamp01 = (val) => Math.min(1, Math.max(0, val));

  let scrollTicking = false;
  const updateScrollEffects = () => {
    const y = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    if (scrollProgress) {
      scrollProgress.style.width = `${Math.min(100, (y / maxScroll) * 100)}%`;
    }
    if (navShell) {
      navShell.classList.toggle('is-scrolled', y > 24);
    }
    if (mobileQuickBar) {
      mobileQuickBar.classList.toggle('is-visible', y > 360);
    }

    if (processSection && contactSection) {
      const vh = Math.max(1, window.innerHeight);
      const cRect = contactSection.getBoundingClientRect();
      if (prefersReducedMotion) {
        processSection.style.setProperty('--sr-dusk', '1');
        processSection.classList.add('is-dusk-cue');
        contactSection.style.setProperty('--sr-contact-dusk', '1');
      } else {
        const washProgress = clamp01((vh * 1.15 - cRect.top) / (vh * 0.72));
        processSection.style.setProperty('--sr-dusk', washProgress.toFixed(3));
        processSection.classList.toggle('is-dusk-cue', washProgress > 0.42);
        const contactReveal = clamp01((vh - cRect.top) / (vh * 0.65));
        contactSection.style.setProperty('--sr-contact-dusk', contactReveal.toFixed(3));
      }
    }

    if (!prefersReducedMotion && contactBackdropImg && contactSection) {
      const rect = contactSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const offset = (progress - 0.5) * 34;
        contactBackdropImg.style.transform = `scale(1.09) translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    }
    scrollTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollEffects);
        scrollTicking = true;
      }
    },
    { passive: true }
  );
  updateScrollEffects();

  // ------------------------------------------------------------------------
  // 2. Mobile Navigation Drawer + Backdrop
  // ------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  const closeMobileMenu = () => {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('active');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    navBackdrop?.classList.remove('active');
    document.body.classList.remove('nav-open');
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('active');
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      navBackdrop?.classList.toggle('active', open);
      document.body.classList.toggle('nav-open', open);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    navBackdrop?.addEventListener('click', closeMobileMenu);

    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('active')) return;
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMobileMenu();
      }
    });
  }

  // ------------------------------------------------------------------------
  // 3. Scroll Reveal Observer
  // ------------------------------------------------------------------------
  const revealItems = document.querySelectorAll('.hr-reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -15px 0px' }
    );
    revealItems.forEach((el) => revealObs.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // ------------------------------------------------------------------------
  // 4. Hero Kapsel-Foto-Wechsel (Sanfter Crossfade + Klick-Impuls)
  // ------------------------------------------------------------------------
  const capsuleWrap = document.getElementById('hrHeroCapsule');
  if (capsuleWrap) {
    const capsuleImgs = Array.from(capsuleWrap.querySelectorAll('img'));
    let capsuleIndex = 0;

    const showCapsule = (idx) => {
      capsuleIndex = (idx + capsuleImgs.length) % capsuleImgs.length;
      capsuleImgs.forEach((img, i) => img.classList.toggle('is-active', i === capsuleIndex));
    };

    capsuleWrap.addEventListener('click', () => showCapsule(capsuleIndex + 1));

    if (!prefersReducedMotion && capsuleImgs.length > 1) {
      setInterval(() => showCapsule(capsuleIndex + 1), 3800);
    }
  }

  // ------------------------------------------------------------------------
  // 5. Großer Hero Panorama-Slider (Tabs + sanfter Auto-Wechsel)
  // ------------------------------------------------------------------------
  const panoWrap = document.getElementById('hrPanorama');
  if (panoWrap) {
    const slides = Array.from(panoWrap.querySelectorAll('.hr-panorama-slide'));
    const tabs = Array.from(panoWrap.querySelectorAll('.hr-pano-tab'));
    const captionTitle = document.getElementById('hrPanoTitle');
    const captionSub = document.getElementById('hrPanoSub');
    let panoIndex = 0;
    let panoPaused = false;

    const activatePano = (idx) => {
      panoIndex = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === panoIndex));
      tabs.forEach((tab, i) => {
        const active = i === panoIndex;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      const currentSlide = slides[panoIndex];
      if (currentSlide && captionTitle && captionSub) {
        captionTitle.textContent = currentSlide.dataset.title || '';
        captionSub.textContent = currentSlide.dataset.sub || '';
      }
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activatePano(i));
    });

    panoWrap.addEventListener('mouseenter', () => {
      panoPaused = true;
    });
    panoWrap.addEventListener('mouseleave', () => {
      panoPaused = false;
    });

    if (!prefersReducedMotion && slides.length > 1) {
      setInterval(() => {
        if (!panoPaused) activatePano(panoIndex + 1);
      }, 4800);
    }
  }

  // ------------------------------------------------------------------------
  // 6. Subtiler 3D-Tilt-Hover auf Desktop-Leistungskarten (HopeRise Feel)
  // ------------------------------------------------------------------------
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.hr-service-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = (-y * 4).toFixed(2);
        const ry = (x * 4).toFixed(2);
        card.style.transform = `translateY(-7px) perspective(950px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ------------------------------------------------------------------------
  // 7. HopeRise Impact Counter (Animiertes Hochzählen & Tab-Wechsel)
  // ------------------------------------------------------------------------
  const impactSection = document.getElementById('impact');
  const impactValue = document.getElementById('hrImpactValue');
  const impactLabel = document.getElementById('hrImpactLabel');
  const impactSub = document.getElementById('hrImpactSub');
  const impactTabs = Array.from(document.querySelectorAll('.hr-impact-tab'));

  const impactMetrics = [
    {
      num: 24,
      prefix: '',
      suffix: 'h',
      label: 'Bis zum transparenten Festpreis-Angebot',
      sub: 'Nach Ihrer kurzen Besichtigung vor Ort in Aschaffenburg erhalten Sie am nächsten Werktag alle Konditionen schriftlich.'
    },
    {
      num: 0,
      prefix: '',
      suffix: ' €',
      label: 'Für Ihre unverbindliche Erstbesichtigung',
      sub: 'Wir schauen uns Ihre Räumlichkeiten persönlich an und beraten ehrlich zu Turnus, Aufwand und ökologischen Mitteln.'
    },
    {
      num: 100,
      prefix: '',
      suffix: ' %',
      label: 'Geprüfte Öko-Mittel & festes Reinigungsteam',
      sub: 'Gleichbleibende Mitarbeiter statt ständigem Personalwechsel sowie biologisch abbaubare Pflege für empfindliche Flächen.'
    },
    {
      num: 6,
      prefix: '',
      suffix: '',
      label: 'Spezialisierte Fachbereiche aus einer Hand',
      sub: 'Von regelmäßiger Büro- & Praxisreinigung bis zu Glasfronten, Grundreinigung und flexiblen Sonderaufgaben.'
    }
  ];

  let activeMetricIdx = 0;
  let impactStarted = false;
  let metricTimer = null;
  let activeCountFrame = null;
  let activeSwitchTimer = null;
  let activeRunToken = 0;

  const animateNumberTo = (metric, token) => {
    if (!impactValue) return;
    if (activeCountFrame) {
      cancelAnimationFrame(activeCountFrame);
      activeCountFrame = null;
    }

    if (prefersReducedMotion || metric.num === 0) {
      impactValue.textContent = `${metric.prefix}${metric.num}${metric.suffix}`;
      return;
    }

    const start = performance.now();
    const duration = 760;
    const step = (now) => {
      if (token !== activeRunToken) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(eased * metric.num);
      impactValue.textContent = `${metric.prefix}${current}${metric.suffix}`;
      if (t < 1) {
        activeCountFrame = requestAnimationFrame(step);
      } else {
        impactValue.textContent = `${metric.prefix}${metric.num}${metric.suffix}`;
        activeCountFrame = null;
      }
    };
    activeCountFrame = requestAnimationFrame(step);
  };

  const setImpactMetric = (idx, animate = true) => {
    activeRunToken += 1;
    const runToken = activeRunToken;

    if (activeSwitchTimer) {
      clearTimeout(activeSwitchTimer);
      activeSwitchTimer = null;
    }
    if (activeCountFrame) {
      cancelAnimationFrame(activeCountFrame);
      activeCountFrame = null;
    }

    activeMetricIdx = (idx + impactMetrics.length) % impactMetrics.length;
    const metric = impactMetrics[activeMetricIdx];

    impactTabs.forEach((tab, i) => {
      const active = i === activeMetricIdx;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (!impactValue || !impactLabel || !impactSub) return;

    if (!animate || prefersReducedMotion) {
      impactLabel.textContent = metric.label;
      impactSub.textContent = metric.sub;
      animateNumberTo(metric, runToken);
      return;
    }

    impactValue.classList.add('is-switching');
    activeSwitchTimer = setTimeout(() => {
      if (runToken !== activeRunToken) return;
      impactLabel.textContent = metric.label;
      impactSub.textContent = metric.sub;
      impactValue.classList.remove('is-switching');
      animateNumberTo(metric, runToken);
      activeSwitchTimer = null;
    }, 180);
  };

  impactTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      setImpactMetric(idx, true);
      if (metricTimer) {
        clearInterval(metricTimer);
        metricTimer = null;
      }
    });
  });

  if (impactSection && 'IntersectionObserver' in window) {
    const impactObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impactStarted) {
            impactStarted = true;
            setImpactMetric(0, true);
            if (!prefersReducedMotion) {
              metricTimer = setInterval(() => setImpactMetric(activeMetricIdx + 1, true), 4600);
            }
          }
        });
      },
      { threshold: 0.35 }
    );
    impactObs.observe(impactSection);
  }

  // ------------------------------------------------------------------------
  // 8. Arched Showcase Carousel Controls
  // ------------------------------------------------------------------------
  const archTrack = document.getElementById('hrArchTrack');
  const prevBtn = document.getElementById('hrArchPrev');
  const nextBtn = document.getElementById('hrArchNext');

  if (archTrack && prevBtn && nextBtn) {
    const scrollByCard = (direction) => {
      const card = archTrack.querySelector('.hr-arch-card');
      const step = card ? card.getBoundingClientRect().width + 24 : 360;
      archTrack.scrollBy({ left: direction * step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));
  }

  // ------------------------------------------------------------------------
  // 9. Vorauswahl Leistung + Quick Chips + Kontaktformular (FormSubmit AJAX)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const serviceSelect = document.getElementById('serviceSelect');
  const objektartInput = document.getElementById('objektartInput');
  const messageInput = document.getElementById('messageInput');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');

  const syncChipSelection = (group, chipBtn) => {
    const targetId = group.getAttribute('data-chip-target');
    const targetInput = targetId ? document.getElementById(targetId) : null;
    const isAlready = chipBtn.classList.contains('is-selected');

    group.querySelectorAll('.hr-chip').forEach((btn) => {
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');
    });

    if (isAlready) {
      if (targetInput) targetInput.value = '';
      return;
    }

    chipBtn.classList.add('is-selected');
    chipBtn.setAttribute('aria-pressed', 'true');
    if (targetInput) targetInput.value = chipBtn.dataset.value || '';
  };

  document.querySelectorAll('.hr-chips').forEach((group) => {
    group.querySelectorAll('.hr-chip').forEach((btn) => {
      btn.addEventListener('click', () => syncChipSelection(group, btn));
    });
  });

  const preselectService = (serviceName) => {
    if (!serviceSelect || !serviceName) return;
    Array.from(serviceSelect.options).forEach((opt) => {
      if (opt.value === serviceName) {
        serviceSelect.value = serviceName;
      }
    });

    const mapObjekt = {
      Büroreinigung: 'Büro',
      Praxisreinigung: 'Praxis'
    };
    const mapped = mapObjekt[serviceName];
    if (mapped) {
      const group = document.querySelector('.hr-chips[data-chip-target="objektartInput"]');
      const matchBtn = group ? group.querySelector(`[data-value="${mapped}"]`) : null;
      if (group && matchBtn) {
        group.querySelectorAll('.hr-chip').forEach((b) => {
          b.classList.remove('is-selected');
          b.setAttribute('aria-pressed', 'false');
        });
        matchBtn.classList.add('is-selected');
        matchBtn.setAttribute('aria-pressed', 'true');
        if (objektartInput) objektartInput.value = mapped;
      }
    }

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    setTimeout(() => {
      if (messageInput) messageInput.focus({ preventScroll: true });
    }, 500);
  };

  document.querySelectorAll('[data-service]').forEach((el) => {
    el.addEventListener('click', () => {
      const svc = el.getAttribute('data-service');
      if (svc) preselectService(svc);
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!submitBtn || !formFeedback) return;

      const origHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Wird gesendet …</span>';
      formFeedback.className = 'hr-form-feedback';
      formFeedback.textContent = '';

      try {
        const data = new FormData(contactForm);
        const res = await fetch('https://formsubmit.co/ajax/serreos.raumpflegeservice@web.de', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });

        if (res.ok) {
          formFeedback.className = 'hr-form-feedback is-success';
          formFeedback.textContent =
            'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden.';
          contactForm.reset();
          document.querySelectorAll('.hr-chip').forEach((btn) => {
            btn.classList.remove('is-selected');
            btn.setAttribute('aria-pressed', 'false');
          });
        } else {
          throw new Error('Status ' + res.status);
        }
      } catch (err) {
        formFeedback.className = 'hr-form-feedback is-error';
        formFeedback.innerHTML =
          'Direktversand momentan nicht möglich. Bitte rufen Sie uns kurz unter <a href="tel:01716107094">0171 6107094</a> an.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHTML;
      }
    });
  }

  // ------------------------------------------------------------------------
  // 10. FAQ Akkordeon (Einzeln klappbar)
  // ------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.hr-faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.hr-faq-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      faqItems.forEach((other) => {
        other.classList.remove('is-open');
        const btn = other.querySelector('.hr-faq-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ------------------------------------------------------------------------
  // 11. Rechtliche Modals (Impressum & Datenschutz)
  // ------------------------------------------------------------------------
  const modalImpressum = document.getElementById('modalImpressum');
  const modalDatenschutz = document.getElementById('modalDatenschutz');

  const openModal = (modal) => {
    if (!modal) return;
    closeMobileMenu();
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('open');
    const anyOpen = document.querySelector('.modal-backdrop.open');
    if (!anyOpen) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  };

  document.getElementById('openImpressum')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modalImpressum);
  });
  document.getElementById('openDatenschutz')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modalDatenschutz);
  });
  document.getElementById('openDatenschutzInline')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modalDatenschutz);
  });
  document.getElementById('closeImpressum')?.addEventListener('click', () => closeModal(modalImpressum));
  document.getElementById('closeDatenschutz')?.addEventListener('click', () => closeModal(modalDatenschutz));

  [modalImpressum, modalDatenschutz].forEach((modal) => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeModal(modalImpressum);
      closeModal(modalDatenschutz);
    }
  });
});
