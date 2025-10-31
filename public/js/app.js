// Konfigurasi Username
const GITHUB_USERNAME = 'dcodemaxz'; 

// --- CUSTOM PARTICLE JAVASCRIPT ---
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const numParticles = 80; 

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5; 
        this.speedY = Math.random() * 0.8 + 0.3; 
        this.speedX = (Math.random() - 0.5) * 0.4; 
        this.opacity = Math.random() * 0.3 + 0.1; 
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }

    update() {
        this.y += this.speedY; 
        this.x += this.speedX; 
        
        this.x += Math.sin(this.y * 0.01) * 0.05; 
        
        if (this.y > canvas.height + this.size) {
            this.reset();
            this.y = -this.size; 
        }

        if (this.x < -this.size * 2 || this.x > canvas.width + this.size * 2) {
            this.x = Math.random() * canvas.width;
        }
    }
}

function createParticles() {
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles); 
}

// --- UTILITY CACHE ---
// Cache duration: 1 jam = 60 * 60 * 1000 milidetik
const CACHE_DURATION_MS = 60 * 60 * 1000; 

const getCachedData = (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = new Date().getTime();

    // Cek apakah cache kadaluarsa
    if (now - data.timestamp > CACHE_DURATION_MS) {
        localStorage.removeItem(key); // Hapus cache kadaluarsa
        return null;
    }

    return data.value;
};

const setCacheData = (key, value) => {
    const data = {
        value: value,
        timestamp: new Date().getTime(),
    };
    localStorage.setItem(key, JSON.stringify(data));
};

// --- LOGIKA GITHUB API UNTUK PROJECTS (dengan Cache) ---
const fetchGithubProjects = async (username, count = 6) => {
    const CACHE_KEY = `github_projects_${username}`;
    const projectsContainer = document.getElementById('github-projects');

    let repos = getCachedData(CACHE_KEY);

    if (repos) {
        console.log('Fetching projects from cache...');
        renderProjects(repos, projectsContainer);
        return;
    }
    
    // Jika tidak ada cache atau cache kadaluarsa, fetch dari API
    console.log('Fetching projects from GitHub API...');
    projectsContainer.innerHTML = '<p style="text-align:center; color:var(--muted);">Loading projects from GitHub...</p>';

    try {
        const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${count}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
        
        repos = await response.json();
        setCacheData(CACHE_KEY, repos); // Simpan ke cache
        renderProjects(repos, projectsContainer);

    } catch (error) {
        console.error("Failed to fetch GitHub repositories:", error);
        projectsContainer.innerHTML = `<p style="color:red; text-align:center;">Failed to load projects from GitHub. Check API connection or rate limits.</p>`;
    }
};

// Fungsi untuk merender HTML projects
const renderProjects = (repos, container) => {
    let htmlContent = '';

    repos.forEach(repo => {
        if (repo.fork) return; 

        const language = repo.language || 'Codebase';
        
        htmlContent += `
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="proj-card card-link">
                <div style="height:140px; background:var(--muted-bg); border-radius:8px; margin-bottom:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--accent); font-size:1rem; padding:10px; text-align:center;">
                    <i class="ph-github-logo" style="font-size: 28px;"></i>
                    <span style="margin-top:5px; font-size:0.8rem;">Last update: ${new Date(repo.pushed_at).toLocaleDateString()}</span>
                </div>
                <h5 style="color:var(--accent); margin-bottom:6px">${repo.name}</h5>
                <p style="color:var(--muted); font-size:0.95rem; line-height:1.4">${repo.description || 'No description provided.'}</p>
                <div style="font-size:0.8rem; color:${repo.language ? 'var(--accent)' : 'var(--muted)'}; margin-top:8px;">
                    ${language} • ⭐ ${repo.stargazers_count}
                </div>
            </a>
        `;
    });
    
    container.innerHTML = htmlContent;
    applyRevealEffects(container.querySelectorAll('.proj-card'));
}

// --- LOGIKA GITHUB API UNTUK LANGUAGES TAB (dengan Cache) ---
const fetchGithubLanguages = async (username, count = 30) => {
    const CACHE_KEY = `github_languages_${username}`;
    const listEl = document.getElementById('language-list');
    const descEl = document.getElementById('lang-desc');

    descEl.innerText = `The percentages below are derived from the primary languages across ${username}'s ${count} most recent repositories.`;
    listEl.innerHTML = '<li>Loading language data...</li>';
    
    let repos = getCachedData(CACHE_KEY);

    if (repos) {
        console.log('Fetching languages from cache...');
        renderLanguages(repos, listEl);
        return;
    }

    // Jika tidak ada cache, fetch dari API
    console.log('Fetching languages from GitHub API...');

    try {
        const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${count}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
        
        repos = await response.json();
        setCacheData(CACHE_KEY, repos); // Simpan ke cache
        renderLanguages(repos, listEl);

    } catch (error) {
        console.error("Failed to fetch GitHub languages:", error);
        listEl.innerHTML = `<li style="color:red;">Failed to load data. (API Limit?)</li>`;
    }
};

// Fungsi untuk merender HTML languages
const renderLanguages = (repos, listEl) => {
    const languageMap = {};
    let totalUnit = 0;

    repos.forEach(repo => {
        if (repo.fork || !repo.language) return;
        const lang = repo.language;
        languageMap[lang] = (languageMap[lang] || 0) + 1;
        totalUnit += 1;
    });

    const sortedLanguages = Object.entries(languageMap)
        .map(([lang, count]) => ({
            lang,
            percent: ((count / totalUnit) * 100).toFixed(1)
        }))
        .filter(item => item.percent >= 1) 
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 10); 

    if (sortedLanguages.length === 0) {
        listEl.innerHTML = `<li>No language data could be loaded.</li>`;
        return;
    }

    let htmlContent = '';
    sortedLanguages.forEach(({ lang, percent }) => {
        htmlContent += `
            <li>
                <span>${lang}</span>
                <span class="value">${percent}%</span>
            </li>
        `;
    });
    
    listEl.innerHTML = htmlContent;
}

// --- LOGIKA TAB SKILLS ---
const switchSkillTab = (key) => {
    document.querySelectorAll('.skill-detail > div').forEach(content => {
        content.style.display = 'none';
    });
    document.querySelectorAll('.skill-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeContent = document.getElementById(key + '-content');
    if (activeContent) {
        activeContent.style.display = 'block';
    }
    document.querySelector(`.skill-tab[data-key="${key}"]`).classList.add('active');
    
    if (key === 'language') {
        fetchGithubLanguages(GITHUB_USERNAME, 30);
    }
};

// Fungsi Smooth Reveal
const applyRevealEffects = (elements) => {
    const obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
            if(e.isIntersecting && e.target.style.opacity !== '1') {
                 e.target.style.transform = 'translateY(0)', e.target.style.opacity = 1;
            }
        });
    }, { threshold: 0.08 });
    elements.forEach(el=>{
        el.style.transform = 'translateY(10px)'; 
        el.style.opacity = 0; 
        el.style.transition = 'all .6s ease';
        obs.observe(el);
    });
}

// --- FUNGSI INISIALISASI UTAMA ---
const initPage = () => {
    // 1. Partikel Canvas
    resizeCanvas(); 
    createParticles(); 
    animateParticles(); 
    window.addEventListener('resize', resizeCanvas); 

    // 2. GitHub Projects (Menggunakan logika Cache)
    fetchGithubProjects(GITHUB_USERNAME, 6); 

    // 3. Audio
    const music = document.getElementById('bgmusic');
    // Mencoba memutar audio, jika gagal (karena browser memblokir auto-play)
    music.play().catch(e => {
        // Menunggu interaksi user (klik) untuk memutar audio
        document.addEventListener('click', () => { music.play().catch(()=>{}); }, { once: true });
    });

    // 4. Tab Skills (Inisialisasi)
    document.querySelectorAll('.skill-tab').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            switchSkillTab(btn.dataset.key);
        });
    });
    // Panggil fetchGithubLanguages saat init untuk tab default
    switchSkillTab('language'); 

    // 5. Smooth Reveal pada elemen statis (Termasuk #stats)
    const staticElements = document.querySelectorAll('.card:not(#github-projects .proj-card), .featured');
    applyRevealEffects(staticElements);

    // 6. Accessibility
    document.querySelectorAll('.nav a, .icons a').forEach(el=>{
        el.addEventListener('focus', ()=> el.style.outline = '2px solid rgba(73,255,239,0.18)');
        el.addEventListener('blur', ()=> el.style.outline = 'none');
    });
};

window.addEventListener('load', initPage);