// Core API Communication & State Management
class CoreAPI {
    constructor() {
        this.baseUrl = '/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.requestQueue = [];
        this.isProcessing = false;
    }

    async get(endpoint, useCache = true) {
        const cacheKey = `GET:${endpoint}`;
        
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (useCache) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    async post(endpoint, payload) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }
}

// Global State Management
class AppState {
    constructor() {
        this.state = {
            user: null,
            theme: 'dark',
            volume: 0.8,
            quality: '1080p',
            autoplay: false,
            watchHistory: [],
            favorites: []
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('appState');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('appState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.saveToStorage();
        this.notify(key, value);
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    notify(key, value) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(value));
        }
    }

    addToHistory(videoId) {
        const history = this.get('watchHistory') || [];
        const filtered = history.filter(id => id !== videoId);
        filtered.unshift(videoId);
        this.set('watchHistory', filtered.slice(0, 50));
    }

    toggleFavorite(videoId) {
        const favorites = this.get('favorites') || [];
        const index = favorites.indexOf(videoId);
        
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(videoId);
        }
        
        this.set('favorites', favorites);
        return index === -1;
    }

    isFavorite(videoId) {
        const favorites = this.get('favorites') || [];
        return favorites.includes(videoId);
    }
}

// Analytics & Tracking
class Analytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.flushInterval = 30000; // 30 seconds
        
        this.startAutoFlush();
    }

    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            page: window.location.pathname
        };

        this.events.push(event);
        console.log('[Analytics]', eventName, properties);

        if (this.events.length >= 10) {
            this.flush();
        }
    }

    async flush() {
        if (this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = [];

        try {
            // In production, send to analytics endpoint
            console.log('[Analytics] Flushing events:', eventsToSend.length);
        } catch (error) {
            console.error('[Analytics] Flush failed:', error);
            this.events.unshift(...eventsToSend);
        }
    }

    startAutoFlush() {
        setInterval(() => this.flush(), this.flushInterval);
        
        window.addEventListener('beforeunload', () => {
            this.flush();
        });
    }

    trackPageView() {
        this.track('page_view', {
            path: window.location.pathname,
            referrer: document.referrer
        });
    }

    trackVideoPlay(videoId) {
        this.track('video_play', { videoId });
    }

    trackVideoComplete(videoId, duration) {
        this.track('video_complete', { videoId, duration });
    }

    trackSearch(query, results) {
        this.track('search', { query, results });
    }
}

// Notification System
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">×</button>
        `;

        this.container.appendChild(notification);
        this.notifications.push(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        return notification;
    }

    hide(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Initialize global instances
const api = new CoreAPI();
const appState = new AppState();
const analytics = new Analytics();
const notifications = new NotificationManager();

// Track page view on load
document.addEventListener('DOMContentLoaded', () => {
    analytics.trackPageView();
});

// Export for use in other modules
window.CoreAPI = CoreAPI;
window.api = api;
window.appState = appState;
window.analytics = analytics;
window.notifications = notifications;
