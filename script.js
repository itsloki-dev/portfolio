// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animCursor() {
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();
document.querySelectorAll('a, button, .project-card, .tech-tag, .contact-link').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// MARQUEE
const items = ['React','Node.js','TypeScript','Python','AWS','Figma','Docker','PostgreSQL','Three.js','Go','GraphQL','Kubernetes'];
const track = document.getElementById('marqueeTrack');
if (track) {
  const doubled = [...items, ...items, ...items, ...items];
  track.innerHTML = doubled.map(i => `<span class="marquee-item"><span class="marquee-dot"></span>${i}</span>`).join('');
}

// SCROLL REVEAL
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.15 });
reveals.forEach(el => observer.observe(el));

// SKILL BAR ANIMATION — trigger when in view
const skillBars = document.querySelectorAll('.skill-bar-fill');
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      e.target.style.animation = 'fillBar 1.2s ease forwards';
    }
  });
}, { threshold: 0.5 });
skillBars.forEach(bar => { bar.style.transform = 'scaleX(0)'; barObserver.observe(bar); });

// PARALLAX ORBS
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (orb1) orb1.style.transform = `translate(${y*0.05}px, ${y*0.08}px)`;
  if (orb2) orb2.style.transform = `translate(${-y*0.03}px, ${-y*0.05}px)`;
});
