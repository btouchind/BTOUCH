/* ============================================================
   BTouch — script.js
   Main JavaScript for B-Touch AI Prosthetic Arm website
   ============================================================ */

/* ── Supabase Configuration ──────────────────────────────── */
// NOTE: Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
let supabase = null;

// Initialize Supabase if keys are set
if (window.supabase && SUPABASE_URL !== 'https://your-project.supabase.co') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ── Google Apps Script Webhook ──────────────────────────── */
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzq1X9e0z52Ue1oD-kjxSkcvkB8POnnWqH4hnV7IyGltLR03puyNCaZLMBJyqxqXTif/exec';

/* ─────────────────────────────────────────────────────────── */
/*  THEME TOGGLE                                               */
/* ─────────────────────────────────────────────────────────── */

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === 'light') {
    root.classList.add('light-theme');
    themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
  } else {
    root.classList.remove('light-theme');
    themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
  }
  localStorage.setItem('btouch-theme', theme);
}

function toggleTheme() {
  const current = root.classList.contains('light-theme') ? 'light' : 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Load saved theme on startup
const savedTheme = localStorage.getItem('btouch-theme') || 'dark';
applyTheme(savedTheme);
themeToggleBtn.addEventListener('click', toggleTheme);

/* ─────────────────────────────────────────────────────────── */
/*  NAVBAR — Scroll shadow + Mobile menu                       */
/* ─────────────────────────────────────────────────────────── */

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');

const sentinel = document.getElementById('top-sentinel');
if (sentinel) {
  const headerObserver = new IntersectionObserver((entries) => {
    navbar.classList.toggle('scrolled', !entries[0].isIntersecting);
  }, { threshold: [0] });
  headerObserver.observe(sentinel);
} else {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─────────────────────────────────────────────────────────── */
/*  SMOOTH SCROLL for anchor links                             */
/* ─────────────────────────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(root).getPropertyValue('--nav-h')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ─────────────────────────────────────────────────────────── */
/*  HERO ARM — 3D tilt on mouse move                           */
/* ─────────────────────────────────────────────────────────── */

const heroArm = document.getElementById('hero-arm');
const heroArmWrap = document.getElementById('hero-arm-wrap');
let isHovering = false;
let rafId = null;
let autoAngle = 0;
let isMobile = window.innerWidth < 768;

window.addEventListener('resize', () => { isMobile = window.innerWidth < 768; });

function autoFloat() {
  if (isHovering || isMobile) return;
  autoAngle = (autoAngle + 0.4) % 360;
  const y = Math.sin(autoAngle * Math.PI / 180) * 14;
  heroArm.style.transform = `perspective(1000px) rotateX(0deg) rotateY(${Math.sin(autoAngle * Math.PI / 180) * 5}deg) translateY(${y * -0.5}px)`;
  heroArm.style.filter = `drop-shadow(0 ${12 + Math.abs(y) * 0.3}px ${32 + Math.abs(y)}px hsl(262 60% 62% / 0.22))`;
  rafId = requestAnimationFrame(autoFloat);
}
rafId = requestAnimationFrame(autoFloat);

if (heroArmWrap) {
  heroArmWrap.addEventListener('mouseenter', () => {
    if (isMobile) return;
    isHovering = true;
    cancelAnimationFrame(rafId);
  });

  heroArmWrap.addEventListener('mouseleave', () => {
    isHovering = false;
    heroArm.style.transition = 'transform 0.5s ease-out, filter 0.3s ease';
    heroArm.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    setTimeout(() => {
      heroArm.style.transition = '';
      rafId = requestAnimationFrame(autoFloat);
    }, 500);
  });

  heroArmWrap.addEventListener('mousemove', (e) => {
    if (!isHovering || isMobile) return;
    const rect = heroArmWrap.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const rotX = py * -10;
    const rotY = px * 14;
    heroArm.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
    heroArm.style.filter = `drop-shadow(0 ${12 + Math.abs(rotY) * 0.5}px ${24 + Math.abs(rotY)}px hsl(262 60% 62% / 0.25))`;
    heroArm.style.transition = 'transform 0.08s ease-out';
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)        */
/* ─────────────────────────────────────────────────────────── */

function createObserver(selector, animClass, options = {}) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = (entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add(animClass), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px' });

  elements.forEach((el, i) => {
    if (!el.dataset.delay) el.dataset.delay = i * (options.stagger || 0);
    obs.observe(el);
  });
}

// Add base animation classes via CSS
const style = document.createElement('style');
style.textContent = `
  .anim-fade-up { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .anim-fade-left { opacity: 0; transform: translateX(-50px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .anim-fade-right { opacity: 0; transform: translateX(50px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .anim-scale { opacity: 0; transform: scale(0.85); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  .anim-fade-up.visible, .anim-fade-left.visible, .anim-fade-right.visible, .anim-scale.visible {
    opacity: 1; transform: none;
  }
  .timeline-dot { opacity: 0; transform: scale(0); transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .timeline-dot.visible { opacity: 1; transform: scale(1); }
`;
document.head.appendChild(style);

// Apply animation classes to elements
document.addEventListener('DOMContentLoaded', () => {
  // Section headers
  document.querySelectorAll('.section-header').forEach(el => el.classList.add('anim-fade-up'));
  // About section
  const aboutImg = document.querySelector('.about-image-wrap');
  const aboutTxt = document.querySelector('.about-text');
  if (aboutImg) aboutImg.classList.add('anim-fade-left');
  if (aboutTxt) aboutTxt.classList.add('anim-fade-right');
  // Timeline cards
  document.querySelectorAll('.timeline-card').forEach((el, i) => {
    const side = el.closest('.timeline-col-left') ? 'anim-fade-left' : 'anim-fade-right';
    el.classList.add(side);
    el.dataset.delay = i * 80;
  });
  document.querySelectorAll('.timeline-dot').forEach(el => el.classList.add('anim-scale'));
  // Product cards
  document.querySelectorAll('.product-card').forEach((el, i) => {
    el.classList.add('anim-fade-up');
    el.dataset.delay = i * 90;
  });
  // Form cards
  document.querySelectorAll('.form-card, .contact-form, .contact-info').forEach(el => el.classList.add('anim-fade-up'));

  // Start observing
  createObserver('.anim-fade-up', 'visible', { stagger: 0 });
  createObserver('.anim-fade-left', 'visible');
  createObserver('.anim-fade-right', 'visible');
  createObserver('.anim-scale', 'visible');
  createObserver('.timeline-dot', 'visible');
});

/* ─────────────────────────────────────────────────────────── */
/*  TOAST NOTIFICATIONS                                         */
/* ─────────────────────────────────────────────────────────── */

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const icon = type === 'success'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icon} ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(1rem)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ─────────────────────────────────────────────────────────── */
/*  INTERNSHIP FORM                                             */
/* ─────────────────────────────────────────────────────────── */

const internshipForm = document.getElementById('internship-form');
const internshipSuccess = document.getElementById('internship-success');

function validateInternshipForm(data) {
  const errors = {};
  if (!data.full_name.trim()) errors.full_name = 'Name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email address';
  if (!data.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^\d{10,15}$/.test(data.phone.replace(/[\s\-()+]+/g, ''))) errors.phone = 'Enter a valid phone number (at least 10 digits)';
  if (!data.role) { errors.role = 'Please select a role';}
  if (!data.message.trim()) errors.message = 'Please tell us about yourself';
  return errors;
  if (
  document.getElementById("intern-role").value === "Other" &&
  !document.getElementById("other-role").value.trim()
  ) {
  errors.role = 'Please specify your role';
  }
}

function showFieldErrors(form, errors) {
  // Clear previous errors
  form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  // Set new errors
  Object.entries(errors).forEach(([field, msg]) => {
    const input = form.querySelector(`[name="${field}"]`);
    const errEl = form.querySelector(`[data-error="${field}"]`);
    if (input) input.classList.add('error');
    if (errEl) errEl.textContent = msg;
  });
}

if (internshipForm) {
  internshipForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = internshipForm.querySelector('[type="submit"]');

    const selectedRole = internshipForm.role.value;

    const finalRole =
      selectedRole === "Other"
        ? document.getElementById("other-role").value.trim()
        : selectedRole;

    const data = {
      full_name: internshipForm.full_name.value,
      email: internshipForm.email.value,
      phone: internshipForm.phone.value,
      role: finalRole,
      message: internshipForm.message.value,
    };

    const errors = validateInternshipForm(data);
    if (Object.keys(errors).length > 0) {
      showFieldErrors(internshipForm, errors);
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Submitting...`;

    try {
      const response = await fetch(GAS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'internship', ...data })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Server error');

      showToast('Application submitted successfully!', 'success');
      internshipForm.reset();
      showFieldErrors(internshipForm, {});
      if (internshipSuccess) {
        internshipSuccess.classList.add('show');
        setTimeout(() => internshipSuccess.classList.remove('show'), 5000);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to submit application. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Apply for Internship`;
    }
  });

  // Clear error on input
  internshipForm.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errEl = internshipForm.querySelector(`[data-error="${input.name}"]`);
      if (errEl) errEl.textContent = '';
    });
  });
}

const roleSelect = document.getElementById("intern-role");
const otherRoleInput = document.getElementById("other-role");

roleSelect.addEventListener("change", function () {
    if (this.value === "Other") {
        otherRoleInput.style.display = "block";
        otherRoleInput.required = true;
    } else {
        otherRoleInput.style.display = "none";
        otherRoleInput.required = false;
        otherRoleInput.value = "";
    }
});

/* ─────────────────────────────────────────────────────────── */
/*  CONTACT FORM                                                */
/* ─────────────────────────────────────────────────────────── */

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');

    const data = {
      full_name: contactForm.full_name.value,
      email: contactForm.email.value,
      subject: contactForm.subject.value,
      message: contactForm.message.value,
    };

    btn.disabled = true;
    btn.innerHTML = `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending...`;

    try {
      const response = await fetch(GAS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'contact', ...data })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Server error');

      showToast('Message sent successfully!', 'success');
      contactForm.reset();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
    }
  });
}

// Spinner CSS
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
`;
document.head.appendChild(spinStyle);
