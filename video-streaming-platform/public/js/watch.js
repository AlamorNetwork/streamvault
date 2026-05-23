// Watch Page Logic
class WatchPage {
    constructor() {
        this.videoId = null;
        this.videoData = null;
        this.player = null;
    }

    init() {
        // Get video ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.videoId = urlParams.get('v');

        if (!this.videoId) {
            this.showError('No video ID provided');
            return;
        }

        // Initialize video player
        this.initPlayer();

        // Load video data
        this.loadVideoData();

        // Load related videos
        this.loadRelatedVideos();

        // Setup event listeners
        this.setupEventListeners();

        // Track page view
        if (window.analytics) {
            analytics.trackEvent('page_view', {
                page: 'watch',
                video_id: this.videoId
            });
        }
    }

    initPlayer() {
        const videoElement = document.getElementById('videoElement');
        if (videoElement) {
            this.player = new VideoPlayer('videoPlayer');
        }
    }

    async loadVideoData() {
        try {
            // In production, this would fetch from API
            // const data = await api.get(`/videos/${this.videoId}`);
            
            // Mock data for demo
            this.videoData = {
                id: this.videoId,
                title: 'Epic Adventure: Journey Through the Mountains',
                description: 'Experience breathtaking views and thrilling adventures as we journey through some of the world\'s most spectacular mountain ranges. This documentary captures the essence of exploration and the beauty of nature in stunning 4K quality.',
                views: 125847,
                likes: 8934,
                rating: 4.8,
                uploadDate: '2025-05-20',
                duration: 3845, // seconds
                thumbnail: 'https://picsum.photos/seed/video1/1920/1080',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                tags: ['Adventure', 'Documentary', 'Nature', '4K', 'Mountains'],
                category: 'documentary',
                qualities: [
                    { label: '1080p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
                    { label: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
                    { label: '480p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
                ]
            };

            this.renderVideoInfo();
            this.loadVideo();

            // Track video view
            if (window.analytics) {
                analytics.trackEvent('video_view', {
                    video_id: this.videoId,
                    video_title: this.videoData.title
                });
            }

        } catch (error) {
            console.error('Error loading video data:', error);
            this.showError('Failed to load video');
        }
    }

    loadVideo() {
        if (!this.videoData || !this.player) return;

        const videoElement = document.getElementById('videoElement');
        if (videoElement) {
            videoElement.src = this.videoData.videoUrl;
            videoElement.load();
        }
    }

    renderVideoInfo() {
        if (!this.videoData) return;

        // Title
        const titleEl = document.getElementById('videoTitle');
        if (titleEl) {
            titleEl.textContent = this.videoData.title;
        }

        // Description
        const descEl = document.getElementById('videoDescription');
        if (descEl) {
            descEl.textContent = this.videoData.description;
        }

        // Views
        const viewsEl = document.getElementById('viewCount');
        if (viewsEl) {
            viewsEl.textContent = `${this.formatNumber(this.videoData.views)} views`;
        }

        // Upload date
        const dateEl = document.getElementById('uploadDate');
        if (dateEl) {
            dateEl.textContent = this.formatDate(this.videoData.uploadDate);
        }

        // Rating
        const ratingEl = document.getElementById('rating');
        if (ratingEl) {
            ratingEl.textContent = this.videoData.rating.toFixed(1);
        }

        // Like count
        const likeCountEl = document.getElementById('likeCount');
        if (likeCountEl) {
            likeCountEl.textContent = this.formatNumber(this.videoData.likes);
        }

        // Tags
        this.renderTags();

        // Update page title
        document.title = `${this.videoData.title} - StreamVault`;
    }

        renderTags() {
        const tagsContainer = document.getElementById('videoTags');
        if (!tagsContainer || !this.videoData.tags) return;

        tagsContainer.innerHTML = this.videoData.tags.map(tag => `
            <a href="/browse.html?tag=${encodeURIComponent(tag)}" class="video-tag">
                #${tag}
            </a>
        `).join('');
    }

    async loadRelatedVideos() {
        try {
            const container = document.getElementById('relatedVideos');
            if (!container) return;

            // In production, fetch from API
            // const data = await api.get(`/videos/${this.videoId}/related`);

            // Mock related videos
            const relatedVideos = [
                {
                    id: 'related1',
                    title: 'Mountain Climbing Adventures',
                    thumbnail: 'https://picsum.photos/seed/related1/640/360',
                    duration: 1245,
                    views: 89234,
                    uploadDate: '2025-05-18',
                    rating: 4.7
                },
                {
                    id: 'related2',
                    title: 'Exploring Hidden Valleys',
                    thumbnail: 'https://picsum.photos/seed/related2/640/360',
                    duration: 2156,
                    views: 156789,
                    uploadDate: '2025-05-15',
                    rating: 4.9
                },
                {
                    id: 'related3',
                    title: 'Wildlife in the Mountains',
                    thumbnail: 'https://picsum.photos/seed/related3/640/360',
                    duration: 1834,
                    views: 234567,
                    uploadDate: '2025-05-12',
                    rating: 4.8
                },
                {
                    id: 'related4',
                    title: 'Sunset Over the Peaks',
                    thumbnail: 'https://picsum.photos/seed/related4/640/360',
                    duration: 945,
                    views: 67890,
                    uploadDate: '2025-05-10',
                    rating: 4.6
                }
            ];

            container.innerHTML = relatedVideos.map(video => this.createVideoCard(video)).join('');

        } catch (error) {
            console.error('Error loading related videos:', error);
        }
    }

    createVideoCard(video) {
        return `
            <a href="/watch.html?v=${video.id}" class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <span class="video-duration">${this.formatDuration(video.duration)}</span>
                    <div class="video-overlay">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="video-meta">
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            ${this.formatNumber(video.views)}
                        </span>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            ${video.rating}
                        </span>
                        <span class="meta-item">${this.formatDate(video.uploadDate)}</span>
                    </div>
                </div>
            </a>
        `;
    }

    setupEventListeners() {
        // Like button
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.handleLike());
        }

        // Favorite button
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.handleFavorite());
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShare());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
            });
        }

        // Navbar scroll effect
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                navbar.classList.remove('scroll-up');
                return;
            }
            
            if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
                navbar.classList.remove('scroll-up');
                navbar.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
                navbar.classList.remove('scroll-down');
                navbar.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
        });
    }

    handleLike() {
        const likeBtn = document.getElementById('likeBtn');
        if (!likeBtn) return;

        const isLiked = likeBtn.classList.contains('active');
        
        if (isLiked) {
            likeBtn.classList.remove('active');
            this.videoData.likes--;
        } else {
            likeBtn.classList.add('active');
            this.videoData.likes++;
        }

        const likeCountEl = document.getElementById('likeCount');
        if (likeCountEl) {
            likeCountEl.textContent = this.formatNumber(this.videoData.likes);
        }

        // Track event
        if (window.analytics) {
            analytics.trackEvent(isLiked ? 'video_unlike' : 'video_like', {
                video_id: this.videoId,
                video_title: this.videoData.title
            });
        }

        // Show notification
        if (window.notificationManager) {
            notificationManager.show(
                isLiked ? 'Removed from liked videos' : 'Added to liked videos',
                'success'
            );
        }
    }

    handleFavorite() {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (!favoriteBtn) return;

        const isFavorited = favoriteBtn.classList.contains('active');
        
        favoriteBtn.classList.toggle('active');

        // Track event
        if (window.analytics) {
            analytics.trackEvent(isFavorited ? 'video_unfavorite' : 'video_favorite', {
                video_id: this.videoId,
                video_title: this.videoData.title
            });
        }

        // Show notification
        if (window.notificationManager) {
            notificationManager.show(
                isFavorited ? 'Removed from favorites' : 'Added to favorites',
                'success'
            );
        }
    }

    async handleShare() {
        const shareData = {
            title: this.videoData.title,
            text: this.videoData.description,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                
                // Track event
                if (window.analytics) {
                    analytics.trackEvent('video_share', {
                        video_id: this.videoId,
                        video_title: this.videoData.title,
                        method: 'native'
                    });
                }
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                
                if (window.notificationManager) {
                    notificationManager.show('Link copied to clipboard!', 'success');
                }

                // Track event
                if (window.analytics) {
                    analytics.trackEvent('video_share', {
                        video_id: this.videoId,
                        video_title: this.videoData.title,
                        method: 'clipboard'
                    });
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
            
            if (window.notificationManager) {
                notificationManager.show('Failed to share video', 'error');
            }
        }
    }

    showError(message) {
        const container = document.querySelector('.watch-section');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <h2>Error Loading Video</h2>
                    <p>${message}</p>
                    <a href="/" class="btn btn-primary">Go Home</a>
                </div>
            `;
        }
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
}

// Initialize watch page
document.addEventListener('DOMContentLoaded', () => {
    const watchPage = new WatchPage();
    watchPage.init();
});
