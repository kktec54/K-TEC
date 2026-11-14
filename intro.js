/**
 * トップページのオープニング（金の龍の動画）（#52）
 * - 終わったら window.ktecIntroDone（Promise）を解決する。
 *   ロゴ・見出し・ハロウィンの演出は、これを待ってから始める。
 * - 流すのは、日本時間で4と5のつく日（4・5・14・15・24・25日）だけ。
 * - 同じタブで2回目に開いたとき・自動で流せないときは飛ばす。
 */
(function () {
    const overlay = document.getElementById('intro-overlay');
    let resolveDone;
    window.ktecIntroDone = new Promise((resolve) => { resolveDone = resolve; });

    const SEEN_KEY = 'ktec-intro-seen';
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* 使えないときは毎回流す */ }
    // 「アニメーションを減らす」設定の人にも見せる（ハロウィンの #46 と同じ）

    // 4と5のつく日だけ流す（見る人の PC の時刻設定に関係なく、日本時間で決める）
    const SHOW_DAYS = [4, 5, 14, 15, 24, 25];
    let day = new Date().getDate();
    try {
        day = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', day: 'numeric' }).format(new Date()));
    } catch (e) { /* 使えないときは PC の日付で決める */ }
    const isShowDay = SHOW_DAYS.includes(day);

    if (!overlay || seen || !isShowDay) {
        if (overlay) overlay.remove();
        resolveDone();
        return;
    }

    const video = overlay.querySelector('video');
    // 流す日だけ動画を読み込む（ほかの日に無駄な読み込みをしない）
    if (video && video.dataset.src) video.src = video.dataset.src;
    if (video && video.dataset.poster) video.poster = video.dataset.poster;
    const skip = overlay.querySelector('.intro-skip');
    document.documentElement.classList.add('is-intro-playing');

    // 再生中は、動画の後ろに隠れたページを Tab で選べないようにする
    // （intro.js の時点ではまだ本文が読み込まれていないので、読み込み後に付ける）
    const inertTargets = [];
    const setInert = () => {
        if (finished) return;
        Array.from(document.body.children).forEach((el) => {
            if (el !== overlay && el.tagName !== 'SCRIPT' && !el.inert) {
                el.inert = true;
                inertTargets.push(el);
            }
        });
    };
    document.addEventListener('DOMContentLoaded', setInert);

    // 動画の最後の光は、動画の横の真ん中・上から約30% に出る。
    // そこがロゴの真ん中に重なるように動画の縦の位置を合わせる（#56）
    const BURST_Y = 0.30;

    // 動画をそのまま見せると、スマホ（特に iPhone）では動画の白がページの白より少し暗く出て、
    // 四角の境目が線に見える。canvas に1コマずつ描き写して見せ、ページと同じ白にする（#60）。
    // canvas が使えないときは、今までどおり動画を見せる。
    let canvas = null;
    let ctx = null;
    if (video) {
        try {
            canvas = document.createElement('canvas');
            canvas.className = 'intro-canvas';
            canvas.setAttribute('aria-hidden', 'true');
            ctx = canvas.getContext('2d');
        } catch (e) { ctx = null; }
        if (ctx) {
            overlay.insertBefore(canvas, video.nextSibling);
        } else {
            canvas = null;
        }
    }
    let canvasOk = !!ctx;
    const drawFrame = () => {
        if (!canvasOk || !overlay.isConnected) return;
        if (video.readyState >= 2) {
            const rect = video.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.round(rect.width * dpr);
            const h = Math.round(rect.height * dpr);
            if (w && h) {
                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                }
                try {
                    ctx.drawImage(video, 0, 0, w, h);
                    // 描けたら、元の動画はほぼ見えなくする（完全に隠すと、止まるスマホがある）
                    video.classList.add('is-behind-canvas');
                    canvas.classList.add('is-drawing');
                } catch (e) {
                    canvasOk = false;
                    video.classList.remove('is-behind-canvas');
                    canvas.classList.remove('is-drawing');
                    return;
                }
            }
        }
        if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(drawFrame);
        else requestAnimationFrame(drawFrame);
    };
    if (canvasOk) {
        video.addEventListener('playing', () => {
            if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(drawFrame);
            else requestAnimationFrame(drawFrame);
        }, { once: true });
    }
    const placeVideo = () => {
        const logo = document.querySelector('.hero-logo-animate-container');
        if (!video || !logo) return;
        const h = video.getBoundingClientRect().height;
        const r = logo.getBoundingClientRect();
        if (!h || !r.height) return;
        const logoCenterY = r.top + r.height / 2;
        // 開き直しでページの途中にいるなど、ロゴが画面に無いときは真ん中のままにする
        if (logoCenterY < 0 || logoCenterY > window.innerHeight) return;
        [video, canvas].forEach((el) => {
            if (!el) return;
            el.style.top = `${logoCenterY - BURST_Y * h}px`;
            el.style.transform = 'translateX(-50%)';
        });
        glowY = logoCenterY;
        overlay.style.setProperty('--intro-glow-y', `${Math.round(logoCenterY)}px`);
    };

    // 画面全体の金の光とキラキラ（#62）。
    // 龍とキラキラは元の動画の端で切れるので、画面全体にキラキラを出して境目を目立たなくする。
    // 動画の白い所は透けさせて（intro.css の mix-blend-mode）、この上に龍を重ねる。
    let glowY = window.innerHeight * 0.35;
    const sparkleCanvas = document.createElement('canvas');
    sparkleCanvas.className = 'intro-sparkles';
    sparkleCanvas.setAttribute('aria-hidden', 'true');
    const sctx = sparkleCanvas.getContext && sparkleCanvas.getContext('2d');
    if (sctx) {
        overlay.insertBefore(sparkleCanvas, overlay.firstChild);
        const COLORS = ['255, 196, 40', '255, 214, 90', '240, 160, 20'];
        // 光る粒の絵を色ごとに1回だけ作っておき、毎コマはそれを貼るだけにする（軽くするため）
        const sprites = COLORS.map((c) => {
            const s = document.createElement('canvas');
            s.width = s.height = 32;
            const g = s.getContext('2d');
            const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, `rgba(${c}, 1)`);
            grad.addColorStop(0.25, `rgba(${c}, 0.85)`);
            grad.addColorStop(1, `rgba(${c}, 0)`);
            g.fillStyle = grad;
            g.fillRect(0, 0, 32, 32);
            return s;
        });
        let W = 0, H = 0, dpr = 1, parts = [];
        const rand = (a, b) => a + Math.random() * (b - a);
        const makePart = (anywhere) => {
            // 光の中心（ロゴの位置）の近くほど多く出す
            const spread = Math.max(W, H) * 0.55;
            const y = anywhere ? glowY + (Math.random() - 0.5) * 2 * spread : H + 10;
            return {
                x: W / 2 + (Math.random() - 0.5) * 2 * Math.min(spread, W * 0.6) * Math.sqrt(Math.random()),
                y,
                size: rand(4, 12),
                speed: rand(6, 22),          // 1秒に上へ進む px
                drift: rand(-8, 8),
                phase: rand(0, Math.PI * 2),
                tw: rand(1.5, 4),            // またたく速さ
                sprite: sprites[Math.floor(Math.random() * sprites.length)],
            };
        };
        const resize = () => {
            // 演出が終わったら、見張りを外して描画領域を手放す
            if (!overlay.isConnected) {
                window.removeEventListener('resize', resize);
                sparkleCanvas.width = sparkleCanvas.height = 0;
                parts = [];
                return;
            }
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            sparkleCanvas.width = Math.round(W * dpr);
            sparkleCanvas.height = Math.round(H * dpr);
            const count = Math.round(Math.min(110, Math.max(45, (W * H) / 9000)));
            parts = Array.from({ length: count }, () => makePart(true));
        };
        resize();
        window.addEventListener('resize', resize);
        let last = performance.now();
        const tick = (now) => {
            if (!overlay.isConnected) { resize(); return; }
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            sctx.clearRect(0, 0, W, H);
            const t = now / 1000;
            parts.forEach((p, i) => {
                p.y -= p.speed * dt;
                p.x += p.drift * dt;
                if (p.y < -20 || p.x < -20 || p.x > W + 20) parts[i] = p = makePart(false);
                const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * p.tw + p.phase));
                sctx.globalAlpha = a;
                sctx.drawImage(p.sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            });
            sctx.globalAlpha = 1;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    document.addEventListener('DOMContentLoaded', placeVideo);
    window.addEventListener('resize', placeVideo);

    let finished = false;
    const FADE_MS = 1400;     // 動画が消えるまでの時間（intro.css の transition と合わせる）
    const HANDOFF_SEC = 0.6;  // 動画の終わりの何秒前から消し始めるか
    const finish = () => {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* 何もしない */ }
        document.documentElement.classList.remove('is-intro-playing');
        inertTargets.forEach((el) => { el.inert = false; });
        // ロゴの演出を途中から始め、動画が消えるのと重ねてつなぐ（intro.css の .is-handoff）
        window.ktecIntroHandoff = true;
        overlay.classList.add('is-leaving');
        resolveDone();
        setTimeout(() => {
            if (video) video.pause();
            overlay.remove();
        }, FADE_MS);
    };

    if (skip) skip.addEventListener('click', finish);
    if (!video) { finish(); return; }

    // 最後の光がはじけている間に消し始め、ロゴへ滑らかに切り替える
    video.addEventListener('timeupdate', () => {
        if (video.duration && video.duration - video.currentTime <= HANDOFF_SEC) finish();
    });
    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);

    // 読み込みが遅い・止まったときの保険（動画は約8.5秒）
    const giveUp = setTimeout(finish, 4000);
    video.addEventListener('playing', () => {
        clearTimeout(giveUp);
        setTimeout(finish, 12000);
    }, { once: true });

    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(finish);
})();
