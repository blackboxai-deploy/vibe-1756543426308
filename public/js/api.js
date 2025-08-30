// Matrix API - Handle all API communications
(function() {
    'use strict';

    // Matrix API namespace
    window.MatrixAPI = {
        baseUrl: '/api',
        
        // Generic request method
        request: function(method, endpoint, data, options) {
            const url = this.baseUrl + endpoint;
            const config = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...((options && options.headers) || {})
                },
                credentials: 'same-origin' // Include cookies
            };

            if (data && method !== 'GET') {
                if (data instanceof FormData) {
                    // Remove Content-Type for FormData (browser sets it with boundary)
                    delete config.headers['Content-Type'];
                    config.body = data;
                } else {
                    config.body = JSON.stringify(data);
                }
            }

            return fetch(url, config)
                .then(response => {
                    // Handle different response types
                    const contentType = response.headers.get('content-type');
                    
                    if (!response.ok) {
                        return response.json().then(error => {
                            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
                        });
                    }

                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        return response.text();
                    }
                })
                .catch(error => {
                    console.error('API Error:', error);
                    throw error;
                });
        },

        // GET request
        get: function(endpoint, options) {
            return this.request('GET', endpoint, null, options);
        },

        // POST request
        post: function(endpoint, data, options) {
            return this.request('POST', endpoint, data, options);
        },

        // PUT request
        put: function(endpoint, data, options) {
            return this.request('PUT', endpoint, data, options);
        },

        // DELETE request
        delete: function(endpoint, options) {
            return this.request('DELETE', endpoint, null, options);
        },

        // Authentication methods
        auth: {
            checkUsername: function(username) {
                return MatrixAPI.post('/auth/check-username', { username });
            },

            register: function(userData) {
                return MatrixAPI.post('/auth/register', userData);
            },

            login: function(credentials) {
                return MatrixAPI.post('/auth/login', credentials);
            },

            logout: function() {
                return MatrixAPI.post('/auth/logout');
            }
        },

        // Posts methods
        posts: {
            getAll: function(page, limit) {
                const params = new URLSearchParams({
                    page: page || 1,
                    limit: limit || 20
                });
                return MatrixAPI.get('/posts?' + params.toString());
            },

            getById: function(id) {
                return MatrixAPI.get('/posts/' + id);
            },

            create: function(postData) {
                return MatrixAPI.post('/posts', postData);
            },

            uploadFile: function(file, onProgress) {
                const formData = new FormData();
                formData.append('file', file);

                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    
                    // Upload progress tracking
                    if (onProgress) {
                        xhr.upload.addEventListener('progress', function(e) {
                            if (e.lengthComputable) {
                                const percentComplete = (e.loaded / e.total) * 100;
                                onProgress(percentComplete);
                            }
                        });
                    }

                    xhr.addEventListener('load', function() {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                reject(new Error('Invalid JSON response'));
                            }
                        } else {
                            try {
                                const error = JSON.parse(xhr.responseText);
                                reject(new Error(error.message || 'Upload failed'));
                            } catch (e) {
                                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                            }
                        }
                    });

                    xhr.addEventListener('error', function() {
                        reject(new Error('Network error occurred'));
                    });

                    xhr.open('POST', MatrixAPI.baseUrl + '/posts/upload');
                    xhr.withCredentials = true; // Include cookies
                    xhr.send(formData);
                });
            }
        },

        // User methods
        user: {
            getProfile: function() {
                return MatrixAPI.get('/user/profile');
            },

            updateProfile: function(profileData) {
                return MatrixAPI.put('/user/profile', profileData);
            },

            getByUsername: function(username) {
                return MatrixAPI.get('/user/' + encodeURIComponent(username));
            }
        },

        // Utility methods
        utils: {
            // Set anonymous username cookie
            setAnonymousUsername: function(username) {
                const expires = new Date();
                expires.setDate(expires.getDate() + 30); // 30 days
                
                document.cookie = `matrix_anon_username=${username}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            },

            // Get anonymous username from cookie
            getAnonymousUsername: function() {
                const value = "; " + document.cookie;
                const parts = value.split("; matrix_anon_username=");
                if (parts.length === 2) {
                    return parts.pop().split(";").shift();
                }
                return null;
            },

            // Clear anonymous username cookie
            clearAnonymousUsername: function() {
                document.cookie = 'matrix_anon_username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            },

            // Validate file before upload
            validateFile: function(file) {
                const maxSize = 50 * 1024 * 1024; // 50MB
                const allowedTypes = [
                    'image/jpeg', 'image/png', 'image/gif',
                    'video/mp4', 'video/webm',
                    'audio/mpeg', 'audio/wav', 'audio/ogg'
                ];

                if (file.size > maxSize) {
                    return { valid: false, error: 'File too large (max 50MB)' };
                }

                if (!allowedTypes.includes(file.type)) {
                    return { valid: false, error: 'Invalid file type' };
                }

                return { valid: true };
            },

            // Format file size
            formatFileSize: function(bytes) {
                if (bytes === 0) return '0 Bytes';
                
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            },

            // Get file type category
            getFileTypeCategory: function(mimeType) {
                if (mimeType.startsWith('image/')) return 'image';
                if (mimeType.startsWith('video/')) return 'video';
                if (mimeType.startsWith('audio/')) return 'audio';
                return 'unknown';
            },

            // Debounce function for API calls
            debounce: function(func, wait) {
                let timeout;
                return function executedFunction() {
                    const later = () => {
                        clearTimeout(timeout);
                        func.apply(this, arguments);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },

            // Retry failed requests
            retry: function(fn, retries, delay) {
                return new Promise((resolve, reject) => {
                    fn()
                        .then(resolve)
                        .catch(error => {
                            if (retries > 0) {
                                setTimeout(() => {
                                    this.retry(fn, retries - 1, delay * 2)
                                        .then(resolve)
                                        .catch(reject);
                                }, delay);
                            } else {
                                reject(error);
                            }
                        });
                });
            }
        }
    };

})();