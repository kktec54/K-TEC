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
