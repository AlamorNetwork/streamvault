// Video Player Component
class VideoPlayer {
    constructor(container) {
        this.container = container;
        this.video = container.querySelector('video');
        this.controls = {
            playBtn: container.querySelector('.play-btn'),
            bigPlayBtn: container.querySelector('.big-play-btn'),
            progressBar: container.querySelector('.progress-bar'),
            progressFilled: container.querySelector('.progress-filled'),
            volumeBtn: container.querySelector('.volume-btn'),
            volumeSlider: container.querySelector('.volume-slider'),
            volumeFilled: container.querySelector('.volume-filled'),
            fullscreenBtn: container.querySelector('.fullscreen-btn'),
            timeDisplay: container.querySelector('.time-display'),
            qualityOptions: container.querySelectorAll('.quality-option')
        };
        
        this.isPlaying = false;
        this.currentQuality = '1080p';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTimeDisplay();
    }

    setupEventListeners() {
        // Play/Pause
        this.controls.playBtn?.addEventListener('click', () => this.togglePlay());
        this.controls.bigPlayBtn?.addEventListener('click', () => this.togglePlay());
        this.video?.addEventListener('click', () => this.togglePlay());
        
        // Progress bar
        this.controls.progressBar?.addEventListener('click', (e) => this.seek(e));
        this.video?.addEventListener('timeupdate', () => this.updateProgress());
        
        // Volume
        this.controls.volumeBtn?.addEventListener('click', () => this.toggleMute());
        this.controls.volumeSlider?.addEventListener('click', (e) => this.setVolume(e));
        
        // Fullscreen
        this.controls.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        
        // Quality
        this.controls.qualityOptions?.forEach(option => {
            option.addEventListener('click', () => this.changeQuality(option.dataset.quality));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Video events
        this.video?.addEventListener('play', () => this.onPlay());
        this.video?.addEventListener('pause', () => this.onPause());
        this.video?.addEventListener('ended', () => this.onEnded());
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    onPlay() {
        this.isPlaying = true;
        this.controls.bigPlayBtn?.classList.add('hidden');
        this.updatePlayButton(true);
    }

    onPause() {
        this.isPlaying = false;
        this.updatePlayButton(false);
    }

    onEnded() {
        this.isPlaying = false;
        this.controls.bigPlayBtn?.classList.remove('hidden');
        this.updatePlayButton(false);
    }

    updatePlayButton(playing) {
        const icon = this.controls.playBtn?.querySelector('svg');
        if (!icon) return;
        
        if (playing) {
            icon.innerHTML = '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>';
        } else {
            icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        }
    }

    seek(e) {
        const rect = this.controls.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = pos * this.video.duration;
    }

    updateProgress() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.controls.progressFilled.style.width = `${percent}%`;
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.video?.currentTime || 0);
        const duration = this.formatTime(this.video?.duration || 0);
        if (this.controls.timeDisplay) {
            this.controls.timeDisplay.textContent = `${current} / ${duration}`;
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        this.updateVolumeIcon();
    }

    setVolume(e) {
        const rect = this.controls.volumeSlider.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.video.volume = Math.max(0, Math.min(1, pos));
        this.controls.volumeFilled.style.width = `${this.video.volume * 100}%`;
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const icon = this.controls.volumeBtn?.querySelector('svg');
        if (!icon) return;
        
        if (this.video.muted || this.video.volume === 0) {
            icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        } else if (this.video.volume < 0.5) {
            icon.innerHTML = '<path d="M7 9v6h4l5 5V4l-5 5H7z"/>';
        } else {
            icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    changeQuality(quality) {
        this.currentQuality = quality;
        this.controls.qualityOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.quality === quality);
        });
        
        // In real implementation, change video source here
        console.log(`Quality changed to ${quality}`);
    }

    handleKeyboard(e) {
        if (!this.video) return;
        
        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.video.currentTime -= 5;
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.video.currentTime += 5;
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.video.volume = Math.min(1, this.video.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.video.volume = Math.max(0, this.video.volume - 0.1);
                break;
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                this.toggleMute();
                break;
        }
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.querySelector('.video-player-container');
    if (playerContainer) {
        new VideoPlayer(playerContainer);
    }
});
