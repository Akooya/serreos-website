document.addEventListener('DOMContentLoaded', () => {
  // Navigation Bar Scroll Effect
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Scroll Animations using Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing once it's visible if you only want the animation to happen once
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToAnimate = document.querySelectorAll('.fade-in-up');
  elementsToAnimate.forEach(element => {
    observer.observe(element);
  });

  // Trigger form submission (prevent default for demo purposes)
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Vielen Dank für Ihre Nachricht! Wir werden uns in Kürze bei Ihnen melden.');
      form.reset();
    });
  }

  // Initial trigger for top elements if they are already in view
  setTimeout(() => {
    const heroContent = document.querySelector('.hero-content.fade-in-up');
    if (heroContent) {
      heroContent.classList.add('visible');
    }
  }, 100);
});
