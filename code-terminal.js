/**
 * K-TEC - 自社開発アプリのカードの背景（#14）
 *
 * 10-ya の背景（typing-terminal.js）をカード用に移したもの。
 * 白地に、コードが1文字ずつ打ち込まれ、改行ごとに1行ずつ押し上がる。
 * - 大きさは画面全体ではなく、カードの中の canvas に合わせる
 * - 10-ya の名前が入る台本は入れない
 * - 画面に見えている間だけ動かす
 */

(function () {
  'use strict';

  // ---------- 打ち込む中身 ----------
  // type: 1文字ずつ打つ行（prompt 付きはコマンド）/ out: まとめて出るログ
  const T = (text, prompt) => ({ kind: 'type', text: text, prompt: prompt || '' });
  const O = (...lines) => ({ kind: 'out', lines: lines });
  const GAP = { kind: 'gap' };

  const SCRIPTS = [
    [
      T('npm run build', '$ '),
      O('> ict-site@1.4.2 build', '> vite build', 'vite v5.4.2 building for production...',
        '✓ 128 modules transformed.', 'dist/index.html      7.74 kB', 'dist/assets/app.js  48.19 kB', '✓ built in 1.42s'),
      GAP
    ],
    [
      T('function tomorrow() {'),
      T('  return new Promise((resolve) => {'),
      T('    setTimeout(() => resolve("A better future"), 1000);'),
      T('  });'),
      T('}'),
      GAP
    ],
    [
      T('while (imagination) {'),
      T('  innovation();'),
      T('}'),
      GAP
    ],
    [
      T('git push origin main', '$ '),
      O('Enumerating objects: 24, done.', 'Counting objects: 100% (24/24), done.',
        'Writing objects: 100% (14/14), 3.81 KiB | 3.81 MiB/s', 'To github.com:ict/solution.git', '   8ba0137..42cd12a  main -> main'),
      GAP
    ],
    [
      T('SELECT * FROM future'),
      T('WHERE society = \'better\''),
      T('ORDER BY impact DESC;'),
      O('(12 rows)'),
      GAP
    ],
    [
      T('let people = ["現場", "事務", "経営", "社会"];'),
      T('people.forEach((p) => connect(p));'),
      GAP
    ],
    [
      T('python3 improve.py', '$ '),
      O('[INFO] loading dataset ... 12,480 records', '[INFO] epoch 1/3  loss=0.412', '[INFO] epoch 2/3  loss=0.187',
        '[INFO] epoch 3/3  loss=0.064', '[DONE] model saved: ./models/ict_v3.pt'),
      GAP
    ],
    [
      T('# Python'),
      T('for i in range(10**9):'),
      T('    improve()'),
      GAP
    ],
    [
      T('const ideas = ["simple", "smart", "sustainable"];'),
      T('ideas.map(idealReal);'),
      GAP
    ],
    [
      T('docker compose up -d', '$ '),
      O('[+] Running 3/3', ' ✔ Network ict_default   Created', ' ✔ Container ict-db     Started',
        ' ✔ Container ict-api    Started'),
      GAP
    ],
    [
      T('#include <future>'),
      T('using namespace ict;'),
      T('int main() {'),
      T('  std::cout << "Hello, World.";'),
      T('  return 0;'),
      T('}'),
      GAP
    ],
    [
      T('npm test -- --watchAll=false', '$ '),
      O('PASS  src/sync.test.ts', 'PASS  src/report.test.ts', 'PASS  src/auth.test.ts',
        'Tests:       48 passed, 48 total', 'Time:        2.31 s'),
      GAP
    ],
    [
      T('<div class="solution">'),
      T('  <h1>ICT</h1>'),
      T('  <p>for everyone</p>'),
      T('</div>'),
      GAP
    ],
    [
      T('const res = await fetch("/api/v1/automate", {'),
      T('  method: "POST",'),
      T('  body: JSON.stringify({ task: "report" }),'),
      T('});'),
      GAP
    ],
    [
      T('curl -s localhost:8080/health', '$ '),
      O('{"status":"ok","latency":"0.8ms","uptime":"42d"}'),
      GAP
    ],
    [
      T('.solution {'),
      T('  display: flex;'),
      T('  align-items: center;'),
      T('  justify-content: center;'),
      T('}'),
      GAP
    ],
    [
      T('def solve(problem):'),
      T('    return "simple"'),
      GAP
    ],
    [
      T('flutter build apk --release', '$ '),
      O('Running Gradle task \'assembleRelease\'...', '✓ Built build/app/outputs/flutter-apk/app-release.apk (18.4MB)'),
      GAP
    ],
    [
      T('CREATE TABLE dreams ('),
      T('  id INT PRIMARY KEY,'),
      T('  idea TEXT,'),
      T('  future TEXT'),
      T(');'),
      GAP
    ],
    [
      T('// 現場から、次の社会をつくる'),
      T('const os = new Opportunity();'),
      GAP
    ],
    [
      T('systemctl reload nginx', '$ '),
      O('● nginx.service - A high performance web server', '   Active: active (running) since 09:12:04'),
      GAP
    ],
    [
      T('for (let i = 0; i < Infinity; i++) {'),
      T('  createBetterTomorrow();'),
      T('}'),
      GAP
    ]
  ];

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- 1つのターミナル列 ----------
  class Terminal {
    constructor(x, width, maxChars, rows) {
      this.x = x;
      this.width = width;
      this.maxChars = maxChars;
      this.rows = rows;
      this.lines = [];          // 確定した行 {text, teya}
      this.active = null;       // 打ち込み中の行 {prompt, text, typed, teya}
      this.queue = [];
      this.teya = false;
      this.wait = rand(0, 900); // 列ごとに始まりをずらす
      this.scroll = 0;          // 押し上げアニメーションの残り（行数）
      this.cps = rand(28, 60);  // 列ごとの基本打鍵速度（文字/秒）
      this.prefill();
    }

    // 全角は2文字分として数え、列の幅を超える部分は切る（隣の列と重ねない）
    clip(s) {
      let w = 0;
      for (let i = 0; i < s.length; i++) {
        w += s.charCodeAt(i) > 0xff ? 2 : 1;
        if (w > this.maxChars) return s.slice(0, i);
      }
      return s;
    }

    nextScript() {
      this.teya = false;
      let script = pick(SCRIPTS);
      // 同じ台本が続けて出ると作り物っぽく見えるので、直近のものは避ける
      this.recent = this.recent || [];
      for (let i = 0; i < 5 && this.recent.includes(script); i++) script = pick(SCRIPTS);
      this.recent.push(script);
      if (this.recent.length > 6) this.recent.shift();
      // ログ行は出すたびに取り出すので、元の台本を壊さないよう複製する
      this.queue = script.map((step) => (step.kind === 'out' ? { kind: 'out', lines: step.lines.slice() } : step));
      // 台本の間の空行を1〜3行にばらつかせ、「コードの壁」にしない
      const extra = Math.floor(rand(0, 3));
      for (let i = 0; i < extra; i++) this.queue.push(GAP);
    }

    // 起動直後から画面が埋まって見えるよう、打ち終わった行で埋めておく
    prefill() {
      const target = this.rows - Math.floor(rand(0, 6));
      while (this.lines.length < target) {
        this.nextScript();
        for (const step of this.queue) {
          if (step.kind === 'type') this.lines.push({ text: this.clip(step.prompt + step.text), teya: this.teya });
          else if (step.kind === 'out') step.lines.forEach((l) => this.lines.push({ text: this.clip(l), teya: this.teya }));
          else this.lines.push({ text: '', teya: false });
        }
      }
      this.lines = this.lines.slice(-this.rows);
      this.queue = [];
    }

    push(text, teya) {
      this.lines.push({ text: text, teya: teya });
      if (this.lines.length > this.rows + 2) this.lines.shift();
      this.scroll = Math.min(this.scroll + 1, 3);
    }

    update(dt) {
      // 押し上げは素早く、ただし瞬間移動にはしない
      if (this.scroll > 0) this.scroll = Math.max(0, this.scroll - dt / 70);

      this.wait -= dt;
      while (this.wait <= 0) {
        if (this.active) {
          this.typeChars();
        } else {
          if (this.queue.length === 0) this.nextScript();
          const step = this.queue.shift();
          if (step.kind === 'type') {
            this.active = { prompt: step.prompt, text: this.clip(step.prompt + step.text).slice(step.prompt.length), typed: 0, teya: this.teya };
            this.wait += rand(60, 260);
          } else if (step.kind === 'out') {
            // ログは1行ずつ、ほぼ一気に出す
            const line = step.lines.shift();
            this.push(this.clip(line), this.teya);
            if (step.lines.length > 0) this.queue.unshift(step);
            this.wait += step.lines.length > 0 ? rand(18, 55) : rand(180, 520);
          } else {
            this.push('', false);
            this.wait += rand(120, 520);
          }
        }
      }
    }

    typeChars() {
      const a = this.active;
      // たまに補完のように数文字まとめて入る
      const burst = Math.random() < 0.12 ? Math.floor(rand(2, 6)) : 1;
      a.typed = Math.min(a.text.length, a.typed + burst);
      if (a.typed >= a.text.length) {
        this.push(a.prompt + a.text, a.teya);
        this.active = null;
        this.wait += rand(40, 180);
        return;
      }
      const ch = a.text[a.typed - 1];
      let delay = (1000 / this.cps) * rand(0.35, 1.7);
      if (ch === ' ' && Math.random() < 0.08) delay += rand(80, 260);   // 考える間
      if ('({;,'.includes(ch) && Math.random() < 0.25) delay += rand(40, 160);
      this.wait += delay;
    }
  }

  // ---------- エンジン本体（下で start / stop を呼ぶ） ----------
  class TypingTerminalEngine {
    constructor(canvas) {
      this.canvas = canvas;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.isRunning = false;
      this.frameId = null;
      this.fontSize = 11;
      this.lineHeight = 18;
      this.terminals = [];
      this.resize();
      window.addEventListener('resize', () => {
        this.resize();
        if (this.isRunning) this.layout();
      });
    }

    resize() {
      this.width = this.canvas.clientWidth;
      this.height = this.canvas.clientHeight;
      this.dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.font = `400 ${this.fontSize}px "JetBrains Mono", monospace`;
      this.charWidth = this.ctx.measureText('M').width || 6.6;
    }

    // 幅の違う列を並べ、全体を中央に寄せて左右の余白をそろえる
    layout() {
      const gap = this.width < 500 ? 14 : 24;
      const margin = this.width < 500 ? 10 : 18;
      const usable = this.width - margin * 2;
      const minW = this.width < 500 ? 130 : 170;
      const count = Math.max(2, Math.floor((usable + gap) / (minW + 60 + gap)));
      const weights = Array.from({ length: count }, () => rand(0.75, 1.3));
      const total = weights.reduce((s, w) => s + w, 0);
      const colSpace = usable - gap * (count - 1);
      const rows = Math.ceil(this.height / this.lineHeight) + 2;

      this.terminals = [];
      let x = margin;
      for (let i = 0; i < count; i++) {
        const w = (colSpace * weights[i]) / total;
        const maxChars = Math.max(8, Math.floor(w / this.charWidth));
        this.terminals.push(new Terminal(x, w, maxChars, rows));
        x += w + gap;
      }
    }

    start() {
      if (this.isRunning || !this.canvas) return;
      this.isRunning = true;
      this.layout();
      let last = performance.now();
      const loop = (now) => {
        if (!this.isRunning) return;
        const dt = Math.min(now - last, 100);
        last = now;
        this.terminals.forEach((t) => t.update(dt));
        this.render(now);
        this.frameId = requestAnimationFrame(loop);
      };
      this.frameId = requestAnimationFrame(loop);
    }

    stop() {
      if (!this.isRunning) return;
      this.isRunning = false;
      if (this.frameId) cancelAnimationFrame(this.frameId);
      this.frameId = null;
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.terminals = [];
    }

    // 中央（ボタンや文のまわり）は薄く、外側はやや濃く。境目の見えないフェード
    alphaAt(x, y) {
      const dx = (x - this.width * 0.5) / (this.width * 0.5);
      const dy = (y - this.height * 0.5) / (this.height * 0.5);
      const d = Math.sqrt(dx * dx + dy * dy);
      const t = Math.min(Math.max((d - 0.15) / 0.85, 0), 1);
      const e = t * t * (3 - 2 * t);
      return 0.10 + (0.40 - 0.10) * e;
    }

    color(teya, alpha) {
      return teya
        ? `rgba(50, 85, 125, ${Math.min(alpha * 1.25, 0.72).toFixed(3)})`
        : `rgba(80, 95, 115, ${alpha.toFixed(3)})`;
    }

    render(now) {
      const ctx = this.ctx;
      const lh = this.lineHeight;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.font = `400 ${this.fontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      const cursorOn = Math.floor(now / 530) % 2 === 0;

      for (const t of this.terminals) {
        // 打ち込み中の行は、カードの下端から少し上げる
        const baseY = this.height - lh - 10 + t.scroll * lh;
        for (let i = t.lines.length - 1, row = 1; i >= 0; i--, row++) {
          const y = baseY - row * lh;
          if (y < -lh) break;
          const line = t.lines[i];
          if (!line.text) continue;
          ctx.fillStyle = this.color(line.teya, this.alphaAt(t.x + t.width / 2, y));
          ctx.fillText(line.text, t.x, Math.round(y));
        }

        // 打ち込み中の行とカーソル
        const a = t.active;
        const text = a ? a.prompt + a.text.slice(0, a.typed) : '';
        const alpha = this.alphaAt(t.x + t.width / 2, baseY);
        if (text) {
          ctx.fillStyle = this.color(a.teya, alpha);
          ctx.fillText(text, t.x, Math.round(baseY));
        }
        if (a || cursorOn) {
          ctx.fillStyle = this.color(false, Math.min(alpha * 1.2, 0.6));
          ctx.fillRect(t.x + ctx.measureText(text).width + 1, Math.round(baseY) + 1, Math.max(2, this.charWidth * 0.55), this.fontSize);
        }
      }
    }
  }

  // カードの canvas を見つけたら、見えている間だけ動かす
  const canvas = document.querySelector('.app-code-bg');
  if (!canvas) return;
  const engine = new TypingTerminalEngine(canvas);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) engine.start();
      else engine.stop();
    }).observe(canvas);
  } else {
    engine.start();
  }
})();
