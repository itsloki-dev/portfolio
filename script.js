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
let allProjects = [];

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  const searchInput = document.getElementById('projectSearch');
  if (!grid) return;

  function highlightText(text, term) {
    if (!term) return text;
    const keywords = term.split(/\s+/).filter(k => k.length > 0);
    if (keywords.length === 0) return text;
    
    // Create a regex that matches any of the keywords
    const pattern = keywords.map(k => k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  function render(projects, isSearching = false, term = '') {
    if (projects.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 4rem 0;">No projects found matching your search.</p>`;
      return;
    }

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
        <div class="project-card reveal">
          ${linksHtml}
          <div class="project-card-visual" style="${bgStyle}">
            <div class="p-vis-grid"></div>
            ${!p.banner ? `<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0.2; font-size:4rem; font-weight:800; font-family:'Syne'; color:var(--accent); text-transform:uppercase;">${p.name}</div>` : ''}
          </div>
          <div class="project-num">${num}${index === 0 && !isSearching ? ' — Featured' : ''}</div>
          <h3 class="project-title">${highlightText(p.name, term)}${p.tagline ? ` — ${p.tagline}` : ''}</h3>
          <p class="project-desc">${highlightText(p.description, term)}</p>
          <div class="project-tags">
            ${p.techstack.map(tag => `<span class="project-tag">${highlightText(tag, term)}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.project-card, .project-link, .project-github').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    grid.querySelectorAll('.project-card').forEach(el => observer.observe(el));
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      if (isSearching || projects.length <= 6) {
        loadMoreBtn.parentElement.classList.add('hidden');
      } else {
        loadMoreBtn.parentElement.classList.remove('hidden');
      }
    }
  }

  function performSearch(term) {
    if (!term) {
      grid.classList.add('is-collapsed');
      grid.classList.remove('is-expanded');
      render(allProjects);
      return;
    }

    const keywords = term.toLowerCase().split(/\s+/).filter(k => k.length > 0);
    
    const filtered = allProjects.filter(p => {
      const searchableContent = (p.name + ' ' + p.description + ' ' + p.techstack.join(' ')).toLowerCase();
      // Project must contain ALL keywords
      return keywords.every(kw => searchableContent.includes(kw));
    });

    grid.classList.remove('is-collapsed');
    grid.classList.remove('is-expanded');
    render(filtered, true, term);
  }

  try {
    const response = await fetch('public/projects/projects.json');
    if (!response.ok) throw new Error('Network response was not ok');
    allProjects = await response.json();
    
    render(allProjects);

    const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
    const queryParam = urlParams.get('searchQuery');
    
    if (queryParam) {
      const term = queryParam.toLowerCase().trim();
      if (searchInput) searchInput.value = term;
      performSearch(term);
      
      if (window.location.hash.includes('projects')) {
        setTimeout(() => {
          document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        performSearch(term);
      });
    }

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        grid.classList.remove('is-collapsed');
        grid.classList.add('is-expanded');
        loadMoreBtn.parentElement.classList.add('hidden');
      });
    }
  } catch (err) {
    console.error('Error loading projects:', err);
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 4rem 0;">Failed to load projects.</p>`;
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
      const slug = tech.toLowerCase().replace(/\.js/g, 'js').replace(/\+/g, 'plus').replace(/\s+/g, '-');
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

    grid.querySelectorAll('.skill-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    grid.querySelectorAll('.skill-card').forEach(el => observer.observe(el));
  } catch (err) {
    console.error('Error loading skills:', err);
  }
}

// Initialize everything
async function init() {
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
