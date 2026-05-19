// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  const navLinks = document.querySelector('.nav-links');
  const navCtas = document.querySelector('.nav-ctas');
  const isOpen = navLinks.style.display === 'flex';

  if (isOpen) {
    navLinks.style.display = '';
    navCtas.style.display = '';
    hamburger.classList.remove('open');
  } else {
    navLinks.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:68px;left:0;right:0;background:rgba(10,22,40,.97);backdrop-filter:blur(20px);padding:16px 24px 24px;border-bottom:1px solid rgba(255,255,255,.08);z-index:99;gap:4px;';
    navCtas.style.cssText = 'display:flex;position:fixed;bottom:0;left:0;right:0;background:rgba(10,22,40,.97);padding:16px 24px;border-top:1px solid rgba(255,255,255,.06);z-index:99;gap:12px;';
    hamburger.classList.add('open');
  }
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      document.querySelector('.nav-links').style.display = '';
      document.querySelector('.nav-ctas').style.display = '';
      hamburger.classList.remove('open');
    }
  });
});

// Intersection Observer for fade-in animations
const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const fadeEls = document.querySelectorAll(
  '.pillar, .sec-card, .copilot-card, .testimonial, .pricing-card, .product-feature, .stat-item'
);

fadeEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity .5s ease ${(i % 4) * 80}ms, transform .5s ease ${(i % 4) * 80}ms`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOpts);

fadeEls.forEach(el => observer.observe(el));

// Animate compliance bars
const scoreBars = document.querySelectorAll('.score-bar');
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

scoreBars.forEach(bar => {
  const targetWidth = bar.style.getPropertyValue('--w');
  bar.style.width = '0';
  requestAnimationFrame(() => {
    barObserver.observe(bar);
    setTimeout(() => { bar.style.width = targetWidth; }, 100);
  });
});

// Animate txn rows with staggered fade
const txnRows = document.querySelectorAll('.txn-row');
const txnObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      txnRows.forEach((row, i) => {
        row.style.opacity = '0';
        row.style.transition = `opacity .4s ease ${i * 80}ms`;
        setTimeout(() => { row.style.opacity = '1'; }, 50);
      });
      txnObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (txnRows.length) txnObserver.observe(txnRows[0].closest('.txn-stream'));

// Live transaction counter animation
function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statValues = document.querySelectorAll('.stat-value');
const numericPattern = /^[\d,]+$/;
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const text = entry.target.textContent.replace(/,/g, '');
      const num = parseInt(text, 10);
      if (!isNaN(num)) animateCounter(entry.target, num);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statValues.forEach(el => {
  const text = el.textContent.replace(/,/g, '');
  if (!isNaN(parseInt(text, 10))) counterObserver.observe(el);
});
