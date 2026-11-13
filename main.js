/**
 * Serreos Raumpflegeservice - Main JavaScript
 * Handles navigation, scroll animations, parallax depth, mobile quick-action dock,
 * animated counters, service pre-selection, modals & FormSubmit AJAX
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Navbar, Scroll Progress, Parallax Depth, Scrollspy & Mobile Quick-Action Dock
  const navbarShell = document.getElementById('navbarShell');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  const heroRings = document.querySelector('.hero-rings');
  const heroMainCard = document.querySelector('.hero-glass-main');
  const mobileQuickBar = document.getElementById('mobileQuickBar');
  const contactSection = document.getElementById('contact');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinksList = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const trackedSections = navLinksList
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      return section ? { id, link, section } : null;
    })
    .filter(Boolean);

  let contactInView = false;
  let ticking = false;

  const updateMobileDockVisibility = (scrollY) => {
    if (!mobileQuickBar) return;
    const isMobile = window.innerWidth <= 820;
    const menuOpen = navLinks && navLinks.classList.contains('active');
    const modalOpen = Boolean(document.querySelector('.modal-backdrop.active'));
    const showDock = isMobile && scrollY > 360 && !contactInView && !menuOpen && !modalOpen;

    mobileQuickBar.classList.toggle('is-visible', showDock);
    document.body.classList.toggle('has-mobile-dock', showDock);
  };

  const updateScrollspy = () => {
    if (!trackedSections.length) return;
    const probeY = window.scrollY + Math.min(180, window.innerHeight * 0.25);
    let currentId = trackedSections[0].id;

    trackedSections.forEach(({ id, section }) => {
      if (section.offsetTop <= probeY) {
        currentId = id;
      }
    });

    trackedSections.forEach(({ id, link }) => {
      link.classList.toggle('active', id === currentId);
    });
  };

  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    const viewportW = window.innerWidth;

    if (navbarShell) {
      navbarShell.classList.toggle('scrolled', scrollY > 24);
    }

    if (scrollProgressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0;
      scrollProgressBar.style.width = `${progress}%`;
    }

    if (!prefersReducedMotion) {
      if (heroRings && scrollY < window.innerHeight * 1.7) {
        const ringDeg = (scrollY * 0.025).toFixed(2);
        const ringShift = (scrollY * 0.08).toFixed(1);
        heroRings.style.transform = `translate3d(0, ${ringShift}px, 0) rotate(${ringDeg}deg)`;
      }

      if (viewportW > 820 && scrollY < window.innerHeight * 1.45) {
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax || '0');
          const offset = scrollY * speed;
          const baseRotate = el.classList.contains('glass-float-top')
            ? 2.5
            : el.classList.contains('glass-float-bottom')
              ? -2.5
              : 0;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) rotate(${baseRotate}deg)`;
        });
      } else if (viewportW <= 820) {
        parallaxElements.forEach((el) => {
          el.style.transform = '';
        });
        if (heroMainCard && scrollY < window.innerHeight * 1.2) {
          const mobileFloat = Math.min(16, scrollY * 0.035).toFixed(1);
          heroMainCard.style.transform = `translate3d(0, ${mobileFloat}px, 0)`;
        }
      }
    }

    updateScrollspy();
    updateMobileDockVisibility(scrollY);
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  // 2. Mobile Navigation Toggle (Drawer + Outside Tap + Escape)
  const hamburgerSvg =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>';
  const closeSvg =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>';

  const closeMobileMenu = () => {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = hamburgerSvg;
    updateMobileDockVisibility(window.scrollY);
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.innerHTML = isOpen ? closeSvg : hamburgerSvg;
      updateMobileDockVisibility(window.scrollY);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  updateScrollEffects();

  // 3. Directional Scroll-Reveal Choreography, Process Fan-In & Counters
  const revealSelector = '.reveal-up, .reveal-left, .reveal-right';
  const heroRevealEls = Array.from(document.querySelectorAll(`#home ${revealSelector}`));
  const scrollRevealEls = Array.from(document.querySelectorAll(revealSelector)).filter(
    (el) => !el.closest('#home')
  );
  const processCards = document.getElementById('processCards');
  const countElements = Array.from(document.querySelectorAll('[data-count]'));

  const settleAfterReveal = (el, delayMs) => {
    if (prefersReducedMotion) {
      el.classList.add('reveal-settled');
      return;
    }
    window.setTimeout(() => {
      el.classList.add('reveal-settled');
      el.style.removeProperty('--reveal-delay');
    }, delayMs + 950);
  };

  const revealElement = (el, delayMs = 0) => {
    if (el.classList.contains('visible')) return;
    if (delayMs > 0) {
      el.style.setProperty('--reveal-delay', `${delayMs}ms`);
    }
    el.classList.add('visible');
    settleAfterReveal(el, delayMs);
  };

  // Hero Entrance immediately on load with clean stagger
  if (prefersReducedMotion) {
    heroRevealEls.forEach((el) => revealElement(el, 0));
  } else {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        heroRevealEls.forEach((el, idx) => revealElement(el, idx * 120));
      });
    });
  }

  const animateCount = (el) => {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';

    const target = parseInt(el.dataset.count || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion || target <= 0) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 760;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = `${current}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    };

    window.requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    // Track #contact section visibility so mobile quick dock clears the form cleanly
    if (contactSection && mobileQuickBar) {
      const contactDockObserver = new IntersectionObserver(
        (entries) => {
          contactInView = entries[0].isIntersecting;
          updateMobileDockVisibility(window.scrollY);
        },
        { threshold: 0.08 }
      );
      contactDockObserver.observe(contactSection);
    }

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const rectA = a.boundingClientRect;
            const rectB = b.boundingClientRect;
            if (Math.abs(rectA.top - rectB.top) > 24) {
              return rectA.top - rectB.top;
            }
            return rectA.left - rectB.left;
          });

        entering.forEach((entry, idx) => {
          const delayMs = Math.min(idx * 95, 380);
          revealElement(entry.target, delayMs);
          obs.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05
      }
    );

    scrollRevealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Elements already scrolled above viewport appear immediately
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        revealElement(el, 0);
      } else if (rect.bottom <= 0) {
        revealElement(el, 0);
      } else {
        revealObserver.observe(el);
      }
    });

    if (processCards) {
      const pRect = processCards.getBoundingClientRect();
      if (pRect.bottom <= 0 || (pRect.top < window.innerHeight * 0.9 && pRect.bottom > 0)) {
        processCards.classList.add('in-view', 'reveal-settled');
      } else {
        const processObserver = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                processCards.classList.add('in-view');
                window.setTimeout(() => {
                  processCards.classList.add('reveal-settled');
                }, 1150);
                obs.unobserve(entry.target);
              }
            });
          },
          { rootMargin: '0px 0px -8% 0px', threshold: 0.14 }
        );
        processObserver.observe(processCards);
      }
    }

    if (countElements.length) {
      const countObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      countElements.forEach((el) => countObserver.observe(el));
    }
  } else {
    scrollRevealEls.forEach((el) => revealElement(el, 0));
    if (processCards) {
      processCards.classList.add('in-view', 'reveal-settled');
    }
    countElements.forEach((el) => animateCount(el));
  }

  // 4. Service Card CTA -> Auto-Select Service & Quick-Choice Chips in Contact Form
  const serviceSelect = document.getElementById('serviceSelect');
  const serviceCtas = document.querySelectorAll('[data-service]');
  const messageInput = document.getElementById('messageInput');
  const objektartInput = document.getElementById('objektartInput');
  const turnusInput = document.getElementById('turnusInput');
  const quickChipGroups = document.querySelectorAll('[data-chip-target]');

  const syncMessageRequirement = () => {
    if (!messageInput) return;
    const hasQuickPick = Boolean((objektartInput && objektartInput.value) || (turnusInput && turnusInput.value));
    messageInput.required = !hasQuickPick;
  };

  quickChipGroups.forEach((group) => {
    const targetId = group.getAttribute('data-chip-target');
    const targetInput = targetId ? document.getElementById(targetId) : null;
    const chips = group.querySelectorAll('.quick-chip');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const wasSelected = chip.classList.contains('is-selected');
        chips.forEach((c) => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-pressed', 'false');
        });

        if (!wasSelected) {
          chip.classList.add('is-selected');
          chip.setAttribute('aria-pressed', 'true');
          if (targetInput) targetInput.value = chip.getAttribute('data-value') || '';
        } else if (targetInput) {
          targetInput.value = '';
        }

        syncMessageRequirement();
      });
    });
  });

  if (serviceSelect && serviceCtas.length > 0) {
    serviceCtas.forEach((cta) => {
      cta.addEventListener('click', () => {
        const chosenService = cta.getAttribute('data-service');
        if (!chosenService) return;
        serviceSelect.value = chosenService;
        serviceSelect.classList.add('is-highlighted');
        window.setTimeout(() => {
          serviceSelect.classList.remove('is-highlighted');
        }, 1600);
      });
    });
  }

  // 5. Modals (Impressum & Datenschutz)
  const modalImpressum = document.getElementById('modalImpressum');
  const modalDatenschutz = document.getElementById('modalDatenschutz');
  const openImpressum = document.getElementById('openImpressum');
  const openDatenschutz = document.getElementById('openDatenschutz');
  const openDatenschutzInline = document.getElementById('openDatenschutzInline');
  const closeImpressum = document.getElementById('closeImpressum');
  const closeDatenschutz = document.getElementById('closeDatenschutz');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateMobileDockVisibility(window.scrollY);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    updateMobileDockVisibility(window.scrollY);
  }

  if (openImpressum) {
    openImpressum.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalImpressum);
    });
  }

  if (openDatenschutz) {
    openDatenschutz.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalDatenschutz);
    });
  }

  if (openDatenschutzInline) {
    openDatenschutzInline.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalDatenschutz);
    });
  }

  if (closeImpressum) {
    closeImpressum.addEventListener('click', () => closeModal(modalImpressum));
  }

  if (closeDatenschutz) {
    closeDatenschutz.addEventListener('click', () => closeModal(modalDatenschutz));
  }

  [modalImpressum, modalDatenschutz].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalImpressum);
      closeModal(modalDatenschutz);
      closeMobileMenu();
    }
  });

  // 7. Contact Form Submission via AJAX (FormSubmit)
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm && submitBtn && formFeedback) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (messageInput && !messageInput.value.trim()) {
        const parts = [];
        if (objektartInput && objektartInput.value) parts.push(`Objektart: ${objektartInput.value}`);
        if (turnusInput && turnusInput.value) parts.push(`Turnus: ${turnusInput.value}`);
        if (parts.length) {
          messageInput.value = `Schnellanfrage (${parts.join(', ')})`;
        }
      }

      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Wird gesendet...</span>';
      formFeedback.className = 'form-feedback';
      formFeedback.style.display = 'none';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('https://formsubmit.co/ajax/serreos.raumpflegeservice@web.de', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          formFeedback.textContent =
            'Vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.';
          formFeedback.className = 'form-feedback success';
          formFeedback.style.display = 'block';
          contactForm.reset();
          quickChipGroups.forEach((group) => {
            group.querySelectorAll('.quick-chip').forEach((c) => {
              c.classList.remove('is-selected');
              c.setAttribute('aria-pressed', 'false');
            });
          });
          if (objektartInput) objektartInput.value = '';
          if (turnusInput) turnusInput.value = '';
          syncMessageRequirement();
        } else {
          throw new Error('Server-Fehler bei der Übertragung');
        }
      } catch (err) {
        formFeedback.textContent = 'Hinweis: Ihre Nachricht wird übermittelt...';
        formFeedback.className = 'form-feedback';
        formFeedback.style.display = 'block';
        contactForm.submit();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
