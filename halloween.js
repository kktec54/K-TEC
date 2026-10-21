/**
 * ハロウィンの演出（#42）
 * 10月の間だけ、トップのインスタのボタンをかぼちゃが食べ、口から出てきたおばけがボタンになる。
 * 見た目と動きは halloween.css。10月以外は何もしない。
 */

(() => {
    if (new Date().getMonth() !== 9) return; // 0 始まりなので 9 = 10月

    // ロゴの演出（K-TEC の文字が集まる。main.js で 8.5 秒後に開始、約1秒）が終わってから始める
    const START_DELAY = 9800;
    const PLAY_TIME = 4800;

    const BAT = `<svg viewBox="0 0 120 90">
        <g class="hw-wl"><path d="M48 46 C38 40 22 34 12 18 C6 34 4 56 8 76 C12 70 18 70 20 76 C24 68 30 68 33 74 C36 66 42 66 46 70 Z"/></g>
        <g class="hw-wr"><path d="M72 44 C84 36 96 26 102 6 C112 26 118 50 114 72 C110 66 104 66 102 72 C98 64 92 64 90 70 C86 62 80 62 76 66 Z"/></g>
        <path d="M46 37 L47 22 L56 31 Z"/><path d="M74 37 L73 22 L64 31 Z"/>
        <circle cx="60" cy="45" r="16"/><ellipse cx="61" cy="61" rx="14" ry="12"/>
        <circle cx="54" cy="43" r="2.6" fill="#fff"/><circle cx="66" cy="43" r="2.6" fill="#fff"/>
        <path d="M50 50 Q60 57 70 50" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <path d="M53 52 l1.6 5.5 l1.6 -4.6 z M65.5 52.8 l1.6 4.6 l1.6 -5.5 z" fill="#fff"/>
    </svg>`;

    const IG_GRADIENT = `<stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/>
        <stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/>`;

    // 黒ねこを乗せた、顔が光る黒いかぼちゃ
    const PUMPKIN = `<svg viewBox="0 -30 140 182">
        <defs>
            <radialGradient id="hw-glow" cx="50%" cy="40%" r="65%">
                <stop offset="0" stop-color="#ffc24d"/><stop offset=".65" stop-color="#f7a01a"/><stop offset="1" stop-color="#e57800"/>
            </radialGradient>
            <radialGradient id="hw-ig-small" cx="30%" cy="107%" r="150%">${IG_GRADIENT}</radialGradient>
        </defs>
        <g class="hw-cat">
            <path d="M31 60 C14 62 6 48 11 36 C14 28 7 25 4 31" fill="none" stroke="#555" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M31 60 C14 62 6 48 11 36 C14 28 7 25 4 31" fill="none" stroke="#262626" stroke-width="4.5" stroke-linecap="round"/>
            <g fill="#262626" stroke="#555" stroke-width="1.5" stroke-linejoin="round">
                <path d="M34 2 C30 24 30 40 28 52 C26 62 30 68 40 68 L60 68 C67 68 67 56 62 48 C58 40 54 28 54 2 Z"/>
                <path d="M26 -9 L27 -30 L40 -18 Z"/><path d="M62 -9 L61 -30 L48 -18 Z"/>
                <ellipse cx="44" cy="-5" rx="20" ry="15"/>
            </g>
            <path d="M29.5 -13 L30 -25 L37 -18 Z M58.5 -13 L58 -25 L51 -18 Z" fill="#777"/>
            <ellipse cx="36" cy="-8" rx="5.5" ry="4" fill="#ffe600"/><ellipse cx="52" cy="-8" rx="5.5" ry="4" fill="#ffe600"/>
            <ellipse cx="36" cy="-8" rx="1.3" ry="3.4" fill="#141414"/><ellipse cx="52" cy="-8" rx="1.3" ry="3.4" fill="#141414"/>
            <path d="M29 -1 Q44 12 59 -1 Q44 5 29 -1 Z" fill="#ffe600"/>
            <polyline points="31,0.6 34,3.6 37,2.2 40,5.6 43,3.6 46,5.6 49,3.4 52,4.8 55,2 57.5,0.8" fill="none" stroke="#141414" stroke-width="1.1" stroke-linejoin="round"/>
        </g>
        <path class="hw-stem" d="M68 66 Q70 44 90 28 l6 5 Q81 46 79 66 Z" fill="#141414"/>
        <path d="M20 72 C26 62 40 62 48 66 C54 60 64 58 72 63 C80 58 92 58 98 64 C106 60 118 62 124 70 C134 80 138 100 136 118 C134 140 124 150 108 150 C96 152 84 150 70 150 C56 150 44 152 32 150 C14 148 4 134 4 112 C4 94 10 80 20 72 Z" fill="#141414"/>
        <g class="hw-eyes-open" fill="url(#hw-glow)">
            <path d="M50 84 C38 88 34 102 42 108 L62 108 L61 102 C53 100 48 94 50 84 Z"/>
            <path d="M105 87 C116 90 122 100 118 106 L94 108 L94 102 C102 100 106 94 105 87 Z"/>
        </g>
        <g class="hw-eyes-happy" fill="none" stroke="#ffb030" stroke-width="6" stroke-linecap="round">
            <path d="M40 104 q11 -14 22 0"/><path d="M94 104 q11 -14 22 0"/>
        </g>
        <path d="M75 98 h6 l4 12 h-14 z" fill="url(#hw-glow)"/>
        <path class="hw-mouth" d="M31 100 C44 112 60 116 76 115 C96 114 114 110 128 104 C126 124 108 140 76 140 C50 140 34 126 31 100 Z" fill="url(#hw-glow)"/>
        <g class="hw-gulp">
            <circle cx="76" cy="128" r="11" fill="url(#hw-ig-small)"/>
            <rect x="70" y="122" width="12" height="12" rx="3.6" fill="none" stroke="#fff" stroke-width="1.7"/>
            <circle cx="76" cy="128" r="2.9" fill="none" stroke="#fff" stroke-width="1.7"/>
        </g>
        <g fill="#141414">
            <path d="M50.5 108.5 L61.5 108.5 L59.8 124.5 L55.5 124.5 Z"/><path d="M93.5 108.5 L103.5 108.5 L102.2 123.5 L97.6 124 Z"/>
        </g>
        <g class="hw-jaw" fill="#141414">
            <path d="M61 141 L62 133.5 L68.5 133 L69 141 Z"/><path d="M82 141 L82.5 134.5 L90 133 L91.5 141 Z"/>
        </g>
    </svg>`;

    // インスタのマークを抱えたおばけ
    const GHOST = `<svg viewBox="0 0 100 110">
        <defs><radialGradient id="hw-ig" cx="30%" cy="107%" r="150%">${IG_GRADIENT}</radialGradient></defs>
        <path d="M48 8 C26 8 16 26 18 50 C20 70 14 86 24 96 C34 104 46 94 58 98 C70 102 80 110 96 100 C84 96 78 88 80 76 C82 60 82 46 80 34 C76 16 66 8 48 8 Z" fill="#fbf8ee" stroke="#a9a49a" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="38" cy="34" r="4" fill="#3a2e2e"/><circle cx="60" cy="32" r="4" fill="#3a2e2e"/>
        <path d="M42 42 Q50 54 58 41 Z" fill="#3a2e2e" stroke="#3a2e2e" stroke-width="2" stroke-linejoin="round"/>
        <g transform="translate(31 52)">
            <rect width="34" height="34" rx="10" fill="url(#hw-ig)"/>
            <rect x="7" y="7" width="20" height="20" rx="6" fill="none" stroke="#fff" stroke-width="2.6"/>
            <circle cx="17" cy="17" r="4.6" fill="none" stroke="#fff" stroke-width="2.6"/>
            <circle cx="23.5" cy="10.5" r="1.6" fill="#fff"/>
        </g>
        <ellipse cx="30" cy="70" rx="7" ry="5.5" fill="#fbf8ee" stroke="#a9a49a" stroke-width="2.5"/>
        <ellipse cx="66" cy="70" rx="7" ry="5.5" fill="#fbf8ee" stroke="#a9a49a" stroke-width="2.5"/>
    </svg>`;

    const STAR = '<path d="M12 1l3 7.5 8 .5-6 5 2 8-7-4.5-7 4.5 2-8-6-5 8-.5z" fill="currentColor"/>';

    // 噛んだときに飛ぶ、インスタの色のかけら
    const CRUMBS = [
        ['#fd5949', 30, -40], ['#d6249f', 44, -6], ['#285AEB', 26, 30],
        ['#fdf497', -8, -48], ['#fd5949', 8, 40], ['#d6249f', 52, -30],
    ].map(([color, dx, dy]) => `<span class="hw-crumb" style="background:${color}; --dx:${dx}px; --dy:${dy}px"></span>`).join('');

    let charIndex = 0;
    const letters = (word) => word.split('').map((c) => `<span class="hw-ch" style="--i:${charIndex++}">${c}</span>`).join('');

    document.addEventListener('DOMContentLoaded', () => {
        const hero = document.querySelector('.hero');
        const btn = hero && hero.querySelector('.instagram-icon-btn');
        if (!btn) return;

        // Happy Halloween の書体は10月だけ読み込む
        const font = document.createElement('link');
        font.rel = 'stylesheet';
        font.href = 'https://fonts.googleapis.com/css2?family=Chewy&display=swap';
        document.head.appendChild(font);

        hero.classList.add('is-halloween');
        hero.insertAdjacentHTML('afterbegin', `<div class="hw-bats" aria-hidden="true">
            <div class="hw-bat b1"><div class="hw-bat-wave">${BAT}</div></div>
            <div class="hw-bat b2"><div class="hw-bat-wave">${BAT}</div></div>
            <div class="hw-bat b3"><div class="hw-bat-wave">${BAT}</div></div>
        </div>`);

        hero.insertAdjacentHTML('beforeend', `<div class="hw">
            <div class="hw-center">
                <div class="hw-ig" aria-hidden="true">${btn.querySelector('svg').outerHTML}</div>
                <div class="hw-pk-enter" aria-hidden="true"><div class="hw-pk-lunge"><div class="hw-pk-body">${PUMPKIN}</div></div></div>
                <div aria-hidden="true">
                    ${CRUMBS}
                    <div class="hw-mogu">もぐもぐ…</div>
                    <div class="hw-gefu">げふっ♪</div>
                    <svg class="hw-star" style="--dx:-40px; --dy:-36px" viewBox="0 0 24 24">${STAR}</svg>
                    <svg class="hw-star" style="--dx:-6px; --dy:-58px" viewBox="0 0 24 24">${STAR}</svg>
                    <svg class="hw-star" style="--dx:26px; --dy:-30px" viewBox="0 0 24 24">${STAR}</svg>
                    <div class="hw-hh hw-hh-l">${letters('Happy')}</div>
                    <div class="hw-hh hw-hh-r">${letters('Halloween')}</div>
                    <span class="hw-tw t1">✦</span><span class="hw-tw t2">✦</span><span class="hw-tw t3">✧</span>
                </div>
                <a class="hw-ghost" href="${btn.href}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" tabindex="-1">
                    <div class="hw-ghost-bob">${GHOST}</div>
                </a>
            </div>
        </div>`);

        const layer = hero.querySelector('.hw');
        const center = layer.querySelector('.hw-center');
        const ghost = layer.querySelector('.hw-ghost');

        // 舞台の中心を、本物のボタンの中心に合わせる（画面の幅が変わったら合わせ直す）
        // ボタンは登場の動き（下から浮き上がる）の途中でずれて見えるので、動きを含まない位置で測る
        const place = () => {
            let x = btn.offsetWidth / 2;
            let y = btn.offsetHeight / 2;
            for (let el = btn; el && el !== hero; el = el.offsetParent) {
                x += el.offsetLeft;
                y += el.offsetTop;
                const parent = el.offsetParent;
                if (parent && parent !== hero) {
                    x -= parent.scrollLeft;
                    y -= parent.scrollTop;
                }
            }
            center.style.left = `${x}px`;
            center.style.top = `${y}px`;
        };

        window.addEventListener('resize', place);
        window.addEventListener('load', place);

        // 「アニメーションを減らす」設定の人にも同じ演出を見せる（#46）
        setTimeout(() => {
            place();
            // 本物のボタンを隠し、食べられる複製と入れ替える
            hero.classList.add('is-halloween-swapped');
            btn.setAttribute('tabindex', '-1');
            btn.setAttribute('aria-hidden', 'true');
            layer.classList.add('is-play');
            // 演出が終わったら、おばけをボタンとして押せるようにする
            setTimeout(() => {
                layer.classList.add('is-done');
                ghost.removeAttribute('tabindex');
            }, PLAY_TIME);
        }, START_DELAY);
    });
})();
