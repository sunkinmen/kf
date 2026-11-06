/* =====================================================================
 * game.js ── 六大物理互動／環境生存迷你遊戲引擎、日本動漫轉場特效、內建木吉他＋長笛＋暖琴淡水彩交響配樂與闖關系統
 * ===================================================================== */
(function () {
  const $ = s => document.querySelector(s);
  const GRADES = ['一', '二', '三', '四', '五', '六'];
  const ORDER = ['art', 'chinese', 'science', 'social', 'english', 'math', 'pe'];
  const MG_ORDER = ['mg_lava', 'mg_magnet', 'mg_rhythm', 'mg_angle', 'mg_eco', 'mg_gear'];
  const ALL = [...MG_ORDER, ...ORDER, 'campus'];
  const STORE = 'kfps-adventure-v1';
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (touch) document.body.classList.add('touch');

  /* ---------- 六大物理互動／環境生存迷你遊戲定義（搭配 Nano Banana 2 專屬造型關主與場景貼圖） ---------- */
  const MINIGAMES = {
    mg_lava: {
      id: 'mg_lava',
      icon: '🌋',
      label: '安全島分類',
      fullTitle: '地板是岩漿：安全島分類大冒險',
      teacher: '小隊長阿烈',
      role: '【低年級 1-2 年級】手眼協調・生活常識・浮島承重互助',
      color: '#f97316',
      portraitKey: 'npcLava',
      texKey: 'texLava',
      intro: '地面即將變成滾燙岩漿啦！🌋\n請在倒數結束前，操控方向鍵（或直接點擊浮島）跳上符合題目分類的「安全浮島」！\n⚠️ 注意：每座浮島最多只能承載 2 人，若同行夥伴已經站滿，請立刻跳往另一座正確浮島分散站立！'
    },
    mg_magnet: {
      id: 'mg_magnet',
      icon: '🧲',
      label: '磁鐵滾球',
      fullTitle: '磁鐵滾球推推樂',
      teacher: '磁力博士波波',
      role: '【低年級 1-2 年級】生活科學・同極相斥異極相吸・鐵磁性探索',
      color: '#ef4444',
      portraitKey: 'npcMagnet',
      texKey: 'texMagnet',
      intro: '嗶嗶！歡迎來到 3D 磁力迷宮！🧲\n請操控圓滾滾磁性機器人滾動，路上散落著鐵釘、迴紋針、木塊、塑膠尺與鋁罐。\n只有「鐵磁性物品」能被磁鐵吸附！按空白鍵或切換鈕改變 N/S 磁極，體驗「異極相吸、同極相斥」，把鐵製品吸到紅色感應機關上開門過關吧！'
    },
    mg_rhythm: {
      id: 'mg_rhythm',
      icon: '🎶',
      label: '節奏跳舞機',
      fullTitle: '節奏字音跳舞機',
      teacher: '音律偶像小律',
      role: '【低年級 1-2 年級】注音四聲調・國字部首・音樂節奏連擊',
      color: '#ec4899',
      portraitKey: 'npcRhythm',
      texKey: 'texRhythm',
      intro: 'Music Start！跟著節拍跳起來吧！🎶\n前方四道霓虹輸送帶會滑來帶有「注音聲調（一聲ˉ、二聲ˊ、三聲ˇ、四聲ˋ）」與「國字部首」的巨大彈簧墊！\n配合音樂節奏左右移動（A/D、方向鍵或點擊跑道）跳上正確踏墊，累積 Combo 觸發華麗特效！'
    },
    mg_angle: {
      id: 'mg_angle',
      icon: '🏰',
      label: '角度投石車',
      fullTitle: '角度投石車攻城防衛戰',
      teacher: '機關工程師小角',
      role: '【中年級 3-4 年級】數學角度（銳角／直角）與拋物線物理力學',
      color: '#d97706',
      portraitKey: 'npcAngle',
      texKey: 'texAngle',
      intro: '紙箱怪軍團來襲！快登上校園城堡操控 3D 投石車！🏰\n觀察前方不同距離與高低差的紙箱怪物，調整投射仰角（銳角 30°、45°、60°、直角 90°）與拉力大小，透過拋物線軌跡精準擊破 3 波紙箱怪！'
    },
    mg_eco: {
      id: 'mg_eco',
      icon: '🦅',
      label: '食物鏈生存',
      fullTitle: '食物鏈大逃殺',
      teacher: '森林精靈小芽',
      role: '【中年級 3-4 年級】自然生態鏈・捕食進化與能量流動',
      color: '#65a30d',
      portraitKey: 'npcEco',
      texKey: 'texEco',
      intro: '歡迎來到池塘森林生態圈！🌿🐛🐦🦅\n你將從「毛毛蟲」開始冒險，規則只有一個：只能捕捉你的「獵物（嫩葉→毛毛蟲→麻雀）」，同時閃避你的「天敵」！\n獵捕滿能量即可進化成麻雀與老鷹；若被天敵捕食則會退化為初級生產者重新吸收陽光生長喔！'
    },
    mg_gear: {
      id: 'mg_gear',
      icon: '⚙️',
      label: '齒輪光影迷宮',
      fullTitle: '齒輪光影解謎迷宮',
      teacher: '光影鍊金師阿光',
      role: '【中年級 3-4 年級】機械齒輪傳動比・光的直進與反射定律',
      color: '#0284c7',
      portraitKey: 'npcGear',
      texKey: 'texGear',
      intro: '古文明石門被封印了！⚙️✨\n第一步：選擇正確齒數的主動齒輪（12齒、24齒、36齒）帶動大齒輪，把阻擋光線的石壁降下；\n第二步：旋轉迷宮中的平面鏡角度，運用「光的直進與反射」將太陽光束精準引導至感應晶石，開啟神殿大門！'
    }
  };

  const S = Object.assign({ grade: 0, avatar: 'm', name: '', tts: null, bgm: true, progress: {}, met: {} }, (() => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } })());
  if (S.bgm === undefined) S.bgm = true;
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { } };
  const prog = () => (S.progress[S.grade] = S.progress[S.grade] || {});
  const gName = g => GRADES[g - 1] + '年級';
  const low = () => S.grade <= 2;

  const subj = id => {
    if (id === 'campus') return { id, icon: '🏫', label: '認識校園', color: '#1e3a6e', teacher: '校長' };
    if (MINIGAMES[id]) return MINIGAMES[id];
    const s = SUBJECTS.find(x => x.id === id);
    return low() && s.low ? Object.assign({}, s, { label: s.low, icon: s.lowIcon, teacher: s.lowTeacher }) : s;
  };
  const isDone = id => !!(prog()[id] && prog()[id].done);
  const totalStars = () => ALL.reduce((a, id) => a + ((prog()[id] && prog()[id].stars) || 0), 0);
  // 完成任 7 個關卡（包含 6 大互動遊戲或學科老師）即可找校長挑戰最終關領獎狀！
  const DoneCount = () => [...MG_ORDER, ...ORDER].filter(isDone).length;
  const subjectsDone = () => DoneCount() >= 7;

  /* =====================================================================
   * WebAudio 錄音室空間殘響 (ConvolverReverb) ＋ 木吉他／毛氈鋼琴／木長笛／暖弦 Pad 淡水彩交響配樂
   * ===================================================================== */
  let AC = null, masterBus = null, reverbBus = null;

  function ensureAC() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      masterBus = AC.createGain();
      masterBus.gain.value = 0.85;
      masterBus.connect(AC.destination);

      try {
        const sr = AC.sampleRate, len = Math.floor(sr * 1.8);
        const ir = AC.createBuffer(2, len, sr);
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch);
          for (let i = 0; i < len; i++) {
            const env = Math.pow(1 - i / len, 2.6);
            d[i] = (Math.random() * 2 - 1) * env * 0.35;
          }
        }
        const conv = AC.createConvolver();
        conv.buffer = ir;
        const revGain = AC.createGain();
        revGain.gain.value = 0.28;
        conv.connect(revGain).connect(masterBus);
        reverbBus = conv;
      } catch (e) {
        reverbBus = masterBus;
      }
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  function beep(notes, type = 'triangle', len = 0.12, vol = 0.18) {
    try {
      const ctx = ensureAC();
      notes.forEach((f, i) => {
        if (!f) return;
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * len;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0008, t + len * 1.85);
        o.connect(g).connect(masterBus);
        o.start(t); o.stop(t + len * 2);
      });
    } catch (e) { }
  }

  const SFX = {
    ok: () => beep([523.25, 659.25, 783.99, 1046.5], 'triangle', 0.10, 0.20),
    ng: () => beep([240, 196], 'sine', 0.16, 0.11),
    tap: () => beep([587.33], 'sine', 0.05, 0.10),
    greet: () => beep([659.25, 880, 1046.5], 'sine', 0.08, 0.13),
    slash: () => {
      // 日本動漫熱血轉場音效 (高速掃頻 + 和弦閃光)
      try {
        const ctx = ensureAC(), t = ctx.currentTime;
        [330, 440, 659.25, 880, 1318.5].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f * 0.5, t + i * 0.035);
          o.frequency.exponentialRampToValueAtTime(f, t + i * 0.035 + 0.16);
          g.gain.setValueAtTime(0.001, t + i * 0.035);
          g.gain.linearRampToValueAtTime(0.11, t + i * 0.035 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0008, t + i * 0.035 + 0.32);
          o.connect(g).connect(reverbBus || masterBus);
          o.start(t + i * 0.035); o.stop(t + i * 0.035 + 0.35);
        });
      } catch (e) { }
    },
    jump: () => {
      try {
        const ctx = ensureAC(), t = ctx.currentTime;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(260, t);
        o.frequency.exponentialRampToValueAtTime(580, t + 0.14);
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        o.connect(g).connect(masterBus);
        o.start(t); o.stop(t + 0.17);
      } catch (e) { }
    },
    land: () => {
      try {
        const ctx = ensureAC(), t = ctx.currentTime;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(55, t + 0.09);
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
        o.connect(g).connect(masterBus);
        o.start(t); o.stop(t + 0.11);
      } catch (e) { }
    },
    step: (isRun) => {
      try {
        const ctx = ensureAC(), t = ctx.currentTime;
        const o = ctx.createOscillator(), g = ctx.createGain();
        const zone = World.getZoneName ? World.getZoneName() : '';
        const onGrass = /荷花|花園/.test(zone);
        o.type = onGrass ? 'sine' : 'triangle';
        const baseF = onGrass ? (isRun ? 205 : 170) : (isRun ? 160 : 132);
        o.frequency.setValueAtTime(baseF + (Math.random() - 0.5) * 20, t);
        o.frequency.exponentialRampToValueAtTime(65, t + 0.045);
        g.gain.setValueAtTime(isRun ? 0.055 : 0.035, t);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 0.05);
        o.connect(g).connect(masterBus);
        o.start(t); o.stop(t + 0.055);
      } catch (e) { }
    },
    bird: () => {
      try {
        const ctx = ensureAC(), t = ctx.currentTime;
        [0, 0.12].forEach((off, idx) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          const f0 = idx === 0 ? 1880 : 2280;
          o.frequency.setValueAtTime(f0, t + off);
          o.frequency.exponentialRampToValueAtTime(f0 * 1.25, t + off + 0.05);
          o.frequency.exponentialRampToValueAtTime(f0 * 0.94, t + off + 0.095);
          g.gain.setValueAtTime(0.001, t + off);
          g.gain.linearRampToValueAtTime(0.048, t + off + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0008, t + off + 0.10);
          o.connect(g).connect(reverbBus || masterBus);
          o.start(t + off); o.stop(t + off + 0.11);
        });
      } catch (e) { }
    },
    splash: () => {
      try {
        const ctx = ensureAC(), t = ctx.currentTime;
        [420, 630, 860].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, t + i * 0.045);
          o.frequency.exponentialRampToValueAtTime(f * 1.32, t + i * 0.045 + 0.06);
          g.gain.setValueAtTime(0.04, t + i * 0.045);
          g.gain.exponentialRampToValueAtTime(0.0008, t + i * 0.045 + 0.075);
          o.connect(g).connect(reverbBus || masterBus);
          o.start(t + i * 0.045); o.stop(t + i * 0.045 + 0.08);
        });
      } catch (e) { }
    },
    bikeBell: () => beep([1567.98, 2093.0], 'sine', 0.07, 0.045),
    stamp: () => beep([523.25, 659.25, 783.99, 1046.5], 'triangle', 0.11, 0.22),
    win: () => beep([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5], 'triangle', 0.12, 0.18)
  };

  /* =====================================================================
   * 晴天愉快動感全樂團 BGM 引擎 (Sunny Upbeat Pop-Fusion Full Band, 126 BPM, G大調)
   * 包含：真實感 Punchy Kick 大鼓、Crisp Snare 小鼓、16分音符律動 Hi-Hat 雙鈸、
   * Funky Slap Electric Bass 電貝斯、立體聲 Detuned 陽光銅管與木吉他刷弦 (Lush Stereo Chords)、
   * 以及雙聲部明亮木琴與和聲主奏 (Sunny Marimba & Synth Brass Lead)，徹底告別單調 MIDI 音！
   * ===================================================================== */
  let noiseBuf = null;
  function getNoiseBuf(ctx) {
    if (noiseBuf) return noiseBuf;
    const sr = ctx.sampleRate, len = sr * 1.0;
    noiseBuf = ctx.createBuffer(1, len, sr);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  // 1. 陽光動感爵士鼓組：Punchy Kick 大鼓 + Crisp Snare 小鼓 + 16分音符律動 Hi-Hat
  function playKick(ctx, t, vol = 0.22) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(145, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.085);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g).connect(masterBus);
    o.start(t); o.stop(t + 0.17);
  }

  function playSnare(ctx, t, vol = 0.12) {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(115, t + 0.06);
    og.gain.setValueAtTime(vol * 0.7, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(og).connect(masterBus);
    o.start(t); o.stop(t + 0.09);

    const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = getNoiseBuf(ctx);
    flt.type = 'highpass';
    flt.frequency.setValueAtTime(1400, t);
    ng.gain.setValueAtTime(vol, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(flt).connect(ng).connect(masterBus);
    if (reverbBus) ng.connect(reverbBus);
    src.start(t); src.stop(t + 0.13);
  }

  function playHiHat(ctx, t, open = false, vol = 0.045) {
    const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = getNoiseBuf(ctx);
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(8800, t);
    flt.Q.value = 1.8;
    const dur = open ? 0.16 : 0.042;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(flt).connect(g).connect(masterBus);
    src.start(t); src.stop(t + dur + 0.01);
  }

  // 2. Funky Pop 律動電貝斯 (Slap Bass Envelope Filter)
  function playGrooveBass(ctx, freq, t, dur, vol = 0.11) {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    const flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o1.type = 'sawtooth'; o2.type = 'triangle';
    o1.frequency.setValueAtTime(freq, t);
    o2.frequency.setValueAtTime(freq, t);
    flt.type = 'lowpass';
    flt.Q.value = 3.2;
    flt.frequency.setValueAtTime(freq * 6.5, t);
    flt.frequency.exponentialRampToValueAtTime(freq * 1.8, t + dur * 0.75);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o1.connect(flt); o2.connect(flt);
    flt.connect(g).connect(masterBus);
    o1.start(t); o2.start(t);
    o1.stop(t + dur + 0.01); o2.stop(t + dur + 0.01);
  }

  // 3. 陽光立體聲電鋼琴與木吉他動感刷弦 (Lush Stereo Chords Strum)
  function playSunnyChordStab(ctx, freqs, t, dur, vol = 0.026) {
    freqs.forEach((f, idx) => {
      const strumOff = idx * 0.012;
      [-7, 7].forEach((det, ch) => {
        const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = ch === 0 ? 'sawtooth' : 'triangle';
        o.frequency.setValueAtTime(f, t + strumOff);
        o.detune.setValueAtTime(det, t + strumOff);
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(2400, t + strumOff);
        flt.frequency.exponentialRampToValueAtTime(950, t + strumOff + dur);
        g.gain.setValueAtTime(0.0008, t + strumOff);
        g.gain.linearRampToValueAtTime(vol, t + strumOff + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0008, t + strumOff + dur);
        o.connect(flt).connect(g).connect(masterBus);
        if (reverbBus) g.connect(reverbBus);
        o.start(t + strumOff); o.stop(t + strumOff + dur + 0.02);
      });
    });
  }

  // 4. 晴天愉快雙聲部主旋律 (Sunny Marimba + Warm Brass-Bell Lead + 三度和聲)
  function playSunnyLead(ctx, freq, harmFreq, t, dur) {
    [-9, 9].forEach(det => {
      const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, t);
      o.detune.setValueAtTime(det, t);
      flt.type = 'lowpass';
      flt.Q.value = 1.6;
      flt.frequency.setValueAtTime(freq * 5.2, t);
      flt.frequency.exponentialRampToValueAtTime(freq * 2.1, t + dur * 0.9);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.032, t + 0.016);
      g.gain.setValueAtTime(0.026, t + dur * 0.65);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(flt).connect(g).connect(masterBus);
      if (reverbBus) g.connect(reverbBus);
      o.start(t); o.stop(t + dur + 0.02);
    });

    const mOsc = ctx.createOscillator(), mGain = ctx.createGain();
    mOsc.type = 'sine';
    mOsc.frequency.setValueAtTime(freq * 2, t);
    mGain.gain.setValueAtTime(0.036, t);
    mGain.gain.exponentialRampToValueAtTime(0.0008, t + Math.min(0.14, dur * 0.7));
    mOsc.connect(mGain).connect(masterBus);
    mOsc.start(t); mOsc.stop(t + Math.min(0.15, dur * 0.75));

    if (harmFreq) {
      const hOsc = ctx.createOscillator(), hFlt = ctx.createBiquadFilter(), hGain = ctx.createGain();
      hOsc.type = 'triangle';
      hOsc.frequency.setValueAtTime(harmFreq, t);
      hFlt.type = 'lowpass';
      hFlt.frequency.value = 1900;
      hGain.gain.setValueAtTime(0.001, t);
      hGain.gain.linearRampToValueAtTime(0.024, t + 0.02);
      hGain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      hOsc.connect(hFlt).connect(hGain).connect(masterBus);
      if (reverbBus) hGain.connect(reverbBus);
      hOsc.start(t); hOsc.stop(t + dur + 0.02);
    }
  }

  const N = {
    G2: 98.00, A2: 110.00, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, Fs3: 185.00, G3: 196.00,
    A3: 220.00, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.00, A4: 440.00,
    B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77
  };

  // G大調晴天動感流行和弦進行 (Gadd9 -> D/F# -> Em7 -> Cmaj9 -> G/B -> Am7 -> D11 -> G6)
  const SUNNY_CHORDS = [
    { bass: ['G2', null, 'G2', 'D3', 'G3', null, 'D3', 'B2'], chord: [N.G3, N.B3, N.D4, N.A4] },
    { bass: ['Fs3', null, 'Fs3', 'D3', 'A2', null, 'D3', 'Fs3'], chord: [N.Fs3, N.A3, N.D4, N.Fs4] },
    { bass: ['E3', null, 'E3', 'B2', 'E3', null, 'G3', 'B2'], chord: [N.E3, N.G3, N.B3, N.D4] },
    { bass: ['C3', null, 'C3', 'G2', 'C3', null, 'E3', 'G3'], chord: [N.C4, N.E4, N.G4, N.D5] },
    { bass: ['B2', null, 'B2', 'D3', 'G3', null, 'D3', 'B2'], chord: [N.G3, N.B3, N.D4, N.G4] },
    { bass: ['A2', null, 'A2', 'E3', 'A3', null, 'E3', 'C3'], chord: [N.A3, N.C4, N.E4, N.G4] },
    { bass: ['D3', null, 'D3', 'A2', 'D3', 'E3', 'Fs3', 'A3'], chord: [N.D4, N.G4, N.A4, N.C5] },
    { bass: ['G2', null, 'D3', 'E3', 'G3', 'E3', 'D3', 'B2'], chord: [N.G3, N.B3, N.D4, N.E4] }
  ];

  // 晴天愉快跳躍雙聲部主旋律
  const SUNNY_MELODY = [
    ['D5', 'B4', 1], ['E5', 'C5', 1], ['G5', 'B4', 2], null, ['A5', 'C5', 1], ['G5', 'B4', 1], ['E5', 'C5', 1], ['D5', 'B4', 1],
    ['Fs5', 'A4', 2], null, ['D5', 'Fs4', 2], null, ['E5', 'G4', 1], ['Fs5', 'A4', 1], ['G5', 'B4', 1], ['A5', 'C5', 1],
    ['B5', 'D5', 2], null, ['G5', 'B4', 1], ['E5', 'G4', 1], ['D5', 'B4', 2], null, ['B4', 'G4', 2], null,
    ['E5', 'G4', 1], ['G5', 'B4', 1], ['A5', 'C5', 2], null, ['G5', 'B4', 2], null, ['E5', 'G4', 1], ['D5', 'Fs4', 1],
    ['B4', 'G4', 1], ['D5', 'B4', 1], ['G5', 'B4', 2], null, ['Fs5', 'A4', 1], ['G5', 'B4', 1], ['A5', 'C5', 2], null,
    ['E5', 'C5', 1], ['G5', 'B4', 1], ['B5', 'D5', 2], null, ['A5', 'C5', 2], null, ['G5', 'B4', 1], ['E5', 'G4', 1],
    ['Fs5', 'A4', 1], ['G5', 'B4', 1], ['A5', 'C5', 2], null, ['B5', 'D5', 1], ['A5', 'C5', 1], ['Fs5', 'A4', 1], ['D5', 'Fs4', 1],
    ['G5', 'B4', 4], null, null, null, ['D5', 'B4', 1], ['E5', 'C5', 1], ['Fs5', 'A4', 1], ['G5', 'B4', 1]
  ];

  let bgmTimer = null, nextStepTime = 0, curStep = 0;
  const STEP_SEC = 0.238; // ~126 BPM 晴天輕快動感節拍

  function scheduleSunnyUpbeatBGM() {
    if (!S.bgm || document.hidden) return;
    try {
      const ctx = ensureAC();
      while (nextStepTime < ctx.currentTime + 0.35) {
        const step64 = curStep % 64;
        const bar = Math.floor(step64 / 8) % 8;
        const beat = step64 % 8;
        const chObj = SUNNY_CHORDS[bar];

        if (beat === 0 || beat === 3 || beat === 4) playKick(ctx, nextStepTime, beat === 0 ? 0.21 : 0.16);
        if (beat === 2 || beat === 6) playSnare(ctx, nextStepTime, 0.11);
        if (bar % 4 === 3 && beat === 7) {
          playSnare(ctx, nextStepTime, 0.09);
          playSnare(ctx, nextStepTime + STEP_SEC * 0.5, 0.11);
        }
        playHiHat(ctx, nextStepTime, beat === 3 || beat === 7, 0.042);
        playHiHat(ctx, nextStepTime + STEP_SEC * 0.5, false, 0.024);

        const bNote = chObj.bass[beat];
        if (bNote && N[bNote]) {
          playGrooveBass(ctx, N[bNote], nextStepTime, STEP_SEC * 1.35, beat === 0 ? 0.11 : 0.085);
        }

        if (beat === 0 || beat === 2 || beat === 3 || beat === 5 || beat === 6) {
          playSunnyChordStab(ctx, chObj.chord, nextStepTime, STEP_SEC * (beat === 0 ? 1.8 : 0.9), beat === 0 ? 0.025 : 0.018);
        }

        const mItem = SUNNY_MELODY[step64];
        if (mItem && N[mItem[0]]) {
          playSunnyLead(ctx, N[mItem[0]], N[mItem[1]], nextStepTime, STEP_SEC * mItem[2] * 0.92);
        }

        nextStepTime += STEP_SEC;
        curStep++;
      }
    } catch (e) { }
  }

  function startBGM() {
    if (!S.bgm || bgmTimer) return;
    try {
      const ctx = ensureAC();
      nextStepTime = ctx.currentTime + 0.06;
      bgmTimer = setInterval(scheduleSunnyUpbeatBGM, 95);
    } catch (e) { }
  }
  function stopBGM() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }
  function toggleBGM() {
    S.bgm = !S.bgm;
    save();
    refreshHUD();
    if (S.bgm) { ensureAC(); startBGM(); toast('🎵 已開啟晴天愉快動感全樂團 BGM！'); }
    else { stopBGM(); toast('🔇 已關閉背景音樂'); }
  }

  World.on('step', isRun => SFX.step(isRun));
  World.on('land', () => SFX.land());
  let ambTimer = 0;

  /* =====================================================================
   * 生動活潑人物配音系統 (Expressive Character Voice & Anime Voice Acting)
   * ===================================================================== */
  const VOICE_PROFILES = {
    campus:    { basePitch: 1.02, baseRate: 1.06, chirpBase: 320, prefix: '哈哈！各位同學早安！' },
    chinese:   { basePitch: 1.22, baseRate: 1.08, chirpBase: 520, prefix: '嗨嗨！歡迎來到國語小天地！' },
    math:      { basePitch: 1.08, baseRate: 1.12, chirpBase: 380, prefix: '嘿！一起來動動腦玩數學吧！' },
    science:   { basePitch: 1.24, baseRate: 1.10, chirpBase: 540, prefix: '哇！大自然充滿了奇妙的科學喔！' },
    social:    { basePitch: 1.06, baseRate: 1.10, chirpBase: 360, prefix: '出發囉！一起認識我們的光復國小！' },
    english:   { basePitch: 1.26, baseRate: 1.12, chirpBase: 580, prefix: 'Hello! Let us have fun together!' },
    pe:        { basePitch: 1.05, baseRate: 1.18, chirpBase: 390, prefix: '預備備，充滿活力動起來！' },
    art:       { basePitch: 1.25, baseRate: 1.08, chirpBase: 550, prefix: '哇喔！用色彩點亮美麗的校園吧！' },
    mg_lava:   { basePitch: 1.20, baseRate: 1.18, chirpBase: 480, prefix: '嗚哇！地板要變成滾燙岩漿啦！快跳！' },
    mg_magnet: { basePitch: 1.32, baseRate: 1.16, chirpBase: 640, prefix: '嗶嗶啵啵！磁力機器人波波啟動囉！' },
    mg_rhythm: { basePitch: 1.35, baseRate: 1.16, chirpBase: 680, prefix: '耶！跟著音樂節拍一起跳起來吧！' },
    mg_angle:  { basePitch: 1.16, baseRate: 1.15, chirpBase: 450, prefix: '看我的厲害！瞄準角度，發射投石車！' },
    mg_eco:    { basePitch: 1.28, baseRate: 1.12, chirpBase: 560, prefix: '嘿咻！一起到大自然體驗食物鏈大冒險！' },
    mg_gear:   { basePitch: 1.18, baseRate: 1.12, chirpBase: 490, prefix: '哼哼！轉動黃金齒輪，解開光影神殿之謎吧！' },
    default:   { basePitch: 1.22, baseRate: 1.12, chirpBase: 520, prefix: '' }
  };

  function playAnimeVoiceChirp(roleId = 'default', mood = 'happy') {
    try {
      const ctx = ensureAC();
      const prof = VOICE_PROFILES[roleId] || VOICE_PROFILES.default;
      const f0 = prof.chirpBase;
      const syllables = mood === 'excited'
        ? [1.0, 1.26, 1.5, 1.32, 1.68]
        : (mood === 'cheer' ? [1.0, 1.35, 1.65] : [1.0, 1.18, 1.42, 1.25]);
      const t0 = ctx.currentTime;
      syllables.forEach((mult, i) => {
        const st = t0 + i * 0.068;
        const o = ctx.createOscillator();
        const f1 = ctx.createBiquadFilter();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f0 * mult * 0.92, st);
        o.frequency.exponentialRampToValueAtTime(f0 * mult * 1.12, st + 0.052);
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(f0 * 2.4, st);
        f1.Q.value = 2.6;
        g.gain.setValueAtTime(0.001, st);
        g.gain.linearRampToValueAtTime(0.065, st + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0008, st + 0.062);
        o.connect(f1).connect(g).connect(masterBus);
        if (reverbBus) g.connect(reverbBus);
        o.start(st); o.stop(st + 0.066);
      });
    } catch (e) { }
  }

  let voices = [];
  const loadVoices = () => { voices = speechSynthesis.getVoices(); };
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

  function pickBestVoice(en) {
    if (en) return voices.find(v => /en[-_]US/i.test(v.lang) && /Natural|Online|Google/i.test(v.name)) || voices.find(v => /en/i.test(v.lang));
    return voices.find(v => /zh[-_]TW/i.test(v.lang) && /HsiaoChen|HsiaoYu|YunJhe|Natural|Online|Google|Mei-Jia|美佳/i.test(v.name))
        || voices.find(v => /zh[-_]TW/i.test(v.lang))
        || voices.find(v => /zh/i.test(v.lang));
  }

  function say(text, force, roleId = null, mood = 'happy') {
    playAnimeVoiceChirp(roleId || nearId || 'default', mood);
    if (!('speechSynthesis' in window) || (!S.tts && !force)) return;
    speechSynthesis.cancel();

    const prof = VOICE_PROFILES[roleId || nearId] || VOICE_PROFILES.default;
    const clean = text
      .replace(/[（(]\s*[)）]|___/g, '空格')
      .replace(/[「」〈〉【】｜]/g, ' ')
      .replace(/[^\u4e00-\u9fa5A-Za-z0-9，。！？、：；\s.,!?]/g, '');

    const latin = (clean.match(/[A-Za-z]/g) || []).length, cjk = (clean.match(/[一-鿿]/g) || []).length;
    const en = latin > cjk * 2;
    const bestVoice = pickBestVoice(en);

    const clauses = clean.split(/([！!？?。，\n]+)/).reduce((acc, cur, idx, arr) => {
      if (idx % 2 === 0 && cur.trim()) {
        const punc = arr[idx + 1] || '';
        acc.push(cur.trim() + punc);
      }
      return acc;
    }, []);

    clauses.slice(0, 6).forEach((clause, idx) => {
      const u = new SpeechSynthesisUtterance(clause);
      u.lang = en ? 'en-US' : 'zh-TW';
      if (bestVoice) u.voice = bestVoice;
      const isExclaim = /[！!]/.test(clause);
      const isQuestion = /[？?]/.test(clause);
      const pitchBoost = isExclaim ? 0.14 : (isQuestion ? 0.10 : (idx === 0 ? 0.08 : 0));
      const rateBoost = isExclaim ? 0.08 : (idx % 2 === 0 ? 0.04 : 0);
      u.pitch = Math.min(1.65, Math.max(0.85, prof.basePitch + pitchBoost));
      u.rate = Math.min(1.35, Math.max(0.95, (S.grade <= 2 ? prof.baseRate - 0.06 : prof.baseRate) + rateBoost));
      speechSynthesis.speak(u);
    });
  }

  /* ---------- 預先載入 Nano Banana 2 關主立繪與六大遊戲場景貼圖 ---------- */
  const GA = window.GAME_ASSETS || {};
  const loadedImgs = {};
  ['npcLava', 'npcMagnet', 'npcRhythm', 'npcAngle', 'npcEco', 'npcGear',
   'texLava', 'texMagnet', 'texRhythm', 'texAngle', 'texEco', 'texGear',
   'boyAvatar', 'girlAvatar'].forEach(k => {
    if (GA[k]) {
      const im = new Image();
      im.src = GA[k];
      loadedImgs[k] = im;
    }
  });

  const fill = $('#loader-fill');
  const skySrc = GA.sky || window.SKY_DATA_URI || 'assets/sky-taipei.jpg';
  if (GA.boyAvatar) { const tb = $('#title-boy-img'); if (tb) tb.src = GA.boyAvatar; }
  if (GA.girlAvatar) { const tg = $('#title-girl-img'); if (tg) tg.src = GA.girlAvatar; }
  World.init($('#world'), { skyImage: skySrc, onProgress: p => (fill.style.width = (p * 100) + '%') });
  World.ready.then(() => {
    fill.style.width = '100%';
    setTimeout(() => $('#loader').classList.add('done'), 250);
    buildTitle();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) World.setReducedMotion(true);
  });

  /* ---------- 標題畫面 ---------- */
  function buildTitle() {
    $('#name').value = S.name || '';
    const box = $('#grades'); box.innerHTML = '';
    for (let g = 1; g <= 6; g++) {
      const p = S.progress[g] || {}, st = ALL.reduce((a, id) => a + ((p[id] && p[id].stars) || 0), 0), done = ALL.filter(id => p[id] && p[id].done).length;
      const b = document.createElement('button'); b.className = 'grade' + (S.grade === g ? ' on' : '');
      b.innerHTML = `${gName(g)}${done ? `<small>⭐${st}</small>` : ''}`;
      b.onclick = () => { S.grade = g; SFX.tap(); if (S.bgm) startBGM(); [...box.children].forEach((c, i) => c.classList.toggle('on', i === g - 1)); $('#go').disabled = false; };
      box.appendChild(b);
    }
    $('#go').disabled = !S.grade;
    pickAvatar(S.avatar || 'm', true);
    ALL.forEach(id => { const s = subj(id); World.setStationInfo(id, { icon: s.icon, label: id === 'campus' ? '校長' : s.label, color: s.color, done: false }); });
    $('#title').hidden = false; $('#title').classList.remove('leave');
    $('#hud').hidden = true;
    World.setMode('title');
  }
  function pickAvatar(g, silent) {
    S.avatar = g; document.querySelectorAll('.avatar').forEach(b => b.classList.toggle('on', b.dataset.g === g));
    const ha = $('#hud-avatar');
    if (ha) ha.src = g === 'f' ? (GA.girlAvatar || 'assets/anime-girl.jpg') : (GA.boyAvatar || 'assets/anime-boy.jpg');
    if (!silent) SFX.tap();
  }
  function start() {
    if (!S.grade) return;
    S.name = $('#name').value.trim(); if (S.tts === null) S.tts = S.grade <= 2; save();
    if (S.bgm) { ensureAC(); startBGM(); }
    World.setAvatar(S.avatar);
    $('#title').classList.add('leave'); setTimeout(() => ($('#title').hidden = true), 500);
    $('#hud').hidden = false;
    World.setMode('play');
    refreshHUD();
    if (!S.met[S.grade]) toast('先去校門口找校長，或點右上角 🎮 體驗六大物理生存互動遊戲！');
  }

  /* ---------- HUD 與導引系統（優先推薦對應年級的 6 大物理生存互動遊戲！） ---------- */
  function refreshHUD() {
    $('#grade-chip').textContent = gName(S.grade);
    $('#stars').textContent = `⭐ ${totalStars()}`;
    $('#stamps').innerHTML = ALL.map(id => {
      const s = subj(id);
      const isMg = !!MINIGAMES[id];
      return `<span class="stamp${isMg ? ' mg' : ''}${isDone(id) ? ' done' : ''}" title="${s.fullTitle || s.label}（點擊傳送）" onclick="Game.teleportTo('${id}')">${s.icon}</span>`;
    }).join('');
    $('#btn-tts').classList.toggle('off', !S.tts);
    const btnBgm = $('#btn-bgm');
    if (btnBgm) btnBgm.classList.toggle('off', !S.bgm);
    ALL.forEach(id => { const s = subj(id); World.setStationInfo(id, { icon: s.icon, label: id === 'campus' ? '校長' : s.label, color: s.color, done: isDone(id) }); });
    World.setGuide(guideTarget());
  }

  function guideTarget() {
    if (!S.met[S.grade]) return 'campus';
    // 優先引導孩童體驗符合該年級的 6 大互動體感關卡！
    const tierOrder = low()
      ? ['mg_lava', 'mg_magnet', 'mg_rhythm', 'mg_angle', 'mg_eco', 'mg_gear']
      : ['mg_angle', 'mg_eco', 'mg_gear', 'mg_lava', 'mg_magnet', 'mg_rhythm'];
    const pendingMg = tierOrder.filter(id => !isDone(id));
    if (pendingMg.length) {
      const p = World.playerPos, L = World.layout.stations;
      let best = pendingMg[0], bd = 1e9;
      pendingMg.forEach(id => {
        const s = L.find(x => x.id === id);
        if (s) {
          const d = Math.hypot(s.x - p.x, s.z - p.z);
          if (d < bd) { bd = d; best = id; }
        }
      });
      return best;
    }
    if (!subjectsDone()) {
      const p = World.playerPos, L = World.layout.stations;
      let best = null, bd = 1e9;
      ORDER.filter(id => !isDone(id)).forEach(id => {
        const s = L.find(x => x.id === id), d = Math.hypot(s.x - p.x, s.z - p.z);
        if (d < bd) { bd = d; best = id; }
      });
      if (best) return best;
    }
    return isDone('campus') ? null : 'campus';
  }

  let guideT = 0;
  World.on('frame', dt => {
    if (World.mode !== 'play' && World.mode !== 'bird') return;
    guideT += dt;
    ambTimer += dt;
    if (ambTimer > 4.2 && World.mode === 'play') {
      ambTimer = 0;
      const p = World.playerPos;
      if (Math.hypot(p.x - (-24.3), p.z - 45.8) < 15) {
        Math.random() < 0.6 ? SFX.splash() : SFX.bird();
      } else if (p.x < -48 && Math.random() < 0.45) {
        SFX.bikeBell();
      } else if (Math.random() < 0.42) {
        SFX.bird();
      }
    }
    if (guideT > 0.4) {
      guideT = 0;
      const g = guideTarget();
      if (g !== World._W.guide) World.setGuide(g);
      const locEl = $('#loc-chip');
      if (locEl && World.getZoneName) locEl.textContent = '📍 ' + World.getZoneName();
    }
    const id = World._W.guide, el = $('#guide');
    if (!id) {
      $('#guide-text').textContent = '🎉 全部完成！點擊右上 🎮 可隨時重玩六大體感遊戲';
      $('#guide-arrow').style.transform = 'rotate(0)';
      el.querySelector('button').hidden = true;
    } else {
      const st = World.layout.stations.find(x => x.id === id), p = World.playerPos, dx = st.x - p.x, dz = st.z - p.z;
      const ang = Math.atan2(dx, -dz) + World.camYaw;
      $('#guide-arrow').style.transform = `rotate(${ang - Math.PI / 2}rad)`;
      const s = subj(id), d = Math.round(Math.hypot(dx, dz));
      $('#guide-text').textContent = `${id === 'campus' ? '去找校長' : '推薦挑戰：' + (s.fullTitle || s.teacher)}（${st.where}）${d > 4 ? d + 'm' : ''}`;
      el.querySelector('button').hidden = d < 5;
    }
    drawMinimap();
  });

  function goGuide() { const id = World._W.guide; if (!id) return; SFX.tap(); World.goTo(id); }
  function teleportTo(id) { SFX.tap(); World.goTo(id); toast(`⚡ 已傳送至：${subj(id).fullTitle || subj(id).label}`); }
  function jump() { SFX.jump(); World.jump(); }
  function cycleTime() {
    SFX.tap();
    const name = World.cycleTime ? World.cycleTime() : '淡水彩晨光';
    toast(`🌤️ 校園光影切換為：${name}`);
  }

  const mm = $('#minimap'), mx = mm.getContext('2d');
  function drawMinimap() {
    const L = World.layout, C = L.campus, W0 = mm.width, H0 = mm.height, pad = 6;
    const k = Math.min((W0 - pad * 2) / (C.x1 - C.x0), (H0 - pad * 2) / (C.z1 - C.z0));
    const X = x => pad + (x - C.x0) * k, Z = z => pad + (z - C.z0) * k;
    mx.clearRect(0, 0, W0, H0);
    mx.fillStyle = '#efeadd'; mx.fillRect(X(C.x0), Z(C.z0), (C.x1 - C.x0) * k, (C.z1 - C.z0) * k);
    const Gd = L.garden; mx.fillStyle = '#b4dca0'; mx.fillRect(X(Gd.x0), Z(Gd.z0), (Gd.x1 - Gd.x0) * k, (Gd.z1 - Gd.z0) * k);
    mx.fillStyle = '#5bb8d4'; mx.beginPath(); mx.arc(X((Gd.x0 + Gd.x1) / 2 + 2.2), Z((Gd.z0 + Gd.z1) / 2 + 1.5), 5.6 * k, 0, 7); mx.fill();
    const Ct = L.court; mx.fillStyle = '#89cfc4'; mx.fillRect(X(Ct.x0), Z(Ct.z0), (Ct.x1 - Ct.x0) * k, (Ct.z1 - Ct.z0) * k);
    const Tk = L.track, r = Tk.wid / 2 * k, hl = (Tk.len - Tk.wid) / 2 * k;
    mx.fillStyle = '#d89685'; mx.beginPath(); mx.roundRect(X(Tk.cx) - hl - r, Z(Tk.cz) - r, (hl + r) * 2, r * 2, r); mx.fill();
    mx.fillStyle = '#8bc495'; mx.beginPath(); mx.roundRect(X(Tk.cx) - hl - r * 0.7, Z(Tk.cz) - r * 0.7, (hl + r * 0.7) * 2, r * 1.4, r * 0.7); mx.fill();
    mx.fillStyle = '#a5b0c4'; L.buildings.forEach(b => mx.fillRect(X(b.x0), Z(b.z0), (b.x1 - b.x0) * k, (b.z1 - b.z0) * k));
    mx.fillStyle = '#7084a8'; mx.beginPath(); mx.arc(X(L.dome.x), Z(L.dome.z), L.dome.r * k, 0, 7); mx.fill();
    mx.fillStyle = '#ffffff'; mx.beginPath(); mx.arc(X(-21.8), Z(15.8), 2.5, 0, 7); mx.fill();
    L.stations.forEach(s => {
      const done = isDone(s.id), cur = World._W.guide === s.id, isMg = !!MINIGAMES[s.id];
      mx.fillStyle = done ? '#ffd166' : subj(s.id).color;
      mx.beginPath(); mx.arc(X(s.x), Z(s.z), cur ? 5.8 : (isMg ? 4.8 : 3.8), 0, 7); mx.fill();
      if (isMg) { mx.strokeStyle = '#ffffff'; mx.lineWidth = 1.4; mx.stroke(); }
      if (cur) {
        mx.strokeStyle = '#ff6b5b'; mx.lineWidth = 2;
        mx.beginPath(); mx.arc(X(s.x), Z(s.z), 8 + Math.sin(performance.now() / 200) * 1.5, 0, 7); mx.stroke();
      }
    });
    const p = World.playerPos, a = World.camYaw;
    mx.save(); mx.translate(X(p.x), Z(p.z)); mx.rotate(-a);
    mx.fillStyle = '#e85d4a'; mx.strokeStyle = '#fff'; mx.lineWidth = 1.5;
    mx.beginPath(); mx.moveTo(0, -7); mx.lineTo(5, 5); mx.lineTo(0, 2.5); mx.lineTo(-5, 5); mx.closePath();
    mx.fill(); mx.stroke(); mx.restore();
  }

  /* =====================================================================
   * 日本動漫風格熱血轉場系統 (進入與退出遊戲皆觸發動態速度線與斜切分鏡！)
   * ===================================================================== */
  let transAnimId = 0;
  function playAnimeTransition(mg, isEntering, onMidpoint) {
    const wrap = $('#anime-trans');
    const cvs = $('#anime-fx-canvas');
    const ctx = cvs.getContext('2d');
    cvs.width = innerWidth;
    cvs.height = innerHeight;

    $('#anime-npc-img').src = GA[mg.portraitKey] || GA.boyAvatar || 'assets/anime-boy.jpg';
    $('#anime-tag').textContent = isEntering ? '⚡ ANIME ACTION STAGE · 進入動漫挑戰！' : '🌟 STAGE RETURN · 返回光復國小校園！';
    $('#anime-title').textContent = mg.fullTitle;
    $('#anime-sub').textContent = isEntering ? mg.role : '太棒了！帶著滿滿收穫回到校園繼續探險吧！';

    wrap.hidden = false;
    SFX.slash();
    requestAnimationFrame(() => wrap.classList.add('active'));

    let t0 = performance.now();
    function drawSpeedlines(now) {
      const el = (now - t0) / 1000;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      // 半透明深藍動漫背景底色
      ctx.fillStyle = isEntering ? 'rgba(15, 23, 42, 0.72)' : 'rgba(20, 60, 50, 0.68)';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      // 放射狀日本動漫集中線／速度線
      const cx = cvs.width / 2, cy = cvs.height / 2;
      const maxR = Math.hypot(cx, cy) * 1.25;
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 72; i++) {
        const ang = (i / 72) * Math.PI * 2 + el * (isEntering ? 2.5 : -2.5);
        const rIn = 140 + ((i * 37 + Math.floor(el * 600)) % 180);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(253, 224, 71, 0.75)' : 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * rIn, Math.sin(ang) * rIn);
        ctx.lineTo(Math.cos(ang - 0.018) * maxR, Math.sin(ang - 0.018) * maxR);
        ctx.lineTo(Math.cos(ang + 0.018) * maxR, Math.sin(ang + 0.018) * maxR);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      if (!wrap.hidden) transAnimId = requestAnimationFrame(drawSpeedlines);
    }
    cancelAnimationFrame(transAnimId);
    transAnimId = requestAnimationFrame(drawSpeedlines);

    setTimeout(() => {
      if (onMidpoint) onMidpoint();
    }, 480);

    setTimeout(() => {
      wrap.classList.remove('active');
      setTimeout(() => {
        wrap.hidden = true;
        cancelAnimationFrame(transAnimId);
      }, 280);
    }, 1050);
  }

  /* ---------- 六大互動遊戲快速傳送門 Hub ---------- */
  function openGameHub() {
    SFX.tap();
    const grid = $('#hub-grid');
    grid.innerHTML = '';
    MG_ORDER.forEach(id => {
      const mg = MINIGAMES[id];
      const st = prog()[id] || { stars: 0, done: false };
      const div = document.createElement('div');
      div.className = 'hub-item';
      const portSrc = GA[mg.portraitKey] || GA.boyAvatar || 'assets/anime-boy.jpg';
      div.innerHTML = `
        <div class="hub-item-top">
          <img src="${portSrc}" alt="${mg.teacher}">
          <div>
            <b>${mg.icon} ${mg.fullTitle}</b>
            <small>${mg.teacher}｜${st.done ? '⭐'.repeat(st.stars) + ' 已過關' : '尚未過關'}</small>
          </div>
        </div>
        <p>${mg.role}</p>
        <div class="hub-item-acts">
          <button class="btn-ghost" data-act="go">📍 瞬移至NPC</button>
          <button class="btn-go" data-act="play">⚡ 立即挑戰</button>
        </div>
      `;
      div.querySelector('[data-act="go"]').onclick = () => {
        closeGameHub();
        teleportTo(id);
      };
      div.querySelector('[data-act="play"]').onclick = () => {
        closeGameHub();
        teleportTo(id);
        launchMinigame(id);
      };
      grid.appendChild(div);
    });
    $('#game-hub').hidden = false;
    lock(true);
  }
  function closeGameHub() {
    $('#game-hub').hidden = true;
    lock(false);
  }

  /* ---------- 靠近老師或六大互動關主 NPC ---------- */
  let nearId = null;
  World.on('npc', id => {
    nearId = id;
    if (id && anyModal()) return;
    $('#talk').hidden = !id;
    if (id) {
      const s = subj(id);
      $('#talk-text').textContent = MINIGAMES[id] ? `挑戰「${s.label}」` : `和${s.teacher}說話`;
      SFX.greet();
    }
  });
  function anyModal() { return ['#dlg', '#quiz', '#result', '#cert', '#menu', '#minigame', '#game-hub'].some(s => !$(s).hidden); }
  function lock(v) { World.setLocked(v); if (v) $('#talk').hidden = true; else $('#talk').hidden = !nearId; }

  function talk() {
    const id = nearId; if (!id || anyModal()) return;
    const s = subj(id), g = gName(S.grade);
    World.npcTalk(id, 3); World.npcWave(id);

    const portEl = $('#dlg-portrait');
    const iconEl = $('#dlg-icon');
    const roleEl = $('#dlg-role');

    if (MINIGAMES[id]) {
      const mg = MINIGAMES[id];
      if (portEl && GA[mg.portraitKey]) {
        portEl.src = GA[mg.portraitKey];
        portEl.hidden = false;
        iconEl.hidden = true;
      } else {
        portEl.hidden = true;
        iconEl.hidden = false;
        iconEl.textContent = mg.icon;
      }
      $('#dlg-name').textContent = `${mg.teacher}｜${mg.fullTitle}`;
      if (roleEl) roleEl.textContent = mg.role;
      const st = prog()[id];
      const text = st && st.done
        ? `${mg.intro}\n\n🏅 你已經拿到這關的印章（${'⭐'.repeat(st.stars)}）！要再進入動漫領域挑戰一次嗎？`
        : mg.intro;
      $('#dlg-text').textContent = text;
      const box = $('#dlg-actions'); box.innerHTML = '';
      [['先逛逛校園', 'ghost', close], ['⚡ 動漫轉場開始挑戰！', 'go', () => { close(); launchMinigame(id); }]].forEach(([t, cls, fn]) => {
        const b = document.createElement('button'); b.className = 'btn btn-' + cls; b.textContent = t;
        b.onclick = () => { SFX.tap(); fn(); }; box.appendChild(b);
      });
      $('#dlg').hidden = false; lock(true); say(VOICE_PROFILES[id].prefix + mg.intro, true, id, 'excited');
      return;
    }

    if (portEl) portEl.hidden = true;
    iconEl.hidden = false;
    iconEl.textContent = id === 'campus' ? '👨‍💼' : s.icon;
    $('#dlg-name').textContent = s.teacher;
    if (roleEl) roleEl.textContent = '';

    let text, acts = [];
    if (id === 'campus') {
      if (!S.met[S.grade]) {
        S.met[S.grade] = 1; save();
        text = TEACHER_LINES.campus.join('\n') + '\n\n💡 校園各角落新增了「6 大物理互動＆環境生存遊戲」（也可點右上角 🎮 傳送門直接挑戰），集滿 7 個印章就能找我領獎狀喔！';
        acts = [['出發探索！', 'go', close]];
      } else if (!subjectsDone()) {
        const need = Math.max(1, 7 - DoneCount());
        text = `加油！你已經完成 ${DoneCount()} 個關卡，再完成 ${need} 個關卡（推薦去玩校園角落的 6 大物理生存互動遊戲，或找科任老師），就能回來找校長拿獎狀！`;
        acts = [['開啟 🎮 遊戲傳送門', 'ghost', () => { close(); openGameHub(); }], ['繼續探索！', 'go', close]];
      } else if (!isDone('campus')) {
        text = `哇！你已經集滿 ${DoneCount()} 個印章了！\n最後一關：校長考考你「認識光復國小」，答對 2 題就能拿獎狀！`;
        acts = [['等一下', 'ghost', close], ['開始挑戰', 'go', () => { close(); startQuiz('campus'); }]];
      } else {
        text = `${S.name || '小小探險家'}，你是光復國小的校園探險王！\n要再看一次獎狀嗎？`;
        acts = [['不用了', 'ghost', close], ['看獎狀', 'go', () => { close(); showCert(); }]];
      }
    } else {
      const st = prog()[id];
      const line = (TEACHER_LINES[id] || [''])[0];
      // 若科任老師對應互動遊戲，提供「直接玩體感互動遊戲」與「傳統快問快答」雙模式！
      const mapMg = { chinese: 'mg_rhythm', science: 'mg_magnet', math: 'mg_angle', social: 'mg_eco', pe: 'mg_lava', art: 'mg_gear' }[id];
      text = `${line}\n你想挑戰「⚡ ${MINIGAMES[mapMg] ? MINIGAMES[mapMg].fullTitle : '互動體驗'}」還是「📝 ${g}・${s.label}快問快答」？過關都能拿到印章喔！`;
      acts = [
        ['等一下', 'ghost', close],
        ['📝 快問快答', 'ghost', () => { close(); startQuiz(id); }]
      ];
      if (mapMg) {
        acts.push([`⚡ 玩${MINIGAMES[mapMg].label}`, 'go', () => { close(); launchMinigame(mapMg, id); }]);
      }
    }
    $('#dlg-text').textContent = text;
    const box = $('#dlg-actions'); box.innerHTML = '';
    acts.forEach(([t, cls, fn]) => { const b = document.createElement('button'); b.className = 'btn btn-' + cls; b.textContent = t; b.onclick = () => { SFX.tap(); fn(); }; box.appendChild(b); });
    $('#dlg').hidden = false; lock(true); say((VOICE_PROFILES[id] ? VOICE_PROFILES[id].prefix : '') + text, true, id, 'happy');
    function close() { $('#dlg').hidden = true; lock(false); refreshHUD(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  }

  /* =====================================================================
   * 六大物理互動／環境生存迷你遊戲核心引擎 (Canvas 2D/2.5D 物理與 Nano Banana 2 貼圖渲染)
   * ===================================================================== */
  const mgCanvas = $('#mg-canvas');
  const mgCtx = mgCanvas.getContext('2d');
  let activeMg = null, mgRaf = 0, mgKeys = {};

  addEventListener('keydown', e => {
    mgKeys[e.code] = true;
    if (activeMg && activeMg.onKey) activeMg.onKey(e.code, e);
  });
  addEventListener('keyup', e => { mgKeys[e.code] = false; });

  function getCanvasPos(e) {
    const r = mgCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (mgCanvas.width / r.width),
      y: (e.clientY - r.top) * (mgCanvas.height / r.height)
    };
  }
  let mgPtrDown = false;
  mgCanvas.addEventListener('pointerdown', e => {
    mgPtrDown = true;
    try { mgCanvas.setPointerCapture(e.pointerId); } catch (err) { }
    if (!activeMg) return;
    const pt = getCanvasPos(e);
    if (activeMg.onPointerDown) activeMg.onPointerDown(pt.x, pt.y);
  });
  mgCanvas.addEventListener('pointermove', e => {
    if (!activeMg || !mgPtrDown) return;
    const pt = getCanvasPos(e);
    if (activeMg.onPointerMove) activeMg.onPointerMove(pt.x, pt.y);
    else if (activeMg.onPointerDown && activeMg.id !== 'mg_angle' && activeMg.id !== 'mg_gear') activeMg.onPointerDown(pt.x, pt.y);
  });
  ['pointerup', 'pointercancel'].forEach(ev => mgCanvas.addEventListener(ev, () => { mgPtrDown = false; }));

  function drawTiledBg(ctx, texKey, fallbackCol, alpha = 1, scrollX = 0, scrollY = 0) {
    const W0 = mgCanvas.width, H0 = mgCanvas.height;
    ctx.save();
    ctx.fillStyle = fallbackCol;
    ctx.fillRect(0, 0, W0, H0);
    const im = loadedImgs[texKey];
    if (im && im.complete && im.naturalWidth > 0) {
      ctx.globalAlpha = alpha;
      const tw = 256, th = 256;
      const ox = ((scrollX % tw) + tw) % tw - tw;
      const oy = ((scrollY % th) + th) % th - th;
      for (let x = ox; x < W0; x += tw) {
        for (let y = oy; y < H0; y += th) {
          ctx.drawImage(im, x, y, tw, th);
        }
      }
    }
    ctx.restore();
  }

  function updateMgHeader(round, maxRound, score, promptText, hintText) {
    $('#mg-round').textContent = `回合 ${round} / ${maxRound}`;
    $('#mg-score').textContent = `⭐ 得分 ${score}`;
    $('#mg-prompt').textContent = promptText;
    if (hintText) $('#mg-hint').textContent = hintText;
  }

  function setMgControls(buttons) {
    const box = $('#mg-controls');
    box.innerHTML = '';
    buttons.forEach(([label, cls, onClick]) => {
      const b = document.createElement('button');
      b.className = 'mg-ctrl-btn ' + (cls || '');
      b.textContent = label;
      b.onclick = () => { SFX.tap(); onClick(); };
      box.appendChild(b);
    });
  }

  function launchMinigame(mgId, bonusSubjectId) {
    const mg = MINIGAMES[mgId];
    if (!mg) return;
    lock(true);
    playAnimeTransition(mg, true, () => {
      $('#mg-npc-avatar').src = GA[mg.portraitKey] || GA.boyAvatar || 'assets/anime-boy.jpg';
      $('#mg-tier').textContent = mg.role;
      $('#mg-title').textContent = mg.fullTitle;
      $('#minigame').hidden = false;
      startSpecificMinigame(mgId, bonusSubjectId);
    });
  }

  function exitMinigame() {
    if (!activeMg) { $('#minigame').hidden = true; lock(false); return; }
    const mg = MINIGAMES[activeMg.id];
    cancelAnimationFrame(mgRaf);
    activeMg = null;
    playAnimeTransition(mg, false, () => {
      $('#minigame').hidden = true;
      lock(false);
      refreshHUD();
    });
  }

  function finishMinigame(mgId, stars, summaryMsg, bonusSubjectId) {
    const mg = MINIGAMES[mgId];
    cancelAnimationFrame(mgRaf);
    activeMg = null;
    const pass = stars >= 2;
    const p = prog();
    const old = p[mgId] || { stars: 0, done: false };
    p[mgId] = { stars: Math.max(old.stars, stars), done: old.done || pass };
    if (bonusSubjectId && pass) {
      const oldSub = p[bonusSubjectId] || { stars: 0, done: false };
      p[bonusSubjectId] = { stars: Math.max(oldSub.stars, stars), done: true };
    }
    save();

    playAnimeTransition(mg, false, () => {
      $('#minigame').hidden = true;
      $('#res-stamp').textContent = pass ? mg.icon : '💪';
      $('#res-stamp').className = 'big-stamp' + (pass ? '' : ' fail');
      $('#res-title').textContent = pass ? (stars === 3 ? '完美過關！太神啦！' : '挑戰成功！') : '再接再厲！';
      $('#res-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
      $('#res-text').textContent = summaryMsg;
      const box = $('#res-actions'); box.innerHTML = '';
      const add = (t, cls, fn) => {
        const b = document.createElement('button'); b.className = 'btn btn-' + cls; b.textContent = t;
        b.onclick = () => { SFX.tap(); $('#result').hidden = true; fn(); }; box.appendChild(b);
      };
      add('返回校園探險', 'ghost', () => lock(false));
      add('⚡ 再玩一次', 'go', () => launchMinigame(mgId, bonusSubjectId));
      $('#result').hidden = false;
      refreshHUD();
      if (pass) { SFX.stamp(); confetti(140); } else SFX.ng();
      say('太棒啦！' + $('#res-title').textContent + summaryMsg, true, mgId, 'excited');
    });
  }

  /* =====================================================================
   * 實現 6 款物理互動＆環境生存迷你遊戲
   * ===================================================================== */
  function startSpecificMinigame(mgId, bonusSubjectId) {
    cancelAnimationFrame(mgRaf);
    const W0 = mgCanvas.width, H0 = mgCanvas.height;

    /* -------------------------------------------------------------------
     * 遊戲 1：【地板是岩漿：安全島分類大冒險】(Floor is Lava: Eco Islands)
     * ------------------------------------------------------------------- */
    if (mgId === 'mg_lava') {
      const rounds = [
        {
          q: '♻️ 第一波：地面要變岩漿了！快跳上屬於「可資源回收」的浮島（注意每島限載 2 人）！',
          islands: [
            { x: 175, y: 175, r: 66, label: '🍶 寶特瓶', ok: true, cap: 2 },
            { x: 450, y: 155, r: 66, label: '🍌 香蕉皮', ok: false, cap: 2 },
            { x: 725, y: 175, r: 66, label: '📦 紙箱', ok: true, cap: 2 },
            { x: 280, y: 360, r: 66, label: '🥫 鐵鋁罐', ok: true, cap: 2 },
            { x: 620, y: 360, r: 66, label: '🧻 髒衛生紙', ok: false, cap: 2 }
          ]
        },
        {
          q: '🐾 第二波：岩漿升溫！快跳上屬於「胎生哺乳類動物」的安全浮島！',
          islands: [
            { x: 175, y: 175, r: 66, label: '🐶 台灣犬', ok: true, cap: 2 },
            { x: 450, y: 155, r: 66, label: '🐧 企鵝', ok: false, cap: 2 },
            { x: 725, y: 175, r: 66, label: '🐬 海豚', ok: true, cap: 2 },
            { x: 280, y: 360, r: 66, label: '🐸 青蛙', ok: false, cap: 2 },
            { x: 620, y: 360, r: 66, label: '🐰 小白兔', ok: true, cap: 2 }
          ]
        },
        {
          q: '🔢 第三波：終極熔岩！快跳上算式結果是「偶數（雙數）」的安全浮島！',
          islands: [
            { x: 175, y: 175, r: 66, label: '8 + 6 = 14', ok: true, cap: 2 },
            { x: 450, y: 155, r: 66, label: '9 + 4 = 13', ok: false, cap: 2 },
            { x: 725, y: 175, r: 66, label: '12 + 8 = 20', ok: true, cap: 2 },
            { x: 280, y: 360, r: 66, label: '7 + 8 = 15', ok: false, cap: 2 },
            { x: 620, y: 360, r: 66, label: '16 + 2 = 18', ok: true, cap: 2 }
          ]
        }
      ];

      const state = {
        id: mgId, rIdx: 0, score: 0, phase: 'move', timer: 6.5, lavaLevel: 0,
        px: 450, py: 265, tx: 450, ty: 265, jumpZ: 0, vz: 0,
        buddies: [], msg: ''
      };

      function setupRound() {
        const rd = rounds[state.rIdx];
        state.phase = 'move';
        state.timer = 6.5;
        state.lavaLevel = 0;
        state.px = 450; state.py = 265; state.tx = 450; state.ty = 265;
        state.msg = '';
        // 產生 3 位同行學童 AI，其中 2 位會故意擠向第一座正確浮島，迫使玩家觀察承重上限並分散站立！
        const okIslands = rd.islands.filter(x => x.ok);
        state.buddies = [
          { x: 410, y: 260, gx: okIslands[0].x - 22, gy: okIslands[0].y + 10, name: '小安', col: '#38bdf8' },
          { x: 490, y: 260, gx: okIslands[0].x + 22, gy: okIslands[0].y + 10, name: '小美', col: '#f472b6' },
          { x: 450, y: 295, gx: okIslands[1].x - 18, gy: okIslands[1].y + 8, name: '阿樂', col: '#a3e635' }
        ];
        updateMgHeader(state.rIdx + 1, 3, state.score, rd.q, '點擊浮島或按 WASD／方向鍵移動，空白鍵跳躍');
      }

      setMgControls([
        ['⬆️ 往上跳', '', () => { state.ty = Math.max(80, state.py - 110); state.vz = 140; SFX.jump(); }],
        ['⬇️ 往下跳', '', () => { state.ty = Math.min(420, state.py + 110); state.vz = 140; SFX.jump(); }],
        ['⬅️ 往左跳', '', () => { state.tx = Math.max(80, state.px - 140); state.vz = 140; SFX.jump(); }],
        ['➡️ 往右跳', '', () => { state.tx = Math.min(820, state.px + 140); state.vz = 140; SFX.jump(); }],
        ['⚡ 立即結算本波岩漿', 'warn', () => { if (state.phase === 'move') state.timer = 0.05; }]
      ]);

      state.onPointerDown = (x, y) => {
        if (state.phase !== 'move') return;
        state.tx = x; state.ty = y; state.vz = 160;
        SFX.jump();
      };

      setupRound();
      let lastT = performance.now();

      function loop(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const rd = rounds[state.rIdx];

        // 鍵盤與點擊移動
        if (state.phase === 'move') {
          const sp = 230;
          if (mgKeys.ArrowLeft || mgKeys.KeyA) { state.px -= sp * dt; state.tx = state.px; }
          if (mgKeys.ArrowRight || mgKeys.KeyD) { state.px += sp * dt; state.tx = state.px; }
          if (mgKeys.ArrowUp || mgKeys.KeyW) { state.py -= sp * dt; state.ty = state.py; }
          if (mgKeys.ArrowDown || mgKeys.KeyS) { state.py += sp * dt; state.ty = state.py; }
          state.px += (state.tx - state.px) * Math.min(1, dt * 8);
          state.py += (state.ty - state.py) * Math.min(1, dt * 8);
          state.px = Math.max(50, Math.min(W0 - 50, state.px));
          state.py = Math.max(50, Math.min(H0 - 50, state.py));

          state.buddies.forEach(b => {
            b.x += (b.gx - b.x) * Math.min(1, dt * 2.5);
            b.y += (b.gy - b.y) * Math.min(1, dt * 2.5);
          });

          state.timer -= dt;
          state.lavaLevel = Math.min(1, 1 - state.timer / 6.5);
          if (state.timer <= 0) {
            state.phase = 'check';
            state.timer = 2.0;
            // 判定玩家在哪座浮島與承重人數
            let stood = null;
            rd.islands.forEach(isl => {
              const cnt = state.buddies.filter(b => Math.hypot(b.x - isl.x, b.y - isl.y) < isl.r).length +
                          (Math.hypot(state.px - isl.x, state.py - isl.y) < isl.r ? 1 : 0);
              isl.curCount = cnt;
              if (Math.hypot(state.px - isl.x, state.py - isl.y) < isl.r) stood = isl;
            });
            if (!stood) {
              SFX.ng();
              state.msg = '💥 哎呀！沒跳上浮島，踩到滾燙岩漿了！';
            } else if (!stood.ok) {
              SFX.ng();
              state.msg = `💥「${stood.label}」不符合題目分類，浮島融化了！`;
            } else if (stood.curCount > stood.cap) {
              SFX.ng();
              state.msg = `⚠️「${stood.label}」站了 ${stood.curCount} 人超重下沉了！記得分散站到其他正確浮島！`;
            } else {
              SFX.ok();
              state.score++;
              state.msg = `✅ 太棒了！成功站上「${stood.label}」且未超重（${stood.curCount}/${stood.cap}人）！`;
            }
            updateMgHeader(state.rIdx + 1, 3, state.score, state.msg);
          }
        } else {
          state.timer -= dt;
          if (state.timer <= 0) {
            state.rIdx++;
            if (state.rIdx < rounds.length) setupRound();
            else {
              const stars = Math.max(1, state.score);
              finishMinigame(mgId, stars, `你在「地板是岩漿：安全島分類大冒險」成功通過 ${state.score} 波熔岩考驗，學會了分類常識與同儕分散承重！`, bonusSubjectId);
              return;
            }
          }
        }

        if (state.jumpZ > 0 || state.vz !== 0) {
          state.jumpZ += state.vz * dt;
          state.vz -= 480 * dt;
          if (state.jumpZ <= 0) { state.jumpZ = 0; state.vz = 0; }
        }

        // 繪製 Nano Banana 2 滾燙熔岩背景
        drawTiledBg(mgCtx, 'texLava', '#ea580c', 0.45 + state.lavaLevel * 0.55, now * 0.03, now * 0.02);
        // 繪製中央初始石板平台（隨岩漿上升縮小）
        if (state.phase === 'move') {
          mgCtx.fillStyle = 'rgba(120, 113, 108, 0.78)';
          mgCtx.beginPath();
          mgCtx.arc(450, 265, Math.max(18, 56 * (1 - state.lavaLevel * 0.7)), 0, Math.PI * 2);
          mgCtx.fill();
        }

        // 繪製浮空島與承重計數
        rd.islands.forEach(isl => {
          const cnt = state.buddies.filter(b => Math.hypot(b.x - isl.x, b.y - isl.y) < isl.r).length +
                      (Math.hypot(state.px - isl.x, state.py - isl.y) < isl.r ? 1 : 0);
          const overloaded = cnt > isl.cap;
          const sink = overloaded ? 8 : Math.sin(now * 0.004 + isl.x) * 4;

          mgCtx.save();
          mgCtx.translate(isl.x, isl.y + sink);
          // 浮島岩座陰影
          mgCtx.fillStyle = '#44403c';
          mgCtx.beginPath(); mgCtx.arc(0, 10, isl.r, 0, Math.PI * 2); mgCtx.fill();
          // 浮島表面
          let topCol = '#f8fafc';
          if (state.phase === 'check') topCol = (isl.ok && !overloaded) ? '#bbf7d0' : '#fecaca';
          else if (overloaded) topCol = '#fde68a';
          mgCtx.fillStyle = topCol;
          mgCtx.strokeStyle = overloaded ? '#ef4444' : '#0284c7';
          mgCtx.lineWidth = 5;
          mgCtx.beginPath(); mgCtx.arc(0, 0, isl.r, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();

          mgCtx.fillStyle = '#1e293b';
          mgCtx.font = '900 20px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(isl.label, 0, -6);

          mgCtx.fillStyle = overloaded ? '#dc2626' : '#0f766e';
          mgCtx.font = '800 14px "Noto Sans TC", sans-serif';
          mgCtx.fillText(`承重 ${cnt} / ${isl.cap} 人${overloaded ? ' (超重!)' : ''}`, 0, 22);
          mgCtx.restore();
        });

        // 繪製同行學童 AI
        state.buddies.forEach(b => {
          mgCtx.save();
          mgCtx.translate(b.x, b.y);
          mgCtx.fillStyle = b.col;
          mgCtx.strokeStyle = '#ffffff';
          mgCtx.lineWidth = 3;
          mgCtx.beginPath(); mgCtx.arc(0, 0, 16, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
          mgCtx.fillStyle = '#ffffff';
          mgCtx.font = '900 12px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(b.name, 0, 4);
          mgCtx.restore();
        });

        // 繪製玩家角色
        mgCtx.save();
        mgCtx.translate(state.px, state.py - state.jumpZ * 0.25);
        mgCtx.fillStyle = '#2563eb';
        mgCtx.strokeStyle = '#fde047';
        mgCtx.lineWidth = 4;
        mgCtx.beginPath(); mgCtx.arc(0, 0, 20, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 14px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText('我', 0, 5);
        mgCtx.restore();

        // 頂部倒數計時進度條
        if (state.phase === 'move') {
          mgCtx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          mgCtx.fillRect(200, 14, 500, 24);
          mgCtx.fillStyle = state.timer < 2.2 ? '#ef4444' : '#f59e0b';
          mgCtx.fillRect(203, 17, 494 * (state.timer / 6.5), 18);
          mgCtx.fillStyle = '#ffffff';
          mgCtx.font = '900 14px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(`🌋 岩漿噴發倒數：${state.timer.toFixed(1)} 秒（點擊正確且未滿載的浮島！）`, 450, 31);
        } else {
          mgCtx.fillStyle = 'rgba(15, 23, 42, 0.86)';
          mgCtx.fillRect(120, 14, 660, 36);
          mgCtx.fillStyle = '#fde047';
          mgCtx.font = '900 18px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(state.msg, 450, 38);
        }

        activeMg = state;
        mgRaf = requestAnimationFrame(loop);
      }
      mgRaf = requestAnimationFrame(loop);
    }

    /* -------------------------------------------------------------------
     * 遊戲 2：【磁鐵滾球推推樂】(Magnetic Marble Odyssey)
     * ------------------------------------------------------------------- */
    else if (mgId === 'mg_magnet') {
      const state = {
        id: mgId, px: 120, py: 250, vx: 0, vy: 0, tx: 120, ty: 250,
        pole: 'N', // 'N' (紅) 或 'S' (藍)
        score: 0,
        switches: [
          { x: 320, y: 125, r: 36, label: '機關 A', active: false },
          { x: 580, y: 380, r: 36, label: '機關 B', active: false },
          { x: 750, y: 140, r: 36, label: '機關 C', active: false }
        ],
        items: [
          { x: 240, y: 240, name: '🔩 鐵釘', mag: true, pole: 'S', r: 22 },
          { x: 460, y: 310, name: '📎 鐵迴紋針', mag: true, pole: 'S', r: 22 },
          { x: 640, y: 240, name: '🔧 小鐵扳手', mag: true, pole: 'S', r: 22 },
          { x: 360, y: 340, name: '🪵 木塊(非磁性)', mag: false, r: 22 },
          { x: 510, y: 150, name: '📏 塑膠尺(非磁性)', mag: false, r: 22 },
          { x: 220, y: 390, name: '🥫 鋁罐(非磁性)', mag: false, r: 22 },
          // 阻擋通道的同極磁障（當切換為 N 極時可將 N 極磁障同極相斥推開！）
          { x: 650, y: 140, name: '🧲 N極磁障', mag: true, pole: 'N', r: 26, barrier: true }
        ],
        gateOpen: false,
        goal: { x: 830, y: 250, r: 38 }
      };

      function refreshPrompt() {
        const cnt = state.switches.filter(s => s.active).length;
        state.score = cnt;
        state.gateOpen = cnt >= 3;
        updateMgHeader(
          Math.min(3, cnt + 1), 3, cnt,
          state.gateOpen
            ? '🎉 3 座磁力機關全部啟動！快滾進右側發光傳送門過關！'
            : `🧲 請用「N 極（紅）」異極相吸鐵釘、迴紋針、鐵扳手壓住 3 座紅色機關（${cnt}/3）！遇到 N 極磁障可用同極相斥推開！`,
          '點擊畫面引導滾球，按空白鍵或下方按鈕切換 N/S 磁極'
        );
      }

      function togglePole() {
        state.pole = state.pole === 'N' ? 'S' : 'N';
        SFX.tap();
      }

      setMgControls([
        ['🧲 切換 N / S 磁極 (空白鍵)', 'primary', togglePole],
        ['⬆️ 上', '', () => { state.ty = Math.max(50, state.py - 90); }],
        ['⬇️ 下', '', () => { state.ty = Math.min(450, state.py + 90); }],
        ['⬅️ 左', '', () => { state.tx = Math.max(50, state.px - 110); }],
        ['➡️ 右', '', () => { state.tx = Math.min(850, state.px + 110); }]
      ]);

      state.onKey = (code) => { if (code === 'Space') togglePole(); };
      state.onPointerDown = (x, y) => {
        if (Math.hypot(x - state.px, y - state.py) < 44) { togglePole(); return; }
        state.tx = x; state.ty = y;
      };
      state.onPointerMove = (x, y) => { state.tx = x; state.ty = y; };

      refreshPrompt();
      let lastT = performance.now();

      function loop(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        const sp = 240;
        if (mgKeys.ArrowLeft || mgKeys.KeyA) { state.px -= sp * dt; state.tx = state.px; }
        if (mgKeys.ArrowRight || mgKeys.KeyD) { state.px += sp * dt; state.tx = state.px; }
        if (mgKeys.ArrowUp || mgKeys.KeyW) { state.py -= sp * dt; state.ty = state.py; }
        if (mgKeys.ArrowDown || mgKeys.KeyS) { state.py += sp * dt; state.ty = state.py; }

        state.px += (state.tx - state.px) * Math.min(1, dt * 6);
        state.py += (state.ty - state.py) * Math.min(1, dt * 6);
        state.px = Math.max(45, Math.min(W0 - 45, state.px));
        state.py = Math.max(45, Math.min(H0 - 45, state.py));

        // 磁力物理計算：異極相吸 (N 吸 S 鐵製品)、同極相斥 (N 斥 N 磁障，S 斥 S)
        state.items.forEach(it => {
          const dx = state.px - it.x, dy = state.py - it.y;
          const d = Math.hypot(dx, dy);
          if (it.mag && d < 155 && d > 1) {
            const samePole = state.pole === it.pole;
            if (!samePole) {
              // 異極相吸：吸附跟隨在磁性機器人周圍
              if (d > 42) {
                it.x += (dx / d) * 185 * dt;
                it.y += (dy / d) * 185 * dt;
              }
            } else {
              // 同極相斥：推開！
              it.x -= (dx / d) * 210 * dt;
              it.y -= (dy / d) * 210 * dt;
            }
          } else if (!it.mag && d < 42 && d > 1) {
            // 非磁性物質（木塊、塑膠尺、鋁罐）僅產生普通物理碰撞，不會被磁鐵吸引
            it.x -= (dx / d) * 80 * dt;
            it.y -= (dy / d) * 80 * dt;
          }
          it.x = Math.max(45, Math.min(W0 - 95, it.x));
          it.y = Math.max(45, Math.min(H0 - 45, it.y));
        });

        // 檢查機關是否被鐵磁性道具壓住
        let changed = false;
        state.switches.forEach(sw => {
          const hit = state.items.find(it => it.mag && !it.barrier && Math.hypot(it.x - sw.x, it.y - sw.y) < 34);
          if (!!hit !== sw.active) {
            sw.active = !!hit;
            changed = true;
            if (sw.active) {
              hit.x = sw.x; hit.y = sw.y;
              SFX.ok();
            }
          }
        });
        if (changed) refreshPrompt();

        // 若三座機關皆啟動，碰觸終點即過關（或三座全滿自動歡呼過關）
        if (state.gateOpen && Math.hypot(state.px - state.goal.x, state.py - state.goal.y) < 62) {
          finishMinigame(mgId, 3, '太厲害了！你成功分辨出鐵釘、迴紋針等鐵磁性物品，並運用「異極相吸、同極相斥」解開 3D 磁力迷宮！', bonusSubjectId);
          return;
        }

        // 繪製 Nano Banana 2 科幻磁力迷宮地板
        drawTiledBg(mgCtx, 'texMagnet', '#334155', 0.88);

        // 繪製感應機關座
        state.switches.forEach(sw => {
          mgCtx.save();
          mgCtx.translate(sw.x, sw.y);
          mgCtx.fillStyle = sw.active ? '#22c55e' : '#ef4444';
          mgCtx.strokeStyle = '#ffffff';
          mgCtx.lineWidth = 4;
          mgCtx.beginPath(); mgCtx.arc(0, 0, sw.r, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
          mgCtx.fillStyle = '#ffffff';
          mgCtx.font = '900 14px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(sw.active ? '✅ 已導通' : sw.label, 0, 5);
          mgCtx.restore();
        });

        // 繪製右側出口傳送門
        mgCtx.save();
        mgCtx.translate(state.goal.x, state.goal.y);
        mgCtx.fillStyle = state.gateOpen ? '#38bdf8' : '#64748b';
        mgCtx.strokeStyle = '#fde047';
        mgCtx.lineWidth = 5;
        mgCtx.beginPath(); mgCtx.arc(0, 0, state.goal.r, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 14px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText(state.gateOpen ? '🚪 出口開啟' : '🔒 需3機關', 0, 5);
        mgCtx.restore();

        // 繪製場上物品（鐵釘、木塊、塑膠尺、鋁罐、磁障）
        state.items.forEach(it => {
          mgCtx.save();
          mgCtx.translate(it.x, it.y);
          mgCtx.fillStyle = it.barrier ? '#dc2626' : (it.mag ? '#3b82f6' : '#a8a29e');
          mgCtx.strokeStyle = '#ffffff';
          mgCtx.lineWidth = 3;
          mgCtx.beginPath(); mgCtx.arc(0, 0, it.r, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
          mgCtx.fillStyle = '#ffffff';
          mgCtx.font = '900 13px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(it.name, 0, -it.r - 8);
          mgCtx.fillText(it.mag ? `(${it.pole}極)` : '(無磁力)', 0, 5);
          mgCtx.restore();
        });

        // 繪製主角磁性機器人與磁場光環
        mgCtx.save();
        mgCtx.translate(state.px, state.py);
        const pulse = 54 + Math.sin(now * 0.008) * 12;
        mgCtx.strokeStyle = state.pole === 'N' ? 'rgba(239, 68, 68, 0.55)' : 'rgba(59, 130, 246, 0.55)';
        mgCtx.lineWidth = 4;
        mgCtx.beginPath(); mgCtx.arc(0, 0, pulse, 0, Math.PI * 2); mgCtx.stroke();

        const npcIm = loadedImgs.npcMagnet;
        if (npcIm && npcIm.complete) {
          mgCtx.drawImage(npcIm, -32, -32, 64, 64);
        } else {
          mgCtx.fillStyle = state.pole === 'N' ? '#ef4444' : '#3b82f6';
          mgCtx.beginPath(); mgCtx.arc(0, 0, 26, 0, Math.PI * 2); mgCtx.fill();
        }
        mgCtx.fillStyle = state.pole === 'N' ? '#ef4444' : '#2563eb';
        mgCtx.strokeStyle = '#ffffff';
        mgCtx.lineWidth = 2;
        mgCtx.beginPath(); mgCtx.roundRect(-36, 26, 72, 22, 8); mgCtx.fill(); mgCtx.stroke();
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 13px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText(`目前: ${state.pole}極`, 0, 41);
        mgCtx.restore();

        activeMg = state;
        mgRaf = requestAnimationFrame(loop);
      }
      mgRaf = requestAnimationFrame(loop);
    }

    /* -------------------------------------------------------------------
     * 遊戲 3：【節奏字音跳舞機】(Phonics Beat Jumper)
     * ------------------------------------------------------------------- */
    else if (mgId === 'mg_rhythm') {
      const questions = [
        { q: '🎵 請跳向「媽（ㄇㄚˉ）」的聲調或部首踏墊：【第一聲 ˉ】', lane: 0, label: '一聲 ˉ (ㄇㄚˉ)' },
        { q: '🎵 請跳向「麻（ㄇㄚˊ）」的聲調踏墊：【第二聲 ˊ】', lane: 1, label: '二聲 ˊ (ㄇㄚˊ)' },
        { q: '🎵 請跳向「馬（ㄇㄚˇ）」的聲調踏墊：【第三聲 ˇ】', lane: 2, label: '三聲 ˇ (ㄇㄚˇ)' },
        { q: '🎵 請跳向「罵（ㄇㄚˋ）」的聲調踏墊：【第四聲 ˋ】', lane: 3, label: '四聲 ˋ (ㄇㄚˋ)' },
        { q: '🎵「河、海、泳」三個字都有哪個部首？請跳向【氵（水部）】（第 2 道）！', lane: 1, label: '氵 水部 (二聲道)' },
        { q: '🎵「樹、林、森」三個字都有哪個部首？請跳向【木（木部）】（第 3 道）！', lane: 2, label: '木 木部 (三聲道)' }
      ];
      const laneLabels = ['第一道：一聲 ˉ', '第二道：二聲 ˊ / 氵部', '第三道：三聲 ˇ / 木部', '第四道：四聲 ˋ'];
      const laneCols = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

      const state = {
        id: mgId, qIdx: 0, playerLane: 1, score: 0, combo: 0,
        padY: 70, speed: 155, bursts: []
      };

      function refreshRhythmUI() {
        const cur = questions[state.qIdx];
        updateMgHeader(
          state.qIdx + 1, questions.length, state.score,
          cur.q,
          `🔥 Combo 連擊：${state.combo}｜點擊下方 4 個聲道按鈕或按 1~4 / 左右鍵切換跑道！`
        );
      }

      setMgControls(laneLabels.map((lbl, idx) => [
        lbl,
        idx === 1 ? 'primary' : '',
        () => { state.playerLane = idx; }
      ]));

      state.onKey = (code) => {
        if (code === 'ArrowLeft' || code === 'KeyA') state.playerLane = Math.max(0, state.playerLane - 1);
        if (code === 'ArrowRight' || code === 'KeyD') state.playerLane = Math.min(3, state.playerLane + 1);
        if (code === 'Digit1') state.playerLane = 0;
        if (code === 'Digit2') state.playerLane = 1;
        if (code === 'Digit3') state.playerLane = 2;
        if (code === 'Digit4') state.playerLane = 3;
      };
      state.onPointerDown = (x) => {
        const lane = Math.min(3, Math.max(0, Math.floor((x - 110) / 170)));
        state.playerLane = lane;
      };

      refreshRhythmUI();
      let lastT = performance.now();

      function loop(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        const cur = questions[state.qIdx];
        state.padY += state.speed * dt;

        // 當彈簧踏墊抵達下方判定線 (y = 405)
        if (state.padY >= 405) {
          const hitX = 195 + state.playerLane * 170;
          if (state.playerLane === cur.lane) {
            state.score++;
            state.combo++;
            SFX.ok();
            for (let i = 0; i < 18; i++) {
              state.bursts.push({
                x: hitX, y: 405,
                vx: (Math.random() - 0.5) * 260,
                vy: -80 - Math.random() * 220,
                col: laneCols[i % 4], life: 0.7
              });
            }
          } else {
            state.combo = 0;
            SFX.ng();
          }
          state.qIdx++;
          state.padY = 70;
          if (state.qIdx >= questions.length) {
            const stars = state.score >= 5 ? 3 : (state.score >= 3 ? 2 : 1);
            finishMinigame(mgId, stars, `你在「節奏字音跳舞機」精準踩中 ${state.score} / ${questions.length} 個聲調與部首彈簧墊！`, bonusSubjectId);
            return;
          }
          refreshRhythmUI();
        }

        // 繪製 Nano Banana 2 霓虹音律舞台背景
        drawTiledBg(mgCtx, 'texRhythm', '#1e1b4b', 0.65, 0, now * 0.08);

        // 繪製 4 條音律輸送帶跑道
        for (let i = 0; i < 4; i++) {
          const lx = 110 + i * 170;
          mgCtx.fillStyle = state.playerLane === i ? 'rgba(255, 255, 255, 0.24)' : 'rgba(15, 23, 42, 0.52)';
          mgCtx.strokeStyle = laneCols[i];
          mgCtx.lineWidth = 4;
          mgCtx.fillRect(lx, 55, 160, 395);
          mgCtx.strokeRect(lx, 55, 160, 395);

          mgCtx.fillStyle = '#ffffff';
          mgCtx.font = '900 15px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(laneLabels[i], lx + 80, 475);
        }

        // 繪製迎面滑來的 4 個彈簧墊
        const wrongLabels = ['一聲 ˉ', '二聲 ˊ', '三聲 ˇ', '四聲 ˋ'];
        for (let i = 0; i < 4; i++) {
          const lx = 122 + i * 170;
          const isTarget = i === cur.lane;
          mgCtx.save();
          mgCtx.translate(lx, state.padY);
          mgCtx.fillStyle = laneCols[i];
          mgCtx.strokeStyle = '#ffffff';
          mgCtx.lineWidth = 3;
          mgCtx.beginPath(); mgCtx.roundRect(0, -24, 136, 48, 16); mgCtx.fill(); mgCtx.stroke();
          mgCtx.fillStyle = '#ffffff';
          mgCtx.font = '900 17px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(isTarget ? cur.label : wrongLabels[i], 68, 6);
          mgCtx.restore();
        }

        // 繪製下方跳躍角色與 Combo 特效
        const px = 190 + state.playerLane * 170;
        const bounce = Math.abs(Math.sin(now * 0.01)) * 18;
        mgCtx.save();
        mgCtx.translate(px, 405 - bounce);
        const npcIm = loadedImgs.npcRhythm;
        if (npcIm && npcIm.complete) {
          mgCtx.drawImage(npcIm, -34, -34, 68, 68);
        } else {
          mgCtx.fillStyle = '#fde047';
          mgCtx.beginPath(); mgCtx.arc(0, 0, 24, 0, Math.PI * 2); mgCtx.fill();
        }
        mgCtx.restore();

        if (state.combo > 0) {
          mgCtx.fillStyle = '#fde047';
          mgCtx.font = '900 28px "Baloo 2", "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'right';
          mgCtx.fillText(`🔥 ${state.combo} COMBO!`, 870, 42);
        }

        state.bursts = state.bursts.filter(b => (b.life -= dt) > 0);
        state.bursts.forEach(b => {
          b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 420 * dt;
          mgCtx.fillStyle = b.col;
          mgCtx.beginPath(); mgCtx.arc(b.x, b.y, 6, 0, Math.PI * 2); mgCtx.fill();
        });

        activeMg = state;
        mgRaf = requestAnimationFrame(loop);
      }
      mgRaf = requestAnimationFrame(loop);
    }

    /* -------------------------------------------------------------------
     * 遊戲 4：【角度投石車攻城防衛戰】(Angle Master: Castle Siege)
     * ------------------------------------------------------------------- */
    else if (mgId === 'mg_angle') {
      const targets = [
        { tx: 470, ty: 380, w: 76, h: 76, hint: '第一波：中距離平地紙箱怪（建議仰角 30° + 中等拉力 75）' },
        { tx: 740, ty: 380, w: 78, h: 78, hint: '第二波：遠距離巨型紙箱怪（45° 是拋射最遠的黃金銳角！試試 45° + 滿拉力 90）' },
        { tx: 540, ty: 205, w: 76, h: 76, hint: '第三波：高台堡壘紙箱怪（建議大銳角 60° + 拉力 85 越過高台！）' }
      ];

      const state = {
        id: mgId, tIdx: 0, angle: 45, power: 75, score: 0,
        proj: null, msg: ''
      };

      function refreshAngleUI() {
        const tg = targets[state.tIdx];
        const angleType = state.angle === 90 ? '直角 90°' : `銳角 ${state.angle}°`;
        updateMgHeader(
          state.tIdx + 1, 3, state.score,
          `🏰 ${tg.hint}`,
          `目前仰角：【${angleType}】｜拉力：【${state.power}%】`
        );
      }

      function fireCatapult() {
        if (state.proj) return;
        SFX.jump();
        const rad = state.angle * Math.PI / 180;
        const v0 = state.power * 6.8;
        state.proj = {
          x: 135, y: 375,
          vx: Math.cos(rad) * v0,
          vy: -Math.sin(rad) * v0
        };
      }

      function setupAngleControls() {
        setMgControls([
          ['📐 銳角 30°', state.angle === 30 ? 'primary' : '', () => { state.angle = 30; setupAngleControls(); refreshAngleUI(); }],
          ['📐 銳角 45°(最遠)', state.angle === 45 ? 'primary' : '', () => { state.angle = 45; setupAngleControls(); refreshAngleUI(); }],
          ['📐 銳角 60°(高拋)', state.angle === 60 ? 'primary' : '', () => { state.angle = 60; setupAngleControls(); refreshAngleUI(); }],
          ['📐 直角 90°(垂直)', state.angle === 90 ? 'primary' : '', () => { state.angle = 90; setupAngleControls(); refreshAngleUI(); }],
          ['💪 拉力 60%', state.power === 60 ? 'primary' : '', () => { state.power = 60; setupAngleControls(); refreshAngleUI(); }],
          ['💪 拉力 75%', state.power === 75 ? 'primary' : '', () => { state.power = 75; setupAngleControls(); refreshAngleUI(); }],
          ['💪 拉力 90%', state.power === 90 ? 'primary' : '', () => { state.power = 90; setupAngleControls(); refreshAngleUI(); }],
          ['🔥 發射水球投石車！', 'warn', fireCatapult]
        ]);
      }

      state.onKey = (code) => { if (code === 'Space' || code === 'Enter') fireCatapult(); };
      // 支援手機橫向／觸控直接點擊或拖曳畫面調整仰角與力道，放開或點發射鈕即投射！
      state.onPointerDown = (x, y) => {
        if (x > 160) {
          const dx = Math.max(40, x - 135), dy = Math.max(20, 385 - y);
          const deg = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
          state.angle = deg >= 75 ? 90 : (deg >= 52 ? 60 : (deg >= 38 ? 45 : 30));
          const dist = Math.hypot(dx, dy);
          state.power = dist > 480 ? 90 : (dist > 320 ? 75 : 60);
          setupAngleControls();
          refreshAngleUI();
        }
        fireCatapult();
      };

      setupAngleControls();
      refreshAngleUI();
      let lastT = performance.now();

      function loop(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const G_ACC = 520;
        const tg = targets[state.tIdx];

        if (state.proj) {
          state.proj.x += state.proj.vx * dt;
          state.proj.y += state.proj.vy * dt;
          state.proj.vy += G_ACC * dt;

          // 命中判定
          if (Math.abs(state.proj.x - tg.tx) < tg.w * 0.62 && Math.abs(state.proj.y - tg.ty) < tg.h * 0.62) {
            SFX.ok();
            state.score++;
            state.proj = null;
            state.tIdx++;
            if (state.tIdx >= targets.length) {
              finishMinigame(mgId, 3, '百發百中！你已完全掌握銳角（30°、45°、60°）、直角（90°）與拋物線力道的關係！', bonusSubjectId);
              return;
            }
            refreshAngleUI();
          } else if (state.proj.y > 445 || state.proj.x > W0 + 40) {
            SFX.ng();
            state.proj = null;
            toast('💡 差一點點！觀察白色虛線拋物線，調整角度或拉力再試一次！');
          }
        }

        // 繪製藍天與綠地戰場
        const skyG = mgCtx.createLinearGradient(0, 0, 0, H0);
        skyG.addColorStop(0, '#bae6fd'); skyG.addColorStop(0.78, '#fef3c7'); skyG.addColorStop(0.78, '#86efac'); skyG.addColorStop(1, '#4ade80');
        mgCtx.fillStyle = skyG;
        mgCtx.fillRect(0, 0, W0, H0);

        // 繪製即時拋物線預測軌跡與量角器刻度
        const rad = state.angle * Math.PI / 180;
        const v0 = state.power * 6.8;
        mgCtx.save();
        mgCtx.strokeStyle = 'rgba(30, 58, 138, 0.45)';
        mgCtx.lineWidth = 3;
        mgCtx.beginPath();
        mgCtx.arc(135, 375, 78, -Math.PI / 2, 0);
        mgCtx.stroke();

        mgCtx.fillStyle = '#1e3a8a';
        mgCtx.font = '900 16px "Noto Sans TC", sans-serif';
        mgCtx.fillText(`${state.angle}° (${state.angle === 90 ? '直角' : '銳角'})`, 155, 320);

        mgCtx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        mgCtx.setLineDash([8, 8]);
        mgCtx.lineWidth = 3.5;
        mgCtx.beginPath();
        for (let t = 0; t < 2.2; t += 0.06) {
          const px = 135 + Math.cos(rad) * v0 * t;
          const py = 375 - Math.sin(rad) * v0 * t + 0.5 * G_ACC * t * t;
          if (t === 0) mgCtx.moveTo(px, py); else mgCtx.lineTo(px, py);
          if (py > 430) break;
        }
        mgCtx.stroke();
        mgCtx.restore();

        // 繪製左側校園投石車
        mgCtx.save();
        mgCtx.translate(135, 385);
        mgCtx.fillStyle = '#92400e';
        mgCtx.fillRect(-45, 0, 90, 28);
        mgCtx.save();
        mgCtx.rotate(-rad);
        mgCtx.fillStyle = '#b45309';
        mgCtx.fillRect(-10, -8, 82, 16);
        mgCtx.fillStyle = '#38bdf8';
        mgCtx.beginPath(); mgCtx.arc(72, 0, 14, 0, Math.PI * 2); mgCtx.fill();
        mgCtx.restore();
        mgCtx.restore();

        // 繪製目標紙箱怪（套用 Nano Banana 2 紙箱怪貼圖）
        if (tg.ty < 320) {
          mgCtx.fillStyle = '#78350f';
          mgCtx.fillRect(tg.tx - 48, tg.ty + tg.h / 2, 96, 420 - (tg.ty + tg.h / 2));
        }
        mgCtx.save();
        mgCtx.translate(tg.tx, tg.ty);
        const boxIm = loadedImgs.texAngle;
        if (boxIm && boxIm.complete) {
          mgCtx.drawImage(boxIm, -tg.w / 2, -tg.h / 2, tg.w, tg.h);
        } else {
          mgCtx.fillStyle = '#d97706';
          mgCtx.fillRect(-tg.w / 2, -tg.h / 2, tg.w, tg.h);
        }
        mgCtx.strokeStyle = '#fef08a';
        mgCtx.lineWidth = 3;
        mgCtx.strokeRect(-tg.w / 2, -tg.h / 2, tg.w, tg.h);
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 15px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText('📦 紙箱怪靶標', 0, -tg.h / 2 - 10);
        mgCtx.restore();

        // 繪製飛行中的水球砲彈
        if (state.proj) {
          mgCtx.fillStyle = '#0284c7';
          mgCtx.strokeStyle = '#ffffff';
          mgCtx.lineWidth = 3;
          mgCtx.beginPath();
          mgCtx.arc(state.proj.x, state.proj.y, 16, 0, Math.PI * 2);
          mgCtx.fill();
          mgCtx.stroke();
        }

        activeMg = state;
        mgRaf = requestAnimationFrame(loop);
      }
      mgRaf = requestAnimationFrame(loop);
    }

    /* -------------------------------------------------------------------
     * 遊戲 5：【食物鏈大逃殺】(Eco-Chain Survival)
     * ------------------------------------------------------------------- */
    else if (mgId === 'mg_eco') {
      // 階級：0=🌱嫩葉(初級生產者), 1=🐛毛毛蟲(初級消費者), 2=🐦麻雀(次級消費者), 3=🦅老鷹(高級消費者)
      const TIERS = [
        { icon: '🌱', name: '綠色植物(生產者)', eat: '☀️ 陽光水滴', preyTier: -1, predTier: 1, speed: 195 },
        { icon: '🐛', name: '毛毛蟲(初級消費者)', eat: '🌱 綠色嫩葉', preyTier: 0, predTier: 2, speed: 215 },
        { icon: '🐦', name: '麻雀(次級消費者)', eat: '🐛 毛毛蟲', preyTier: 1, predTier: 3, speed: 235 },
        { icon: '🦅', name: '老鷹(巔峰掠食者)', eat: '🐦 麻雀', preyTier: 2, predTier: 99, speed: 265 }
      ];

      const state = {
        id: mgId, tier: 1, exp: 0, score: 0,
        px: 450, py: 250, tx: 450, ty: 250, invuln: 1.5,
        entities: []
      };

      function spawnEntities() {
        state.entities = [];
        for (let i = 0; i < 14; i++) {
          const t = i < 5 ? -1 : (i < 9 ? 0 : (i < 12 ? 1 : (i < 13 ? 2 : 3)));
          state.entities.push({
            x: 80 + Math.random() * 740,
            y: 80 + Math.random() * 340,
            vx: (Math.random() - 0.5) * 95,
            vy: (Math.random() - 0.5) * 95,
            tier: t
          });
        }
      }

      function refreshEcoUI() {
        const info = TIERS[state.tier];
        const predName = info.predTier <= 3 ? TIERS[info.predTier].icon + TIERS[info.predTier].name : '無天敵（再吃 2 隻麻雀即獲勝！）';
        updateMgHeader(
          state.tier, 3, state.score,
          `你現在是【${info.icon} ${info.name}】｜🎯 捕捉獵物：【${info.eat}】（進度 ${state.exp}/2）｜⚠️ 閃避天敵：【${predName}】`,
          '點擊畫面或按方向鍵移動，被天敵碰到會退化為植物重新生長喔！'
        );
      }

      setMgControls([
        ['⬆️ 往北游走', '', () => { state.ty = Math.max(50, state.py - 100); }],
        ['⬇️ 往南游走', '', () => { state.ty = Math.min(450, state.py + 100); }],
        ['⬅️ 往西游走', '', () => { state.tx = Math.max(50, state.px - 120); }],
        ['➡️ 往東游走', '', () => { state.tx = Math.min(850, state.px + 120); }]
      ]);

      state.onPointerDown = (x, y) => { state.tx = x; state.ty = y; };
      state.onPointerMove = (x, y) => { state.tx = x; state.ty = y; };

      spawnEntities();
      refreshEcoUI();
      let lastT = performance.now();

      function loop(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const info = TIERS[state.tier];
        state.invuln = Math.max(0, state.invuln - dt);

        if (mgKeys.ArrowLeft || mgKeys.KeyA) { state.px -= info.speed * dt; state.tx = state.px; }
        if (mgKeys.ArrowRight || mgKeys.KeyD) { state.px += info.speed * dt; state.tx = state.px; }
        if (mgKeys.ArrowUp || mgKeys.KeyW) { state.py -= info.speed * dt; state.ty = state.py; }
        if (mgKeys.ArrowDown || mgKeys.KeyS) { state.py += info.speed * dt; state.ty = state.py; }

        state.px += (state.tx - state.px) * Math.min(1, dt * 6);
        state.py += (state.ty - state.py) * Math.min(1, dt * 6);
        state.px = Math.max(40, Math.min(W0 - 40, state.px));
        state.py = Math.max(40, Math.min(H0 - 40, state.py));

        for (let i = state.entities.length - 1; i >= 0; i--) {
          const e = state.entities[i];
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (e.x < 40 || e.x > W0 - 40) e.vx *= -1;
          if (e.y < 40 || e.y > H0 - 40) e.vy *= -1;

          const d = Math.hypot(state.px - e.x, state.py - e.y);
          if (d < 36) {
            if (e.tier === info.preyTier) {
              // 成功捕食獵物！
              SFX.ok();
              state.exp++;
              state.score++;
              e.x = 70 + Math.random() * 760;
              e.y = 70 + Math.random() * 360;
              if (state.exp >= 2) {
                state.exp = 0;
                if (state.tier < 3) {
                  state.tier++;
                  state.invuln = 1.5;
                  toast(`🌟 進化成功！你成長為「${TIERS[state.tier].icon} ${TIERS[state.tier].name}」了！`);
                } else {
                  finishMinigame(mgId, 3, '恭喜你從初級消費者一路進化為食物鏈頂端的老鷹，深刻體會了生態平衡與能量流動！', bonusSubjectId);
                  return;
                }
              }
              refreshEcoUI();
            } else if (e.tier === info.predTier && state.invuln <= 0) {
              // 被天敵捕食：退化為初級生產者（綠色植物）吸收陽光重新生長！
              SFX.ng();
              state.tier = 0;
              state.exp = 0;
              state.invuln = 2.0;
              toast('🌱 被天敵捕食了！化為養分回到「綠色植物（初級生產者）」，快收集 2 顆 ☀️ 陽光重新進化！');
              refreshEcoUI();
            }
          }
        }

        // 繪製 Nano Banana 2 森林池塘生態背景
        drawTiledBg(mgCtx, 'texEco', '#15803d', 0.85);

        // 繪製生態圈生物
        state.entities.forEach(e => {
          const isPrey = e.tier === info.preyTier;
          const isPred = e.tier === info.predTier;
          const emoji = e.tier === -1 ? '☀️' : TIERS[e.tier].icon;
          mgCtx.save();
          mgCtx.translate(e.x, e.y);
          mgCtx.fillStyle = isPrey ? 'rgba(34, 197, 94, 0.85)' : (isPred ? 'rgba(239, 68, 68, 0.85)' : 'rgba(15, 23, 42, 0.45)');
          mgCtx.strokeStyle = isPrey ? '#fef08a' : (isPred ? '#fecaca' : 'rgba(255,255,255,0.4)');
          mgCtx.lineWidth = isPrey || isPred ? 3.5 : 1.5;
          mgCtx.beginPath(); mgCtx.arc(0, 0, 22, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
          mgCtx.font = '24px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
          mgCtx.textAlign = 'center'; mgCtx.textBaseline = 'middle';
          mgCtx.fillText(emoji, 0, 2);
          if (isPrey || isPred) {
            mgCtx.fillStyle = '#ffffff';
            mgCtx.font = '900 11px "Noto Sans TC", sans-serif';
            mgCtx.fillText(isPrey ? '可捕食' : '⚠️天敵', 0, -28);
          }
          mgCtx.restore();
        });

        // 繪製玩家生物
        mgCtx.save();
        mgCtx.translate(state.px, state.py);
        if (state.invuln > 0 && Math.floor(now / 100) % 2 === 0) mgCtx.globalAlpha = 0.55;
        mgCtx.fillStyle = '#2563eb';
        mgCtx.strokeStyle = '#fde047';
        mgCtx.lineWidth = 4;
        mgCtx.beginPath(); mgCtx.arc(0, 0, 28, 0, Math.PI * 2); mgCtx.fill(); mgCtx.stroke();
        mgCtx.font = '30px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        mgCtx.textAlign = 'center'; mgCtx.textBaseline = 'middle';
        mgCtx.fillText(info.icon, 0, 2);
        mgCtx.fillStyle = '#fde047';
        mgCtx.font = '900 13px "Noto Sans TC", sans-serif';
        mgCtx.fillText(`我 (${info.name.split('(')[0]})`, 0, 40);
        mgCtx.restore();

        activeMg = state;
        mgRaf = requestAnimationFrame(loop);
      }
      mgRaf = requestAnimationFrame(loop);
    }

    /* -------------------------------------------------------------------
     * 遊戲 6：【齒輪光影解謎迷宮】(Gear & Prism Labyrinth)
     * ------------------------------------------------------------------- */
    else if (mgId === 'mg_gear') {
      // 謎題：大從動齒輪為 12 齒，需轉動 2 圈才能完全降下中央石壁 -> 玩家需選擇 24 齒主動齒輪（24 / 12 = 2 倍傳動比）！
      // 接著旋轉兩面平面鏡：鏡 A 設為 45° (將水平右射光轉為垂直向下)，鏡 B 設為 45° (將垂直向下光轉為水平向右射入感應晶石)！
      const state = {
        id: mgId, driverTeeth: 12, wallOpen: false,
        m1: 0,   // 0=水平(0°), 1=斜向(\ 45°), 2=垂直(90°), 3=反斜(/ 135°)
        m2: 2,
        solved: false, winTimer: 0
      };

      function checkGearAndLight() {
        state.wallOpen = (state.driverTeeth === 24);
        const hitCrystal = state.wallOpen && state.m1 === 1 && state.m2 === 1;
        const ratio = (state.driverTeeth / 12).toFixed(1);
        updateMgHeader(
          state.wallOpen ? 2 : 1, 2, hitCrystal ? 3 : (state.wallOpen ? 1 : 0),
          !state.wallOpen
            ? `⚙️ 步驟1：從動齒輪為 12 齒，石門需轉動「正好 2.0 圈」才能開啟！請切換主動齒輪齒數（目前 ${state.driverTeeth} 齒 → 傳動比 ${ratio} 圈）`
            : '✨ 步驟2：石壁已降下！請點擊平面鏡 A 與平面鏡 B 旋轉角度（45°），將太陽光反射至右側感應晶石！',
          '點擊齒輪按鈕與平面鏡即可直接操作實驗'
        );
        if (hitCrystal && !state.solved) {
          state.solved = true;
          state.winTimer = 1.6;
          SFX.win();
        }
      }

      function setupGearControls() {
        setMgControls([
          ['⚙️ 12齒主動輪 (1.0圈)', state.driverTeeth === 12 ? 'primary' : '', () => { state.driverTeeth = 12; setupGearControls(); checkGearAndLight(); }],
          ['⚙️ 24齒主動輪 (2.0圈・開門!)', state.driverTeeth === 24 ? 'primary' : '', () => { state.driverTeeth = 24; SFX.ok(); setupGearControls(); checkGearAndLight(); }],
          ['⚙️ 36齒主動輪 (3.0圈・超載)', state.driverTeeth === 36 ? 'primary' : '', () => { state.driverTeeth = 36; setupGearControls(); checkGearAndLight(); }],
          ['🪞 旋轉平面鏡 A', 'warn', () => { state.m1 = (state.m1 + 1) % 4; checkGearAndLight(); }],
          ['🪞 旋轉平面鏡 B', 'warn', () => { state.m2 = (state.m2 + 1) % 4; checkGearAndLight(); }]
        ]);
      }

      state.onPointerDown = (x, y) => {
        if (Math.hypot(x - 450, y - 140) < 65) { state.m1 = (state.m1 + 1) % 4; SFX.tap(); checkGearAndLight(); }
        else if (Math.hypot(x - 450, y - 370) < 65) { state.m2 = (state.m2 + 1) % 4; SFX.tap(); checkGearAndLight(); }
        else if (x < 280) {
          state.driverTeeth = state.driverTeeth === 12 ? 24 : (state.driverTeeth === 24 ? 36 : 12);
          SFX.tap(); setupGearControls(); checkGearAndLight();
        }
      };

      setupGearControls();
      checkGearAndLight();
      let lastT = performance.now();

      function drawGearWheel(ctx, x, y, r, teeth, ang, col, label) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.fillStyle = col;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * Math.PI * 2;
          ctx.save();
          ctx.rotate(a);
          ctx.fillRect(-6, -r - 8, 12, 12);
          ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#451a03';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 14px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + r + 24);
      }

      function loop(now) {
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        if (state.solved) {
          state.winTimer -= dt;
          if (state.winTimer <= 0) {
            finishMinigame(mgId, 3, '神殿大門開啟！你運用「24齒：12齒＝2倍傳動比」降下石壁，並以兩面 45° 平面鏡完美驗證了光的直進與反射定律！', bonusSubjectId);
            return;
          }
        }

        // 繪製 Nano Banana 2 古文明黃金齒輪神殿背景
        drawTiledBg(mgCtx, 'texGear', '#451a03', 0.85);

        // 左側：齒輪傳動組
        const spd = now * 0.0018;
        const rDriver = state.driverTeeth === 12 ? 32 : (state.driverTeeth === 24 ? 48 : 60);
        const ratio = state.driverTeeth / 12;
        drawGearWheel(mgCtx, 130, 260, rDriver, state.driverTeeth, spd, '#eab308', `主動輪 (${state.driverTeeth}齒)`);
        drawGearWheel(mgCtx, 130 + rDriver + 34, 260, 32, 12, -spd * ratio, '#f59e0b', `從動輪 (12齒・轉${ratio.toFixed(1)}圈)`);

        // 中央石壁（當传動比 = 2.0 時完全降下開啟光路）
        const wallH = state.wallOpen ? 22 : 165;
        mgCtx.fillStyle = state.wallOpen ? '#22c55e' : '#57534e';
        mgCtx.strokeStyle = '#fde047';
        mgCtx.lineWidth = 4;
        mgCtx.fillRect(295, 70, 36, wallH);
        mgCtx.strokeRect(295, 70, 36, wallH);
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 13px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText(state.wallOpen ? '✅石門已降' : '🪨厚重石壁', 313, 62);

        // 計算太陽光束直線與反射路徑
        const beamPts = [{ x: 95, y: 140 }];
        if (!state.wallOpen) {
          beamPts.push({ x: 295, y: 140 });
        } else {
          beamPts.push({ x: 450, y: 140 }); // 抵達平面鏡 A
          if (state.m1 === 1) {
            // 45° (\) 反射向下至平面鏡 B (450, 370)
            beamPts.push({ x: 450, y: 370 });
            if (state.m2 === 1) {
              // 45° (\) 反射向右至感應晶石 (780, 370)
              beamPts.push({ x: 780, y: 370 });
            } else if (state.m2 === 3) {
              beamPts.push({ x: 180, y: 370 });
            } else if (state.m2 === 0) {
              beamPts.push({ x: 450, y: 140 });
            } else {
              beamPts.push({ x: 450, y: 480 });
            }
          } else if (state.m1 === 3) {
            beamPts.push({ x: 450, y: 20 });
          } else {
            beamPts.push({ x: 860, y: 140 });
          }
        }

        // 繪製太陽雷射光束
        mgCtx.save();
        mgCtx.strokeStyle = '#fde047';
        mgCtx.shadowColor = '#38bdf8';
        mgCtx.shadowBlur = 18;
        mgCtx.lineWidth = 8;
        mgCtx.lineCap = 'round';
        mgCtx.lineJoin = 'round';
        mgCtx.beginPath();
        beamPts.forEach((p, idx) => idx === 0 ? mgCtx.moveTo(p.x, p.y) : mgCtx.lineTo(p.x, p.y));
        mgCtx.stroke();
        mgCtx.restore();

        // 繪製太陽光源發射器
        mgCtx.fillStyle = '#f59e0b';
        mgCtx.beginPath(); mgCtx.arc(95, 140, 26, 0, Math.PI * 2); mgCtx.fill();
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 14px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText('☀️ 太陽光束', 95, 102);

        // 繪製兩面可旋轉平面鏡 A 與 B
        const mirrorAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
        const mirrorNames = ['0° 水平', '45° 斜射 (正確反射!)', '90° 垂直', '135° 反斜'];
        [[450, 140, state.m1, '平面鏡 A（點擊旋轉）'], [450, 370, state.m2, '平面鏡 B（點擊旋轉）']].forEach(([mx, my, mState, mLabel]) => {
          mgCtx.save();
          mgCtx.translate(mx, my);
          mgCtx.fillStyle = 'rgba(15, 23, 42, 0.55)';
          mgCtx.beginPath(); mgCtx.arc(0, 0, 44, 0, Math.PI * 2); mgCtx.fill();
          mgCtx.rotate(mirrorAngles[mState]);
          mgCtx.strokeStyle = '#38bdf8';
          mgCtx.lineWidth = 9;
          mgCtx.beginPath(); mgCtx.moveTo(-36, 0); mgCtx.lineTo(36, 0); mgCtx.stroke();
          mgCtx.strokeStyle = '#ffffff';
          mgCtx.lineWidth = 3;
          mgCtx.beginPath(); mgCtx.moveTo(-36, -3); mgCtx.lineTo(36, -3); mgCtx.stroke();
          mgCtx.restore();

          mgCtx.fillStyle = mState === 1 ? '#86efac' : '#ffffff';
          mgCtx.font = '900 14px "Noto Sans TC", sans-serif';
          mgCtx.textAlign = 'center';
          mgCtx.fillText(`${mLabel}：${mirrorNames[mState]}`, mx + 135, my + 5);
        });

        // 繪製右側神殿感應晶石
        mgCtx.save();
        mgCtx.translate(780, 370);
        mgCtx.fillStyle = state.solved ? '#38bdf8' : '#475569';
        mgCtx.strokeStyle = '#fde047';
        mgCtx.lineWidth = 5;
        mgCtx.beginPath();
        mgCtx.moveTo(0, -38); mgCtx.lineTo(32, 0); mgCtx.lineTo(0, 38); mgCtx.lineTo(-32, 0); mgCtx.closePath();
        mgCtx.fill(); mgCtx.stroke();
        mgCtx.fillStyle = '#ffffff';
        mgCtx.font = '900 15px "Noto Sans TC", sans-serif';
        mgCtx.textAlign = 'center';
        mgCtx.fillText(state.solved ? '💎 晶石充能完畢！' : '💎 感應晶石', 0, 58);
        mgCtx.restore();

        activeMg = state;
        mgRaf = requestAnimationFrame(loop);
      }
      mgRaf = requestAnimationFrame(loop);
    }
  }

  /* ---------- 傳統快問快答（保留給校長最終關與想練習題目的孩童） ---------- */
  const Q = { id: null, list: [], i: 0, right: 0, marks: [] };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function startQuiz(id) {
    const pool = id === 'campus' ? QUESTIONS.campus : QUESTIONS[id][S.grade];
    Q.id = id; Q.list = shuffle(pool).slice(0, 3); Q.i = 0; Q.right = 0; Q.marks = [];
    const s = subj(id); $('#quiz-sub').textContent = `${gName(S.grade)}・${s.label}`; $('#quiz-sub').style.background = s.color;
    $('#quiz').hidden = false; lock(true); showQ();
  }
  function showQ() {
    const [q, opts, tip] = Q.list[Q.i], order = shuffle(opts.map((t, i) => ({ t, ok: i === 0 })));
    $('#quiz-dots').innerHTML = Q.list.map((_, i) => `<i class="${Q.marks[i] || (i === Q.i ? 'now' : '')}"></i>`).join('');
    $('#quiz-q').textContent = q; $('#quiz-fb').hidden = true; $('#quiz-next').hidden = true;
    const box = $('#quiz-opts'); box.innerHTML = '';
    order.forEach((o, i) => {
      const b = document.createElement('button'); b.className = 'opt';
      b.innerHTML = `<em>${'ABCD'[i]}</em><span></span>`;
      b.querySelector('span').textContent = o.t;
      b.onclick = () => answer(b, o, order, tip);
      box.appendChild(b);
    });
    Q.cur = { q, order };
    if (S.tts) readQuestion();
  }
  function readQuestion() { const c = Q.cur; if (!c) return; say(c.q + '。' + c.order.map((o, i) => `${'ABCD'[i]}，${o.t}`).join('。'), true); }
  function answer(btn, o, order, tip) {
    const btns = [...$('#quiz-opts').children]; btns.forEach(b => (b.disabled = true));
    const okBtn = btns[order.findIndex(x => x.ok)];
    okBtn.classList.add('ok');
    const fb = $('#quiz-fb'); fb.hidden = false;
    if (o.ok) { Q.right++; Q.marks[Q.i] = 'ok'; SFX.ok(); fb.className = 'fb ok'; fb.textContent = '✅ 答對了！' + tip; World.npcWave(Q.id); }
    else { btn.classList.add('ng'); Q.marks[Q.i] = 'ng'; SFX.ng(); fb.className = 'fb ng'; fb.textContent = `💡 正確答案是「${order.find(x => x.ok).t}」。${tip}`; }
    $('#quiz-dots').children[Q.i].className = Q.marks[Q.i];
    const nb = $('#quiz-next'); nb.hidden = false; nb.textContent = Q.i < Q.list.length - 1 ? '下一題 ▸' : '看結果 ▸'; nb.focus();
    say(fb.textContent);
  }
  function nextQ() { SFX.tap(); if (++Q.i < Q.list.length) showQ(); else finishQuiz(); }
  function finishQuiz() {
    $('#quiz').hidden = true;
    const id = Q.id, s = subj(id), pass = Q.right >= 2, p = prog(), old = p[id] || { stars: 0, done: false };
    const first = pass && !old.done;
    p[id] = { stars: Math.max(old.stars, Q.right), done: old.done || pass }; save();
    $('#res-stamp').textContent = pass ? s.icon : '💪'; $('#res-stamp').className = 'big-stamp' + (pass ? '' : ' fail');
    $('#res-title').textContent = pass ? (Q.right === 3 ? '全對！太厲害了！' : '過關！') : '差一點點！';
    $('#res-stars').textContent = '⭐'.repeat(Q.right) + '☆'.repeat(3 - Q.right);
    let msg;
    if (!pass) msg = '答對 2 題就能過關，再試一次一定可以！';
    else if (id === 'campus') msg = '恭喜你完成校園探險挑戰！校長要頒發榮譽獎狀給你！';
    else { msg = first ? `拿到「${s.label}」印章！繼續探索校園吧！` : `最好成績 ${'⭐'.repeat(p[id].stars)}`; }
    $('#res-text').textContent = msg;
    const box = $('#res-actions'); box.innerHTML = '';
    const add = (t, cls, fn) => { const b = document.createElement('button'); b.className = 'btn btn-' + cls; b.textContent = t; b.onclick = () => { SFX.tap(); $('#result').hidden = true; fn(); }; box.appendChild(b); };
    if (!pass) { add('先去逛逛', 'ghost', () => lock(false)); add('再試一次', 'go', () => startQuiz(id)); }
    else if (id === 'campus') add('領獎狀 🏅', 'go', showCert);
    else add('繼續探險 ▸', 'go', () => lock(false));
    $('#result').hidden = false;
    refreshHUD();
    if (pass) { SFX.stamp(); confetti(first ? 120 : 50); } else SFX.ng();
    say($('#res-title').textContent + msg);
  }

  /* ---------- 獎狀 ---------- */
  function showCert() {
    $('#cert-name').textContent = S.name || '小小探險家';
    $('#cert-grade').textContent = gName(S.grade);
    $('#cert-subj').textContent = low() ? '生活' : '自然、社會';
    $('#cert-stars').textContent = totalStars();
    const d = new Date(); $('#cert-date').textContent = `中華民國 ${d.getFullYear() - 1911} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
    let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
    $('#btn-print').hidden = framed;
    $('#cert').hidden = false; lock(true); SFX.win(); confetti(260);
    say(`恭喜${S.name || '小小探險家'}，成為光復國小校園探險王！`);
  }
  function closeCert() { $('#cert').hidden = true; lock(false); }

  /* ---------- 彩帶 ---------- */
  const cf = $('#confetti'), cx = cf.getContext('2d'); let parts = [], cfRun = false;
  function confetti(n) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cf.width = innerWidth; cf.height = innerHeight;
    const cols = ['#ff6b5b', '#ffd166', '#4a8bd6', '#5cb896', '#a77bd8', '#ff8fb1'];
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 16 - 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[i % 6], s: 6 + Math.random() * 6, life: 1 });
    if (!cfRun) { cfRun = true; requestAnimationFrame(stepCf); }
  }
  function stepCf() {
    cx.clearRect(0, 0, cf.width, cf.height);
    parts = parts.filter(p => (p.life -= 0.006) > 0 && p.y < cf.height + 20);
    parts.forEach(p => {
      p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.life * 2); cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore();
    });
    if (parts.length) requestAnimationFrame(stepCf); else { cfRun = false; cx.clearRect(0, 0, cf.width, cf.height); }
  }

  /* ---------- 搖桿與按鍵 ---------- */
  (function joystick() {
    const j = $('#joystick'), k = j.querySelector('i'); let id = null, cx0 = 0, cy0 = 0;
    const R = 50;
    j.addEventListener('pointerdown', e => { id = e.pointerId; const r = j.getBoundingClientRect(); cx0 = r.left + r.width / 2; cy0 = r.top + r.height / 2; j.setPointerCapture(id); mv(e); });
    const mv = e => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - cx0, dy = e.clientY - cy0;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx *= R / d; dy *= R / d; }
      k.style.transform = `translate(${dx}px,${dy}px)`;
      const s = Math.hypot(dx, dy) / R > 0.92 && !$('#run').classList.contains('on') ? 0.9 : 1;
      World.setMoveInput(dx / R * s, -dy / R * s);
    };
    j.addEventListener('pointermove', mv);
    const up = e => { if (e.pointerId !== id) return; id = null; k.style.transform = ''; World.setMoveInput(0, 0); };
    j.addEventListener('pointerup', up); j.addEventListener('pointercancel', up);
    const run = $('#run');
    run.addEventListener('pointerdown', () => { run.classList.add('on'); World._W.keys.ShiftLeft = true; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => run.addEventListener(ev, () => { run.classList.remove('on'); World._W.keys.ShiftLeft = false; }));
  })();

  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') { if (e.key === 'Enter') start(); return; }
    if ($('#title').hidden === false && e.key === 'Enter') { start(); return; }
    if (e.code === 'KeyE' || (e.key === 'Enter' && !anyModal())) { if (!anyModal()) talk(); }
    if (!$('#quiz').hidden && /^[1-4a-dA-D]$/.test(e.key)) { const i = '1234abcd'.indexOf(e.key.toLowerCase()) % 4; const b = $('#quiz-opts').children[i]; if (b && !b.disabled) b.click(); }
    if (!$('#quiz').hidden && e.key === 'Enter' && !$('#quiz-next').hidden) nextQ();
    if (e.key === 'Escape') {
      if (!$('#minigame').hidden) exitMinigame();
      else if (!$('#game-hub').hidden) closeGameHub();
      else if (!$('#menu').hidden) closeMenu();
      else if (!$('#dlg').hidden) { $('#dlg').hidden = true; lock(false); }
    }
    if (e.code === 'KeyM' && !anyModal() && World.mode !== 'title') toggleBird();
  });

  /* ---------- 選單與按鈕 ---------- */
  function toggleTTS() { S.tts = !S.tts; save(); refreshHUD(); toast(S.tts ? '🔊 題目會唸出來' : '🔇 關閉朗讀'); if (S.tts) say('語音朗讀打開了', true); else if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function toggleBird() { SFX.tap(); if (World.mode === 'bird') { World.setMode('play'); $('#btn-bird').classList.remove('off'); } else { World.setMode('bird'); toast('🗺️ 鳥瞰校園：拖曳轉方向、滾輪或雙指縮放，再按一次回來'); } }
  function toggleView() { SFX.tap(); World.setView(World.view === 'first' ? 'third' : 'first'); toast(World.view === 'first' ? '👀 第一人稱視角' : '🧒 第三人稱視角'); }
  function openMenu() { SFX.tap(); $('#menu').hidden = false; lock(true); }
  function closeMenu() { $('#menu').hidden = true; lock(false); }
  function backToTitle() { closeMenu(); buildTitle(); }
  function respawn() { closeMenu(); World.respawn(); }
  function resetGrade() {
    closeMenu();
    ask('🔄', '重新挑戰', `確定要清除${gName(S.grade)}的印章，重新挑戰嗎？`, [['不要', 'ghost', () => { }], ['確定清除', 'go', () => { S.progress[S.grade] = {}; S.met[S.grade] = 0; save(); refreshHUD(); toast('進度已清除，從校長開始吧！'); World.respawn(); }]]);
  }
  function ask(icon, name, text, acts) {
    $('#dlg-portrait').hidden = true;
    $('#dlg-icon').hidden = false;
    $('#dlg-icon').textContent = icon; $('#dlg-name').textContent = name; $('#dlg-text').textContent = text;
    const box = $('#dlg-actions'); box.innerHTML = '';
    acts.forEach(([t, cls, fn]) => { const b = document.createElement('button'); b.className = 'btn btn-' + cls; b.textContent = t; b.onclick = () => { $('#dlg').hidden = true; lock(false); fn(); }; box.appendChild(b); });
    $('#dlg').hidden = false; lock(true);
  }
  function showHelp() {
    closeMenu();
    $('#dlg-portrait').hidden = true;
    $('#dlg-icon').hidden = false;
    $('#dlg-icon').textContent = '❓'; $('#dlg-name').textContent = '怎麼玩';
    $('#dlg-text').textContent = (touch ? '左下搖桿走路，按住 🏃 衝刺、點 🦘 跳躍，滑動畫面轉方向。' : 'WASD 或方向鍵走路，按住 Shift 衝刺、空白鍵跳躍，拖曳滑鼠轉方向，按 E 互動，M 打開鳥瞰。') +
      '\n🎮 點擊右上角「🎮」圖示或左上角印章，可瞬移並直接體驗校園角落的「六大物理＆環境生存互動遊戲」（含日本動漫轉場特效）！\n集滿 7 個印章後回校門口找校長，就能領取榮譽獎狀！';
    const box = $('#dlg-actions'); box.innerHTML = ''; const b = document.createElement('button'); b.className = 'btn btn-go'; b.textContent = '知道了'; b.onclick = () => { $('#dlg').hidden = true; lock(false); }; box.appendChild(b);
    $('#dlg').hidden = false; lock(true);
  }
  let toastT = 0;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), 2600); }

  window.Game = {
    start, pickAvatar, talk, nextQ, readQuestion,
    toggleTTS, toggleBGM, toggleBird, toggleView,
    openMenu, closeMenu, backToTitle, respawn, resetGrade, showHelp,
    goGuide, teleportTo, openGameHub, closeGameHub, launchMinigame, exitMinigame,
    closeCert, jump, cycleTime, _S: S
  };

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
})();
