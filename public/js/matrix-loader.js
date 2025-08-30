// Matrix Loader - Boot sequences and loading animations
(function() {
    'use strict';

    // Matrix Loader namespace
    window.MatrixLoader = {
        // Loading sequences
        sequences: {
            boot: [
                { text: 'MATRIX OS v3.0 INITIALIZING...', delay: 100, type: 'loading' },
                { text: 'Loading kernel modules...', delay: 150, type: 'ok' },
                { text: 'Initializing neural pathways...', delay: 200, type: 'loading' },
                { text: 'Establishing connection to main frame...', delay: 180, type: 'ok' },
                { text: 'Loading art gallery protocols...', delay: 160, type: 'loading' },
                { text: 'Scanning for digital artifacts...', delay: 140, type: 'ok' },
                { text: 'Calibrating visual cortex...', delay: 120, type: 'loading' },
                { text: 'Matrix connection established...', delay: 200, type: 'ok' },
                { text: 'Welcome to the digital underground...', delay: 300, type: 'ok' }
            ],
            
            upload: [
                { text: 'Preparing file for matrix injection...', delay: 100, type: 'loading' },
                { text: 'Analyzing digital signature...', delay: 150, type: 'loading' },
                { text: 'Encoding for neural transmission...', delay: 200, type: 'loading' },
                { text: 'Injecting into matrix stream...', delay: 250, type: 'ok' },
                { text: 'Upload complete - art added to matrix', delay: 200, type: 'ok' }
            ],

            auth: [
                { text: 'Scanning identity matrix...', delay: 100, type: 'loading' },
                { text: 'Verifying neural patterns...', delay: 150, type: 'loading' },
                { text: 'Authentication successful...', delay: 200, type: 'ok' },
                { text: 'Welcome back to the matrix...', delay: 150, type: 'ok' }
            ]
        },

        // Show boot sequence
        showBootSequence: function(containerId, onComplete) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const bootDiv = document.createElement('div');
            bootDiv.className = 'boot-sequence matrix-boot active';
            
            let currentIndex = 0;
            const sequence = this.sequences.boot;

            const addLine = () => {
                if (currentIndex >= sequence.length) {
                    if (onComplete) {
                        setTimeout(onComplete, 500);
                    }
                    return;
                }

                const item = sequence[currentIndex];
                const line = document.createElement('div');
                line.className = `boot-line ${item.type}`;
                line.textContent = item.text;
                
                bootDiv.appendChild(line);
                
                // Scroll to bottom if needed
                container.scrollTop = container.scrollHeight;
                
                currentIndex++;
                setTimeout(addLine, item.delay);
            };

            container.appendChild(bootDiv);
            setTimeout(addLine, 200);
        },

        // Show terminal loading
        showTerminalLoading: function(containerId, title, message, onComplete) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const terminal = document.createElement('div');
            terminal.className = 'terminal-loading';
            terminal.innerHTML = `
                <div class="terminal-header-loading">${title || 'MATRIX TERMINAL'}</div>
                <div class="terminal-content-loading">
                    <div class="loading-text glow-text">${message || 'Processing...'}<span class="loading-dots"></span></div>
                    <div class="processing-indicator">
                        <span class="processing-text">Loading</span>
                        <div class="processing-blocks">
                            <div class="processing-block"></div>
                            <div class="processing-block"></div>
                            <div class="processing-block"></div>
                            <div class="processing-block"></div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(terminal);

            if (onComplete) {
                setTimeout(onComplete, 2000);
            }
        },

        // Show progress loader
        showProgressLoader: function(containerId, title, onProgress) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const progressDiv = document.createElement('div');
            progressDiv.className = 'progress-loader';
            progressDiv.innerHTML = `
                <div class="matrix-text glow-text">${title || 'LOADING MATRIX...'}</div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="dynamic-progress-fill"></div>
                    </div>
                    <div class="progress-text" id="dynamic-progress-text">Initializing...</div>
                </div>
            `;

            container.appendChild(progressDiv);

            // Return control object
            return {
                setProgress: (percent, text) => {
                    const fill = document.getElementById('dynamic-progress-fill');
                    const textEl = document.getElementById('dynamic-progress-text');
                    
                    if (fill) fill.style.width = percent + '%';
                    if (textEl && text) textEl.textContent = text;
                },
                
                complete: (finalText) => {
                    const textEl = document.getElementById('dynamic-progress-text');
                    if (textEl) textEl.textContent = finalText || 'Complete!';
                    
                    setTimeout(() => {
                        if (progressDiv.parentNode) {
                            progressDiv.parentNode.removeChild(progressDiv);
                        }
                    }, 1000);
                }
            };
        },

        // Show upload progress
        showUploadProgress: function(containerId, fileName, onComplete) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const uploadDiv = document.createElement('div');
            uploadDiv.className = 'upload-progress';
            uploadDiv.innerHTML = `
                <div class="upload-status">Uploading ${fileName} to matrix...</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="upload-progress-fill"></div>
                </div>
                <div class="progress-text" id="upload-progress-text">Preparing file...</div>
            `;

            container.appendChild(uploadDiv);

            return {
                setProgress: (percent) => {
                    const fill = document.getElementById('upload-progress-fill');
                    const text = document.getElementById('upload-progress-text');
                    
                    if (fill) fill.style.width = percent + '%';
                    if (text) {
                        if (percent < 25) {
                            text.textContent = 'Analyzing file structure...';
                        } else if (percent < 50) {
                            text.textContent = 'Encoding for matrix transmission...';
                        } else if (percent < 75) {
                            text.textContent = 'Injecting into neural pathways...';
                        } else if (percent < 95) {
                            text.textContent = 'Finalizing matrix integration...';
                        } else {
                            text.textContent = 'Upload complete!';
                        }
                    }
                },
                
                complete: () => {
                    const text = document.getElementById('upload-progress-text');
                    if (text) text.textContent = 'File successfully added to matrix!';
                    
                    if (onComplete) {
                        setTimeout(onComplete, 1000);
                    }
                    
                    setTimeout(() => {
                        if (uploadDiv.parentNode) {
                            uploadDiv.parentNode.removeChild(uploadDiv);
                        }
                    }, 2000);
                },
                
                error: (errorMsg) => {
                    const text = document.getElementById('upload-progress-text');
                    if (text) {
                        text.textContent = errorMsg || 'Upload failed!';
                        text.className = 'progress-text loading-error';
                    }
                    
                    setTimeout(() => {
                        if (uploadDiv.parentNode) {
                            uploadDiv.parentNode.removeChild(uploadDiv);
                        }
                    }, 3000);
                }
            };
        },

        // Show sequence loading
        showSequenceLoading: function(containerId, sequenceName, onComplete) {
            const sequence = this.sequences[sequenceName];
            if (!sequence) return;

            const container = document.getElementById(containerId);
            if (!container) return;

            const seqDiv = document.createElement('div');
            seqDiv.className = 'sequence-loading';
            
            let currentIndex = 0;

            const addLine = () => {
                if (currentIndex >= sequence.length) {
                    if (onComplete) {
                        setTimeout(onComplete, 500);
                    }
                    return;
                }

                const item = sequence[currentIndex];
                const line = document.createElement('div');
                line.className = `loading-line ${item.type}`;
                line.textContent = item.text;
                
                // Add typing effect for important lines
                if (item.type === 'ok') {
                    line.classList.add('typing-effect');
                }
                
                seqDiv.appendChild(line);
                
                currentIndex++;
                setTimeout(addLine, item.delay);
            };

            container.appendChild(seqDiv);
            setTimeout(addLine, 100);
        },

        // Show spinner
        showSpinner: function(containerId, message) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const spinnerDiv = document.createElement('div');
            spinnerDiv.className = 'spinner-container';
            spinnerDiv.innerHTML = `
                <div class="matrix-spinner">
                    <span class="spinner-chars"></span>
                </div>
                <div class="spinner-message glow-text">${message || 'Processing...'}</div>
            `;

            container.appendChild(spinnerDiv);

            return {
                remove: () => {
                    if (spinnerDiv.parentNode) {
                        spinnerDiv.parentNode.removeChild(spinnerDiv);
                    }
                }
            };
        },

        // Show error loading state
        showError: function(containerId, errorMsg, onRetry) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const errorDiv = document.createElement('div');
            errorDiv.className = 'loading-error';
            errorDiv.innerHTML = `
                <div class="error-text">${errorMsg || 'Matrix connection failed'}</div>
                ${onRetry ? '<button class="matrix-btn retry-btn"><span class="btn-text">RETRY</span></button>' : ''}
            `;

            if (onRetry) {
                const retryBtn = errorDiv.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', onRetry);
                }
            }

            container.appendChild(errorDiv);

            return {
                remove: () => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }
            };
        },

        // Show success state
        showSuccess: function(containerId, message, autoHide) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const successDiv = document.createElement('div');
            successDiv.className = 'loading-success';
            successDiv.innerHTML = `<div class="success-text">${message || 'Operation completed successfully!'}</div>`;

            container.appendChild(successDiv);

            if (autoHide !== false) {
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.parentNode.removeChild(successDiv);
                    }
                }, 2000);
            }

            return {
                remove: () => {
                    if (successDiv.parentNode) {
                        successDiv.parentNode.removeChild(successDiv);
                    }
                }
            };
        },

        // Clear all loading states
        clear: function(containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        }
    };

})();