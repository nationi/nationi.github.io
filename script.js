window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');

    preloader.classList.add('hidden');

    setTimeout(() => {
      preloader.remove();
    }, 1000); 
});

(() => {

    const canvas = document.getElementById('particles-canvas');

    if (!canvas) {
        console.error('Canvas element not found');
        return; 
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Failed to get 2d context');
        return; 
    }

    const PARTICLE_CONFIG = {
        amount: 150,            
        size: {
            min: 1,
            max: 5
        },
        speed: {
            min: 0.2,
            max: 0.8
        },
        opacity: {
            min: 0.1,
            max: 0.7
        },
        colors: ['#6C63FF', '#F468B7', '#40E0D0', '#FFFFFF'],
        connectionDistance: 150,
        connectionOpacity: 0.15,
        responsive: true        
    };

    const adjustConfigForScreenSize = () => {
        const config = { ...PARTICLE_CONFIG };
        const { innerWidth, innerHeight } = window;

        const smallerDimension = Math.min(innerWidth, innerHeight);

        const isLowEndDevice = () => {
            const isLowRAM = navigator.deviceMemory && navigator.deviceMemory <= 4; 
            const isLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4; 
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            return isLowRAM || isLowCores || isMobile;
        };

        if (innerWidth <= 768) {
            config.amount = 80;
            config.connectionDistance = 100;
        }

        if (innerWidth <= 480) {
            config.amount = 50;
            config.connectionDistance = 70;
            config.size.max = 4;
            config.speed.max = 0.6;
            config.speed.min = 0.15;
        }

        if (smallerDimension <= 350) {
            config.amount = 30;
            config.connectionDistance = 50;
        }

        if (isLowEndDevice()) {
            config.amount = Math.max(20, Math.floor(config.amount * 0.5));
            config.connectionOpacity *= 0.6;
            config.connectionDistance = Math.floor(config.connectionDistance * 0.8);

            if ('ontouchstart' in window) {
                config.speed.max *= 0.7;
                config.speed.min *= 0.7;
            }

            if (smallerDimension <= 400) {
                config.amount = Math.max(15, Math.floor(config.amount * 0.7));
                config.connectionDistance = Math.floor(config.connectionDistance * 0.7);
            }
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            config.amount = Math.max(10, Math.floor(config.amount * 0.5));
            config.speed.max *= 0.5;
            config.speed.min *= 0.5;
        }

        return config;
    };

    let config = adjustConfigForScreenSize();

    let particles = [];

    class Particle {
        constructor() {
            this.init();
        }

        init() {

            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;

            this.vx = (Math.random() - 0.5) * config.speed.max;
            this.vy = (Math.random() - 0.5) * config.speed.max;

            this.size = Math.random() * (config.size.max - config.size.min) + config.size.min;

            this.color = config.colors[Math.floor(Math.random() * config.colors.length)];

            this.opacity = Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min;

            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulseFactor = 0;

            this.currentSize = this.size;
            this.currentOpacity = this.opacity;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.currentOpacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        drawConnections(particles) {
            particles.forEach(particle => {
                const distance = this.getDistance(particle);
                if (distance < config.connectionDistance && distance > 0) {
                    ctx.beginPath();
                    ctx.strokeStyle = this.color;

                    const opacity = (1 - distance / config.connectionDistance) * config.connectionOpacity;
                    ctx.globalAlpha = opacity;

                    ctx.lineWidth = 0.5;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(particle.x, particle.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });
        }

        getDistance(particle) {
            const dx = this.x - particle.x;
            const dy = this.y - particle.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    const init = () => {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        config = adjustConfigForScreenSize();

        particles = [];
        for (let i = 0; i < config.amount; i++) {
            particles.push(new Particle());
        }
    };

    let isPageVisible = true;
    let animationFrameId = null;
    let lastTimestamp = 0;

    const toggleAnimation = (visible) => {
        isPageVisible = visible;

        if (visible) {

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            animationFrameId = requestAnimationFrame(animate);
            lastTimestamp = performance.now(); 
        } else if (animationFrameId) {

            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    if (document.hidden !== undefined) {

        document.addEventListener('visibilitychange', () => {
            toggleAnimation(!document.hidden);
        }, { passive: true });
    }

    window.addEventListener('blur', () => toggleAnimation(false), { passive: true });
    window.addEventListener('focus', () => toggleAnimation(true), { passive: true });

    window.addEventListener('mousemove', () => {
        if (!isPageVisible) toggleAnimation(true);
    }, { passive: true, once: true });

    document.addEventListener('visibilitychange', () => {

        if (!document.hidden && performance.now() - lastTimestamp > 5000) {

            console.log('Принудительное возобновление анимации после длительного простоя');
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            lastTimestamp = performance.now();
            isPageVisible = true;
            animationFrameId = requestAnimationFrame(animate);
        }
    });

    setInterval(() => {
        if (isPageVisible && !animationFrameId && document.visibilityState === 'visible') {
            console.log('Обнаружена остановка анимации, перезапуск');
            lastTimestamp = performance.now();
            animationFrameId = requestAnimationFrame(animate);
        }
    }, 10000);

    let resizeTimeout;
    window.addEventListener('resize', () => {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            if (config.responsive) {
                init();
            }
        }, 150);
    }, { passive: true });

    init();
    animationFrameId = requestAnimationFrame(animate);

    function animate(timestamp) {
        if (!isPageVisible) {
            animationFrameId = null;
            return;
        }

        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = Math.min(timestamp - lastTimestamp, 100) / 1000; 
        lastTimestamp = timestamp;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const skipFrame = isMobile && Math.random() > 0.7;
        
        if (skipFrame) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.x += particle.vx * deltaTime * 60; 
            particle.y += particle.vy * deltaTime * 60;

            if (isMobile) {
                particle.pulseFactor += particle.pulseSpeed * deltaTime * 30;
                const pulse = Math.sin(particle.pulseFactor) * 0.3 + 0.5;
                particle.currentSize = particle.size * (0.9 + pulse * 0.2);
                particle.currentOpacity = particle.opacity * (0.8 + pulse * 0.2);
            } else {
                particle.pulseFactor += particle.pulseSpeed * deltaTime * 60;
                const pulse = Math.sin(particle.pulseFactor) * 0.5 + 0.5;
                particle.currentSize = particle.size * (0.8 + pulse * 0.4);
                particle.currentOpacity = particle.opacity * (0.7 + pulse * 0.3);
            }

            if (particle.x < 0 || particle.x > canvas.width || 
                particle.y < 0 || particle.y > canvas.height) {
                particle.init();

                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
            }

            particle.draw();

            if (
                particle.x >= -config.connectionDistance && 
                particle.x <= canvas.width + config.connectionDistance && 
                particle.y >= -config.connectionDistance && 
                particle.y <= canvas.height + config.connectionDistance
            ) {
                particle.drawConnections(particles);
            }
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    let lastMouseMoveTime = 0;
    const mouseMoveThrottle = 'ontouchstart' in window ? 1000 / 30 : 1000 / 60;

    const handleMouseMove = (e) => {
        const currentTime = Date.now();

        if (currentTime - lastMouseMoveTime < mouseMoveThrottle) return;

        lastMouseMoveTime = currentTime;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 500;
                particle.vx -= dx * force;
                particle.vy -= dy * force;
            }
        });
    };

    if (!('ontouchstart' in window)) {
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const handleClick = (e) => {
        const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        if (!x && !y) return; 

        const isMobile = 'ontouchstart' in window;
        const particleCount = isMobile ? 3 : 8;
        const maxExtraParticles = isMobile ? 20 : 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = new Particle();
            particle.x = x;
            particle.y = y;
            
            if (isMobile) {
                particle.vx = (Math.random() - 0.5) * 3.5;
                particle.vy = (Math.random() - 0.5) * 3.5;
                particle.size = Math.random() * 3 + 1.5;
            } else {
                particle.vx = (Math.random() - 0.5) * 5;
                particle.vy = (Math.random() - 0.5) * 5;
                particle.size = Math.random() * 4 + 2;
            }
            
            particle.opacity = 1;
            particles.push(particle);

            if (particles.length > config.amount + maxExtraParticles) {
                particles.shift();
            }
        }
    };

    document.addEventListener('click', handleClick, { passive: true });

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            e.preventDefault(); 
            handleClick(e);
        }
    }, { passive: false });

    document.addEventListener('touchstart', (e) => {

        if (e.target !== canvas && e.touches.length > 0) {
            handleClick(e);
        }
    }, { passive: true });
})();
