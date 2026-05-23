// Main Application Logic
class StreamApp {
    constructor() {
        this.currentPage = window.location.pathname;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollAnimations();
        this.loadPageContent();
        this.setupMobileMenu();
    }

    setupNavigation() {
        // Active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === this.currentPage) {
                link.classList.add('active');
            }
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });
        }
    }

    async loadPageContent() {
        if (this.currentPage === '/' || this.currentPage === '/index.html') {
            await this.loadHomePage();
        } else if (this.currentPage.includes('browse')) {
            await this.loadBrowsePage();
        }
    }

    async loadHomePage() {
        try {
            // Load featured videos
            const response = await fetch('/api/videos/featured');
            const data = await response.json();
            
            if (data.success) {
                this.renderFeaturedVideos(data.videos);
                this.updateStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading home page:', error);
        }
    }

    renderFeaturedVideos(videos) {
        const grid = document.querySelector('.featured-grid');
        if (!grid) return;

        grid.innerHTML = videos.map(video => `
            <div class="video-card scroll-reveal" data-video-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="video-overlay">
                        <div class="video-play-btn">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="video-meta">
                        <span>👁 ${this.formatViews(video.views)}</span>
                        <span>⏱ ${video.duration}</span>
                        <span>⭐ ${video.rating}</span>
                    </div>
                    ${video.badge ? `<span class="video-badge">${video.badge}</span>` : ''}
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.videoId;
                window.location.href = `/watch.html?v=${videoId}`;
            });
        });
    }

    updateStats(stats) {
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements.length === 0) return;

        statElements[0].textContent = this.formatNumber(stats.totalVideos);
        statElements[1].textContent = this.formatNumber(stats.activeUsers);
        statElements[2].textContent = stats.quality;
    }

    formatViews(views) {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }

    formatNumber(num) {
        return num.toLocaleString();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StreamApp();
});

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
