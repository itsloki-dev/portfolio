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

// SCROLL REVEAL OBSERVER
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.15 });

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// MARQUEE
const items = ['React','Node.js','Express','TypeScript','Python','FastAPI','Java','MongoDB','PostgreSQL','Bash'];
const track = document.getElementById('marqueeTrack');
if (track) {
  const doubled = [...items, ...items, ...items, ...items];
  track.innerHTML = doubled.map(i => `<span class="marquee-item"><span class="marquee-dot"></span>${i}</span>`).join('');
}

// PROJECTS FETCH & RENDER
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  function render(projects) {
    grid.innerHTML = projects.map((p, index) => {
      const num = (index + 1).toString().padStart(2, '0');
      const bannerPath = p.banner ? `public/projects/${p.banner}` : '';
      const bgStyle = bannerPath 
        ? `background-image: url('${bannerPath}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(135deg, #1a2335 0%, #080b10 100%);`;

      const linksHtml = p.links ? `
        <div class="project-links-container">
          ${p.links.live ? `<a href="${p.links.live}" class="project-link" target="_blank" title="Live Demo"><span>↗</span></a>` : ''}
          ${p.links.github ? `<a href="${p.links.github}" class="project-github" target="_blank" title="GitHub Repository"><span>&lt;&gt;</span></a>` : ''}
        </div>
      ` : '';

      return `
        <div class="project-card">
          ${linksHtml}
          <div class="project-card-visual" style="${bgStyle}">
            <div class="p-vis-grid"></div>
            ${!p.banner ? `<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0.2; font-size:4rem; font-weight:800; font-family:'Syne'; color:var(--accent); text-transform:uppercase;">${p.name}</div>` : ''}
          </div>
          <div class="project-num">${num}${index === 0 ? ' — Featured' : ''}</div>
          <h3 class="project-title">${p.name}${p.tagline ? ` — ${p.tagline}` : ''}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-tags">
            ${p.techstack.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Re-bind hover listeners
    grid.querySelectorAll('.project-card, .project-link, .project-github').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Observe reveal
    grid.querySelectorAll('.project-card').forEach(el => observer.observe(el));

    // Load More Logic
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        grid.classList.remove('is-collapsed');
        grid.classList.add('is-expanded');
        loadMoreBtn.classList.add('hidden');
      });
    }
  }

  try {
    const response = await fetch('public/projects/projects.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const projects = await response.json();
    render(projects);
  } catch (err) {
    console.error('Error loading projects:', err);
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 4rem 0;">
      Failed to load projects. Ensure you are running through a local server.<br>
      <small style="opacity: 0.5;">${err.message}</small>
    </p>`;
  }
}

// SKILLS DYNAMIC RANKING
async function loadSkills() {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;

  try {
    const response = await fetch('public/projects/projects.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const projects = await response.json();

    const techCounts = {};
    projects.forEach(p => {
      p.techstack.forEach(tech => {
        const t = tech.toLowerCase().trim();
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });

    const sortedTech = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    grid.innerHTML = sortedTech.map(([tech, count]) => {
      // Improved slug generation for Simple Icons
      const slug = tech.toLowerCase()
        .replace(/\.js/g, 'js')
        .replace(/\+/g, 'plus')
        .replace(/\s+/g, '-');
      const iconUrl = `https://cdn.simpleicons.org/${slug}`;

      return `
        <div class="skill-card reveal">
          <img src="${iconUrl}" alt="${tech}" class="skill-icon" onerror="this.style.display='none'">
          <div class="skill-info">
            <span class="skill-name">${tech}</span>
            <span class="skill-count">${count} ${count === 1 ? 'Project' : 'Projects'}</span>
          </div>
        </div>
      `;
    }).join('');

    // Re-bind hover listeners
    grid.querySelectorAll('.skill-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Observe reveal
    grid.querySelectorAll('.skill-card').forEach(el => observer.observe(el));

  } catch (err) {
    console.error('Error loading skills:', err);
  }
}

// Initialize everything
async function init() {
  // First observe existing reveals
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  
  await loadProjects();
  await loadSkills();
}

init();

// PARALLAX ORBS
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (orb1) orb1.style.transform = `translate(${y*0.05}px, ${y*0.08}px)`;
  if (orb2) orb2.style.transform = `translate(${-y*0.03}px, ${-y*0.05}px)`;
}, { passive: true });
