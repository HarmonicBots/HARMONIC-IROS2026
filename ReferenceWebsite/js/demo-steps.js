/* HARMONIC - Demo Steps Controller
   ================================== */

class DemoController {
  constructor(containerId, totalSteps, stepTitles = [], options = {}) {
    this.container = document.getElementById(containerId);
    this.totalSteps = totalSteps;
    this.stepTitles = stepTitles;
    this.currentStep = 0;
    this.autoPlayInterval = null;
    this.autoPlaySpeed = 5000;
    this.hasVideoSteps = options.hasVideoSteps !== false;
    this.videoStepCount = options.videoStepCount || 2;
    if (this.container) { this.init(); }
  }

  init() { this.generateStepNav(); this.updateDisplay(); this.bindEvents(); }

  generateStepNav() {
    const navGrid = this.container.querySelector('.step-nav-grid');
    if (!navGrid) return;
    navGrid.innerHTML = '';
    for (let i = 0; i < this.totalSteps; i++) {
      const btn = document.createElement('button');
      btn.className = 'step-nav-btn';
      if (this.hasVideoSteps) {
        if (this.videoStepCount === 1 && i === this.totalSteps - 1) btn.classList.add('simulation');
        if (this.videoStepCount === 2) {
          if (i === this.totalSteps - 2) btn.classList.add('simulation');
          else if (i === this.totalSteps - 1) btn.classList.add('robot');
        }
      }
      btn.textContent = i === 0 ? 'Intro' : i;
      btn.title = this.stepTitles[i] || `Step ${i}`;
      btn.onclick = () => this.goToStep(i);
      navGrid.appendChild(btn);
    }
  }

  updateDisplay() {
    const currentSpan = this.container.querySelector('#currentStep');
    const totalSpan = this.container.querySelector('#totalSteps');
    if (currentSpan) currentSpan.textContent = this.currentStep;
    if (totalSpan) totalSpan.textContent = this.totalSteps - 1;
    const prevBtn = this.container.querySelector('#prevStep');
    const nextBtn = this.container.querySelector('#nextStep');
    if (prevBtn) prevBtn.disabled = this.currentStep <= 0;
    if (nextBtn) nextBtn.disabled = this.currentStep >= this.totalSteps - 1;
    this.container.querySelectorAll('.demo-step').forEach(s => s.classList.remove('active'));
    const cur = this.container.querySelector(`#step${this.currentStep}`);
    if (cur) cur.classList.add('active');
    this.container.querySelectorAll('.step-nav-btn').forEach((btn, i) => {
      btn.classList.remove('active', 'completed');
      if (i === this.currentStep) btn.classList.add('active');
      else if (i < this.currentStep) btn.classList.add('completed');
    });
  }

  goToStep(step) {
    if (step >= 0 && step < this.totalSteps) { this.currentStep = step; this.updateDisplay(); this.stopAutoPlay(); }
  }
  nextStep() { if (this.currentStep < this.totalSteps - 1) { this.currentStep++; this.updateDisplay(); } }
  prevStep() { if (this.currentStep > 0) { this.currentStep--; this.updateDisplay(); } }

  toggleAutoPlay() { this.autoPlayInterval ? this.stopAutoPlay() : this.startAutoPlay(); }

  startAutoPlay() {
    const btn = this.container.querySelector('#autoPlayBtn');
    this.autoPlayInterval = setInterval(() => {
      if (this.currentStep < this.totalSteps - 1) { this.nextStep(); } else { this.stopAutoPlay(); }
    }, this.autoPlaySpeed);
    if (btn) { btn.innerHTML = '<i class="fas fa-stop"></i> Stop'; btn.classList.add('active'); }
  }

  stopAutoPlay() {
    const btn = this.container.querySelector('#autoPlayBtn');
    if (this.autoPlayInterval) { clearInterval(this.autoPlayInterval); this.autoPlayInterval = null; }
    if (btn) { btn.innerHTML = '<i class="fas fa-play"></i> Auto Play'; btn.classList.remove('active'); }
  }

  bindEvents() {
    const prevBtn = this.container.querySelector('#prevStep');
    const nextBtn = this.container.querySelector('#nextStep');
    const autoBtn = this.container.querySelector('#autoPlayBtn');
    if (prevBtn) prevBtn.onclick = () => this.prevStep();
    if (nextBtn) nextBtn.onclick = () => this.nextStep();
    if (autoBtn) autoBtn.onclick = () => this.toggleAutoPlay();
    document.addEventListener('keydown', (e) => {
      if (!this.container.offsetParent) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); this.nextStep(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prevStep(); }
    });
  }
}

const demo2StepTitles = [
  'Understanding Multi-Robot Coordination',
  'Task Initiation: Danny\'s Request',
  'Information Gathering: Object Description',
  'Location Information: Last Known Location',
  'Plan Distribution: Search Initiation',
  'Search Execution: Coordinated Exploration',
  'Communication and Coordination',
  'Object Detection: Keys Found',
  'Task Completion: Mission Report',
  'Mission Debrief: Team Coordination Summary'
];

window.DemoController = DemoController;
window.demo2StepTitles = demo2StepTitles;
