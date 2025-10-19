(() => {
    'use strict';


    const CONFIG = {
        THEME_KEY: 'theme',
        SCORES_KEY: 'leaderboardScores',
        PENDING_SCORE_KEY: 'pendingScore',
        DEFAULT_THEME: 'dark',
        LAZY_LOAD_MARGIN: '100px',
        LAZY_LOAD_THRESHOLD: 0.1,
        PARTICLE_COUNT_MOBILE: 30,
        PARTICLE_COUNT_DESKTOP: 50,
        PARTICLE_DISTANCE: 150,
        LEADERBOARD_PER_PAGE: 10,
        LEADERBOARD_MAX_SCORES: 100,
        STAT_ANIMATION_DURATION: 2000,
        QUIZ_QUESTIONS: 10,
        HEADER_SCROLL_THRESHOLD: 100,
        SCROLL_OFFSET: 80
    };

    

    const SELECTORS = {
        themeToggle: '#theme-toggle',
        mobileToggle: '.mobile-menu-toggle',
        navLinks: '.nav-links',
        header: '.site-header',
        progressBar: '.scroll-progress-bar',
        customCursor: '.custom-cursor',
        particleCanvas: '.particle-network',
        heroContainer: '#hero-canvas-container',
        protocolNode: '.protocol-node',
        ecosystemInfo: '#ecosystem-info',
        statNumber: '.stat-number',
        quizContent: '#quiz-content',
        leaderboardBody: '#leaderboard-body',
        timelineItem: '.timeline-item'
    };

    // ================================================================
    // UTILITY FUNCTIONS
    // ================================================================
    const Utils = {
        debounce: (fn, ms) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) } },
        throttle: (fn, ms) => { let inThrottle; return (...args) => { if (!inThrottle) { fn.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, ms) } } },
        qs: (s, p = document) => p.querySelector(s),
        qsa: (s, p = document) => [...p.querySelectorAll(s)],
        addClass: (el, c) => el?.classList.add(c),
        removeClass: (el, c) => el?.classList.remove(c),
        toggleClass: (el, c) => el?.classList.toggle(c),
        hasClass: (el, c) => el?.classList.contains(c),
        setAttr: (el, k, v) => el?.setAttribute(k, v),
        getAttr: (el, k) => el?.getAttribute(k),
        setCSSVar: (k, v) => document.documentElement.style.setProperty(k, v),
        getCSSVar: (k) => getComputedStyle(document.documentElement).getPropertyValue(k).trim(),
        escapeHtml: (t) => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML },
        formatDate: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        getInitials: (n) => { const p = n.trim().split(' '); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : n.substring(0, 2).toUpperCase() },
        isInViewport: (el) => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.left >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight) && r.right <= (window.innerWidth || document.documentElement.clientWidth) },
        smoothScroll: (target, offset = CONFIG.SCROLL_OFFSET) => { const el = typeof target === 'string' ? Utils.qs(target) : target; if (!el) return; const pos = el.getBoundingClientRect().top + window.pageYOffset - offset; window.scrollTo({ top: pos, behavior: 'smooth' }) },
        storage: {
            get: (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
            set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { console.error('Storage error:', e) } },
            remove: (k) => localStorage.removeItem(k)
        }
    };

    // ================================================================
    // CORE APP CLASS
    // ================================================================
    class App {
        constructor() {
            this.modules = {};
            this.init();
        }

        init() {
            this.initCoreModules();
            this.lazyLoadModules();
            window.app = this;
            this.logSuccess();
        }

        initCoreModules() {
            this.modules.theme = new ThemeToggle();
            this.modules.mobileNav = new MobileNav();
            this.modules.scrollProgress = new ScrollProgress();
            this.modules.header = new HeaderScroll();
            this.modules.cursor = new CustomCursor();
            this.modules.particles = new ParticleNetwork();
            this.modules.hero3D = new ThreeJSHero();
            this.modules.smoothScroll = new SmoothScroll();
            this.modules.lazyImages = new LazyImages();
        }

        lazyLoadModules() {
            const obs = new IntersectionObserver((entries, observer) => {
                entries.forEach(e => {
                    if (!e.isIntersecting) return;
                    const id = e.target.id;
                    const moduleMap = {
                        ecosystem: () => this.modules.ecosystem = new EcosystemExplorer(),
                        stats: () => this.modules.stats = new AnimatedStats(),
                        quiz: () => this.modules.quiz = new QuizSystem(),
                        leaderboard: () => this.modules.leaderboard = new LeaderboardSystem(),
                        roadmap: () => this.modules.roadmap = new RoadmapAnimations()
                    };
                    if (moduleMap[id] && !this.modules[id]) {
                        moduleMap[id]();
                        observer.unobserve(e.target);
                    }
                });
            }, { rootMargin: CONFIG.LAZY_LOAD_MARGIN, threshold: CONFIG.LAZY_LOAD_THRESHOLD });

            ['ecosystem', 'stats', 'quiz', 'leaderboard', 'roadmap'].forEach(id => {
                const el = Utils.qs(`#${id}`);
                if (el) obs.observe(el);
            });
        }

        destroy() {
            if (this.modules.hero3D?.dispose) {
                this.modules.hero3D.dispose();
            }
            if (this.modules.particles?.destroy) {
                this.modules.particles.destroy();
            }
        }

        logSuccess() {
            console.log('%c🪁 Kite AI V2 Loaded', 'color:#64ffda;font-size:16px;font-weight:bold');
            console.log('%cKonami Code: ↑↑↓↓←→←→BA', 'color:#a8b2d1;font-style:italic');
        }
    }

    // ================================================================
    // THEME TOGGLE MODULE
    // ================================================================
    class ThemeToggle {
        constructor() {
            this.btn = Utils.qs(SELECTORS.themeToggle);
            this.html = document.documentElement;
            if (!this.btn) return;
            this.init();
        }

        init() {
            const saved = Utils.storage.get(CONFIG.THEME_KEY) || CONFIG.DEFAULT_THEME;
            this.html.setAttribute('data-theme', saved);
            this.btn.addEventListener('click', () => this.toggle());
        }

        toggle() {
            const current = this.html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            this.html.setAttribute('data-theme', newTheme);
            Utils.storage.set(CONFIG.THEME_KEY, newTheme);
            this.btn.style.transform = 'rotate(360deg)';
            setTimeout(() => this.btn.style.transform = '', 400);
        }
    }

    // ================================================================
    // MOBILE NAVIGATION MODULE
    // ================================================================
    class MobileNav {
        constructor() {
            this.toggle = Utils.qs(SELECTORS.mobileToggle);
            this.nav = Utils.qs(SELECTORS.navLinks);
            if (!this.toggle || !this.nav) return;
            this.init();
        }

        init() {
            this.toggle.addEventListener('click', e => { e.stopPropagation(); this.toggleMenu() });
            Utils.qsa('a', this.nav).forEach(a => a.addEventListener('click', () => this.close()));
            document.addEventListener('click', e => { if (!e.target.closest('.main-nav') && Utils.hasClass(this.nav, 'active')) this.close() });
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && Utils.hasClass(this.nav, 'active')) this.close() });
        }

        toggleMenu() {
            const active = Utils.toggleClass(this.nav, 'active');
            Utils.toggleClass(this.toggle, 'active');
            Utils.setAttr(this.toggle, 'aria-expanded', active);
            document.body.style.overflow = active ? 'hidden' : '';
        }

        close() {
            Utils.removeClass(this.nav, 'active');
            Utils.removeClass(this.toggle, 'active');
            Utils.setAttr(this.toggle, 'aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    // ================================================================
    // SCROLL PROGRESS MODULE
    // ================================================================
    class ScrollProgress {
        constructor() {
            this.bar = Utils.qs(SELECTORS.progressBar);
            this.ticking = false;
            if (!this.bar) return;
            window.addEventListener('scroll', () => this.request(), { passive: true });
        }

        request() {
            if (!this.ticking) {
                requestAnimationFrame(() => this.update());
                this.ticking = true;
            }
        }

        update() {
            const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
            this.bar.style.width = `${pct}%`;
            Utils.setAttr(this.bar, 'aria-valuenow', Math.round(pct));
            this.ticking = false;
        }
    }

    // ================================================================
    // HEADER SCROLL MODULE
    // ================================================================
    class HeaderScroll {
        constructor() {
            this.header = Utils.qs(SELECTORS.header);
            if (!this.header) return;
            window.addEventListener('scroll', () => this.handle(), { passive: true });
        }

        handle() {
            window.pageYOffset > CONFIG.HEADER_SCROLL_THRESHOLD ? Utils.addClass(this.header, 'scrolled') : Utils.removeClass(this.header, 'scrolled');
        }
    }

    // ================================================================
    // CUSTOM CURSOR MODULE
    // ================================================================
    class CustomCursor {
        constructor() {
            this.cursor = Utils.qs(SELECTORS.customCursor);
            if (!this.cursor || !window.matchMedia("(pointer:fine)").matches) {
                if (this.cursor) this.cursor.style.display = 'none';
                return;
            }
            this.init();
        }

        init() {
            document.addEventListener('mousemove', e => {
                requestAnimationFrame(() => {
                    this.cursor.style.left = `${e.clientX}px`;
                    this.cursor.style.top = `${e.clientY}px`;
                });
            });
            this.updateElements();
        }

        updateElements() {
            Utils.qsa('a,button,.protocol-node,.options li,.stat-card,.insight-card,.timeline-item,.leaderboard-entry,.tab-btn,.pagination-btn').forEach(el => {
                el.addEventListener('mouseenter', () => Utils.addClass(this.cursor, 'hover'));
                el.addEventListener('mouseleave', () => Utils.removeClass(this.cursor, 'hover'));
            });
        }
    }

    // ================================================================
    // PARTICLE NETWORK MODULE
    // ================================================================
    class ParticleNetwork {
        constructor() {
            this.canvas = Utils.qs(SELECTORS.particleCanvas);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.count = window.innerWidth < 768 ? CONFIG.PARTICLE_COUNT_MOBILE : CONFIG.PARTICLE_COUNT_DESKTOP;
            this.distance = CONFIG.PARTICLE_DISTANCE;
            this.mouse = { x: null, y: null };
            this.animId = null;
            this.init();
        }

        init() {
            this.resize();
            this.create();
            this.animate();
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY });
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            const newCount = window.innerWidth < 768 ? CONFIG.PARTICLE_COUNT_MOBILE : CONFIG.PARTICLE_COUNT_DESKTOP;
            if (newCount !== this.count) {
                this.count = newCount;
                this.particles = [];
                this.create();
            }
        }

        create() {
            for (let i = 0; i < this.count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    r: Math.random() * 2 + 1
                });
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const color = Utils.getCSSVar('--brand-rgb');
            this.particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
                if (this.mouse.x && this.mouse.y) {
                    const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) { p.x -= dx * 0.01; p.y -= dy * 0.01 }
                }
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${color},0.6)`;
                this.ctx.fill();
                this.particles.slice(i + 1).forEach(p2 => {
                    const dx = p.x - p2.x, dy = p.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.distance) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(${color},${0.3 * (1 - dist / this.distance)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            });
            this.animId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animId) cancelAnimationFrame(this.animId);
        }
    }


    // ================================================================
    // THREE.JS HERO MODULE
    // ================================================================
    class ThreeJSHero {
        constructor() {
            this.container = Utils.qs(SELECTORS.heroContainer);
            if (!this.container || typeof THREE === 'undefined') return;
            this.init();
        }

        init() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            const geo = new THREE.IcosahedronGeometry(2, 1);
            const mat = new THREE.MeshBasicMaterial({ color: 0x64ffda, wireframe: true, transparent: true, opacity: 0.8 });
            this.mesh = new THREE.Mesh(geo, mat);
            this.scene.add(this.mesh);
            this.camera.position.z = 5;

            this.mouse = new THREE.Vector2();
            this.mouseMoveHandler = e => {
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            };
            window.addEventListener('mousemove', this.mouseMoveHandler);

            this.resizeHandler = () => this.resize();
            window.addEventListener('resize', this.resizeHandler);

            this.animate();
        }

        resize() {
            if (!this.container) return;
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        animate() {
            this.animId = requestAnimationFrame(() => this.animate());
            this.mesh.rotation.x += 0.001 + (this.mouse.y * 0.003);
            this.mesh.rotation.y += 0.001 + (this.mouse.x * 0.003);
            this.mesh.position.y = Math.sin(Date.now() * 0.001) * 0.2;
            this.renderer.render(this.scene, this.camera);
        }

        dispose() {
            if (this.animId) cancelAnimationFrame(this.animId);
            if (this.mesh) {
                this.mesh.geometry.dispose();
                this.mesh.material.dispose();
            }
            if (this.renderer) {
                this.renderer.dispose();
                if (this.container && this.renderer.domElement) {
                    this.container.removeChild(this.renderer.domElement);
                }
            }
            window.removeEventListener('resize', this.resizeHandler);
            window.removeEventListener('mousemove', this.mouseMoveHandler);
        }
    }

    // ================================================================
    // ECOSYSTEM EXPLORER MODULE
    // ================================================================
    class EcosystemExplorer {
        constructor() {
            this.nodes = Utils.qsa(SELECTORS.protocolNode);
            this.panel = Utils.qs(SELECTORS.ecosystemInfo);
            this.active = null;
            this.locked = false;

            this.data = {
                bitmind: { title: "BitMind: Deepfake Detection", desc: "The guardian of truth. BitMind uses decentralized AI to detect and authenticate digital media, ensuring trust in agent interactions. Powered by advanced ML models and zero-knowledge proofs." },
                nubila: { title: "Nubila: Multi-Agent Cloud", desc: "The nervous system. Nubila orchestrates autonomous agents across distributed clouds, enabling seamless collaboration and resource allocation. Supports dynamic scaling and cross-chain communication." },
                apro: { title: "APRO: Data Oracle", desc: "The bridge to reality. APRO delivers verified, tamper-proof real-world data feeds to agents, from financial tickers to IoT sensors. Ensures data integrity through cryptographic verification." },
                app: { title: "APP: Agent Payments Protocol", desc: "The economic engine. APP is a secure Layer 2 protocol for agent-to-agent micropayments, enabling a frictionless agent economy. Features instant settlements and minimal gas fees." },
                carv: { title: "CARV: Gaming & Identity", desc: "The digital soul. CARV manages tokenized identities and data for agents, allowing them to own their digital personas across metaverses. Supports decentralized reputation systems." }
            };

            this.connections = {
                bitmind: ['nubila', 'app'],
                nubila: ['bitmind', 'apro', 'app', 'carv'],
                apro: ['nubila'],
                app: ['bitmind', 'nubila', 'carv'],
                carv: ['nubila', 'app']
            };

            this.init();
        }

        init() {
            if (!this.nodes.length) return;
            this.resetPanel();

            this.nodes.forEach(n => {
                n.addEventListener('mouseenter', e => { if (!this.locked) this.onHover(e) });
                n.addEventListener('mouseleave', () => { if (!this.locked) this.onLeave() });
                n.addEventListener('click', e => {
                    e.stopPropagation();
                    const id = Utils.getAttr(e.currentTarget, 'data-protocol');
                    this.active === id && this.locked ? this.unlock() : this.lock(e);
                });
                n.addEventListener('focus', e => { if (!this.locked) this.onHover(e) });
                n.addEventListener('blur', () => { if (!this.locked) this.onLeave() });
                Utils.setAttr(n, 'tabindex', '0');
                Utils.setAttr(n, 'role', 'button');
                Utils.setAttr(n, 'aria-label', `Explore ${Utils.getAttr(n, 'data-protocol')} protocol`);
            });

            document.addEventListener('click', e => {
                if (!e.target.closest('.protocol-node') && !e.target.closest('.ecosystem-info') && this.locked) this.unlock();
            });
        }

        onHover(e) {
            const id = Utils.getAttr(e.currentTarget, 'data-protocol');
            const conn = this.connections[id] || [];
            this.active = id;
            this.updatePanel(id);
            this.highlight(id, conn);
        }

        onLeave() {
            this.active = null;
            this.resetPanel();
            this.resetNodes();
        }

        lock(e) {
            const id = Utils.getAttr(e.currentTarget, 'data-protocol');
            const conn = this.connections[id] || [];
            this.locked = true;
            this.active = id;
            this.updatePanel(id, true);
            this.highlight(id, conn);
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand)';
        }

        unlock() {
            this.locked = false;
            this.active = null;
            this.nodes.forEach(n => n.style.boxShadow = '');
            this.resetPanel();
            this.resetNodes();
        }

        highlight(activeId, connIds) {
            this.nodes.forEach(n => {
                const nId = Utils.getAttr(n, 'data-protocol');
                Utils.removeClass(n, 'highlight');
                Utils.removeClass(n, 'connected');
                Utils.removeClass(n, 'dimmed');
                if (nId === activeId) Utils.addClass(n, 'highlight');
                else if (connIds.includes(nId)) Utils.addClass(n, 'connected');
                else Utils.addClass(n, 'dimmed');
            });
        }

        resetNodes() {
            this.nodes.forEach(n => {
                Utils.removeClass(n, 'highlight');
                Utils.removeClass(n, 'connected');
                Utils.removeClass(n, 'dimmed');
                n.style.boxShadow = '';
            });
        }

        updatePanel(id, locked = false) {
            if (!this.panel || !this.data[id]) return;
            this.panel.style.opacity = '0';
            this.panel.style.transform = 'translateY(10px)';
            setTimeout(() => {
                const hint = locked ? '<p style="font-size:0.9rem;color:var(--brand);margin-top:1rem;">🔒 Locked. Click again to unlock.</p>' : '<p style="font-size:0.9rem;color:var(--text-tertiary);margin-top:1rem;">💡 Click to lock this view.</p>';
                this.panel.innerHTML = `<h3>${this.data[id].title}</h3><p>${this.data[id].desc}</p>${hint}`;
                this.panel.style.transition = 'opacity 0.3s ease,transform 0.3s ease';
                this.panel.style.opacity = '1';
                this.panel.style.transform = 'translateY(0)';
            }, 150);
        }

        resetPanel() {
            if (!this.panel) return;
            this.panel.style.opacity = '0';
            this.panel.style.transform = 'translateY(10px)';
            setTimeout(() => {
                this.panel.innerHTML = '<h3>🌐 Decentralized AI Ecosystem</h3><p>Hover over any protocol to explore its connections and learn how they work together to power autonomous agents.</p><p style="font-size:0.9rem;color:var(--text-tertiary);margin-top:1rem;">💡 Click to lock the selection.</p>';
                this.panel.style.transition = 'opacity 0.3s ease,transform 0.3s ease';
                this.panel.style.opacity = '1';
                this.panel.style.transform = 'translateY(0)';
            }, 150);
        }
    }

    // ================================================================
    // ANIMATED STATS MODULE
    // ================================================================
    class AnimatedStats {
        constructor() {
            this.stats = Utils.qsa(SELECTORS.statNumber);
            this.animated = false;
            this.observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting && !this.animated) {
                        this.animateAll();
                        this.animated = true;
                    }
                });
            }, { threshold: 0.5 });
            this.init();
        }

        init() {
            const section = Utils.qs('#stats');
            if (section) this.observer.observe(section);
        }

        animateAll() {
            this.stats.forEach((s, i) => setTimeout(() => this.animate(s), i * 100));
        }

        animate(el) {
            const target = parseFloat(Utils.getAttr(el, 'data-target'));
            const suffix = Utils.getAttr(el, 'data-suffix') || '';
            const duration = CONFIG.STAT_ANIMATION_DURATION;
            const start = performance.now();
            const isDec = target % 1 !== 0;

            const step = current => {
                const elapsed = current - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                const val = eased * target;

                if (isDec) el.textContent = val.toFixed(1) + suffix;
                else if (target >= 1000) el.textContent = Math.floor(val).toLocaleString() + suffix;
                else el.textContent = Math.floor(val) + suffix;

                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = (isDec ? target.toFixed(1) : target.toLocaleString()) + suffix;
            };
            requestAnimationFrame(step);
        }
    }

    // ================================================================
    // QUIZ SYSTEM MODULE
    // ================================================================
    class QuizSystem {
        constructor() {
            this.questions = [
                { q: "What is the primary issue with the current internet design?", o: ["It is optimized for machines but lacks human interaction.", "It is designed only for humans, leading to challenges in identity, trust, and payments for AI agents.", "It supports too many AI agents, causing scalability issues.", "It has excessive fees for micropayments."], c: 1, e: "Today's internet is designed only for humans, creating challenges for AI agents in identity, trust, and payments." },
                { q: "What is Kite described as?", o: ["A Layer-2 scaling solution for Ethereum.", "An EVM-compatible Layer-1 blockchain for AI and the agentic internet.", "A centralized database for AI models.", "A payment gateway for human users."], c: 1, e: "Kite is an EVM-compatible Layer-1 blockchain focused on AI and the agentic internet." },
                { q: "Which feature of Kite's Agent Native Identity & Auth allows agents to login to any app using a portable identity?", o: ["Reputation-based sharing.", "Interoperable interactions.", "Portable identity, similar to using Gmail everywhere.", "Cryptographic M×N auth maze."], c: 2, e: "Portable identity enables agents to log in to any app seamlessly, like using Gmail universally." },
                { q: "What does Agent Native Governance in Kite primarily enable?", o: ["Instant micropayments between machines.", "Programmable permissions for autonomous agent execution with context-aware controls.", "Portable logins across services.", "High-throughput block production."], c: 1, e: "It provides programmable permissions and context-aware authorization for autonomous agents." },
                { q: "How does Kite handle Agent Native Payments?", o: ["Through high-fee, traditional banking integrations.", "With instant, stablecoin-native settlements for machine-to-machine micropayments and near-zero fees.", "By requiring repeated sign-ups for each transaction.", "Using only fiat currencies for scalability."], c: 1, e: "Kite uses instant, stablecoin-native settlements with near-zero fees for micropayments." },
                { q: "What is a core principle of Kite's architecture?", o: ["Rigidity to ensure security.", "Modularity, allowing developers to pick and use different components flexibly.", "Centralization for faster development.", "Exclusion of EVM compatibility."], c: 1, e: "Modularity allows flexible selection of components in Kite's architecture." },
                { q: "Which consensus mechanism is part of Kite's Base Layer?", o: ["Proof of Stake.", "Proof of Work.", "Proof of AI.", "Proof of Authority."], c: 2, e: "Kite's Base Layer includes Proof of AI consensus." },
                { q: "What is the Kite AIR Platform?", o: ["A hardware device for AI training.", "The complete AI agent ecosystem with MCP integration and AI-optimized tooling.", "A payment protocol for DeFi.", "A governance tool for blockchain nodes."], c: 1, e: "The Kite AIR Platform is a complete ecosystem for AI agents with MCP integration." },
                { q: "What benefit does Kite's Sovereign L1 Blockchain provide for AI applications?", o: ["Increased latency for security.", "High throughput, scalability, and reduced latency optimized for complex AI models.", "Reliance on Layer-2 solutions only.", "Exclusion of integrated compute resources."], c: 1, e: "It offers high throughput, scalability, low latency, and optimizations for AI models." },
                { q: "Which group is NOT listed as a target audience for Kite?", o: ["AI Users & Researchers.", "Blockchain Developers.", "Traditional Web2 App Developers.", "Web3 Innovators."], c: 2, e: "Target audiences include AI users, blockchain developers, and Web3 innovators, but not traditional Web2 developers." }
            ];

            this.current = 0;
            this.score = 0;
            this.startTime = null;
            this.cacheElements();
            this.init();
        }

        cacheElements() {
            this.el = {
                progress: Utils.qs('.progress-bar'),
                fill: Utils.qs('#progress-fill'),
                question: Utils.qs('#question'),
                options: Utils.qs('#options'),
                nextBtn: Utils.qs('#next-btn'),
                explanation: Utils.qs('#explanation'),
                content: Utils.qs(SELECTORS.quizContent)
            };
        }

        init() {
            if (!this.el.question) return;
            this.startTime = Date.now();
            this.load();
            this.el.nextBtn.addEventListener('click', () => this.next());
        }

        load() {
            this.reset();
            const q = this.questions[this.current];
            this.el.question.textContent = q.q;

            q.o.forEach((opt, idx) => {
                const li = document.createElement('li');
                li.textContent = opt;
                Utils.setAttr(li, 'role', 'radio');
                Utils.setAttr(li, 'aria-checked', 'false');
                Utils.setAttr(li, 'tabindex', '0');

                li.addEventListener('click', () => this.select(idx, li));
                li.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.select(idx, li);
                    }
                });

                this.el.options.appendChild(li);
            });

            this.updateProgress();

            if (window.app?.modules?.cursor) window.app.modules.cursor.updateElements();
        }

        select(idx, el) {
            if (Utils.hasClass(this.el.options, 'answered')) return;

            Utils.addClass(this.el.options, 'answered');
            [...this.el.options.children].forEach(li => {
                li.style.pointerEvents = 'none';
                Utils.setAttr(li, 'aria-disabled', 'true');
            });

            const q = this.questions[this.current];
            const correct = idx === q.c;

            if (correct) {
                this.score++;
                Utils.addClass(el, 'correct');
                Utils.setAttr(el, 'aria-checked', 'true');

            } else {
                Utils.addClass(el, 'incorrect');
                Utils.setAttr(el, 'aria-checked', 'false');
                Utils.addClass(this.el.options.children[q.c], 'correct');
                Utils.setAttr(this.el.options.children[q.c], 'aria-checked', 'true');
            }

            this.el.explanation.textContent = q.e;
            this.el.explanation.style.display = 'block';
            this.el.nextBtn.disabled = false;
            this.el.nextBtn.focus();
        }

        next() {
            this.current++;
            this.current < this.questions.length ? this.load() : this.showResults();
        }

        reset() {
            this.el.options.innerHTML = '';
            Utils.removeClass(this.el.options, 'answered');
            this.el.explanation.textContent = '';
            this.el.explanation.style.display = 'none';
            this.el.nextBtn.disabled = true;
        }

        updateProgress() {
            const pct = (this.current / this.questions.length) * 100;
            this.el.fill.style.width = `${pct}%`;
            Utils.setAttr(this.el.progress, 'aria-valuenow', Math.round(pct));
        }

        showResults() {
            this.el.fill.style.width = '100%';
            Utils.setAttr(this.el.progress, 'aria-valuenow', '100');

            const time = Math.round((Date.now() - this.startTime) / 1000);
            const pct = Math.round((this.score / this.questions.length) * 100);

            let msg = '', emoji = '';
            if (pct === 100) { msg = "Perfect score! You're an agentic AI expert! 🎉"; emoji = "🏆" }
            else if (pct >= 80) { msg = "Excellent! You have a strong understanding of the ecosystem!"; emoji = "⭐" }
            else if (pct >= 60) { msg = "Good job! Keep learning about the agentic future!"; emoji = "👍" }
            else { msg = "Keep exploring! There's so much to discover!"; emoji = "📚" }

            this.el.content.innerHTML = `
            <div class="result">
                <div class="stat-icon" style="font-size:5rem;margin-bottom:1rem;">${emoji}</div>
                <h2>Quiz Complete!</h2>
                <p>${msg}</p>
                <p style="font-size:2rem;font-weight:700;color:var(--brand);margin:2rem 0;">
                    ${this.score}/${this.questions.length} <span style="font-size:1.2rem;">(${pct}%)</span>
                </p>
                <p style="font-size:1.2rem;color:var(--text-secondary);margin-bottom:2rem;">
                    ⏱️ Time: ${time}s
                </p>
                <button class="btn btn-primary" id="submit-score-btn">
                    <span>Submit to Leaderboard</span>
                </button>
                <button class="btn btn-secondary" onclick="location.reload()" style="margin-left:1rem;">
                    <span>Try Again</span>
                </button>
            </div>
        `;

            const submitBtn = Utils.qs('#submit-score-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.submit(this.score, time, pct));
            }
        }

        submit(score, time, pct) {
            const name = prompt("Enter your name for the leaderboard:", "Anonymous");
            if (!name) return;

            const data = {
                name: name,
                score: score,
                totalQuestions: this.questions.length,
                percentage: pct,
                time: time,
                date: new Date().toISOString()
            };

            if (window.app?.modules?.leaderboard) {
                try {
                    window.app.modules.leaderboard.addScore(data);
                    Utils.smoothScroll('#leaderboard');
                } catch (error) {
                    console.error('Submit error:', error);
                    alert('❌ Failed to submit. Please try again.');
                    return;
                }
            } else {
                Utils.storage.set(CONFIG.PENDING_SCORE_KEY, data);
                alert('🎉 Score saved! Scroll down to see the leaderboard.');
            }
        }
    }

    // ================================================================
    // LEADERBOARD SYSTEM MODULE (FIXED FIREBASE VERSION)
    // ================================================================
    class LeaderboardSystem {
        constructor() {
            this.period = 'all-time';
            this.page = 1;
            this.perPage = CONFIG.LEADERBOARD_PER_PAGE;
            this.all = [];
            this.filtered = [];
            this.search = '';
            this.db = null;
            this.cacheElements();
            this.init();
        }
        
        cacheElements() {
            this.el = {
                body: Utils.qs(SELECTORS.leaderboardBody),
                search: Utils.qs('#leaderboard-search'),
                tabs: Utils.qsa('.tab-btn'),
                prev: Utils.qs('#prev-page'),
                next: Utils.qs('#next-page'),
                currentPage: Utils.qs('#current-page'),
                totalPages: Utils.qs('#total-pages'),
                userPos: Utils.qs('#user-position'),
                userRank: Utils.qs('#user-rank'),
                userScore: Utils.qs('#user-score'),
                userTime: Utils.qs('#user-time')
            };
        }
        
        init() {
            if (!this.el.body) return;
            
            // ✅ FIXED: Wait for Firebase to be ready
            this.waitForFirebase().then(() => {
                this.loadScores();
                this.checkPending();
                this.setupEvents();
            });
        }
        
        // ✅ NEW: Wait for Firebase initialization
        waitForFirebase() {
            return new Promise((resolve) => {
                if (window.firebaseReady) {
                    this.db = window.db || null;
                    resolve();
                    return;
                }
                
                // Poll every 100ms for up to 5 seconds
                let attempts = 0;
                const maxAttempts = 50;
                
                const checkInterval = setInterval(() => {
                    attempts++;
                    
                    if (window.firebaseReady) {
                        clearInterval(checkInterval);
                        this.db = window.db || null;
                        if (window.firebaseError) {
                            console.warn('Firebase error detected:', window.firebaseError);
                        }
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        console.error('❌ Firebase timeout after 5 seconds');
                        resolve(); // Resolve anyway to use sample data
                    }
                }, 100);
            });
        }
        
        setupEvents() {
            this.el.tabs.forEach(btn => {
                btn.addEventListener('click', e => {
                    this.el.tabs.forEach(b => Utils.removeClass(b, 'active'));
                    Utils.addClass(e.target, 'active');
                    this.period = Utils.getAttr(e.target, 'data-period');
                    this.page = 1;
                    this.filterByPeriod();
                    this.render();
                });
            });
            
            if (this.el.search) {
                this.el.search.addEventListener('input', Utils.debounce(e => {
                    this.search = e.target.value.toLowerCase();
                    this.page = 1;
                    this.filter();
                    this.render();
                }, 300));
            }
            
            if (this.el.prev) {
                this.el.prev.addEventListener('click', () => {
                    if (this.page > 1) {
                        this.page--;
                        this.render();
                        this.scrollToTop();
                    }
                });
            }
            
            if (this.el.next) {
                this.el.next.addEventListener('click', () => {
                    const total = Math.ceil(this.filtered.length / this.perPage);
                    if (this.page < total) {
                        this.page++;
                        this.render();
                        this.scrollToTop();
                    }
                });
            }
        }
        
loadScores() {
    if (!this.db) {
        console.error('❌ Firebase not initialized - leaderboard will be empty');
        this.all = [];
        this.filterByPeriod();
        this.render();
        return;
    }
    
    if (this.el.body) {
        this.el.body.innerHTML = '<div class="leaderboard-loading"><div class="loading-spinner"></div><p>Loading global leaderboard...</p></div>';
    }
    
    const timeout = setTimeout(() => {
        console.warn('⚠️ Firebase query timeout');
        this.all = [];
        this.filterByPeriod();
        this.render();
    }, 10000);
    
    // ✅ OPTIMIZED: Uses composite index (score DESC + time ASC)
    this.db.collection('leaderboard')
        .orderBy('score', 'desc')
        .orderBy('time', 'asc')
        .limit(100)
        .get()
        .then(snapshot => {
            clearTimeout(timeout);
            this.all = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Convert Firestore Timestamp to ISO string
                if (data.date && data.date.toDate) {
                    data.date = data.date.toDate().toISOString();
                } else if (!data.date) {
                    data.date = new Date().toISOString();
                }
                
                this.all.push(data);
            });
            
            console.log(`✅ Loaded ${this.all.length} scores from Firebase (using composite index)`);
            
            this.filterByPeriod();
            this.render();
        })
        .catch(error => {
            clearTimeout(timeout);
            console.error('❌ Firestore Error:', error.code, error.message);
            
            if (this.el.body) {
                this.el.body.innerHTML = `
                    <div class="leaderboard-empty">
                        <div class="leaderboard-empty-icon">⚠️</div>
                        <h3>Connection Error</h3>
                        <p style="color:var(--error);font-size:0.9rem;margin:1rem 0;">
                            ${error.message}
                        </p>
                        <p style="font-size:0.85rem;color:var(--text-tertiary);">
                            Error Code: ${error.code}
                        </p>
                        <button class="btn btn-secondary" onclick="location.reload()" style="margin-top:1.5rem;">
                            <span>Retry</span>
                        </button>
                    </div>
                `;
            }
            
            this.all = [];
            this.filterByPeriod();
            this.updatePagination();
        });
}
        
        // ========== FIXED: Save to Firebase with better validation ==========
        addScore(data) {
            if (!this.db) {
                console.error('❌ Firebase not initialized!');
                alert('Cannot save score - database not connected. Your score will be saved locally.');
                Utils.storage.set(CONFIG.PENDING_SCORE_KEY, data);
                return;
            }
            
            // ✅ Validate data before saving
            if (!data.name || !data.score || !data.time) {
                console.error('❌ Invalid score data:', data);
                alert('Invalid score data. Please try again.');
                return;
            }
            
            // Prepare data for Firestore
            const scoreData = {
                name: data.name.trim().substring(0, 50), // Limit name length
                score: parseInt(data.score),
                totalQuestions: parseInt(data.totalQuestions) || 5,
                percentage: parseInt(data.percentage),
                time: parseInt(data.time),
                date: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('💾 Saving score to Firebase:', scoreData);
            
            // Save to Firestore
            this.db.collection('leaderboard')
                .add(scoreData)
                .then(docRef => {
                    console.log('✅ Score saved with ID:', docRef.id);
                    
                    // Show success feedback immediately
                    alert('🎉 Score submitted to global leaderboard!');
                    
                    // Reload leaderboard
                    this.loadScores();
                    
                    // Show user position (use client timestamp for immediate display)
                    data.date = new Date().toISOString();
                    this.showUserPos(data);
                    
                    // Scroll to leaderboard
                    setTimeout(() => {
                        Utils.smoothScroll('#leaderboard');
                    }, 500);
                })
                .catch(error => {
                    console.error('❌ Error saving score:', error);
                    console.error('Error details:', {
                        code: error.code,
                        message: error.message
                    });
                    
                    // Save locally as fallback
                    Utils.storage.set(CONFIG.PENDING_SCORE_KEY, data);
                    
                    alert(`Failed to save score online: ${error.message}\n\nYour score has been saved locally.`);
                });
        }
        
        checkPending() {
            const pending = Utils.storage.get(CONFIG.PENDING_SCORE_KEY);
            if (pending && this.db) {
                console.log('📤 Found pending score, saving to Firebase...');
                this.addScore(pending);
                Utils.storage.remove(CONFIG.PENDING_SCORE_KEY);
            }
        }
        
        filterByPeriod() {
            const now = new Date();
            if (this.period === 'all-time') {
                this.filtered = [...this.all];
            } else if (this.period === 'monthly') {
                const month = new Date(now.getFullYear(), now.getMonth(), 1);
                this.filtered = this.all.filter(
s => new Date(s.date) >= month);
            } else if (this.period === 'weekly') {
                const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                this.filtered = this.all.filter(s => new Date(s.date) >= week);
            }
            this.filter();
        }
        
        filter() {
            if (this.search) {
                this.filtered = this.filtered.filter(s => s.name.toLowerCase().includes(this.search));
            }
        }
        
        render() {
            if (!this.el.body) return;
            
            this.el.body.innerHTML = '<div class="leaderboard-loading"><div class="loading-spinner"></div><p>Loading leaderboard...</p></div>';
            
            setTimeout(() => {
                if (this.filtered.length === 0) {
                    this.renderEmpty();
                    return;
                }
                
                const start = (this.page - 1) * this.perPage;
                const end = start + this.perPage;
                const page = this.filtered.slice(start, end);
                
                this.el.body.innerHTML = '';
                
                page.forEach((s, i) => {
                    const rank = start + i + 1;
                    const entry = this.createEntry(s, rank);
                    this.el.body.appendChild(entry);
                });
                
                this.updatePagination();
                
                if (window.app?.modules?.cursor) window.app.modules.cursor.updateElements();
            }, 300);
        }
        
        createEntry(s, rank) {
            const div = document.createElement('div');
            div.className = 'leaderboard-entry';
            div.style.animationDelay = `${(rank % this.perPage) * 0.05}s`;
            
            if (this.isRecent(s)) Utils.addClass(div, 'user-entry');
            
            const initials = Utils.getInitials(s.name);
            const date = Utils.formatDate(s.date);
            
            div.innerHTML = `
                <div class="rank-col">
                    <div class="rank-display ${this.getRankClass(rank)}">
                        ${rank <= 3 ? this.getMedal(rank) : `#${rank}`}
                    </div>
                </div>
                <div class="player-col">
                    <div class="player-info">
                        <div class="player-avatar">${initials}</div>
                        <div class="player-details">
                            <div class="player-name">${Utils.escapeHtml(s.name)}</div>
                            <div class="player-country">🌍 Global</div>
                        </div>
                    </div>
                </div>
                <div class="score-col">
                    <div class="score-display">
                        <span class="score-points">${s.score}/${s.totalQuestions}</span>
                        <span class="score-percentage">${s.percentage}%</span>
                    </div>
                </div>
                <div class="time-col">
                    <div class="time-display">${s.time}s</div>
                </div>
                <div class="date-col">
                    <div class="date-display">${date}</div>
                </div>
            `;
            
            return div;
        }
        
        getRankClass(r) {
            if (r === 1) return 'top-1';
            if (r === 2) return 'top-2';
            if (r === 3) return 'top-3';
            return '';
        }
        
        getMedal(r) {
            const medals = ['', '🥇', '🥈', '🥉'];
            return `<span class="rank-medal">${medals[r]}</span>`;
        }
        
        isRecent(s) {
            const fiveMin = new Date(Date.now() - 5 * 60 * 1000);
            return new Date(s.date) > fiveMin;
        }
        
        renderEmpty() {
            this.el.body.innerHTML = '<div class="leaderboard-empty"><div class="leaderboard-empty-icon">🏆</div><h3>No scores yet</h3><p>Be the first to complete the quiz and claim the top spot!</p></div>';
            this.updatePagination();
        }
        
        updatePagination() {
            const total = Math.ceil(this.filtered.length / this.perPage) || 1;
            if (this.el.currentPage) this.el.currentPage.textContent = this.page;
            if (this.el.totalPages) this.el.totalPages.textContent = total;
            if (this.el.prev) this.el.prev.disabled = this.page === 1;
            if (this.el.next) this.el.next.disabled = this.page >= total;
        }
        
        showUserPos(data) {
            if (!this.el.userPos) return;
            
            const rank = this.filtered.findIndex(s => s.name === data.name && s.score === data.score && s.time === data.time) + 1;
            
            if (rank > 0) {
                this.el.userPos.style.display = 'block';
                if (this.el.userRank) this.el.userRank.textContent = rank;
                if (this.el.userScore) this.el.userScore.textContent = `${data.score}/${data.totalQuestions}`;
                if (this.el.userTime) this.el.userTime.textContent = `${data.time}s`;
                setTimeout(() => this.el.userPos.style.animation = 'slideUp 0.6s ease-out', 100);
            }
        }
        
        scrollToTop() {
            Utils.smoothScroll('#leaderboard', 100);
        }
        
        generateSample() {
            const names = ['Alex Chen', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'David Lee', 'Olivia Martinez', 'James Taylor', 'Sophia Anderson', 'Daniel Garcia', 'Isabella Rodriguez', 'Matthew Davis', 'Mia Thompson', 'Christopher White', 'Ava Harris', 'Joshua Martin', 'Emily Clark', 'Andrew Lewis', 'Charlotte Walker', 'Ryan Hall', 'Amelia Young'];
            const scores = [];
            const now = Date.now();
            
            names.forEach(name => {
                const score = Math.floor(Math.random() * 3) + 3;
                const time = Math.floor(Math.random() * 60) + 30;
                const days = Math.floor(Math.random() * 30);
                const date = new Date(now - days * 24 * 60 * 60 * 1000);
                
                scores.push({
                    name: name,
                    score: score,
                    totalQuestions: 5,
                    percentage: Math.round((score / 5) * 100),
                    time: time,
                    date: date.toISOString()
                });
            });
            
            scores.sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time);
            return scores;
        }
    }

    // ================================================================
    // ROADMAP ANIMATIONS MODULE
    // ================================================================
    class RoadmapAnimations {
        constructor() {
            this.items = Utils.qsa(SELECTORS.timelineItem);
            this.init();
        }

        init() {
            if (!this.items.length) return;

            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.style.opacity = '0';
                        e.target.style.transform = 'translateY(30px)';
                        setTimeout(() => {
                            e.target.style.transition = 'opacity 0.6s ease-out,transform 0.6s ease-out';
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'translateY(0)';
                        }, 100);
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.2 });

            this.items.forEach((item, idx) => {
                item.style.transitionDelay = `${idx * 0.1}s`;
                obs.observe(item);
            });
        }
    }

    // ================================================================
    // SMOOTH SCROLL MODULE
    // ================================================================
    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            Utils.qsa('a[href^="#"]').forEach(a => {
                a.addEventListener('click', e => {
                    const href = Utils.getAttr(a, 'href');
                    if (href === '#') return;
                    e.preventDefault();
                    const target = Utils.qs(href);
                    if (target) {
                        Utils.smoothScroll(target);
                        if (window.app?.modules?.mobileNav) window.app.modules.mobileNav.close();
                    }
                });
            });
        }
    }

    // LAZY IMAGES MODULE
    class LazyImages {
        constructor() {
            this.images = Utils.qsa('img[loading="lazy"]');
            this.init();
        }

        init() {
            if ('IntersectionObserver' in window) {
                const obs = new IntersectionObserver(entries => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            const img = e.target;
                            img.src = Utils.getAttr(img, 'data-src') || img.src;
                            Utils.addClass(img, 'loaded');
                            obs.unobserve(img);
                        }
                    });
                });
                this.images.forEach(img => obs.observe(img));
            }
        }
    }

    // FORM VALIDATION MODULE
    class FormValidation {
        constructor() {
            this.forms = Utils.qsa('form[data-validate]');
            this.init();
        }

        init() {
            this.forms.forEach(form => {
                form.addEventListener('submit', e => {
                    if (!this.validate(form)) e.preventDefault();
                });
            });
        }

        validate(form) {
            let valid = true;
            const inputs = Utils.qsa('input[required],textarea[required]', form);
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    this.showError(input, 'This field is required');
                    valid = false;
                } else {
                    this.clearError(input);
                }
            });
            return valid;
        }

        showError(input, msg) {
            const err = input.parentElement.querySelector('.error-message') || document.createElement('div');
            err.className = 'error-message';
            err.textContent = msg;
            err.style.color = '#ff4757';
            err.style.fontSize = '0.875rem';
            err.style.marginTop = '0.25rem';
            if (!input.parentElement.querySelector('.error-message')) input.parentElement.appendChild(err);
            Utils.addClass(input, 'error');
            Utils.setAttr(input, 'aria-invalid', 'true');
        }

        clearError(input) {
            const err = input.parentElement.querySelector('.error-message');
            if (err) err.remove();
            Utils.removeClass(input, 'error');
            input.removeAttribute('aria-invalid');
        }
    }

    // ANALYTICS TRACKER MODULE
    class AnalyticsTracker {
        constructor() {
            this.events = [];
            this.init();
        }

        init() {
            this.track('page_view', { page: window.location.pathname });

            Utils.qsa('.btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.track('button_click', {
                        text: btn.textContent.trim(),
                        href: Utils.getAttr(btn, 'href')
                    });
                });
            });

            const quiz = Utils.qs('#quiz');
            if (quiz) {
                const obs = new IntersectionObserver(entries => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            this.track('quiz_view');
                            obs.unobserve(e.target);
                        }
                    });
                }, { threshold: 0.5 });
                obs.observe(quiz);
            }
        }

        track(name, data = {}) {
            const event = {
                name: name,
                timestamp: new Date().toISOString(),
                data: data
            };
            this.events.push(event);
            console.log('Analytics:', event);
        }
    }

    // EASTER EGG MODULE
    class EasterEgg {
        constructor() {
            this.seq = [];
            this.code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
            this.init();
        }

        init() {
            document.addEventListener('keydown', e => {
                this.seq.push(e.key);
                this.seq = this.seq.slice(-this.code.length);
                if (this.seq.join(',') === this.code.join(',')) this.activate();
            });
        }

        activate() {
            document.body.style.animation = 'rainbow 2s ease-in-out';

            const msg = document.createElement('div');
            msg.textContent = '🎉 You found the secret! You\'re a true AI agent! 🤖';
            msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,var(--brand),var(--accent));color:white;padding:2rem 3rem;border-radius:20px;font-size:1.5rem;font-weight:700;z-index:10000;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:scaleIn 0.5s ease-out;text-align:center;';
            document.body.appendChild(msg);

            setTimeout(() => {
                msg.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => msg.remove(), 500);
            }, 3000);

            const style = document.createElement('style');
            style.textContent = '@keyframes rainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}@keyframes fadeOut{to{opacity:0;transform:translate(-50%,-50%) scale(0.8)}}';
            document.head.appendChild(style);

            console.log('🎉 Easter egg activated!');
        }
    }

    // PERFORMANCE MONITOR MODULE
    class PerformanceMonitor {
        constructor() {
            this.init();
        }

        init() {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const perf = performance.getEntriesByType('navigation')[0];
                        const paint = performance.getEntriesByType('paint');
                        console.group('⚡ Performance Metrics');
                        console.log('DOM Content Loaded:', Math.round(perf.domContentLoadedEventEnd - perf.fetchStart), 'ms');
                        console.log('Page Load Complete:', Math.round(perf.loadEventEnd - perf.fetchStart), 'ms');
                        paint.forEach(p => console.log(`${p.name}:`, Math.round(p.startTime), 'ms'));
                        console.groupEnd();
                    }, 0);
                });
            }
        }
    }

    // INITIALIZE APPLICATION
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        new SmoothScroll();
        new LazyImages();
        new FormValidation();
        new AnalyticsTracker();
        new EasterEgg();
        new PerformanceMonitor();
        window.kiteApp = app;
    });

    // CLEANUP ON PAGE UNLOAD
    window.addEventListener('beforeunload', () => {
        if (window.app?.destroy) {
            window.app.destroy();
        }
    });

    // GLOBAL ERROR HANDLING
    window.addEventListener('error', e => console.error('Global error:', e.error));
    window.addEventListener('unhandledrejection', e => console.error('Unhandled rejection:', e.reason));

    // SERVICE WORKER REGISTRATION (PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // navigator.serviceWorker.register('/sw.js').then(r=>console.log('SW:',r)).catch(e=>console.log('SW error:',e));
        });
    }

    // MODULE EXPORTS (CommonJS/ES6)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { Utils };
    }

})();
