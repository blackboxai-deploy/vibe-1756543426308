// Matrix Core - Main application logic
(function() {
    'use strict';

    // Matrix App namespace
    window.MatrixApp = {
        // Application state
        state: {
            isLoggedIn: false,
            currentUser: null,
            currentPage: 'feed',
            posts: [],
            loading: false,
            page: 1,
            hasMore: true
        },

        // API base URL
        apiBase: '/api',

        // Initialize the application
        init: function() {
            this.showLoader();
            this.setupEventListeners();
            this.checkAuthStatus();
            this.initializeMatrixRain();
            
            // Simulate loading time for Matrix effect
            setTimeout(() => {
                this.loadFeed();
                this.hideLoader();
            }, 2000);
        },

        // Show Matrix loader
        showLoader: function() {
            const loader = document.getElementById('matrix-loader');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            
            if (!loader) return;
            
            loader.classList.remove('fade-out');
            
            // Animate progress bar
            let progress = 0;
            const messages = [
                'Initializing neural pathways...',
                'Loading Matrix protocols...',
                'Establishing connection...',
                'Accessing the Matrix...',
                'Welcome to the digital underground...'
            ];
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                }
                
                if (progressFill) {
                    progressFill.style.width = progress + '%';
                }
                
                if (progressText && messages.length > 0) {
                    const messageIndex = Math.floor((progress / 100) * messages.length);
                    if (messages[messageIndex]) {
                        progressText.textContent = messages[messageIndex];
                    }
                }
            }, 200);
        },

        // Hide Matrix loader
        hideLoader: function() {
            const loader = document.getElementById('matrix-loader');
            const app = document.getElementById('app');
            
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
            
            if (app) {
                app.classList.remove('hidden');
            }
        },

        // Setup event listeners
        setupEventListeners: function() {
            const postBtn = document.getElementById('post-btn');
            const loginBtn = document.getElementById('login-btn');
            const profileBtn = document.getElementById('profile-btn');
            const loadMoreBtn = document.getElementById('load-more-btn');

            if (postBtn) {
                postBtn.addEventListener('click', () => this.showPostModal());
            }

            if (loginBtn) {
                loginBtn.addEventListener('click', () => this.showLoginModal());
            }

            if (profileBtn) {
                profileBtn.addEventListener('click', () => this.showProfile());
            }

            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
            }

            // Handle scroll for infinite loading
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                if (scrollTimeout) return;
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                    scrollTimeout = null;
                }, 100);
            });
        },

        // Initialize Matrix rain effect
        initializeMatrixRain: function() {
            if (typeof MatrixRain !== 'undefined') {
                // Initialize loader rain
                const loaderCanvas = document.getElementById('matrix-rain-canvas');
                if (loaderCanvas) {
                    new MatrixRain(loaderCanvas, { intensity: 0.8, speed: 1 });
                }

                // Initialize main rain
                const mainCanvas = document.getElementById('main-matrix-canvas');
                if (mainCanvas) {
                    new MatrixRain(mainCanvas, { intensity: 0.3, speed: 0.5 });
                }
            }
        },

        // Check authentication status
        checkAuthStatus: function() {
            // Check for session cookie or anonymous username
            const hasSession = this.getCookie('matrix_session');
            const anonUsername = this.getCookie('matrix_anon_username');

            if (hasSession) {
                this.fetchUserProfile();
            } else if (anonUsername) {
                this.state.currentUser = {
                    username: anonUsername,
                    anonymous: true
                };
                this.updateAuthUI();
            }
        },

        // Fetch user profile
        fetchUserProfile: function() {
            if (typeof MatrixAPI === 'undefined') return;

            MatrixAPI.get('/user/profile')
                .then(user => {
                    this.state.isLoggedIn = true;
                    this.state.currentUser = user;
                    this.updateAuthUI();
                })
                .catch(error => {
                    console.error('Failed to fetch user profile:', error);
                    // Clear invalid session
                    this.logout();
                });
        },

        // Update authentication UI
        updateAuthUI: function() {
            const loginBtn = document.getElementById('login-btn');
            const profileBtn = document.getElementById('profile-btn');

            if (this.state.isLoggedIn) {
                if (loginBtn) loginBtn.style.display = 'none';
                if (profileBtn) {
                    profileBtn.style.display = 'block';
                    profileBtn.querySelector('.btn-text').textContent = this.state.currentUser.username.toUpperCase();
                }
            } else {
                if (loginBtn) loginBtn.style.display = 'block';
                if (profileBtn) profileBtn.style.display = 'none';
            }
        },

        // Load main feed
        loadFeed: function() {
            if (typeof MatrixAPI === 'undefined') return;

            this.state.loading = true;
            this.updateLoadingState();

            MatrixAPI.get('/posts?page=' + this.state.page + '&limit=20')
                .then(data => {
                    if (this.state.page === 1) {
                        this.state.posts = data.posts;
                    } else {
                        this.state.posts = this.state.posts.concat(data.posts);
                    }
                    
                    this.state.hasMore = this.state.page < data.pagination.pages;
                    this.renderPosts();
                    this.updateFeedStats(data.pagination.total);
                    
                    this.state.loading = false;
                    this.updateLoadingState();
                })
                .catch(error => {
                    console.error('Failed to load feed:', error);
                    this.state.loading = false;
                    this.updateLoadingState();
                    this.showError('Failed to load Matrix feed');
                });
        },

        // Load more posts
        loadMorePosts: function() {
            if (this.state.loading || !this.state.hasMore) return;
            
            this.state.page++;
            this.loadFeed();
        },

        // Handle scroll for infinite loading
        handleScroll: function() {
            if (this.state.loading || !this.state.hasMore) return;

            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 1000) {
                this.loadMorePosts();
            }
        },

        // Render posts
        renderPosts: function() {
            const postsGrid = document.getElementById('posts-grid');
            if (!postsGrid) return;

            postsGrid.innerHTML = '';

            this.state.posts.forEach(post => {
                const postElement = this.createPostElement(post);
                postsGrid.appendChild(postElement);
            });
        },

        // Create post element
        createPostElement: function(post) {
            const article = document.createElement('article');
            article.className = 'post-card';
            article.onclick = () => this.openPost(post.id);

            const mediaElement = this.createMediaElement(post);
            const metaElement = this.createPostMeta(post);

            article.appendChild(mediaElement);
            article.appendChild(metaElement);

            return article;
        },

        // Create media element based on file type
        createMediaElement: function(post) {
            const container = document.createElement('div');
            container.className = 'post-media';
            container.style.cssText = `
                width: 100%;
                max-height: 300px;
                overflow: hidden;
                background: var(--matrix-charcoal);
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            const filePath = '/uploads/' + post.file_path;
            let mediaEl;

            if (post.file_type === 'image') {
                mediaEl = document.createElement('img');
                mediaEl.src = filePath;
                mediaEl.alt = post.title || 'Matrix art';
                mediaEl.style.cssText = 'width: 100%; height: auto; object-fit: cover;';
            } else if (post.file_type === 'video') {
                mediaEl = document.createElement('video');
                mediaEl.src = filePath;
                mediaEl.controls = true;
                mediaEl.style.cssText = 'width: 100%; height: auto; object-fit: cover;';
            } else if (post.file_type === 'audio') {
                mediaEl = document.createElement('audio');
                mediaEl.src = filePath;
                mediaEl.controls = true;
                mediaEl.style.cssText = 'width: 100%;';
                
                // Add visual representation for audio
                const audioVisual = document.createElement('div');
                audioVisual.style.cssText = `
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(45deg, var(--matrix-charcoal), var(--matrix-deep-black));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--matrix-neon-green);
                    font-size: 48px;
                `;
                audioVisual.textContent = '🎵';
                
                container.appendChild(audioVisual);
            }

            if (mediaEl) {
                container.appendChild(mediaEl);
            }

            return container;
        },

        // Create post meta information
        createPostMeta: function(post) {
            const meta = document.createElement('div');
            meta.className = 'post-meta';
            meta.style.cssText = `
                padding: var(--space-md);
                border-top: 1px solid var(--matrix-dark-green);
            `;

            const title = document.createElement('h3');
            title.className = 'post-title glow-text';
            title.textContent = post.title || 'Untitled';
            title.style.cssText = `
                margin: 0 0 var(--space-sm) 0;
                font-size: var(--font-md);
                color: var(--matrix-neon-green);
            `;

            const author = document.createElement('div');
            author.className = 'post-author';
            author.style.cssText = `
                font-size: var(--font-xs);
                color: var(--matrix-lime-green);
                margin-bottom: var(--space-sm);
            `;

            if (post.author) {
                author.textContent = `by @${post.author.username}`;
            } else if (post.author_name) {
                author.textContent = `by ${post.author_name}`;
            } else {
                author.textContent = 'by ANONYMOUS';
            }

            const stats = document.createElement('div');
            stats.className = 'post-stats';
            stats.style.cssText = `
                display: flex;
                justify-content: space-between;
                font-size: var(--font-xs);
                color: var(--matrix-dark-green);
            `;

            const views = document.createElement('span');
            views.textContent = `👁 ${post.views || 0} views`;

            const date = document.createElement('span');
            date.textContent = this.formatDate(post.created_at);

            stats.appendChild(views);
            stats.appendChild(date);

            meta.appendChild(title);
            meta.appendChild(author);
            meta.appendChild(stats);

            return meta;
        },

        // Update feed statistics
        updateFeedStats: function(total) {
            const feedStats = document.getElementById('feed-stats');
            if (feedStats) {
                feedStats.innerHTML = `
                    <span class="stat-item">Posts: <span class="stat-value">${total}</span></span>
                `;
            }
        },

        // Update loading state
        updateLoadingState: function() {
            const loadingMore = document.getElementById('loading-more');
            const loadMoreBtn = document.getElementById('load-more-btn');

            if (this.state.loading) {
                if (loadingMore) loadingMore.classList.remove('hidden');
                if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            } else {
                if (loadingMore) loadingMore.classList.add('hidden');
                if (loadMoreBtn && this.state.hasMore) {
                    loadMoreBtn.classList.remove('hidden');
                } else if (loadMoreBtn) {
                    loadMoreBtn.classList.add('hidden');
                }
            }
        },

        // Open post in detail view
        openPost: function(postId) {
            if (typeof MatrixModals !== 'undefined') {
                MatrixModals.showPostModal(postId);
            }
        },

        // Show post creation modal
        showPostModal: function() {
            if (typeof MatrixModals !== 'undefined') {
                MatrixModals.showPostCreationModal();
            }
        },

        // Show login modal
        showLoginModal: function() {
            if (typeof MatrixModals !== 'undefined') {
                MatrixModals.showLoginModal();
            }
        },

        // Show user profile
        showProfile: function() {
            if (typeof MatrixModals !== 'undefined') {
                MatrixModals.showProfileModal();
            }
        },

        // Logout
        logout: function() {
            if (typeof MatrixAPI !== 'undefined') {
                MatrixAPI.post('/auth/logout')
                    .then(() => {
                        this.state.isLoggedIn = false;
                        this.state.currentUser = null;
                        this.updateAuthUI();
                        this.loadFeed(); // Reload feed
                    })
                    .catch(error => {
                        console.error('Logout failed:', error);
                    });
            }
        },

        // Show error message
        showError: function(message) {
            // Simple error display - could be enhanced with modal
            console.error('Matrix Error:', message);
            
            // Create temporary error display
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--matrix-red);
                color: var(--matrix-white);
                padding: var(--space-md);
                border-radius: var(--radius-sm);
                z-index: 1000;
                font-family: var(--font-matrix);
                font-size: var(--font-sm);
            `;
            errorDiv.textContent = message;
            
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 3000);
        },

        // Cookie utilities
        getCookie: function(name) {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop().split(";").shift();
        },

        // Format date
        formatDate: function(timestamp) {
            const date = new Date(timestamp * 1000);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days === 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                if (hours === 0) {
                    const minutes = Math.floor(diff / (1000 * 60));
                    return `${minutes}m ago`;
                }
                return `${hours}h ago`;
            } else if (days < 7) {
                return `${days}d ago`;
            } else {
                return date.toLocaleDateString();
            }
        }
    };

})();