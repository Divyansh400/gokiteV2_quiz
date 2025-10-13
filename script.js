
document.addEventListener('DOMContentLoaded', () => {
    
    // --- CORE APPLICATION ---
    class App {
        constructor() {
            this.modules = {};
            this.init();
        }

        init() {
            // Eagerly load modules that are always needed
            this.modules.themeToggle = new ThemeToggle();
            this.modules.mobileNav = new MobileNav();
            this.modules.scrollProgressBar = new ScrollProgressBar();
            this.modules.customCursor = new CustomCursor();
            this.modules.headerScroll = new HeaderScroll();
            this.modules.particleNetwork = new ParticleNetwork();
            this.modules.threeJSHero = new ThreeJSHero();

            // Lazily load modules that are below the fold
            this.lazyLoadModules();

            // Make app globally accessible for module communication
            window.app = this;
        }
        
        lazyLoadModules() {
            const observerOptions = { rootMargin: '100px', threshold: 0.1 };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const targetId = entry.target.id;
                        if (targetId === 'ecosystem' && !this.modules.ecosystem) {
                            this.modules.ecosystem = new EcosystemExplorer();
                        }
                        if (targetId === 'stats' && !this.modules.stats) {
                            this.modules.stats = new AnimatedStats();
                        }
                        if (targetId === 'quiz' && !this.modules.quiz) {
                            this.modules.quiz = new QuizSystem();
                        }
                        if (targetId === 'roadmap' && !this.modules.roadmap) {
                            this.modules.roadmap = new RoadmapAnimations();
                        }
                        obs.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            const ecosystemSection = document.getElementById('ecosystem');
            const statsSection = document.getElementById('stats');
            const quizSection = document.getElementById('quiz');
            const roadmapSection = document.getElementById('roadmap');
            
            if (ecosystemSection) observer.observe(ecosystemSection);
            if (statsSection) observer.observe(statsSection);
            if (quizSection) observer.observe(quizSection);
            if (roadmapSection) observer.observe(roadmapSection);
        }
    }

    // --- MODULE: THEME TOGGLE ---
    class ThemeToggle {
        constructor() {
            this.toggleButton = document.getElementById('theme-toggle');
            this.html = document.documentElement;
            this.init();
        }

        init() {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            this.html.setAttribute('data-theme', savedTheme);
            
            if (this.toggleButton) {
                this.toggleButton.addEventListener('click', () => this.toggleTheme());
            }
        }

        toggleTheme() {
            const currentTheme = this.html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Trigger animation
            this.toggleButton.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.toggleButton.style.transform = '';
            }, 400);
        }
    }

    // --- MODULE: MOBILE NAVIGATION (FIXED) ---
    class MobileNav {
        constructor() {
            this.toggleButton = document.querySelector('.mobile-menu-toggle');
            this.navLinks = document.querySelector('.nav-links');
            this.init();
        }

        init() {
            if (!this.toggleButton || !this.navLinks) return;

            // Toggle menu
            this.toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu when clicking nav links
            this.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMenu();
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.main-nav') && this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }

        toggleMenu() {
            const isActive = this.navLinks.classList.toggle('active');
            this.toggleButton.classList.toggle('active');
            this.toggleButton.setAttribute('aria-expanded', isActive);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        }

        closeMenu() {
            this.navLinks.classList.remove('active');
            this.toggleButton.classList.remove('active');
            this.toggleButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
    
    // --- MODULE: SCROLL PROGRESS BAR (OPTIMIZED) ---
    class ScrollProgressBar {
        constructor() {
            this.progressBar = document.querySelector('.scroll-progress-bar');
            this.ticking = false;
            this.init();
        }

        init() {
            if (!this.progressBar) return;
            window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        }

        requestTick() {
            if (!this.ticking) {
                requestAnimationFrame(() => this.updateScroll());
                this.ticking = true;
            }
        }

        updateScroll() {
            const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
            this.progressBar.style.width = `${scrollPercentage}%`;
            this.progressBar.setAttribute('aria-valuenow', Math.round(scrollPercentage));
            this.ticking = false;
        }
    }

    // --- MODULE: HEADER SCROLL EFFECT (NEW) ---
    class HeaderScroll {
        constructor() {
            this.header = document.querySelector('.site-header');
            this.lastScroll = 0;
            this.init();
        }

        init() {
            if (!this.header) return;
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        }

        handleScroll() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            
            this.lastScroll = currentScroll;
        }
    }

    // --- MODULE: CUSTOM CURSOR (FIXED) ---
    class CustomCursor {
        constructor() {
            this.cursor = document.querySelector('.custom-cursor');
            this.init();
        }

        init() {
            if (!this.cursor) return;
            
            // Only enable on devices with fine pointer (mouse)
            if (!window.matchMedia("(pointer: fine)").matches) {
                this.cursor.style.display = 'none';
                return;
            }

            // Track cursor position
            document.addEventListener('mousemove', (e) => {
                requestAnimationFrame(() => {
                    this.cursor.style.left = `${e.clientX}px`;
                    this.cursor.style.top = `${e.clientY}px`;
                });
            });
            
            // Update interactive elements
            this.updateInteractiveElements();
        }

        updateInteractiveElements() {
            const interactiveElements = document.querySelectorAll('a, button, .protocol-node, .options li, .stat-card, .insight-card, .timeline-item');
            
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
            });
        }
    }

    // --- MODULE: PARTICLE NETWORK BACKGROUND (NEW) ---
    class ParticleNetwork {
        constructor() {
            this.canvas = document.querySelector('.particle-network');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.particleCount = window.innerWidth < 768 ? 30 : 50;
            this.connectionDistance = 150;
            this.mouse = { x: null, y: null };
            this.animationId = null;
            
            this.init();
        }
        
        init() {
            this.resize();
            this.createParticles();
            this.animate();
            
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
        }
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Adjust particle count for mobile
            const newCount = window.innerWidth < 768 ? 30 : 50;
            if (newCount !== this.particleCount) {
                this.particleCount = newCount;
                this.particles = [];
                this.createParticles();
            }
        }
        
        createParticles() {
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1
                });
            }
        }
        
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Get brand color from CSS
            const brandColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-brand-rgb').trim();
            
            this.particles.forEach((p, i) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Bounce off edges
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
                
                // Mouse interaction
                if (this.mouse.x && this.mouse.y) {
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        p.x -= dx * 0.01;
                        p.y -= dy * 0.01;
                    }
                }
                
                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${brandColor}, 0.6)`;
                this.ctx.fill();
                
                // Draw connections
                this.particles.slice(i + 1).forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.connectionDistance) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(${brandColor}, ${0.3 * (1 - distance / this.connectionDistance)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            });
            
            this.animationId = requestAnimationFrame(() => this.animate());
        }
        
        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }
    
    // --- MODULE: INTERACTIVE 3D HERO (FIXED) ---
    class ThreeJSHero {
        constructor() {
            this.container = document.getElementById('hero-canvas-container');
            if (!this.container || typeof THREE === 'undefined') return;
            this.init();
        }

        init() {
            // Scene, Camera, Renderer
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(
                75,
                this.container.clientWidth / this.container.clientHeight,
                0.1,
                1000
            );
            
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);
            
            // Create geometry
            const geometry = new THREE.IcosahedronGeometry(2, 1);
            const material = new THREE.MeshBasicMaterial({
                color: 0x64ffda,
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
            
            this.camera.position.z = 5;

            // Mouse interaction
            this.mouse = new THREE.Vector2();
            this.mouseMoveHandler = (e) => {
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            };
            window.addEventListener('mousemove', this.mouseMoveHandler);
            
            // Handle resize
            this.resizeHandler = () => this.onResize();
            window.addEventListener('resize', this.resizeHandler);

            this.animate();
        }
        
        onResize() {
            if (!this.container) return;
            
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

          animate() {
            this.animationId = requestAnimationFrame(() => this.animate());
            
            // Interactive rotation
            this.mesh.rotation.x += 0.001 + (this.mouse.y * 0.003);
            this.mesh.rotation.y += 0.001 + (this.mouse.x * 0.003);
            
            // Floating animation
            this.mesh.position.y = Math.sin(Date.now() * 0.001) * 0.2;
            
            this.renderer.render(this.scene, this.camera);
        }

        dispose() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
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

// --- MODULE: ECOSYSTEM EXPLORER (FIXED) ---
// --- MODULE: ECOSYSTEM EXPLORER (COMPLETELY FIXED) ---
class EcosystemExplorer {
    constructor() {
        this.nodes = document.querySelectorAll('.protocol-node');
        this.infoPanel = document.getElementById('ecosystem-info');
        this.currentActive = null;
        this.isLocked = false;
        
        this.data = {
            bitmind: {
                title: "BitMind: Deepfake Detection",
                description: "The guardian of truth. BitMind uses decentralized AI to detect and authenticate digital media, ensuring trust in agent interactions. Powered by advanced ML models and zero-knowledge proofs."
            },
            nubila: {
                title: "Nubila: Multi-Agent Cloud",
                description: "The nervous system. Nubila orchestrates autonomous agents across distributed clouds, enabling seamless collaboration and resource allocation. Supports dynamic scaling and cross-chain communication."
            },
            apro: {
                title: "APRO: Data Oracle",
                description: "The bridge to reality. APRO delivers verified, tamper-proof real-world data feeds to agents, from financial tickers to IoT sensors. Ensures data integrity through cryptographic verification."
            },
            app: {
                title: "APP: Agent Payments Protocol",
                description: "The economic engine. APP is a secure Layer 2 protocol for agent-to-agent micropayments, enabling a frictionless agent economy. Features instant settlements and minimal gas fees."
            },
            carv: {
                title: "CARV: Gaming & Identity",
                description: "The digital soul. CARV manages tokenized identities and data for agents, allowing them to own their digital personas across metaverses. Supports decentralized reputation systems."
            },
        };
        
        this.connections = {
            'bitmind': ['nubila', 'apro'],
            'nubila': ['bitmind', 'app', 'carv'],
            'apro': ['bitmind', 'app'],
            'app': ['nubila', 'apro', 'carv'],
            'carv': ['nubila', 'app']
        };
        
        this.init();
    }
    
    init() {
        if (!this.nodes.length) return;
        
        // Initialize info panel
        this.resetInfoPanel();
        
        this.nodes.forEach(node => {
            // Hover events - only work when not locked
            node.addEventListener('mouseenter', (e) => {
                if (!this.isLocked) {
                    this.onHover(e);
                }
            });
            
            node.addEventListener('mouseleave', () => {
                if (!this.isLocked) {
                    this.onLeave();
                }
            });
            
            // Click to lock/unlock
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const protocolId = e.currentTarget.dataset.protocol;
                
                if (this.currentActive === protocolId && this.isLocked) {
                    // Clicking the same node again unlocks
                    this.unlock();
                } else {
                    // Lock to this node
                    this.lock(e);
                }
            });
            
            // Keyboard support
            node.addEventListener('focus', (e) => {
                if (!this.isLocked) {
                    this.onHover(e);
                }
            });
            
            node.addEventListener('blur', () => {
                if (!this.isLocked) {
                    this.onLeave();
                }
            });
            
            // Make nodes keyboard accessible
            node.setAttribute('tabindex', '0');
            node.setAttribute('role', 'button');
            node.setAttribute('aria-label', `Explore ${node.dataset.protocol} protocol`);
        });
        
        // Click outside to unlock
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.protocol-node') && 
                !e.target.closest('.ecosystem-info') && 
                this.isLocked) {
                this.unlock();
            }
        });
    }
    
    onHover(e) {
        const protocolId = e.currentTarget.dataset.protocol;
        const connectedNodes = this.connections[protocolId] || [];
        
        this.currentActive = protocolId;
        
        // Update info panel
        this.updateInfoPanel(protocolId);
        
        // Highlight nodes
        this.highlightNodes(protocolId, connectedNodes);
    }
    
    onLeave() {
        this.currentActive = null;
        this.resetInfoPanel();
        this.resetNodes();
    }
    
    lock(e) {
        const protocolId = e.currentTarget.dataset.protocol;
        const connectedNodes = this.connections[protocolId] || [];
        
        this.isLocked = true;
        this.currentActive = protocolId;
        
        // Update info panel
        this.updateInfoPanel(protocolId, true);
        
        // Highlight nodes
        this.highlightNodes(protocolId, connectedNodes);
        
        // Add locked indicator
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-brand)';
    }
    
    unlock() {
        this.isLocked = false;
        this.currentActive = null;
        
        // Remove locked indicators
        this.nodes.forEach(node => {
            node.style.boxShadow = '';
        });
        
        this.resetInfoPanel();
        this.resetNodes();
    }
    
    highlightNodes(activeId, connectedIds) {
        this.nodes.forEach(node => {
            const nodeId = node.dataset.protocol;
            
            // Remove all states first
            node.classList.remove('highlight', 'connected', 'dimmed');
            
            if (nodeId === activeId) {
                // The active node
                node.classList.add('highlight');
            } else if (connectedIds.includes(nodeId)) {
                // Connected nodes
                node.classList.add('connected');
            } else {
                // Other nodes
                node.classList.add('dimmed');
            }
        });
    }
    
    resetNodes() {
        this.nodes.forEach(node => {
            node.classList.remove('highlight', 'connected', 'dimmed');
            node.style.boxShadow = '';
        });
    }
    
    updateInfoPanel(protocolId, locked = false) {
        if (!this.infoPanel || !this.data[protocolId]) return;
        
        this.infoPanel.style.opacity = '0';
        this.infoPanel.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            const lockHint = locked ? 
                '<p style="font-size: 0.9rem; color: var(--color-brand); margin-top: 1rem;">🔒 Locked. Click again to unlock.</p>' : 
                '<p style="font-size: 0.9rem; color: var(--color-text-tertiary); margin-top: 1rem;">💡 Click to lock this view.</p>';
            
            this.infoPanel.innerHTML = `
                <h3>${this.data[protocolId].title}</h3>
                <p>${this.data[protocolId].description}</p>
                ${lockHint}
            `;
            
            this.infoPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.infoPanel.style.opacity = '1';
            this.infoPanel.style.transform = 'translateY(0)';
        }, 150);
    }
    
    resetInfoPanel() {
        if (!this.infoPanel) return;
        
        this.infoPanel.style.opacity = '0';
        this.infoPanel.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            this.infoPanel.innerHTML = `
                <h3>🌐 Decentralized AI Ecosystem</h3>
                <p>Hover over any protocol to explore its connections and learn how they work together to power autonomous agents.</p>
                <p style="font-size: 0.9rem; color: var(--color-text-tertiary); margin-top: 1rem;">💡 Click to lock the selection.</p>
            `;
            
            this.infoPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.infoPanel.style.opacity = '1';
            this.infoPanel.style.transform = 'translateY(0)';
        }, 150);
    }
}

    // --- MODULE: ANIMATED STATS (NEW) ---
    class AnimatedStats {
        constructor() {
            this.statNumbers = document.querySelectorAll('.stat-number');
            this.hasAnimated = false;
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateAll();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.5 });
            
            this.init();
        }
        
        init() {
            const statsSection = document.getElementById('stats');
            if (statsSection) {
                this.observer.observe(statsSection);
            }
        }
        
        animateAll() {
            this.statNumbers.forEach((stat, index) => {
                setTimeout(() => {
                    this.animateValue(stat);
                }, index * 100);
            });
        }
        
        animateValue(element) {
            const target = parseFloat(element.dataset.target);
            const suffix = element.dataset.suffix || '';
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();
            const isDecimal = target % 1 !== 0;
            
            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-quart)
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = easeOutQuart * target;
                
                // Format number
                if (isDecimal) {
                    element.textContent = current.toFixed(1) + suffix;
                } else if (target >= 1000) {
                    element.textContent = Math.floor(current).toLocaleString() + suffix;
                } else {
                    element.textContent = Math.floor(current) + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Final value
                    if (isDecimal) {
                        element.textContent = target.toFixed(1) + suffix;
                    } else {
                        element.textContent = target.toLocaleString() + suffix;
                    }
                }
            };
            
            requestAnimationFrame(step);
        }
    }

    // --- MODULE: QUIZ SYSTEM (FIXED) ---
    class QuizSystem {
        constructor() {
            this.quizData = [
                {
                    question: "What visual design style is prominently featured in Kite AI's V2 website?",
                    options: ["Material Design", "Neumorphism", "Glassmorphism", "Flat Design"],
                    correct: 2,
                    explanation: "The V2 design uses blurred, semi-transparent backgrounds known as Glassmorphism to create a sense of depth and modernity."
                },
                {
                    question: "Which protocol in the ecosystem is described as the 'nervous system' for agent coordination?",
                    options: ["BitMind", "Nubila", "APRO", "APP"],
                    correct: 1,
                    explanation: "Nubila orchestrates agents across distributed clouds, acting as the coordinating 'nervous system' of the ecosystem."
                },
                {
                    question: "What is the main role of BitMind in the Kite AI ecosystem?",
                    options: ["Provide cloud storage", "Detect and authenticate deepfakes", "Manage identities", "Generate analytics"],
                    correct: 1,
                    explanation: "BitMind is the verification layer for ensuring the authenticity of digital content using AI and zero-knowledge proofs."
                },
                {
                    question: "Which technology underpins the trust model in Kite AI?",
                    options: ["Zero-knowledge proofs", "Blockchain with verifiable credentials", "Quantum encryption", "Centralized authorities"],
                    correct: 1,
                    explanation: "Blockchain provides an immutable ledger, while verifiable credentials allow agents to prove claims securely without revealing sensitive data."
                },
                {
                    question: "What does the APP protocol enable in the Kite AI ecosystem?",
                    options: ["Data storage", "Agent micropayments", "Identity management", "Network routing"],
                    correct: 1,
                    explanation: "APP (Agent Payments Protocol) is a Layer 2 solution that enables instant, low-cost micropayments between autonomous agents."
                }
            ];
            
            this.currentQuestion = 0;
            this.score = 0;
            this.cacheDOMElements();
            this.init();
        }
        
        cacheDOMElements() {
            this.elements = {
                progressBar: document.querySelector('.progress-bar'),
                progressFill: document.getElementById('progress-fill'),
                question: document.getElementById('question'),
                options: document.getElementById('options'),
                nextBtn: document.getElementById('next-btn'),
                explanation: document.getElementById('explanation'),
                quizContent: document.getElementById('quiz-content'),
            };
        }

        init() {
            if (!this.elements.question) return;
            this.loadQuestion();
            this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        loadQuestion() {
            this.resetState();
            const q = this.quizData[this.currentQuestion];
            
            // Update question text
            this.elements.question.textContent = q.question;
            
            // Create option elements
            q.options.forEach((option, index) => {
                const li = document.createElement('li');
                li.textContent = option;
                li.setAttribute('role', 'radio');
                li.setAttribute('aria-checked', 'false');
                li.setAttribute('tabindex', '0');
                
                li.addEventListener('click', () => this.selectOption(index, li));
                li.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectOption(index, li);
                    }
                });
                
                this.elements.options.appendChild(li);
            });
            
            this.updateProgress();
            
            // Update cursor for new elements
            if (window.app?.modules?.customCursor) {
                window.app.modules.customCursor.updateInteractiveElements();
            }
        }
        
        selectOption(selectedIndex, selectedElement) {
            // Prevent multiple selections
            if (this.elements.options.classList.contains('answered')) return;
            
            // Disable all options
            this.elements.options.classList.add('answered');
            Array.from(this.elements.options.children).forEach(li => {
                li.style.pointerEvents = 'none';
                li.setAttribute('aria-disabled', 'true');
            });

            const q = this.quizData[this.currentQuestion];
            const isCorrect = selectedIndex === q.correct;
            
            if (isCorrect) {
                this.score++;
                selectedElement.classList.add('correct');
                selectedElement.setAttribute('aria-checked', 'true');
            } else {
                selectedElement.classList.add('incorrect');
                selectedElement.setAttribute('aria-checked', 'false');
                this.elements.options.children[q.correct].classList.add('correct');
                this.elements.options.children[q.correct].setAttribute('aria-checked', 'true');
            }
            
            // Show explanation with animation
            this.elements.explanation.textContent = q.explanation;
            this.elements.explanation.style.display = 'block';
            
            this.elements.nextBtn.disabled = false;
            this.elements.nextBtn.focus();
        }
        
        nextQuestion() {
            this.currentQuestion++;
            if (this.currentQuestion < this.quizData.length) {
                this.loadQuestion();
            } else {
                this.showResults();
            }
        }
        
        resetState() {
            this.elements.options.innerHTML = '';
            this.elements.options.classList.remove('answered');
            this.elements.explanation.textContent = '';
            this.elements.explanation.style.display = 'none';
            this.elements.nextBtn.disabled = true;
        }

        updateProgress() {
            const progress = (this.currentQuestion / this.quizData.length) * 100;
            this.elements.progressFill.style.width = `${progress}%`;
            this.elements.progressBar.setAttribute('aria-valuenow', Math.round(progress));
        }
        
        showResults() {
            this.elements.progressFill.style.width = '100%';
            this.elements.progressBar.setAttribute('aria-valuenow', '100');
            
            const percentage = Math.round((this.score / this.quizData.length) * 100);
            let message = '';
            let emoji = '';
            
            if (percentage === 100) {
                message = "Perfect score! You're an agentic AI expert! 🎉";
                emoji = "🏆";
            } else if (percentage >= 80) {
                message = "Excellent! You have a strong understanding of the ecosystem!";
                emoji = "⭐";
            } else if (percentage >= 60) {
                message = "Good job! Keep learning about the agentic future!";
                emoji = "👍";
            } else {
                message = "Keep exploring! There's so much to discover!";
                emoji = "📚";
            }
            
            this.elements.quizContent.innerHTML = `
                <div class="result">
                    <div class="stat-icon" style="font-size: 5rem; margin-bottom: 1rem;">${emoji}</div>
                    <h2>Quiz Complete!</h2>
                    <p>${message}</p>
                    <p style="font-size: 2rem; font-weight: 700; color: var(--color-brand); margin: 2rem 0;">
                        ${this.score} / ${this.quizData.length} <span style="font-size: 1.2rem;">(${percentage}%)</span>
                    </p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <span>Try Again</span>
                    </button>
                </div>
            `;
        }
    }

    // --- MODULE: ROADMAP ANIMATIONS (NEW) ---
    // --- MODULE: ROADMAP ANIMATIONS (NEW) - Continued ---
    class RoadmapAnimations {
        constructor() {
            this.timelineItems = document.querySelectorAll('.timeline-item');
            this.init();
        }

        init() {
            if (!this.timelineItems.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px)';
                        
                        setTimeout(() => {
                            entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            this.timelineItems.forEach((item, index) => {
                item.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(item);
            });
        }
    }

    // --- MODULE: SMOOTH SCROLL (NEW) ---
    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;
                    
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Close mobile menu if open
                        if (window.app?.modules?.mobileNav) {
                            window.app.modules.mobileNav.closeMenu();
                        }
                    }
                });
            });
        }
    }

    // --- MODULE: LAZY LOAD IMAGES (NEW) ---
    class LazyLoadImages {
        constructor() {
            this.images = document.querySelectorAll('img[loading="lazy"]');
            this.init();
        }

        init() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                this.images.forEach(img => imageObserver.observe(img));
            }
        }
    }

    // --- MODULE: FORM VALIDATION (NEW - if you add forms later) ---
    class FormValidation {
        constructor() {
            this.forms = document.querySelectorAll('form[data-validate]');
            this.init();
        }

        init() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                    }
                });
            });
        }

        validateForm(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    this.showError(input, 'This field is required');
                    isValid = false;
                } else {
                    this.clearError(input);
                }
            });

            return isValid;
        }

        showError(input, message) {
            const errorDiv = input.parentElement.querySelector('.error-message') || document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.color = '#ff4757';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            
            if (!input.parentElement.querySelector('.error-message')) {
                input.parentElement.appendChild(errorDiv);
            }
            
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }

        clearError(input) {
            const errorDiv = input.parentElement.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.remove();
            }
            input.classList.remove('error');
            input.removeAttribute('aria-invalid');
        }
    }

    // --- MODULE: ANALYTICS TRACKER (Optional) ---
    class AnalyticsTracker {
        constructor() {
            this.events = [];
            this.init();
        }

        init() {
            // Track page view
            this.trackEvent('page_view', { page: window.location.pathname });

            // Track button clicks
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.trackEvent('button_click', { 
                        text: btn.textContent.trim(),
                        href: btn.getAttribute('href')
                    });
                });
            });

            // Track quiz completion
            const quizSection = document.getElementById('quiz');
            if (quizSection) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.trackEvent('quiz_view');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(quizSection);
            }
        }

        trackEvent(eventName, data = {}) {
            const event = {
                name: eventName,
                timestamp: new Date().toISOString(),
                data: data
            };
            
            this.events.push(event);
            
            // Console log for development (replace with actual analytics service)
            console.log('Analytics Event:', event);
            
            // Example: Send to Google Analytics
            // if (typeof gtag !== 'undefined') {
            //     gtag('event', eventName, data);
            // }
        }
    }

    // --- MODULE: EASTER EGG (Fun addition!) ---
    class EasterEgg {
        constructor() {
            this.sequence = [];
            this.code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
            this.init();
        }

        init() {
            document.addEventListener('keydown', (e) => {
                this.sequence.push(e.key);
                this.sequence = this.sequence.slice(-this.code.length);

                if (this.sequence.join(',') === this.code.join(',')) {
                    this.activate();
                }
            });
        }

        activate() {
            // Fun animation when Konami code is entered
            document.body.style.animation = 'rainbow 2s ease-in-out';
            
            const message = document.createElement('div');
            message.textContent = '🎉 You found the secret! You\'re a true AI agent! 🤖';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
                color: white;
                padding: 2rem 3rem;
                border-radius: 20px;
                font-size: 1.5rem;
                font-weight: 700;
                z-index: 10000;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: scaleIn 0.5s ease-out;
            `;
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => message.remove(), 500);
            }, 3000);
            
            // Add rainbow animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
                @keyframes fadeOut {
                    to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
            
            console.log('🎉 Easter egg activated!');
        }
    }

    // --- MODULE: PERFORMANCE MONITOR (Development tool) ---
    class PerformanceMonitor {
        constructor() {
            this.init();
        }

        init() {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const perfData = performance.getEntriesByType('navigation')[0];
                        const paintData = performance.getEntriesByType('paint');
                        
                        console.group('⚡ Performance Metrics');
                        console.log('DOM Content Loaded:', Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart), 'ms');
                        console.log('Page Load Complete:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
                        
                        paintData.forEach(paint => {
                            console.log(`${paint.name}:`, Math.round(paint.startTime), 'ms');
                        });
                        
                        console.groupEnd();
                    }, 0);
                });
            }
        }
    }

    // --- INITIALIZE ALL MODULES ---
    
    // Core app
    const kiteApp = new App();
    
    // Additional enhancements
    new SmoothScroll();
    new LazyLoadImages();
    new FormValidation();
    new AnalyticsTracker();
    new EasterEgg();
    new PerformanceMonitor();
    
    // Expose app globally for debugging
    window.kiteApp = kiteApp;
    
    console.log('%c🪁 Kite AI V2 Loaded Successfully!', 'color: #64ffda; font-size: 16px; font-weight: bold;');
    console.log('%cTry the Konami code for a surprise! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️ B A', 'color: #a8b2d1; font-style: italic;');
});

// --- UTILITY FUNCTIONS ---

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function execution rate
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get computed CSS variable value
 */
function getCSSVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Set CSS variable value
 */
function setCSSVariable(variable, value) {
    document.documentElement.style.setProperty(variable, value);
}

// --- ERROR HANDLING ---

window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // You can send this to an error tracking service like Sentry
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You can send this to an error tracking service
});

// --- SERVICE WORKER (Optional - for PWA support) ---

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/service-worker.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

// --- EXPORT FOR MODULE USAGE (if needed) ---

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        isInViewport,
        getCSSVariable,
        setCSSVariable
    };
}

