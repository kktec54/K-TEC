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
            const highlightArray = Array.isArray(highlightText) ? highlightText : [highlightText];
            highlightArray.forEach(term => {
                let startPos = 0;
                while ((startPos = textWithoutLines.indexOf(term, startPos)) !== -1) {
                    for (let i = 0; i < term.length; i++) {
                        highlightIndices.push(startPos + i);
                    }
                    startPos += term.length;
                }
            });
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
            const text = "次代へと繋ぐ礎　揺るぎない技術";
            lupinAnimate(heroTitle, text, ["礎", "技術"]);
        }, 4500); // Further delayed for slower logo reveal
    }

    // --- Hero Brand Logo Gathering Animation ---
    const brandFinal = document.querySelector('.hero-brand-final');
    if (brandFinal) {
        setTimeout(() => {
            brandFinal.classList.add('show');
            brandFinal.classList.add('is-gathered');
        }, 8500); 
    }

    // --- 自社開発アプリの枠：カードの中を流れるコード（#10） ---
    // 暗い下地に、意味のないコードを下から上へゆっくり流す。ランダムな1〜2文字を5色で色分けする。
    const codeCanvas = document.querySelector('.app-code-bg');
    if (codeCanvas) {
        const ctx = codeCanvas.getContext('2d');
        const SNIPPETS = [
            'const app = createApp({ site: "K-TEC" });',
            'function build(idea) { return deploy(idea); }',
            'if (request) { design(); code(); release(); }',
            'import { useState } from "react";',
            'SELECT * FROM projects WHERE status = "dev";',
            'for (let i = 0; i < pages.length; i++) render(pages[i]);',
            '<section class="hero"><h1>K-TEC</h1></section>',
            'git commit -m "update top page"',
            'await fetch("/api/apps").then(r => r.json());',
            '.btn { border-radius: 50px; color: #fff; }',
            'class SiteLens extends App { scan() {} }',
            'export default { name: "TimeLog" };',
            'npm run build && npm run deploy',
            'let curve = layout(points, radius);',
            'return <Card title="apps" />;',
            'def estimate(work): return work * rate',
        ];
        const COLORS = ['#58a6ff', '#7ee787', '#d2a8ff', '#ffa657', '#ff7b9c'];
        const BASE = 'rgba(201, 209, 217, 0.26)';
        const FONT_SIZE = 12;
        const LINE_H = 18;
        let lines = [];
        let offset = 0;
        let width = 0;
        let height = 0;

        const makeLine = () => {
            const text = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
            const indent = Math.floor(Math.random() * 4) * 2;
            // 1行に2〜4か所、1〜2文字だけ色を付ける
            const marks = {};
            const count = 2 + Math.floor(Math.random() * 3);
            for (let k = 0; k < count; k++) {
                const at = Math.floor(Math.random() * text.length);
                const len = 1 + Math.floor(Math.random() * 2);
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                for (let j = 0; j < len; j++) marks[at + j] = color;
            }
            return { text: ' '.repeat(indent) + text, indent, marks };
        };

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = codeCanvas.clientWidth;
            height = codeCanvas.clientHeight;
            codeCanvas.width = width * dpr;
            codeCanvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = FONT_SIZE + 'px Consolas, Menlo, monospace';
            ctx.textBaseline = 'top';
            const need = Math.ceil(height / LINE_H) + 2;
            while (lines.length < need) lines.push(makeLine());
            lines.length = need;
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.globalAlpha = 1;
            const charW = ctx.measureText('M').width;
            lines.forEach((line, i) => {
                const y = i * LINE_H - offset;
                for (let c = 0; c < line.text.length; c++) {
                    const ch = line.text[c];
                    if (ch === ' ') continue;
                    const x = 14 + c * charW;
                    if (x > width) break;
                    const mark = line.marks[c - line.indent];
                    ctx.globalAlpha = mark ? 0.7 : 1;
                    ctx.fillStyle = mark || BASE;
                    ctx.fillText(ch, x, y);
                }
            });
        };

        let running = false;
        let last = 0;
        const step = (now) => {
            if (!running) return;
            const dt = last ? Math.min(now - last, 100) : 16;
            last = now;
            offset += dt * 0.02; // 1秒に約20px 上へ
            while (offset >= LINE_H) {
                offset -= LINE_H;
                lines.shift();
                lines.push(makeLine());
            }
            draw();
            requestAnimationFrame(step);
        };

        resize();
        draw();
        window.addEventListener('resize', () => { resize(); draw(); });

        // 動きを減らす設定では止めたまま見せる。画面に見えている間だけ流す
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduce && 'IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                const visible = entries[0].isIntersecting;
                if (visible && !running) {
                    running = true;
                    last = 0;
                    requestAnimationFrame(step);
                } else if (!visible) {
                    running = false;
                }
            }).observe(codeCanvas);
        }
    }
});
