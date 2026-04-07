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

// GLOBAL DATA & HELPERS
let allProjects = [];
let isInitialLoading = true;

// THEME & SETTINGS LOADER
async function loadSettings() {
  try {
    const response = await fetch('public/data/settings.json');
    if (!response.ok) throw new Error('Settings not found');
    const data = await response.json();
    
    // Load Fonts dynamically
    if (data.theme.fonts.import_url) {
      const link = document.createElement('link');
      link.href = data.theme.fonts.import_url;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Apply Colors
    const colors = data.theme.colors;
    for (const [key, value] of Object.entries(colors)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
    
    // Apply Fonts
    const fonts = data.theme.fonts;
    for (const [key, value] of Object.entries(fonts)) {
      if (key !== 'import_url') {
        document.documentElement.style.setProperty(`--font-${key}`, value);
      }
    }
  } catch (err) {
    console.error('Error loading theme settings:', err);
  }
}

function highlightText(text, term) {
  if (!term) return text;
  const keywords = term.split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) return text;
  const pattern = keywords.map(k => k.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function performSearch(term) {
  const grid = document.getElementById('projectsGrid');
  const searchInput = document.getElementById('projectSearch');
  if (!grid) return;

  if (searchInput) searchInput.value = term;

  if (!term) {
    grid.classList.add('is-collapsed');
    grid.classList.remove('is-expanded');
    renderProjects(allProjects);
    return;
  }

  const keywords = term.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const filtered = allProjects.filter(p => {
    const searchableContent = (p.name + ' ' + p.description + ' ' + p.techstack.join(' ')).toLowerCase();
    return keywords.every(kw => searchableContent.includes(kw));
  });

  grid.classList.remove('is-collapsed');
  grid.classList.remove('is-expanded');
  renderProjects(filtered, true, term);
}

function renderProjects(projects, isSearching = false, term = '') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 4rem 0;">No projects found matching your search.</p>`;
    return;
  }

  grid.innerHTML = projects.map((p, index) => {
    const num = (index + 1).toString().padStart(2, '0');
    const bannerPath = p.banner || '';
    const bgStyle = bannerPath 
      ? `background-image: url('${bannerPath}'); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, var(--card) 0%, var(--bg) 100%);`;

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
          ${!bannerPath ? '<div class="p-vis-grid"></div>' : ''}
          ${!bannerPath ? `<div class="project-watermark">${p.name}</div>` : ''}
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

  // Handle Watermark Overflow (Precise Fill)
  grid.querySelectorAll('.project-watermark').forEach(wm => {
    const parent = wm.parentElement;
    if (!parent) return;
    
    const maxWidth = parent.offsetWidth * 0.9; // Use 90% of width
    const maxHeight = parent.offsetHeight * 0.8; // Use 80% of height
    
    const test = document.createElement('span');
    test.style.fontSize = '10px';
    test.style.visibility = 'hidden';
    test.style.position = 'absolute';
    test.style.whiteSpace = 'nowrap';
    test.style.fontFamily = 'Syne, sans-serif'; // Match heading font
    test.style.fontWeight = '800';
    test.style.textTransform = 'uppercase';
    test.innerText = wm.innerText;
    document.body.appendChild(test);
    
    const widthAt10 = test.offsetWidth;
    const heightAt10 = test.offsetHeight;
    document.body.removeChild(test);
    
    const scaleW = maxWidth / widthAt10;
    const scaleH = maxHeight / heightAt10;
    const finalScale = Math.min(scaleW, scaleH);
    
    wm.style.fontSize = (finalScale * 10) + 'px';
  });

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

// ROUTING LOGIC
function handleURLQuery() {
  const hashPart = window.location.hash;
  const queryStr = hashPart.includes('?') ? hashPart.split('?')[1] : window.location.search.substring(1);
  const urlParams = new URLSearchParams(queryStr);
  const queryParam = urlParams.get('searchQuery');

  if (queryParam) {
    performSearch(queryParam.toLowerCase().trim());
  }

  if (hashPart) {
    const targetId = hashPart.split('?')[0].substring(1);
    if (!targetId) return;
    
    // Disable observer temporarily to prevent hash fighting
    isInitialLoading = true;

    requestAnimationFrame(() => {
      setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Re-enable observer after scroll finishes
          setTimeout(() => { isInitialLoading = false; }, 800);
        }
      }, 150);
    });
  } else {
    isInitialLoading = false;
  }
}

// PROJECTS FETCH
async function loadProjects() {
  try {
    const response = await fetch('public/data/projects.json?v=' + Date.now());
    if (!response.ok) throw new Error('Network response was not ok');
    allProjects = await response.json();
    renderProjects(allProjects);
    
    // Double check overflow after initial paint (Precise Fill)
    setTimeout(() => {
        const watermarks = document.querySelectorAll('.project-watermark');
        watermarks.forEach(wm => {
            const parent = wm.parentElement;
            if (!parent) return;
            const maxWidth = parent.offsetWidth * 0.9;
            const maxHeight = parent.offsetHeight * 0.8;
            
            const test = document.createElement('span');
            test.style.fontSize = '10px';
            test.style.visibility = 'hidden';
            test.style.position = 'absolute';
            test.style.whiteSpace = 'nowrap';
            test.style.fontFamily = 'Syne, sans-serif';
            test.style.fontWeight = '800';
            test.style.textTransform = 'uppercase';
            test.innerText = wm.innerText;
            document.body.appendChild(test);
            
            const widthAt10 = test.offsetWidth;
            const heightAt10 = test.offsetHeight;
            document.body.removeChild(test);
            
            const scaleW = maxWidth / widthAt10;
            const scaleH = maxHeight / heightAt10;
            const finalScale = Math.min(scaleW, scaleH);
            
            wm.style.fontSize = (finalScale * 10) + 'px';
        });
    }, 100);
  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

// SKILLS DYNAMIC RANKING
async function loadSkills() {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;

  try {
    const response = await fetch('public/data/projects.json?v=' + Date.now());
    const projects = await response.json();

    const techCounts = {};
    projects.forEach(p => {
      p.techstack.forEach(tech => {
        const t = tech.toLowerCase().trim();
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });

    const sortedTech = Object.entries(techCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

    grid.innerHTML = sortedTech.map(([tech, count]) => {
      const slug = tech.toLowerCase().replace(/\.js/g, 'js').replace(/\+/g, 'plus').replace(/\s+/g, '-');
      const iconUrl = `https://cdn.simpleicons.org/${slug}`;

      return `
        <div class="skill-card reveal" data-tech="${tech}">
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
      el.addEventListener('click', () => {
        const tech = el.getAttribute('data-tech');
        window.location.href = `#projects?searchQuery=${encodeURIComponent(tech)}`;
        window.location.reload(); 
      });
    });

    grid.querySelectorAll('.skill-card').forEach(el => observer.observe(el));
  } catch (err) {
    console.error('Error loading skills:', err);
  }
}

// SECTION OBSERVER (Hash Sync & Nav Active State)
const sectionObserver = new IntersectionObserver((entries) => {
  if (isInitialLoading) return;

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      if (!id) return;

      const newHashBase = id === 'hero' ? '#' : `#${id}`;
      
      // ONLY keep searchQuery if we are actually looking at the projects section
      const currentHash = window.location.hash;
      const queryPart = (id === 'projects' && currentHash.includes('?')) 
        ? '?' + currentHash.split('?')[1] 
        : '';
      
      history.replaceState(null, null, newHashBase + queryPart);
      
      document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${id}`);
      });
    }
  });
}, { threshold: 0.6 });

// Initialize everything
async function init() {
  // Load settings first for theme application
  await loadSettings();
  
  document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  
  // Wait for all data to load before handling routing
  await Promise.all([loadProjects(), loadSkills()]);
  
  handleURLQuery();

  // Search Input Listener
  const searchInput = document.getElementById('projectSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value.toLowerCase().trim());
    });
  }

  // Load More Logic
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const grid = document.getElementById('projectsGrid');
      grid.classList.remove('is-collapsed');
      grid.classList.add('is-expanded');
      loadMoreBtn.parentElement.classList.add('hidden');
    });
  }
}

init();

// Handle back/forward navigation
window.addEventListener('popstate', () => {
  isInitialLoading = false; 
  handleURLQuery();
});

// PARALLAX ORBS
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (orb1) orb1.style.transform = `translate(${y*0.05}px, ${y*0.08}px)`;
  if (orb2) orb2.style.transform = `translate(${-y*0.03}px, ${-y*0.05}px)`;
}, { passive: true });
