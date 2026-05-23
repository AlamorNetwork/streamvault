// Browse Page Logic
class BrowsePage {
    constructor() {
        this.currentCategory = 'all';
        this.currentSort = 'popular';
        this.currentPage = 1;
        this.videosPerPage = 12;
        this.videos = [];
        
        this.init();
    }

    async init() {
        await this.loadVideos();
        this.setupFilters();
        this.setupSearch();
        this.renderVideos();
    }

    async loadVideos() {
        try {
            const response = await fetch('/api/videos/all');
            const data = await response.json();
            
            if (data.success) {
                this.videos = data.videos;
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showError('Failed to load videos');
        }
    }

    setupFilters() {
        // Category filter
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.currentPage = 1;
                this.renderVideos();
            });
        });

        // Sort filter
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.renderVideos();
            });
        }
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.renderVideos();
            }, 300));
        }
    }

    filterVideos() {
        let filtered = [...this.videos];

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(v => v.category === this.currentCategory);
        }

        // Filter by search
        if (this.searchQuery) {
            filtered = filtered.filter(v => 
                v.title.toLowerCase().includes(this.searchQuery) ||
                v.description?.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort
        switch(this.currentSort) {
            case 'popular':
                filtered.sort((a, b) => b.views - a.views);
                break;
            case 'recent':
                filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'duration':
                filtered.sort((a, b) => this.parseDuration(b.duration) - this.parseDuration(a.duration));
                break;
        }

        return filtered;
    }

    parseDuration(duration) {
        const parts = duration.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    renderVideos() {
        const filtered = this.filterVideos();
        const start = (this.currentPage - 1) * this.videosPerPage;
        const end = start + this.videosPerPage;
        const pageVideos = filtered.slice(start, end);

        const grid = document.querySelector('.videos-grid');
        if (!grid) return;

        if (pageVideos.length === 0) {
            grid.innerHTML = '<div class="no-results">No videos found</div>';
            return;
        }

        grid.innerHTML = pageVideos.map(video => `
            <div class="video-card animate-fade-in-up" data-video-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="video-overlay">
                        <div class="video-play-btn">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                    <span class="video-duration">${video.duration}</span>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="video-meta">
                        <span>👁 ${this.formatViews(video.views)}</span>
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

        this.renderPagination(filtered.length);
    }

    renderPagination(totalVideos) {
        const totalPages = Math.ceil(totalVideos / this.videosPerPage);
        const pagination = document.querySelector('.pagination');
        
        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        // Previous button
        html += `
            <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span class="page-dots">...</span>';
            }
        }

        // Next button
        html += `
            <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}">
                Next
            </button>
        `;

        pagination.innerHTML = html;

        // Add click handlers
        pagination.querySelectorAll('.page-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.dataset.page);
                this.renderVideos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    formatViews(views) {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }

    showError(message) {
        const grid = document.querySelector('.videos-grid');
        if (grid) {
            grid.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('browse')) {
        new BrowsePage();
    }
});
