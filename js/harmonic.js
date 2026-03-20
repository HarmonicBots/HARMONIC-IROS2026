/* HARMONIC IROS 2026 - Core Utilities
   ===================================== */
const HARMONIC = {
  ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  },
  $(selector, context = document) { return context.querySelector(selector); },
  $$(selector, context = document) { return Array.from(context.querySelectorAll(selector)); },
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
    };
  },
  scrollTo(element, offset = 70) {
    const target = typeof element === 'string' ? this.$(element) : element;
    if (target) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },
  initSidebar() {
    const links = this.$$('.sidebar-page-link');
    const sections = links.map(l => this.$(l.getAttribute('href'))).filter(Boolean);
    const toggle = this.$('#sidebarToggle');
    const sidebar = this.$('#sidebar');
    const backdrop = this.$('#sidebar-backdrop');

    // Scroll spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const link = links.find(l => l.getAttribute('href') === '#' + entry.target.id);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(s => observer.observe(s));

    // Mobile toggle
    if (toggle && sidebar && backdrop) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('visible');
      });
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
      });
      links.forEach(l => l.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
      }));
    }
  },
  init() { this.initSidebar(); }
};
HARMONIC.ready(() => { HARMONIC.init(); });
window.HARMONIC = HARMONIC;
