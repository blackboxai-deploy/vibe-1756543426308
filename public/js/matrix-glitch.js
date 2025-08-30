// Matrix Glitch Effects - Text glitches and digital distortions
(function() {
    'use strict';

    // Matrix Glitch namespace
    window.MatrixGlitch = {
        // Active glitch elements
        activeGlitches: new Set(),
        
        // Glitch characters for text corruption
        glitchChars: '!@#$%^&*()_+-=[]{}|;:,.<>?`~アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',

        // Initialize glitch effects
        init: function() {
            this.initializeGlitchElements();
            this.setupGlobalGlitches();
        },

        // Initialize elements with glitch data attributes
        initializeGlitchElements: function() {
            // Auto-initialize glitch text elements
            const glitchElements = document.querySelectorAll('[data-glitch]');
            for (let i = 0; i < glitchElements.length; i++) {
                this.addTextGlitch(glitchElements[i]);
            }

            // Auto-initialize glitch containers
            const containers = document.querySelectorAll('[data-glitch-container]');
            for (let i = 0; i < containers.length; i++) {
                this.addContainerGlitch(containers[i]);
            }
        },

        // Setup global glitch effects
        setupGlobalGlitches: function() {
            // Random page glitches
            if (Math.random() < 0.3) { // 30% chance
                setTimeout(() => {
                    this.triggerPageGlitch();
                }, Math.random() * 10000 + 5000); // 5-15 seconds
            }

            // Glitch on user interactions
            document.addEventListener('click', (e) => {
                if (Math.random() < 0.1) { // 10% chance on click
                    this.triggerClickGlitch(e.target);
                }
            });
        },

        // Add text glitch effect to element
        addTextGlitch: function(element, options) {
            const settings = Object.assign({
                intensity: 0.1,
                duration: 100,
                interval: 3000,
                corruption: true
            }, options || {});

            const originalText = element.textContent;
            let glitchInterval;
            let isGlitching = false;

            const glitch = () => {
                if (isGlitching) return;
                isGlitching = true;

                const glitchText = settings.corruption ? 
                    this.corruptText(originalText, settings.intensity) : originalText;
                
                element.textContent = glitchText;
                element.classList.add('glitching');

                setTimeout(() => {
                    element.textContent = originalText;
                    element.classList.remove('glitching');
                    isGlitching = false;
                }, settings.duration);
            };

            // Start periodic glitching
            glitchInterval = setInterval(glitch, settings.interval + Math.random() * 2000);
            this.activeGlitches.add({ element, interval: glitchInterval });

            return {
                trigger: glitch,
                stop: () => {
                    clearInterval(glitchInterval);
                    this.activeGlitches.delete({ element, interval: glitchInterval });
                    element.textContent = originalText;
                    element.classList.remove('glitching');
                }
            };
        },

        // Add container glitch effect
        addContainerGlitch: function(container, options) {
            const settings = Object.assign({
                duration: 200,
                interval: 5000,
                intensity: 0.3
            }, options || {});

            let glitchInterval;

            const glitch = () => {
                container.classList.add('digital-distortion');
                
                // Random glitch effects
                const effects = ['blur', 'contrast', 'invert', 'hue-rotate'];
                const effect = effects[Math.floor(Math.random() * effects.length)];
                
                switch (effect) {
                    case 'blur':
                        container.style.filter = `blur(${Math.random() * 2}px)`;
                        break;
                    case 'contrast':
                        container.style.filter = `contrast(${1 + Math.random() * 0.5})`;
                        break;
                    case 'invert':
                        container.style.filter = `invert(${Math.random() * 0.2})`;
                        break;
                    case 'hue-rotate':
                        container.style.filter = `hue-rotate(${Math.random() * 30}deg)`;
                        break;
                }

                setTimeout(() => {
                    container.classList.remove('digital-distortion');
                    container.style.filter = '';
                }, settings.duration);
            };

            glitchInterval = setInterval(glitch, settings.interval + Math.random() * 3000);
            this.activeGlitches.add({ element: container, interval: glitchInterval });

            return {
                trigger: glitch,
                stop: () => {
                    clearInterval(glitchInterval);
                    container.classList.remove('digital-distortion');
                    container.style.filter = '';
                }
            };
        },

        // Corrupt text with glitch characters
        corruptText: function(text, intensity) {
            intensity = Math.max(0, Math.min(1, intensity)); // Clamp between 0-1
            const chars = text.split('');
            const numToCorrupt = Math.floor(chars.length * intensity);

            for (let i = 0; i < numToCorrupt; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                const randomChar = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
                chars[randomIndex] = randomChar;
            }

            return chars.join('');
        },

        // Trigger page-wide glitch effect
        triggerPageGlitch: function() {
            const body = document.body;
            const duration = 100 + Math.random() * 200;

            // Add glitch class to body
            body.classList.add('page-glitch');

            // Random visual distortions
            const glitchEffects = [
                () => body.style.filter = 'contrast(1.2) hue-rotate(10deg)',
                () => body.style.filter = 'invert(0.1) contrast(1.1)',
                () => body.style.transform = 'skewX(0.5deg)',
                () => body.style.filter = 'blur(0.5px) contrast(1.3)'
            ];

            const effect = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
            effect();

            // Trigger text glitches on random elements
            const textElements = document.querySelectorAll('h1, h2, h3, p, span, button');
            const numElements = Math.min(5, Math.floor(textElements.length * 0.1));
            
            for (let i = 0; i < numElements; i++) {
                const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
                if (randomElement && !randomElement.classList.contains('glitching')) {
                    this.quickGlitch(randomElement, 150);
                }
            }

            // Reset after duration
            setTimeout(() => {
                body.classList.remove('page-glitch');
                body.style.filter = '';
                body.style.transform = '';
            }, duration);
        },

        // Trigger glitch on click target
        triggerClickGlitch: function(target) {
            if (!target || target.classList.contains('glitching')) return;

            this.quickGlitch(target, 80);
            
            // Ripple effect to nearby elements
            const nearby = this.getNearbyElements(target, 100);
            nearby.forEach((element, index) => {
                setTimeout(() => {
                    this.quickGlitch(element, 50);
                }, index * 50);
            });
        },

        // Quick glitch effect for temporary glitches
        quickGlitch: function(element, duration) {
            if (element.classList.contains('glitching')) return;

            const originalText = element.textContent;
            const glitchedText = this.corruptText(originalText, 0.3);
            
            element.textContent = glitchedText;
            element.classList.add('glitching');

            setTimeout(() => {
                element.textContent = originalText;
                element.classList.remove('glitching');
            }, duration || 100);
        },

        // Get nearby elements for ripple effects
        getNearbyElements: function(target, radius) {
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const allElements = document.querySelectorAll('*');
            const nearby = [];

            for (let i = 0; i < allElements.length && nearby.length < 5; i++) {
                const element = allElements[i];
                if (element === target || element.contains(target) || target.contains(element)) continue;
                
                const elemRect = element.getBoundingClientRect();
                const elemCenterX = elemRect.left + elemRect.width / 2;
                const elemCenterY = elemRect.top + elemRect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(centerX - elemCenterX, 2) + Math.pow(centerY - elemCenterY, 2)
                );

                if (distance <= radius && element.textContent && element.textContent.trim()) {
                    nearby.push(element);
                }
            }

            return nearby;
        },

        // Create scan line effect
        addScanLines: function(element) {
            element.classList.add('scan-lines');
            
            return {
                remove: () => element.classList.remove('scan-lines')
            };
        },

        // Create digital noise effect
        addDigitalNoise: function(element, duration) {
            const noiseOverlay = document.createElement('div');
            noiseOverlay.className = 'digital-noise-overlay';
            noiseOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle, rgba(0,255,0,0.1) 1px, transparent 1px),
                    radial-gradient(circle, rgba(0,255,0,0.05) 1px, transparent 1px);
                background-size: 20px 20px, 40px 40px;
                animation: digitalNoise 0.1s linear infinite;
                pointer-events: none;
                z-index: 1000;
            `;

            // Ensure element is positioned
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }

            element.appendChild(noiseOverlay);

            if (duration) {
                setTimeout(() => {
                    if (noiseOverlay.parentNode) {
                        noiseOverlay.parentNode.removeChild(noiseOverlay);
                    }
                }, duration);
            }

            return {
                remove: () => {
                    if (noiseOverlay.parentNode) {
                        noiseOverlay.parentNode.removeChild(noiseOverlay);
                    }
                }
            };
        },

        // Matrix-style data stream effect
        addDataStream: function(element, text, speed) {
            const stream = document.createElement('div');
            stream.className = 'data-stream';
            stream.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                color: var(--matrix-neon-green);
                font-family: var(--font-matrix);
                font-size: var(--font-xs);
                white-space: pre;
                pointer-events: none;
                z-index: 100;
                opacity: 0.7;
                animation: dataStreamFlow ${speed || 3}s linear infinite;
            `;

            const streamText = text || this.generateDataStreamText();
            stream.textContent = streamText;

            element.appendChild(stream);

            setTimeout(() => {
                if (stream.parentNode) {
                    stream.parentNode.removeChild(stream);
                }
            }, (speed || 3) * 1000);

            return {
                remove: () => {
                    if (stream.parentNode) {
                        stream.parentNode.removeChild(stream);
                    }
                }
            };
        },

        // Generate random data stream text
        generateDataStreamText: function() {
            const chars = '01アイウエオカキクケコ';
            let result = '';
            for (let i = 0; i < 50; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
                if (i % 10 === 9) result += '\n';
            }
            return result;
        },

        // Stop all active glitches
        stopAll: function() {
            this.activeGlitches.forEach(glitch => {
                if (glitch.interval) {
                    clearInterval(glitch.interval);
                }
                if (glitch.element) {
                    glitch.element.classList.remove('glitching', 'digital-distortion', 'scan-lines');
                    glitch.element.style.filter = '';
                    glitch.element.style.transform = '';
                }
            });
            this.activeGlitches.clear();
        },

        // Destroy glitch system
        destroy: function() {
            this.stopAll();
            document.removeEventListener('click', this.triggerClickGlitch);
        }
    };

    // Auto-initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize if not on low-end devices or reduced motion
        const isLowEnd = navigator.deviceMemory && navigator.deviceMemory < 2;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!isLowEnd && !prefersReducedMotion) {
            MatrixGlitch.init();
        }
    });

})();