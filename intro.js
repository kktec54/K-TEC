/**
 * トップページのオープニング（金の龍の動画）（#52）
 * - 終わったら window.ktecIntroDone（Promise）を解決する。
 *   ロゴ・見出し・ハロウィンの演出は、これを待ってから始める。
 * - 同じタブで2回目に開いたとき・「アニメーションを減らす」設定・自動で流せないときは飛ばす。
 */
(function () {
    const overlay = document.getElementById('intro-overlay');
    let resolveDone;
    window.ktecIntroDone = new Promise((resolve) => { resolveDone = resolve; });

    const SEEN_KEY = 'ktec-intro-seen';
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* 使えないときは毎回流す */ }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!overlay || seen || reduce) {
        if (overlay) overlay.remove();
        resolveDone();
        return;
    }

    const video = overlay.querySelector('video');
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

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* 何もしない */ }
        document.documentElement.classList.remove('is-intro-playing');
        inertTargets.forEach((el) => { el.inert = false; });
        overlay.classList.add('is-leaving');
        resolveDone();
        setTimeout(() => {
            if (video) video.pause();
            overlay.remove();
        }, 800);
    };

    if (skip) skip.addEventListener('click', finish);
    if (!video) { finish(); return; }

    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);

    // 読み込みが遅い・止まったときの保険（動画は10秒）
    const giveUp = setTimeout(finish, 4000);
    video.addEventListener('playing', () => {
        clearTimeout(giveUp);
        setTimeout(finish, 12000);
    }, { once: true });

    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(finish);
})();
