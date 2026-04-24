/**
 * K-TEC Corporate Website - Main Javascript
 * Handles scroll effects, animations, and Lupin-style typing.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Header Scroll Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Lupin-style Typing Animation ---
    const lupinAnimate = (element, text, highlightText = "") => {
        element.innerHTML = '';
        
        const lines = text.split('\n');
        const textWithoutLines = text.replace(/\n/g, '');
        const highlightIndices = [];
        
        if (highlightText) {
            let startPos = textWithoutLines.indexOf(highlightText);
            if (startPos !== -1) {
                for (let i = 0; i < highlightText.length; i++) {
                    highlightIndices.push(startPos + i);
                }
            }
        }

        let totalCharIdx = 0;
        lines.forEach((line, lIdx) => {
            line.split('').forEach((char) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.classList.add('lupin-char');
                if (highlightIndices.includes(totalCharIdx)) {
                    span.classList.add('highlight');
                }
                element.appendChild(span);
                totalCharIdx++;
            });
            if (lIdx < lines.length - 1) {
                const br = document.createElement('br');
                br.classList.add('sp-br');
                element.appendChild(br);
            }
        });

        const spans = element.querySelectorAll('.lupin-char');
        spans.forEach((span, index) => {
            setTimeout(() => {
                span.classList.add('show');
            }, 75 * index); 
        });
    };

    // --- Intersection Observer for Animations ---
    const observerOptions = {
        threshold: 0.2
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Check for lupin-text to animate typing
                if (entry.target.classList.contains('lupin-trigger')) {
                    const text = entry.target.dataset.text.replace(/\\n/g, '\n');
                    const highlight = entry.target.dataset.highlight || "";
                    lupinAnimate(entry.target, text, highlight);
                    animationObserver.unobserve(entry.target);
                }
                
                if (entry.target.classList.contains('animate-hidden')) {
                    entry.target.classList.add('animate-show');
                    animationObserver.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.lupin-trigger, .animate-hidden').forEach(el => {
        animationObserver.observe(el);
    });

    // --- Hero Logo Animation Repeat Logic ---
    const logoContainer = document.querySelector('.hero-logo-animate-container');
    
    if (logoContainer) {
        const triggerLogoAnimation = () => {
            logoContainer.classList.remove('is-animating');
            void logoContainer.offsetWidth; // Force reflow to reset CSS animations
            logoContainer.classList.add('is-animating');
        };

        // Initial play
        triggerLogoAnimation();

        // Repeat every 8 seconds (8000ms) for a much slower, grander sequence
        setInterval(triggerLogoAnimation, 8000);
    }

    // --- Hero Title Animation Trigger (Delayed to wait for logo reveal) ---
    const heroTitle = document.querySelector('.hero-title');
    if(heroTitle) {
        setTimeout(() => {
            heroTitle.style.opacity = "1";
            const text = "次代へと繋ぐ！\n揺るぎない技術";
            lupinAnimate(heroTitle, text, "技術");
        }, 4500); // Further delayed for slower logo reveal
    }
});
