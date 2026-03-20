/* HARMONIC - Modal / Lightbox
   ============================= */

HARMONIC.ready(() => { initModals(); });

function initModals() {
  if (!HARMONIC.$('#modal-container')) {
    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = `
      <div class="modal-overlay video-modal" id="video-modal">
        <div class="modal">
          <button class="modal-close" onclick="closeVideoModal()">&times;</button>
          <div class="modal-body"><video id="modal-video" controls><source src="" type="video/mp4">Your browser does not support the video tag.</video></div>
          <div class="modal-caption" id="video-caption"></div>
        </div>
      </div>
      <div class="modal-overlay image-modal" id="image-modal">
        <div class="modal">
          <button class="modal-close" onclick="closeImageModal()">&times;</button>
          <div class="modal-body"><img id="modal-image" src="" alt=""></div>
          <div class="modal-caption" id="image-caption"></div>
        </div>
      </div>`;
    document.body.appendChild(container);
  }
  HARMONIC.$$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAllModals(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });
}

function openVideoModal(src, caption = '') {
  const modal = HARMONIC.$('#video-modal');
  const video = HARMONIC.$('#modal-video');
  const captionEl = HARMONIC.$('#video-caption');
  if (modal && video) {
    video.querySelector('source').src = src;
    video.load();
    if (captionEl) captionEl.textContent = caption;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    video.play().catch(() => {});
  }
}

function closeVideoModal() {
  const modal = HARMONIC.$('#video-modal');
  const video = HARMONIC.$('#modal-video');
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
  if (video) { video.pause(); video.currentTime = 0; }
}

function openImageModal(src, caption = '') {
  const modal = HARMONIC.$('#image-modal');
  const img = HARMONIC.$('#modal-image');
  const captionEl = HARMONIC.$('#image-caption');
  if (modal && img) {
    img.src = src; img.alt = caption;
    if (captionEl) captionEl.textContent = caption;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeImageModal() {
  const modal = HARMONIC.$('#image-modal');
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function closeAllModals() { closeVideoModal(); closeImageModal(); }

window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.closeAllModals = closeAllModals;
