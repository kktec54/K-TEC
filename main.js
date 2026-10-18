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

    // --- 自社開発アプリのカード：DM の案内と CODE\10 を1文字ずつ打ち込み、くり返す（#16・#22） ---
    // 1文字ずつ5色からランダムに色を付け、打ち直すたびに色を変える（#18）
    // DM の行を打ってから CODE\10 を打ち、少し見せてから両方消して打ち直す
    const typedEls = Array.from(document.querySelectorAll('.app-teaser .code-typed'));
    if (typedEls.length) {
        const COLORS = ['#0969da', '#1a7f37', '#8250df', '#bc4c00', '#bf3989']; // 青・緑・紫・橙・桃
        const lines = typedEls.map((el) => ({
            el,
            cursor: el.parentElement.querySelector('.code-cursor'),
            text: el.textContent,
            colors: [],
        }));
        const pickColors = () => {
            lines.forEach((line) => {
                line.colors = Array.from(line.text, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
            });
        };
        const render = (line, count) => {
            line.el.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const span = document.createElement('span');
                span.style.color = line.colors[i];
                span.textContent = line.text[i];
                line.el.appendChild(span);
            }
        };
        const setCursor = (index) => {
            lines.forEach((line, i) => line.cursor.classList.toggle('is-active', i === index));
        };
        let current = 0;
        let typed = 0;
        const restart = () => {
            pickColors();
            lines.forEach((line) => render(line, 0));
            current = 0;
            typed = 0;
            setCursor(0);
        };
        const tick = () => {
            const line = lines[current];
            if (typed < line.text.length) {
                typed++;
                render(line, typed);
                setTimeout(tick, 70 + Math.random() * 110);
            } else if (current < lines.length - 1) {
                // 次の行へ移る
                current++;
                typed = 0;
                setCursor(current);
                setTimeout(tick, 500);
            } else {
                // 打ち終わったら少し見せて、消してから色を変えて打ち直す
                setTimeout(() => { restart(); setTimeout(tick, 700); }, 4000);
            }
        };
        restart();
        setTimeout(tick, 600);
    }

    // --- モーダルの共通処理（#24・#26） ---
    // ×ボタン・背景のクリック・Esc キーで閉じる。開いている間は後ろの画面を動かさない
    const setupModal = (modal) => {
        modal.querySelector('.contact-modal-close').addEventListener('click', () => modal.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        });
        modal.addEventListener('close', () => {
            document.body.style.overflow = '';
        });
    };
    const openModal = (modal) => {
        modal.showModal();
        document.body.style.overflow = 'hidden';
    };

    // --- お問い合わせフォームのモーダル（#24） ---
    const contactModal = document.getElementById('contact-form');
    if (contactModal && typeof contactModal.showModal === 'function') {
        setupModal(contactModal);
        document.querySelectorAll('[data-open-contact]').forEach(opener => {
            opener.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(contactModal);
            });
        });
    }

    // --- 連絡先のモーダル（#26） ---
    // 迷惑電話・迷惑メール対策。電話番号とメールはページの文字として置かず、
    // 押されたときに部品から組み立てる（文字を自動で集めるロボットに拾われにくくする）
    const infoModal = document.getElementById('contact-info-modal');
    if (infoModal && typeof infoModal.showModal === 'function') {
        setupModal(infoModal);
        const infoTitle = infoModal.querySelector('.contact-modal-title');
        const infoValue = infoModal.querySelector('.contact-info-value');
        const infoData = {
            address: () => ({ title: '所在地', text: '京都市山科区勧修寺西金ケ崎256-1' }),
            phone: () => {
                const tel = ['8894', '9549', '090'].reverse().join('-');
                return { title: '電話番号 (代表)', text: tel, href: 'tel:' + tel.replace(/-/g, '') };
            },
            email: () => {
                const mail = ['k-tec', ['circus', 'ocn', 'ne', 'jp'].join('.')].join(String.fromCharCode(64));
                return { title: 'メールアドレス', text: mail, href: 'mailto:' + mail };
            },
        };
        document.querySelectorAll('[data-info]').forEach(opener => {
            opener.addEventListener('click', () => {
                const info = infoData[opener.dataset.info]();
                infoTitle.textContent = info.title;
                infoValue.textContent = '';
                if (info.href) {
                    const link = document.createElement('a');
                    link.href = info.href;
                    link.textContent = info.text;
                    infoValue.appendChild(link);
                } else {
                    infoValue.textContent = info.text;
                }
                openModal(infoModal);
            });
        });
    }
});
