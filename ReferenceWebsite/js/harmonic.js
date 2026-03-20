/* HARMONIC - Core Utilities
   ========================= */
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
    if (target) { const top = target.getBoundingClientRect().top + window.pageYOffset - offset; window.scrollTo({ top, behavior: 'smooth' }); }
  },
  initScrollToTop() {
    const btn = this.$('.scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', this.throttle(() => { btn.classList.toggle('visible', window.scrollY > 500); }, 100));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },
  init() { this.initScrollToTop(); }
};
HARMONIC.ready(() => { HARMONIC.init(); });
window.HARMONIC = HARMONIC;
