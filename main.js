/**
 * Serreos Raumpflegeservice - Main JavaScript
 * Handles navigation, animations, modals, and AJAX contact form submission
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation on Scroll
  const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Navigation Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.textContent = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      });
    });
  }

  // 3. Scroll Reveal Animations (Intersection Observer)
  const animElements = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    animElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    animElements.forEach(el => el.classList.add('visible'));
  }

  // 4. Modals (Impressum & Datenschutz)
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
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
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

  // Close modals when clicking the backdrop
  [modalImpressum, modalDatenschutz].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalImpressum);
      closeModal(modalDatenschutz);
    }
  });

  // 5. Contact Form Submission via AJAX (FormSubmit)
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formFeedback = document.getElementById('formFeedback') || document.getElementById('formStatus');

  if (contactForm && submitBtn && formFeedback) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // UI: Loading State
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Wird gesendet...</span>';
      formFeedback.className = 'form-feedback';
      formFeedback.style.display = 'none';

      // Collect form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('https://formsubmit.co/ajax/serreos.raumpflegeservice@web.de', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          formFeedback.textContent = 'Vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.';
          formFeedback.className = 'form-feedback success';
          formFeedback.style.display = 'block';
          contactForm.reset();
        } else {
          throw new Error('Server-Fehler bei der Übertragung');
        }
      } catch (err) {
        // Fallback: standard form submit if AJAX is blocked or fails
        formFeedback.textContent = 'Hinweis: Ihre Nachricht wird übermittelt...';
        formFeedback.className = 'form-feedback';
        formFeedback.style.display = 'block';
        contactForm.submit();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
