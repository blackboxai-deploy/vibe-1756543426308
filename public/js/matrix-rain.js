// Matrix Rain Effect - Optimized for mobile devices
(function() {
    'use strict';

    // Matrix Rain class
    window.MatrixRain = function(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = Object.assign({
            intensity: 0.5, // 0-1, lower for mobile
            speed: 0.8, // 0-2, lower for battery saving
            fontSize: 14,
            opacity: 0.6
        }, options || {});

        // Matrix characters (Japanese katakana + numbers)
        this.chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
        this.charArray = this.chars.split('');

        // Colors for different depths
        this.colors = [
            'rgba(0, 255, 0, 0.9)',     // Bright green (front)
            'rgba(0, 200, 0, 0.7)',     // Medium green
            'rgba(0, 150, 0, 0.5)',     // Darker green
            'rgba(0, 100, 0, 0.3)'      // Darkest green (back)
        ];

        // Performance settings based on device
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isLowEnd = this.detectLowEndDevice();
        
        if (this.isLowEnd) {
            this.options.intensity *= 0.5;
            this.options.speed *= 0.7;
            this.options.fontSize = Math.max(16, this.options.fontSize);
        }

        this.drops = [];
        this.animationFrame = null;
        this.lastTime = 0;
        this.fps = this.isLowEnd ? 20 : 30; // Lower FPS for low-end devices
        this.frameInterval = 1000 / this.fps;

        this.init();
        this.start();
    };

    // Prototype methods
    MatrixRain.prototype = {
        // Initialize the rain effect
        init: function() {
            this.resizeCanvas();
            this.createDrops();
            
            // Handle window resize
            window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
            
            // Pause on visibility change (battery saving)
            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        },

        // Detect low-end devices
        detectLowEndDevice: function() {
            // Simple heuristics for low-end device detection
            const memory = navigator.deviceMemory || 4; // Default to 4GB if not supported
            const cores = navigator.hardwareConcurrency || 4;
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            // Consider low-end if:
            // - Less than 3GB RAM
            // - Less than 4 cores
            // - Slow connection
            return memory < 3 || cores < 4 || (connection && connection.effectiveType && 
                   (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'));
        },

        // Resize canvas to full screen
        resizeCanvas: function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Recalculate columns based on new width
            this.columns = Math.floor(this.canvas.width / this.options.fontSize);
            this.createDrops();
        },

        // Handle window resize
        handleResize: function() {
            this.resizeCanvas();
        },

        // Handle visibility change
        handleVisibilityChange: function() {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        },

        // Create drops for each column
        createDrops: function() {
            this.drops = [];
            const numDrops = Math.floor(this.columns * this.options.intensity);
            
            for (let i = 0; i < numDrops; i++) {
                this.drops.push({
                    x: Math.floor(Math.random() * this.columns) * this.options.fontSize,
                    y: Math.random() * this.canvas.height,
                    speed: (Math.random() * this.options.speed + 0.5) * this.options.fontSize,
                    char: this.charArray[Math.floor(Math.random() * this.charArray.length)],
                    color: Math.floor(Math.random() * this.colors.length),
                    trail: []
                });
            }
        },

        // Start the animation
        start: function() {
            if (this.animationFrame) return;
            this.lastTime = performance.now();
            this.animate();
        },

        // Stop the animation
        stop: function() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        },

        // Main animation loop
        animate: function() {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;

            if (deltaTime >= this.frameInterval) {
                this.update(deltaTime);
                this.draw();
                this.lastTime = currentTime;
            }

            this.animationFrame = requestAnimationFrame(this.animate.bind(this));
        },

        // Update drop positions
        update: function(deltaTime) {
            const speedMultiplier = deltaTime / 16.67; // Normalize to 60fps

            for (let i = 0; i < this.drops.length; i++) {
                const drop = this.drops[i];
                
                // Add current position to trail
                if (drop.trail.length > 10) {
                    drop.trail.shift();
                }
                drop.trail.push({ x: drop.x, y: drop.y });

                // Move drop down
                drop.y += drop.speed * speedMultiplier;

                // Reset if drop goes off screen
                if (drop.y > this.canvas.height + 50) {
                    drop.y = -50;
                    drop.x = Math.floor(Math.random() * this.columns) * this.options.fontSize;
                    drop.char = this.charArray[Math.floor(Math.random() * this.charArray.length)];
                    drop.trail = [];
                }

                // Occasionally change character
                if (Math.random() < 0.01) {
                    drop.char = this.charArray[Math.floor(Math.random() * this.charArray.length)];
                }
            }
        },

        // Draw the rain effect
        draw: function() {
            // Clear canvas with fade effect
            this.ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + (this.options.opacity * 0.1)})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Set font
            this.ctx.font = `${this.options.fontSize}px monospace`;
            this.ctx.textAlign = 'center';

            // Draw drops
            for (let i = 0; i < this.drops.length; i++) {
                const drop = this.drops[i];
                
                // Draw trail (fading effect)
                for (let j = 0; j < drop.trail.length; j++) {
                    const trailDrop = drop.trail[j];
                    const alpha = (j / drop.trail.length) * 0.5;
                    const colorWithAlpha = this.colors[drop.color].replace(/[\d\.]+\)$/g, alpha + ')');
                    
                    this.ctx.fillStyle = colorWithAlpha;
                    this.ctx.fillText(drop.char, trailDrop.x + this.options.fontSize/2, trailDrop.y);
                }

                // Draw main drop
                this.ctx.fillStyle = this.colors[drop.color];
                this.ctx.fillText(drop.char, drop.x + this.options.fontSize/2, drop.y);
            }
        },

        // Utility: Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        // Destroy the effect
        destroy: function() {
            this.stop();
            window.removeEventListener('resize', this.handleResize);
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
    };

    // Auto-initialize if canvas is already present
    document.addEventListener('DOMContentLoaded', function() {
        const canvases = document.querySelectorAll('canvas[data-matrix-rain]');
        for (let i = 0; i < canvases.length; i++) {
            new MatrixRain(canvases[i]);
        }
    });

})();