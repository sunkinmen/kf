/* =====================================================================
 * school.js ── 臺北市信義區光復國小 3D 實景校園（淡水彩柔邊美學＋穩定視角＋水袖兩側光復大字＋實景國父紀念館＋飄逸大波斯菊＋學童投籃＋精細交通工具版）
 * ===================================================================== */
(function () {
  const T = THREE;
  const V3 = T.Vector3;
  const v = (x, y, z) => new V3(x, y, z);

  const W = {
    renderer: null, scene: null, camera: null, clock: new T.Clock(),
    updaters: [], mode: 'title', view: 'third', timeIdx: 0,
    solids: [], boxes: [], circles: [], npcs: [], stations: {}, kids: [],
    listeners: { npc: [], frame: [], mode: [], step: [], land: [], sfx: [] },
    move: { x: 0, y: 0 }, keys: {}, reduced: false,
    dustPool: [], dustIdx: 0,
    sunOffset: new V3(-65, 138, 72)
  };
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || Math.min(innerWidth, innerHeight) < 600;
  const FONT_TC = '"Noto Sans TC","Microsoft JhengHei",sans-serif';
  const FLOOR_H = 3.6;

  /* ---------------------------------------------------------------------
   * 校園配置（x 往東、z 往南；原點約在校地中心，1 單位 = 1 公尺）
   * --------------------------------------------------------------------- */
  const LAYOUT = {
    campus: { x0: -63, x1: 62, z0: -86, z1: 86 },
    gate: { x: -63, z0: 6, z1: 22 },                  // 光復南路 271 號正門
    track: { cx: -6, cz: -54.8, len: 91, wid: 41 },   // 200 公尺 PU 跑道與籃球場
    dome: { x: 6.1, z: 15.8, r: 20.6 },               // 光復樓（修澤蘭設計之圓樓）
    court: { x0: 13.2, x1: 40.9, z0: 23.8, z1: 48.8 },// 中庭綜合球場與小光貓頭鷹遊戲場
    plaza: { x0: -62, x1: -13, z0: 2.6, z1: 26.4 },   // 校門椰林迎賓大道與廣場
    garden: { x0: -49, x1: -4, z0: 27.7, z1: 61 },    // 西南生態花園（植物詩文步道、荷花池與大波斯菊花海）
    buildings: [
      { id: 'mingde', name: '明德樓', sub: '行政大樓・4F 活動中心', x0: -56.8, x1: -9.8, z0: -31.2, z1: -4.0, floors: 5, roof: 'arch', wall: '#fff3db', band: '#ffbe0b', glass: '#3a86ff', roofCol: '#219ebc' },
      { id: 'north', name: '忠孝樓', sub: '北側教學大樓', x0: -2.6, x1: 44.9, z0: -21.1, z1: -6.6, floors: 4, wall: '#eefaf4', band: '#06d6a0', glass: '#3a86ff', roofCol: '#118ab2' },
      { id: 'link', x0: -9.8, x1: -2.6, z0: -23.8, z1: -7.9, floors: 2, wall: '#fff1d6', band: '#fb8500', glass: '#3a86ff', roofCol: '#ffb703' },
      { id: 'eastN', name: '仁愛樓', sub: '東側北棟教室', x0: 44.1, x1: 58.1, z0: -79.2, z1: -16.4, floors: 4, wall: '#fff0f5', band: '#ff5d8f', glass: '#3a86ff', roofCol: '#e63946' },
      { id: 'eastS', name: '信義樓', sub: '東側南棟教室', x0: 46.2, x1: 59.4, z0: -16.4, z1: 48.8, floors: 4, wall: '#fff2e2', band: '#fb8500', glass: '#3a86ff', roofCol: '#f77f00' },
      { id: 'eastX', name: '和平樓', sub: '創校第一期校舍', x0: 27.7, x1: 46.2, z0: 4.0, z1: 27.7, floors: 4, wall: '#eefcf3', band: '#38b000', glass: '#3a86ff', roofCol: '#2ec4b6', color: true },
      { id: 'mapHouse', name: '臺灣地圖屋頂', sub: '專科與幼兒園教室', x0: -2.6, x1: 10.6, z0: 37, z1: 62, floors: 2, wall: '#fff3db', band: '#ffbe0b', glass: '#3a86ff', roofTex: 'taiwan' },
      { id: 'south', name: '實踐樓', sub: '南側教學大樓', x0: -9.2, x1: 57.3, z0: 62, z1: 79.2, floors: 4, wall: '#f3f0ff', band: '#8338ec', glass: '#3a86ff', roofCol: '#7209b7', color: true },
      { id: 'sw', name: '力行樓', sub: '西南教學大樓', x0: -49.4, x1: -8.7, z0: 63, z1: 75.2, floors: 3, wall: '#eefaf8', band: '#00b4d8', glass: '#3a86ff', roofCol: '#0077b6' },
      { id: 'west', name: '自強樓', sub: '西側教學大樓', x0: -61.5, x1: -49.4, z0: 31.7, z1: 81.8, floors: 4, wall: '#fff0f3', band: '#ff4d6d', glass: '#3a86ff', roofCol: '#c9184a', color: true }
    ],
    towers: [
      { x: 43.5, z: 47, r: 2.3, h: 15, name: '旋轉樓梯' },
      { x: 12.8, z: 39.2, r: 2.2, h: 11.2, name: '修澤蘭旋轉梯' }
    ],
    stations: [
      { id: 'campus', x: -48, z: 9, yaw: 0, outfit: 'principal', where: '光復南路校門口' },
      { id: 'chinese', x: -17.5, z: 21, outfit: 'tChinese', where: '光復樓（圓樓）前' },
      { id: 'math', x: 36, z: -1, outfit: 'tMath', where: '和平樓東側中庭' },
      { id: 'science', x: -31, z: 43, outfit: 'tScience', where: '植物詩文步道荷花池' },
      { id: 'social', x: 15.5, z: 55, outfit: 'tSocial', where: '臺灣地圖屋頂旁', face: [30, 38] },
      { id: 'english', x: 27, z: 36, outfit: 'tEnglish', where: '中庭綜合球場' },
      { id: 'pe', x: -6, z: -55, outfit: 'tPE', where: '200m 操場跑道' },
      { id: 'art', x: -33, z: 1, outfit: 'tArt', where: '明德樓前廣場' },
      { id: 'mg_lava', x: -35.5, z: 30.5, outfit: 'mgLava', where: '南側花圃熔岩浮石陣', face: [-25, 22], prop: 'lava', portraitKey: 'npcLava', texKey: 'texLava' },
      { id: 'mg_magnet', x: -35.5, z: -34.5, outfit: 'mgMagnet', where: '明德樓北側磁力拱門', face: [-35.5, -46], prop: 'magnet', portraitKey: 'npcMagnet', texKey: 'texMagnet' },
      { id: 'mg_rhythm', x: -13.5, z: 24.5, outfit: 'mgRhythm', where: '圓樓南側音律舞台', face: [-25, 24.5], prop: 'rhythm', portraitKey: 'npcRhythm', texKey: 'texRhythm' },
      { id: 'mg_angle', x: 11.5, z: -31.5, outfit: 'mgAngle', where: '操場南側攻城投石陣', face: [11.5, -48], prop: 'angle', portraitKey: 'npcAngle', texKey: 'texAngle' },
      { id: 'mg_eco', x: -16.5, z: 48.5, outfit: 'mgEco', where: '荷花池畔生態祭壇', face: [-24.3, 45.8], prop: 'eco', portraitKey: 'npcEco', texKey: 'texEco' },
      { id: 'mg_gear', x: 3.5, z: 38.5, outfit: 'mgGear', where: '圓樓南側光影神殿碑', face: [18, 38.5], prop: 'gear', portraitKey: 'npcGear', texKey: 'texGear' }
    ],
    spawn: { x: -55, z: 14, yaw: -Math.PI / 2 }
  };
  W.layout = LAYOUT;

  /* ---------- 淡水彩柔邊材質與暖褐水彩鉛筆淡線系統（絕不使用黑色勾邊或黑色加深！） ---------- */
  const matCache = {};
  // 使用柔和暖褐水彩鉛筆色 (#a69683) 且低透明度 (0.26) 輕柔勾勒建築邊線，完全不用黑色！
  const wcLineMat = new T.LineBasicMaterial({ color: 0xa69683, transparent: true, opacity: 0.26 });

  function pbr(color, extra) {
    // Cute Vivid Toy Style / Vibrant Designer Toy Aesthetic (Octane Render Physical Vinyl / Resin Shader)
    const isNatural = extra && extra.natural;
    const opts = Object.assign({
      color,
      roughness: isNatural ? 0.52 : 0.22,
      metalness: isNatural ? 0.02 : 0.06,
      clearcoat: isNatural ? 0.06 : 0.72,
      clearcoatRoughness: isNatural ? 0.42 : 0.12,
      reflectivity: isNatural ? 0.32 : 0.90,
      envMapIntensity: isNatural ? 0.55 : 0.78
    }, extra || {});
    delete opts.natural;
    const key = color + (extra ? JSON.stringify(extra) : '');
    if (!extra && matCache[key]) return matCache[key];
    const m = new T.MeshPhysicalMaterial(opts);
    if (!extra) matCache[key] = m;
    return m;
  }

  function addEdgeInk(mesh) {
    // 截圖 Q 版圓潤玩具島嶼風格：不使用任何幾何鐵絲邊線，保持純淨光滑積木質感！
    return mesh;
  }

  function M(geo, color, o = {}) {
    const m = new T.Mesh(geo, o.mat || pbr(color, o.pbr));
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    if (o.s) (typeof o.s === 'number') ? m.scale.setScalar(o.s) : m.scale.set(...o.s);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.recv !== false;
    // 移除黑色反向描邊 (o.ol)，僅在建築幾何體加上淡淡的水彩鉛筆邊線
    if (o.edge) addEdgeInk(m, typeof o.edge === 'number' ? o.edge : 28);
    (o.parent || W.scene).add(m);
    return m;
  }
  const G = (parent, x = 0, y = 0, z = 0) => {
    const g = new T.Group();
    g.position.set(x, y, z);
    (parent || W.scene).add(g);
    return g;
  };
  const box = (w, h, d) => new T.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 20) => new T.CylinderGeometry(rt, rb, h, s);
  const sph = (r, d = 2) => new T.IcosahedronGeometry(r, d);
  const sSph = (r, ws = 28, hs = 20) => new T.SphereGeometry(r, ws, hs);

  let _seed = 20261105;
  const srnd = (a = 0, b = 1) => {
    _seed = (_seed * 1664525 + 1013904223) >>> 0;
    return a + (_seed / 4294967296) * (b - a);
  };
  const UP = new V3(0, 1, 0);
  function tube(parent, a, b, r, col, o = {}) {
    const d = new V3().subVectors(b, a), len = d.length();
    const m = M(cyl(r, r, len, 12), col, Object.assign({ parent, cast: true }, o));
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    return m;
  }
  function canvasTex(w, h, draw, opts = {}) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    draw(x, w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = opts.linear ? T.NoColorSpace : T.SRGBColorSpace;
    t.anisotropy = 8;
    if (opts.repeat) {
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(...opts.repeat);
    }
    if (opts.text && document.fonts) {
      document.fonts.ready.then(() => {
        x.clearRect(0, 0, w, h);
        draw(x, w, h);
        t.needsUpdate = true;
      });
    }
    return t;
  }
  function mergeGeos(rawList) {
    const list = rawList.map(g => g.index ? g.toNonIndexed() : g);
    let n = 0, hasColor = false;
    list.forEach(g => {
      n += g.attributes.position.count;
      if (g.attributes.color) hasColor = true;
    });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    const col = hasColor ? new Float32Array(n * 3) : null;
    let o = 0;
    list.forEach(g => {
      const cnt = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
      if (col) {
        if (g.attributes.color) {
          col.set(g.attributes.color.array, o * 3);
        } else {
          col.fill(1.0, o * 3, (o + cnt) * 3);
        }
      }
      o += cnt;
    });
    const m = new T.BufferGeometry();
    m.setAttribute('position', new T.BufferAttribute(pos, 3));
    m.setAttribute('normal', new T.BufferAttribute(nor, 3));
    m.setAttribute('uv', new T.BufferAttribute(uv, 2));
    if (col) m.setAttribute('color', new T.BufferAttribute(col, 3));
    m.computeBoundingSphere();
    return m;
  }

  /* ---------- 柔和暖色調接地陰影圓盤（不使用純黑，改用淡暖灰藍水彩暈染陰影） ---------- */
  let _aoShadowTex = null;
  function getAOShadowTex() {
    if (_aoShadowTex) return _aoShadowTex;
    _aoShadowTex = canvasTex(128, 128, (x, w, h) => {
      const g = x.createRadialGradient(64, 64, 4, 64, 64, 60);
      g.addColorStop(0, 'rgba(72, 86, 106, 0.38)');
      g.addColorStop(0.55, 'rgba(85, 98, 118, 0.18)');
      g.addColorStop(1, 'rgba(85, 98, 118, 0)');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
    });
    return _aoShadowTex;
  }
  function addContactShadow(parent, r = 0.6, y = 0.015, opacity = 0.72, ox = 0, oz = 0) {
    const mat = new T.MeshBasicMaterial({
      map: getAOShadowTex(),
      transparent: true,
      opacity,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1
    });
    const m = new T.Mesh(new T.PlaneGeometry(r * 2, r * 2), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(ox, y, oz);
    m.renderOrder = 1;
    (parent || W.scene).add(m);
    return m;
  }

  /* ---------------------------------------------------------------------
   * 光復國小實景「淺天藍色夏季運動校服」與 Nano Banana 2 動漫角色臉孔貼圖
   * --------------------------------------------------------------------- */
  let _stoneBump = null, _uniformShirtMat = null, _uniformSleeveMat = null, _uniformShortsL = null, _uniformShortsR = null, _sockMat = null;
  const _faceMatCache = {};

  function getStoneBump(rep = 8) {
    if (_stoneBump && rep === 8) return _stoneBump;
    const t = canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 4500; i++) {
        const v0 = 105 + ((i * 37) % 50);
        x.fillStyle = `rgb(${v0},${v0},${v0})`;
        x.fillRect((i * 73) % w, (i * 131) % h, 2 + (i % 3), 2 + (i % 3));
      }
    }, { linear: true, repeat: [rep, rep] });
    if (rep === 8) _stoneBump = t;
    return t;
  }

  function getUniformShirtMat() {
    if (_uniformShirtMat) return _uniformShirtMat;
    const map = canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#ffffff';
      x.fillRect(0, 0, w, h);
      x.fillStyle = '#82c8f8';
      for (let y = 36; y < h - 18; y += 28) x.fillRect(0, y, w, 3.5);
      x.fillStyle = '#72bef5';
      [128, 384].forEach(cx => {
        x.beginPath();
        x.moveTo(cx - 56, 0); x.lineTo(cx + 56, 0);
        x.lineTo(cx + 28, 130); x.lineTo(cx - 28, 130);
        x.closePath(); x.fill();
      });
      x.fillStyle = '#2b4570';
      x.fillRect(0, 0, w, 26);
      const nx = 264, ny = 86, nw = 54, nh = 28;
      x.fillStyle = '#ffffff'; x.fillRect(nx, ny, nw, nh);
      x.strokeStyle = '#e05252'; x.lineWidth = 2.2;
      x.strokeRect(nx + 2, ny + 2, nw - 4, nh - 4);
      x.fillStyle = '#2b4c8c'; x.font = '900 13px sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('60104', nx + nw / 2, ny + nh / 2 + 1);
      x.fillStyle = '#243b66';
      x.font = `900 58px "DFKai-SB","BiauKai","Kaiti TC",${FONT_TC}`;
      x.fillText('光 復', 256, 158);
      x.fillStyle = '#e6f2fc';
      x.fillRect(0, h - 14, w, 14);
    }, { text: true });

    if (window.GAME_ASSETS && window.GAME_ASSETS.shirtNb2) {
      const img = new Image();
      img.onload = () => {
        const ctx = map.image.getContext('2d');
        ctx.drawImage(img, 0, 0, 512, 512);
        map.needsUpdate = true;
      };
      img.src = window.GAME_ASSETS.shirtNb2;
    }

    _uniformShirtMat = new T.MeshStandardMaterial({
      map,
      roughness: 0.65,
      metalness: 0.01
    });
    return _uniformShirtMat;
  }

  function getUniformSleeveMat() {
    if (_uniformSleeveMat) return _uniformSleeveMat;
    const map = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#72bef5'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#2b4570'; x.fillRect(108, 0, 40, h);
      x.fillStyle = '#ffffff'; x.fillRect(114, 0, 7, h); x.fillRect(135, 0, 7, h);
      x.fillStyle = '#2b4570'; x.fillRect(0, h - 20, w, 20);
    });
    _uniformSleeveMat = new T.MeshStandardMaterial({ map, roughness: 0.65, metalness: 0.01 });
    return _uniformSleeveMat;
  }

  function getUniformShortsLegMat(isRightLeg) {
    if (isRightLeg && _uniformShortsR) return _uniformShortsR;
    if (!isRightLeg && _uniformShortsL) return _uniformShortsL;
    const map = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#68b6f2'; x.fillRect(0, 0, w, h);
      const sx = isRightLeg ? 192 : 64;
      x.fillStyle = '#2b4570'; x.fillRect(sx - 18, 0, 36, h);
      x.fillStyle = '#ffffff'; x.fillRect(sx - 12, 0, 6, h); x.fillRect(sx + 6, 0, 6, h);
      x.fillStyle = '#529ee0'; x.fillRect(0, h - 18, w, 18);
    });
    const mat = new T.MeshStandardMaterial({ map, roughness: 0.65, metalness: 0.01 });
    if (isRightLeg) _uniformShortsR = mat; else _uniformShortsL = mat;
    return mat;
  }

  function getSockMat() {
    if (_sockMat) return _sockMat;
    const map = canvasTex(128, 128, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#2b4570';
      x.fillRect(0, 14, w, 9);
      x.fillRect(0, 30, w, 9);
      x.fillRect(0, 46, w, 7);
    });
    _sockMat = new T.MeshStandardMaterial({ map, roughness: 0.68 });
    return _sockMat;
  }

  function getAnimeFaceMat(gender, hairCol, eyeCol = '#6b422b', glasses = false, isStudent = false, customFaceKey = null) {
    const key = `${gender}_${hairCol}_${eyeCol}_${glasses}_${isStudent}_${customFaceKey || 'npc'}`;
    if (_faceMatCache[key]) return _faceMatCache[key];

    const drawFace = (x, w, h, blink, talkOpen) => {
      const hc = hairCol || '#52382c';
      x.fillStyle = '#fde6d4';
      x.fillRect(0, 0, w, h);

      x.fillStyle = hc;
      x.fillRect(0, 0, w, 178);
      x.fillRect(0, 170, 295, 225);
      x.fillRect(w - 295, 170, 295, 225);

      const cx = 512, cy = 282;
      [-86, 86].forEach(ox => {
        const grd = x.createRadialGradient(cx + ox, cy + 34, 4, cx + ox, cy + 34, 42);
        grd.addColorStop(0, 'rgba(255, 140, 155, 0.55)');
        grd.addColorStop(1, 'rgba(255, 140, 155, 0)');
        x.fillStyle = grd;
        x.beginPath(); x.arc(cx + ox, cy + 34, 42, 0, Math.PI * 2); x.fill();
      });

      [-68, 68].forEach(ox => {
        const ex = cx + ox, ey = cy - 4;
        const sign = ox < 0 ? -1 : 1;
        if (blink) {
          x.strokeStyle = '#4a2e22';
          x.lineWidth = 7;
          x.lineCap = 'round';
          x.beginPath();
          x.moveTo(ex - 38, ey + 6);
          x.quadraticCurveTo(ex, ey - 18, ex + 38, ey + 6);
          x.stroke();
        } else {
          x.save();
          x.beginPath();
          x.ellipse(ex, ey, 39, 44, 0, 0, Math.PI * 2);
          x.fillStyle = '#ffffff';
          x.fill();
          x.clip();
          const ig = x.createLinearGradient(ex, ey - 38, ex, ey + 40);
          ig.addColorStop(0, '#3a2218');
          ig.addColorStop(0.45, eyeCol);
          ig.addColorStop(1, '#d8925c');
          x.fillStyle = ig;
          x.beginPath();
          x.ellipse(ex - sign * 3, ey + 2, 30, 37, 0, 0, Math.PI * 2);
          x.fill();
          x.fillStyle = '#2b1810';
          x.beginPath();
          x.ellipse(ex - sign * 3, ey + 2, 13.5, 17.5, 0, 0, Math.PI * 2);
          x.fill();
          x.fillStyle = '#ffffff';
          x.beginPath();
          x.ellipse(ex - 13, ey - 14, 11, 13.5, -0.2, 0, Math.PI * 2);
          x.fill();
          x.beginPath();
          x.arc(ex + 11, ey + 16, 6, 0, Math.PI * 2);
          x.fill();
          x.restore();

          x.strokeStyle = '#3d2419';
          x.lineWidth = 8.5;
          x.lineCap = 'round';
          x.beginPath();
          x.moveTo(ex - 40, ey - 8);
          x.quadraticCurveTo(ex, ey - 50, ex + 40, ey - 8);
          x.stroke();
        }
        x.strokeStyle = '#4a2e22';
        x.lineWidth = 6;
        x.lineCap = 'round';
        x.beginPath();
        x.moveTo(ex - 32, ey - 58 + sign * 3);
        x.quadraticCurveTo(ex, ey - 70, ex + 32, ey - 58 - sign * 3);
        x.stroke();
      });

      x.fillStyle = hc;
      x.fillRect(260, 0, 504, 206);
      const spikes = [
        [270, 195, 304, 295, 362, 200],
        [338, 198, 382, 252, 438, 202],
        [412, 200, 464, 262, 518, 202],
        [488, 200, 526, 268, 578, 202],
        [552, 200, 598, 258, 650, 202],
        [622, 198, 662, 248, 708, 200],
        [678, 195, 720, 295, 756, 198]
      ];
      spikes.forEach(([x0, y0, xm, ym, x1, y1]) => {
        x.beginPath();
        x.moveTo(x0, y0);
        x.quadraticCurveTo((x0 + xm) * 0.5 - 8, (y0 + ym) * 0.5 + 8, xm, ym);
        x.quadraticCurveTo((xm + x1) * 0.5 + 6, (ym + y1) * 0.5 + 8, x1, y1);
        x.closePath();
        x.fill();
      });

      if (glasses) {
        x.strokeStyle = '#52627a';
        x.lineWidth = 5;
        [-68, 68].forEach(ox => {
          x.beginPath();
          x.roundRect(cx + ox - 44, cy - 46, 88, 70, 16);
          x.stroke();
        });
        x.beginPath();
        x.moveTo(cx - 24, cy - 12);
        x.lineTo(cx + 24, cy - 12);
        x.stroke();
      }

      if (talkOpen) {
        x.fillStyle = '#e86b82';
        x.strokeStyle = '#7c382e';
        x.lineWidth = 3.5;
        x.beginPath();
        x.arc(cx, cy + 44, 16, 0, Math.PI);
        x.closePath();
        x.fill();
        x.stroke();
      } else {
        x.strokeStyle = '#8a3b30';
        x.lineWidth = 4.5;
        x.lineCap = 'round';
        x.beginPath();
        x.moveTo(cx - 19, cy + 45);
        x.quadraticCurveTo(cx, cy + 58, cx + 19, cy + 45);
        x.stroke();
      }
    };

    const texOpen = canvasTex(1024, 512, (x, w, h) => drawFace(x, w, h, false, false));
    const texBlink = canvasTex(1024, 512, (x, w, h) => drawFace(x, w, h, true, false));
    const texTalk = canvasTex(1024, 512, (x, w, h) => drawFace(x, w, h, false, true));

    if ((isStudent || customFaceKey) && window.GAME_ASSETS) {
      const openUri = customFaceKey ? window.GAME_ASSETS[customFaceKey] : (gender === 'f' ? window.GAME_ASSETS.girlFaceEq : window.GAME_ASSETS.boyFaceEq);
      const blinkUri = customFaceKey ? null : (gender === 'f' ? (window.GAME_ASSETS.girlFaceEqBlink || openUri) : (window.GAME_ASSETS.boyFaceEqBlink || openUri));
      if (openUri) {
        const imgO = new Image();
        imgO.onload = () => {
          const ctxO = texOpen.image.getContext('2d');
          ctxO.drawImage(imgO, 0, 0, 1024, 512);
          texOpen.needsUpdate = true;

          // 若為 6 大遊戲專屬關主 (customFaceKey)，直接以原圖合成自然的眨眼眼瞼，避免切換至通用學童臉孔造成貼圖跳動！
          if (customFaceKey) {
            const ctxB = texBlink.image.getContext('2d');
            ctxB.drawImage(imgO, 0, 0, 1024, 512);
            // 取樣額頭／臉頰膚色覆蓋雙眼區域並繪製柔和笑彎閉眼線
            ctxB.fillStyle = '#fae0cc';
            [[438, 256], [586, 256]].forEach(([ex, ey]) => {
              ctxB.save();
              ctxB.beginPath();
              ctxB.ellipse(ex, ey, 44, 34, 0, 0, Math.PI * 2);
              ctxB.fill();
              ctxB.strokeStyle = '#4a3228';
              ctxB.lineWidth = 6.5;
              ctxB.lineCap = 'round';
              ctxB.beginPath();
              ctxB.arc(ex, ey - 4, 28, 0.15 * Math.PI, 0.85 * Math.PI);
              ctxB.stroke();
              ctxB.restore();
            });
            texBlink.needsUpdate = true;
          }

          const ctxT = texTalk.image.getContext('2d');
          ctxT.drawImage(imgO, 0, 0, 1024, 512);
          ctxT.fillStyle = '#e86b82';
          ctxT.strokeStyle = '#7a342a';
          ctxT.lineWidth = 3.2;
          ctxT.beginPath();
          ctxT.arc(512, 344, 14, 0, Math.PI);
          ctxT.closePath();
          ctxT.fill();
          ctxT.stroke();
          texTalk.needsUpdate = true;
        };
        imgO.src = openUri;
      }
      if (blinkUri) {
        const imgB = new Image();
        imgB.onload = () => {
          const ctxB = texBlink.image.getContext('2d');
          ctxB.drawImage(imgB, 0, 0, 1024, 512);
          texBlink.needsUpdate = true;
        };
        imgB.src = blinkUri;
      }
    }

    const mat = new T.MeshStandardMaterial({
      map: texOpen,
      roughness: 0.54,
      metalness: 0.01
    });
    mat.userData = { texOpen, texBlink, texTalk };
    _faceMatCache[key] = mat;
    return mat;
  }

  /* ---------------------------------------------------------------------
   * 日系動漫人物建模與 16 關節骨骼動作系統 (makeNPC，無黑色勾邊)
   * --------------------------------------------------------------------- */
  const SKIN = '#fae0cc', HAIR = '#543b2e';
  const skinMat = new T.MeshPhysicalMaterial({ color: '#ffe3ce', roughness: 0.24, metalness: 0.02, clearcoat: 0.58, clearcoatRoughness: 0.18, sheen: 0.35, sheenColor: new T.Color('#ffbfa8'), envMapIntensity: 1.35 });

  const OUTFIT = {
    principal: { g: 'm', shirt: '#ffffff', pants: '#3b4a68', coat: '#2d4570', tie: '#d4505c', hair: '#5c6270', glasses: true },
    tChinese:  { g: 'f', shirt: '#fff2f5', pants: '#5e5078', coat: '#c85a68', hair: '#4a352c', style: 'long', booklet: true },
    tMath:     { g: 'm', shirt: '#eef5ff', pants: '#425278', vest: '#3b66b8', hair: '#4a3a32', glasses: true },
    tScience:  { g: 'f', shirt: '#e2f6ec', pants: '#4d6482', coat: '#f8fafc', hair: '#4e3a30', style: 'bob' },
    tSocial:   { g: 'm', shirt: '#f5ead6', pants: '#6e5e52', ranger: true, map: true, hair: '#4e3a30' },
    tEnglish:  { g: 'f', shirt: '#fff8de', pants: '#3e5c90', coat: '#3ca6a8', hair: '#785036', style: 'pony' },
    tPE:       { g: 'm', shirt: '#ff883e', pants: '#2d426c', whistle: true, hair: '#3d3538' },
    tArt:      { g: 'f', shirt: '#f5ebff', pants: '#56925a', apron: '#e6a642', beret: '#d25b72', hair: '#48342e', style: 'bob' },
    kidM:      { g: 'm', student: true, hair: '#543b2e', ahoge: true },
    kidF:      { g: 'f', student: true, hair: '#50362a', style: 'pony' },
    pedM:      { g: 'm', shirt: '#72bef5', pants: '#475569', hair: '#483830' },
    pedF:      { g: 'f', shirt: '#f9a8d4', pants: '#52627a', hair: '#52382c', style: 'bob' },
    mgLava:    { g: 'm', shirt: '#d4b88c', pants: '#6b4e38', vest: '#a67b52', hair: '#6e4730', lavaHat: true, faceKey: 'faceLava' },
    mgMagnet:  { g: 'm', shirt: '#e0f2fe', pants: '#3b82f6', coat: '#ffffff', tie: '#ef4444', hair: '#38bdf8', magnetEars: true, faceKey: 'faceMagnet' },
    mgRhythm:  { g: 'f', shirt: '#fce7f3', pants: '#a855f7', vest: '#ec4899', hair: '#f472b6', style: 'pony', rhythmNotes: true, faceKey: 'faceRhythm' },
    mgAngle:   { g: 'm', shirt: '#fef3c7', pants: '#475569', vest: '#64748b', hair: '#334155', angleGoggles: true, faceKey: 'faceAngle' },
    mgEco:     { g: 'f', shirt: '#dcfce7', pants: '#4d7c0f', coat: '#65a30d', hair: '#84cc16', style: 'bob', ecoSprout: true, faceKey: 'faceEco' },
    mgGear:    { g: 'm', shirt: '#fef9c3', pants: '#b45309', vest: '#eab308', hair: '#292524', gearCollar: true, faceKey: 'faceGear' }
  };

  function makeNPC(outfitKey) {
    const o = OUTFIT[outfitKey] || OUTFIT.kidM;
    const isStudent = !!o.student;
    const p = G(null);

    const aoShadow = addContactShadow(p, 0.56, 0.015, 0.72);

    const body = G(p, 0, 0, 0);
    const torso = G(body, 0, 0.88, 0);

    const legs = [-1, 1].map(sx => {
      const hip = G(body, sx * 0.13, 0.84, 0);
      if (isStudent) {
        M(cyl(0.128, 0.138, 0.30, 22), '#68b6f2', {
          y: -0.14, ry: Math.PI, parent: hip,
          mat: getUniformShortsLegMat(sx > 0)
        });
        M(sSph(0.088, 16, 12), SKIN, { y: -0.31, parent: hip, mat: skinMat });
      } else {
        M(new T.CapsuleGeometry(0.112, 0.24, 8, 16), o.pants, { y: -0.17, parent: hip, pbr: { roughness: 0.72 } });
      }

      const knee = G(hip, 0, -0.33, 0);
      if (isStudent) {
        M(cyl(0.082, 0.068, 0.22, 16), SKIN, { y: -0.11, parent: knee, mat: skinMat });
        M(cyl(0.075, 0.070, 0.20, 18), '#ffffff', { y: -0.26, ry: Math.PI, parent: knee, mat: getSockMat() });
      } else {
        M(new T.CapsuleGeometry(0.10, 0.26, 8, 16), o.pants, { y: -0.18, parent: knee, pbr: { roughness: 0.72 } });
      }

      const ankle = G(knee, 0, -0.37, 0);
      if (isStudent) {
        M(box(0.165, 0.05, 0.31), '#ffffff', { y: -0.04, z: 0.045, parent: ankle, pbr: { roughness: 0.48 } });
        M(sSph(0.108, 18, 14), '#ffffff', { y: 0.01, z: 0.04, s: [0.80, 0.60, 1.36], parent: ankle, pbr: { roughness: 0.45 } });
        M(sSph(0.104, 16, 12), '#68b6f2', { y: 0.018, z: -0.01, s: [0.82, 0.62, 0.92], parent: ankle, pbr: { roughness: 0.50 } });
        M(box(0.10, 0.022, 0.07), '#68b6f2', { y: 0.052, z: 0.07, rx: 0.35, parent: ankle });
      } else {
        M(sSph(0.13, 18, 14), o.boots || '#4a5568', { y: -0.01, z: 0.05, s: [0.85, 0.65, 1.38], parent: ankle, pbr: { roughness: 0.45, metalness: 0.05 } });
      }
      return { hip, knee, ankle, sx };
    });

    if (isStudent) {
      M(cyl(0.265, 0.275, 0.22, 24), '#68b6f2', { y: -0.02, s: [1.0, 1, 0.76], parent: torso, pbr: { roughness: 0.62 } });
      M(sSph(0.268, 22, 16), '#68b6f2', { y: -0.08, s: [1.0, 0.45, 0.76], parent: torso, pbr: { roughness: 0.62 } });

      M(cyl(0.265, 0.295, 0.56, 32), '#ffffff', {
        y: 0.34, ry: Math.PI, s: [1.02, 1, 0.78], parent: torso,
        mat: getUniformShirtMat()
      });
      M(sSph(0.272, 24, 16), '#72bef5', { y: 0.58, s: [1.02, 0.34, 0.76], parent: torso, pbr: { roughness: 0.62 } });
      M(new T.TorusGeometry(0.152, 0.030, 12, 28), '#2b4570', { y: 0.66, z: 0.01, rx: Math.PI / 2 + 0.08, parent: torso, pbr: { roughness: 0.60 } });
    } else {
      M(sSph(0.33, 22, 16), o.pants, { y: 0.02, s: [1.04, 0.55, 0.84], parent: torso, pbr: { roughness: 0.7 } });
      M(sSph(0.355, 26, 20), o.shirt, { y: 0.31, s: [1, 1.15, 0.82], parent: torso, pbr: { roughness: 0.65 } });
      if (o.tie) M(box(0.055, 0.34, 0.02), o.tie, { y: 0.36, z: 0.285, parent: torso, pbr: { roughness: 0.4 } });
      if (o.whistle) {
        tube(torso, v(-0.09, 0.62, 0.22), v(0, 0.38, 0.29), 0.008, '#e2e8f0');
        tube(torso, v(0.09, 0.62, 0.22), v(0, 0.38, 0.29), 0.008, '#e2e8f0');
        M(cyl(0.025, 0.025, 0.05, 12), '#cbd5e1', { y: 0.36, z: 0.30, rz: Math.PI / 2, parent: torso, pbr: { metalness: 0.65, roughness: 0.25 } });
      }
      if (o.vest) {
        const vest = new T.Mesh(new T.CylinderGeometry(0.345, 0.375, 0.60, 24, 1, true, 0.52, Math.PI * 2 - 1.04), pbr(o.vest, { side: T.DoubleSide, roughness: 0.68 }));
        vest.position.y = 0.29; vest.scale.z = 0.86; vest.castShadow = true; torso.add(vest);
      }
      if (o.coat) {
        const coat = new T.Mesh(new T.CylinderGeometry(0.365, 0.405, 0.72, 24, 1, true, 0.40, Math.PI * 2 - 0.80), pbr(o.coat, { side: T.DoubleSide, roughness: 0.62 }));
        coat.position.y = 0.25; coat.scale.z = 0.88; coat.castShadow = true; torso.add(coat);
        [-1, 1].forEach(sx => M(box(0.07, 0.60, 0.03), o.coat, { x: sx * 0.13, y: 0.27, z: 0.31, rz: sx * -0.05, parent: torso }));
        M(new T.TorusGeometry(0.21, 0.048, 10, 22, Math.PI), o.coat, { y: 0.59, z: -0.03, rx: -Math.PI / 2 + 0.3, parent: torso });
      }
      if (o.apron) {
        M(box(0.42, 0.62, 0.045), o.apron, { y: 0.21, z: 0.29, parent: torso, pbr: { roughness: 0.72 } });
        M(box(0.18, 0.12, 0.05), '#56925a', { y: 0.13, z: 0.312, parent: torso });
        [-1, 1].forEach(s => M(box(0.048, 0.32, 0.035), o.apron, { x: s * 0.14, y: 0.54, z: 0.25, rx: -0.2, parent: torso }));
      }
    }

    const makeArm = (sx) => {
      const sh = G(torso, sx * 0.33, 0.54, 0);
      if (isStudent) {
        M(cyl(0.092, 0.088, 0.21, 18), '#72bef5', {
          y: -0.09, ry: sx > 0 ? -Math.PI / 2 : Math.PI / 2,
          parent: sh, mat: getUniformSleeveMat()
        });
        M(sSph(0.090, 16, 12), '#72bef5', { y: 0.0, parent: sh, pbr: { roughness: 0.62 } });
      } else {
        M(new T.CapsuleGeometry(0.085, 0.20, 6, 14), o.coat || o.shirt, { y: -0.14, parent: sh, pbr: { roughness: 0.68 } });
      }
      const el = G(sh, 0, -0.22, 0);
      if (isStudent) {
        M(cyl(0.066, 0.056, 0.22, 16), SKIN, { y: -0.11, parent: el, mat: skinMat });
        M(sSph(0.066, 12, 10), SKIN, { y: 0, parent: el, mat: skinMat });
      } else {
        M(new T.CapsuleGeometry(0.076, 0.18, 6, 14), o.coat || o.shirt, { y: -0.12, parent: el, pbr: { roughness: 0.68 } });
      }
      const wrist = G(el, 0, -0.23, 0);
      M(sSph(0.064, 14, 12), SKIN, { y: -0.03, s: [0.82, 1.05, 0.65], parent: wrist, mat: skinMat });
      M(new T.CapsuleGeometry(0.020, 0.038, 4, 8), SKIN, { x: -sx * 0.048, y: -0.02, z: 0.028, rz: sx * 0.5, parent: wrist, mat: skinMat });
      sh.rotation.z = sx * 0.15;
      return { sh, el, wrist };
    };
    const R = makeArm(1), Lf = makeArm(-1);
    const hand = G(Lf.wrist, 0, -0.05, 0.04);
    if (o.map) {
      M(box(0.34, 0.26, 0.016), '#e9f1e2', { y: 0.06, rx: -0.4, rz: 0.25, parent: hand });
      M(box(0.12, 0.1, 0.018), '#72bef5', { x: 0.05, y: 0.08, rx: -0.4, rz: 0.25, parent: hand });
      Lf.el.rotation.x = 1.0;
    }
    if (o.booklet) {
      M(box(0.17, 0.23, 0.04), '#60a5fa', { y: 0.02, rx: -0.2, parent: hand });
      M(box(0.13, 0.05, 0.044), '#ffffff', { y: 0.06, rx: -0.2, parent: hand });
      Lf.el.rotation.x = 0.9;
    }

    M(cyl(0.092, 0.105, 0.14, 16), SKIN, { y: 0.70, parent: torso, mat: skinMat });
    const head = G(torso, 0, 1.06, 0);

    const hc = o.hair || HAIR;
    const faceMat = getAnimeFaceMat(o.g, hc, '#6b422b', !!o.glasses, isStudent, o.faceKey || null);
    const headMesh = M(sSph(0.415, 36, 28), '#ffffff', {
      ry: -Math.PI / 2, s: [1.05, 0.96, 0.95], parent: head, mat: faceMat
    });
    [-1, 1].forEach(sx => {
      M(sSph(0.082, 16, 12), SKIN, { x: sx * 0.425, y: -0.04, s: [0.52, 0.95, 0.75], parent: head, mat: skinMat });
    });

    const hairMat = new T.MeshPhysicalMaterial({ color: hc, roughness: 0.26, metalness: 0.04, clearcoat: 0.65, clearcoatRoughness: 0.15, envMapIntensity: 1.35 });
    M(new T.SphereGeometry(0.422, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.52), hc, {
      y: 0.03, z: -0.08, rx: -0.95, s: [1.04, 0.98, 1.02], parent: head, mat: hairMat
    });
    [-1, 1].forEach(sx => {
      M(new T.CapsuleGeometry(0.075, 0.20, 6, 12), hc, {
        x: sx * 0.36, y: -0.06, z: -0.16,
        rx: -0.15, rz: sx * 0.18, s: [0.85, 1, 0.95], parent: head, mat: hairMat
      });
    });

    if (o.g === 'm') {
      [-1, 1].forEach(sx => {
        M(new T.ConeGeometry(0.095, 0.24, 10), hc, {
          x: sx * 0.42, y: 0.15, z: -0.03,
          rz: sx * -1.18, rx: -0.1, s: [0.72, 1, 0.82], parent: head, mat: hairMat
        });
        M(new T.ConeGeometry(0.082, 0.20, 10), hc, {
          x: sx * 0.43, y: 0.03, z: -0.05,
          rz: sx * -1.32, rx: -0.15, s: [0.68, 1, 0.78], parent: head, mat: hairMat
        });
      });
      if (o.ahoge) {
        M(new T.ConeGeometry(0.062, 0.24, 10), hc, {
          x: 0.04, y: 0.47, z: 0.0, rz: -0.48, s: [0.65, 1.15, 0.5], parent: head, mat: hairMat
        });
      }
    }

    let hairSwing = null;
    if (o.g === 'f') {
      if (o.style === 'pony') {
        hairSwing = G(head, 0, 0.36, -0.14);
        const bowCol = '#7ac4f8';
        M(sSph(0.068, 12, 10), '#58acee', { y: 0.09, z: 0.05, parent: hairSwing });
        [-1, 1].forEach(sx => {
          M(new T.ConeGeometry(0.145, 0.29, 12), bowCol, {
            x: sx * 0.15, y: 0.11, z: 0.05,
            rz: sx * (Math.PI / 2 - 0.26), s: [1, 1, 0.48], parent: hairSwing
          });
          M(box(0.06, 0.24, 0.024), bowCol, {
            x: sx * 0.10, y: -0.02, z: 0.06, rz: sx * -0.35, parent: hairSwing
          });
        });
        M(sSph(0.20, 20, 16), hc, { x: 0.06, y: -0.07, z: -0.18, s: [0.96, 1.45, 0.96], rx: 0.35, rz: -0.15, parent: hairSwing, mat: hairMat });
        M(new T.ConeGeometry(0.17, 0.44, 12), hc, { x: 0.11, y: -0.29, z: -0.25, rx: Math.PI - 0.45, rz: -0.22, s: [0.92, 1, 0.78], parent: hairSwing, mat: hairMat });
      }
      if (o.style === 'long') {
        M(new T.CapsuleGeometry(0.29, 0.28, 8, 18), hc, { y: -0.25, z: -0.20, s: [1.1, 1, 0.55], parent: head, mat: hairMat });
      }
      if (o.style === 'bob') {
        M(sSph(0.44, 24, 18), hc, { y: -0.05, z: -0.15, s: [1.04, 0.78, 0.78], parent: head, mat: hairMat });
      }
    }

    if (o.beret) M(sSph(0.38, 22, 16), o.beret, { x: 0.06, y: 0.34, z: -0.02, s: [1.15, 0.38, 1.12], rz: -0.22, parent: head });
    if (o.ranger) {
      M(cyl(0.60, 0.60, 0.04, 28), '#c4ae82', { y: 0.20, parent: head });
      M(cyl(0.30, 0.36, 0.30, 22), '#c4ae82', { y: 0.36, parent: head });
      M(cyl(0.365, 0.365, 0.06, 22), '#8c7452', { y: 0.25, parent: head });
    }
    if (o.lavaHat) {
      M(cyl(0.54, 0.56, 0.045, 24), '#e0533c', { y: 0.22, parent: head });
      M(sSph(0.38, 20, 14), '#e0533c', { y: 0.28, s: [1.05, 0.65, 1.05], parent: head });
      [-0.14, 0.14].forEach(gx => M(cyl(0.08, 0.08, 0.06, 14), '#334155', { x: gx, y: 0.29, z: 0.34, rx: Math.PI / 2, parent: head }));
    }
    if (o.magnetEars) {
      [-1, 1].forEach(sx => {
        const col = sx < 0 ? '#ef4444' : '#3b82f6';
        M(new T.TorusGeometry(0.16, 0.048, 10, 18, Math.PI), col, { x: sx * 0.36, y: 0.36, rz: sx * -0.55, parent: head });
      });
    }
    if (o.rhythmNotes) {
      [-1, 1].forEach(sx => {
        M(sSph(0.15, 14, 12), '#f472b6', { x: sx * 0.42, y: 0.18, z: -0.05, s: [0.65, 1.5, 0.65], rz: sx * 0.35, parent: head });
      });
      M(new T.OctahedronGeometry(0.11, 0), '#fde047', { x: -0.28, y: 0.36, z: 0.24, parent: head });
    }
    if (o.angleGoggles) {
      M(sSph(0.41, 20, 14), '#facc15', { y: 0.18, s: [1.04, 0.58, 1.04], parent: head });
      [-0.14, 0.14].forEach(gx => M(cyl(0.085, 0.085, 0.065, 14), '#d97706', { x: gx, y: 0.26, z: 0.35, rx: Math.PI / 2, parent: head }));
      M(new T.ConeGeometry(0.18, 0.32, 3), '#eab308', { y: 0.05, z: 0.06, rx: -0.4, parent: hand });
    }
    if (o.ecoSprout) {
      M(cyl(0.018, 0.018, 0.18, 8), '#65a30d', { y: 0.46, parent: head });
      [-1, 1].forEach(sx => M(sSph(0.08, 10, 8), '#84cc16', { x: sx * 0.07, y: 0.54, s: [1.3, 0.4, 0.6], rz: sx * 0.4, parent: head }));
    }
    if (o.gearCollar) {
      M(new T.TorusGeometry(0.28, 0.055, 10, 24), '#eab308', { y: 0.60, rx: Math.PI / 2, parent: torso });
      const gem = M(new T.OctahedronGeometry(0.12, 0), '#38bdf8', { y: 0.12, z: 0.05, parent: hand, pbr: { emissive: '#38bdf8', emissiveIntensity: 0.45 } });
      W.updaters.push(t => { gem.rotation.y = t * 2.2; });
    }

    p.traverse(child => {
      if (child.isMesh && child !== aoShadow) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    p.userData = {
      legs, armR: R.sh, elR: R.el, armL: Lf.sh, elL: Lf.el,
      head, headMesh, faceMat, torso, body, hairSwing, aoShadow,
      blinkT: Math.random() * 3,
      walkPhase: Math.random() * 6,
      landSquash: 0,
      lastStepSign: 1
    };

    p.userData.anim = (t, dt, talking, speed = 0, jumpY = 0, vy = 0, turnRate = 0, isPlayer = false) => {
      const u = p.userData;
      u.blinkT -= dt;
      if (u.blinkT < 0) u.blinkT = 2.6 + Math.random() * 2.4;
      const isBlinking = u.blinkT < 0.11;
      const isTalking = talking && Math.sin(t * 14) > -0.1;
      const targetTex = isBlinking ? u.faceMat.userData.texBlink : (isTalking ? u.faceMat.userData.texTalk : u.faceMat.userData.texOpen);
      if (u.faceMat.map !== targetTex) {
        u.faceMat.map = targetTex;
        u.faceMat.needsUpdate = true;
      }

      if (u.aoShadow) {
        const sc = Math.max(0.35, 1.0 - jumpY * 0.42);
        u.aoShadow.scale.setScalar(sc);
        u.aoShadow.material.opacity = 0.72 * sc;
      }

      const walkWeight = T.MathUtils.clamp(speed / 6.0, 0, 1);
      const runWeight = T.MathUtils.clamp((speed - 9.0) / 6.0, 0, 1);
      const freq = 2.4 + speed * 1.15;
      if (speed > 0.2 && jumpY <= 0.01) {
        u.walkPhase += dt * freq;
      } else if (jumpY <= 0.01) {
        u.walkPhase += dt * 2.2;
      }
      const ph = u.walkPhase;
      const s = Math.sin(ph);
      const c = Math.cos(ph);

      u.landSquash = Math.max(0, u.landSquash - dt * 5.5);

      if (jumpY > 0.02) {
        body.position.y = jumpY;
        torso.rotation.x = T.MathUtils.lerp(torso.rotation.x, T.MathUtils.clamp(-vy * 0.04, -0.22, 0.25), dt * 10);
        torso.rotation.y = T.MathUtils.lerp(torso.rotation.y, 0, dt * 8);
        legs[0].hip.rotation.x = T.MathUtils.lerp(legs[0].hip.rotation.x, 0.55, dt * 12);
        legs[1].hip.rotation.x = T.MathUtils.lerp(legs[1].hip.rotation.x, 0.28, dt * 12);
        legs[0].knee.rotation.x = T.MathUtils.lerp(legs[0].knee.rotation.x, -0.95, dt * 12);
        legs[1].knee.rotation.x = T.MathUtils.lerp(legs[1].knee.rotation.x, -0.65, dt * 12);
        u.armL.rotation.x = T.MathUtils.lerp(u.armL.rotation.x, 0.65, dt * 10);
        u.armR.rotation.x = T.MathUtils.lerp(u.armR.rotation.x, 0.65, dt * 10);
        u.armL.rotation.z = T.MathUtils.lerp(u.armL.rotation.z, -0.48, dt * 10);
        u.armR.rotation.z = T.MathUtils.lerp(u.armR.rotation.z, 0.48, dt * 10);
        u.elL.rotation.x = T.MathUtils.lerp(u.elL.rotation.x, 0.55, dt * 10);
        u.elR.rotation.x = T.MathUtils.lerp(u.elR.rotation.x, 0.55, dt * 10);
      } else if (walkWeight > 0.05) {
        const strideAmp = (0.56 + runWeight * 0.48) * walkWeight;
        const kneeAmp = (0.65 + runWeight * 0.68) * walkWeight;
        const bobAmp = (0.042 + runWeight * 0.048) * walkWeight;
        body.position.y = Math.abs(c) * bobAmp - u.landSquash * 0.14;

        torso.rotation.x = T.MathUtils.lerp(torso.rotation.x, 0.08 * walkWeight + 0.18 * runWeight + u.landSquash * 0.2, dt * 10);
        torso.rotation.y = -s * (0.11 + runWeight * 0.08) * walkWeight;
        torso.rotation.z = c * 0.03 * walkWeight;

        legs.forEach((leg, idx) => {
          const dir = idx === 0 ? 1 : -1;
          const lSin = s * dir;
          const lCos = Math.cos(ph - 0.38 * dir) * dir;
          leg.hip.rotation.x = lSin * strideAmp - u.landSquash * 0.35;
          const kneeBend = Math.max(0, -lCos) * kneeAmp + 0.08 * walkWeight + u.landSquash * 0.65;
          leg.knee.rotation.x = -kneeBend;
          leg.ankle.rotation.x = lSin * 0.22 * walkWeight + kneeBend * 0.25;
        });

        const armAmp = (0.48 + runWeight * 0.54) * walkWeight;
        const elbowBase = 0.24 * walkWeight + 0.68 * runWeight;
        u.armL.rotation.x = -s * armAmp;
        u.armR.rotation.x = s * armAmp;
        u.armL.rotation.z = -0.15 - runWeight * 0.08;
        u.armR.rotation.z = 0.15 + runWeight * 0.08;
        u.elL.rotation.x = elbowBase + Math.max(0, -s) * 0.35 * walkWeight;
        u.elR.rotation.x = elbowBase + Math.max(0, s) * 0.35 * walkWeight;

        if (isPlayer) {
          const sign = s >= 0 ? 1 : -1;
          if (sign !== u.lastStepSign) {
            u.lastStepSign = sign;
            if (speed > 7.5) {
              spawnDust(p.position.x - Math.sin(p.rotation.y) * 0.25, 0.12, p.position.z - Math.cos(p.rotation.y) * 0.25, 2);
            }
            W.listeners.step.forEach(fn => fn(speed > 12));
          }
        }
      } else {
        const breath = Math.sin(t * 2.4);
        body.position.y = breath * 0.012 - u.landSquash * 0.14;
        torso.scale.set(1 + breath * 0.012, 1 - breath * 0.008, 1 + breath * 0.012);
        torso.rotation.x = T.MathUtils.lerp(torso.rotation.x, u.landSquash * 0.2, dt * 8);
        torso.rotation.y = T.MathUtils.lerp(torso.rotation.y, Math.sin(t * 0.9) * 0.03, dt * 6);
        torso.rotation.z = T.MathUtils.lerp(torso.rotation.z, Math.cos(t * 1.2) * 0.015, dt * 6);

        legs.forEach(leg => {
          leg.hip.rotation.x = T.MathUtils.lerp(leg.hip.rotation.x, -u.landSquash * 0.35, dt * 10);
          leg.knee.rotation.x = T.MathUtils.lerp(leg.knee.rotation.x, -u.landSquash * 0.65, dt * 10);
          leg.ankle.rotation.x = T.MathUtils.lerp(leg.ankle.rotation.x, 0, dt * 10);
        });
        u.armL.rotation.x = T.MathUtils.lerp(u.armL.rotation.x, Math.sin(t * 1.6) * 0.04, dt * 8);
        u.armR.rotation.x = T.MathUtils.lerp(u.armR.rotation.x, -Math.sin(t * 1.6) * 0.04, dt * 8);
        u.armL.rotation.z = T.MathUtils.lerp(u.armL.rotation.z, -0.15, dt * 8);
        u.armR.rotation.z = T.MathUtils.lerp(u.armR.rotation.z, 0.15, dt * 8);
        u.elL.rotation.x = T.MathUtils.lerp(u.elL.rotation.x, o.map || o.booklet ? 0.95 : 0.12, dt * 8);
        u.elR.rotation.x = T.MathUtils.lerp(u.elR.rotation.x, 0.12, dt * 8);
      }

      body.rotation.z = T.MathUtils.lerp(body.rotation.z, T.MathUtils.clamp(-turnRate * 0.08, -0.14, 0.14), dt * 8);
      if (u.hairSwing) {
        u.hairSwing.rotation.x = 0.12 + walkWeight * 0.28 + Math.sin(ph * 2) * (0.06 + walkWeight * 0.18) + Math.max(0, -vy * 0.05);
        u.hairSwing.rotation.z = Math.cos(ph) * (0.04 + walkWeight * 0.12) - turnRate * 0.12;
      }
    };
    return p;
  }

  /* ---------------------------------------------------------------------
   * 天空與 Nano Banana 2 淡水彩遠景無縫融合系統
   * --------------------------------------------------------------------- */
  const TIME_PRESETS = [
    {
      name: 'Octane 柔光晨曦',
      top: '#78b6d8', mid: '#b8d9ec', bot: '#ece6da',
      hemiSky: 0xfff8f0, hemiGnd: 0x8ab868, hemiInt: 1.25,
      sunCol: 0xfff7e8, sunInt: 1.85, sunPos: [-62, 132, 78],
      exposure: 1.08
    },
    {
      name: 'Studio 晴空暖陽',
      top: '#5ea4d4', mid: '#a8d2ec', bot: '#f4ece0',
      hemiSky: 0xffffff, hemiGnd: 0x95be72, hemiInt: 1.30,
      sunCol: 0xfffaee, sunInt: 1.92, sunPos: [-38, 155, 52],
      exposure: 1.10
    },
    {
      name: 'Aurelia 金色夕照',
      top: '#6882b2', mid: '#e8b298', bot: '#f6dec2',
      hemiSky: 0xffe8d6, hemiGnd: 0x8a7e68, hemiInt: 1.12,
      sunCol: 0xffbe78, sunInt: 1.80, sunPos: [-88, 82, 85],
      exposure: 1.05
    }
  ];

  // Octane Render Studio Softbox PMREM Environment Map (營造設計師公仔表面的柔和攝影棚反光板高光！)
  function buildEnvironmentMap() {
    try {
      const pmrem = new T.PMREMGenerator(W.renderer);
      pmrem.compileEquirectangularShader();
      const envScene = new T.Scene();
      const g = new T.SphereGeometry(50, 32, 16);
      const m = new T.ShaderMaterial({
        side: T.BackSide,
        uniforms: {
          top: { value: new T.Color('#8ec5e8') },
          mid: { value: new T.Color('#f4efe6') },
          bot: { value: new T.Color('#8cb46e') }
        },
        vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP;
          void main(){
            float h = vP.y;
            vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.75, h)) : mix(bot, mid, smoothstep(-0.6, 0.0, h));
            // 加入三盞 Octane Studio Softbox 高光反光板燈箱
            float sb1 = smoothstep(0.82, 0.96, dot(vP, normalize(vec3(-0.45, 0.75, 0.50))));
            float sb2 = smoothstep(0.84, 0.97, dot(vP, normalize(vec3(0.65, 0.55, -0.45))));
            float sb3 = smoothstep(0.88, 0.98, dot(vP, normalize(vec3(0.0, 0.95, 0.15))));
            c += vec3(1.0, 0.98, 0.94) * (sb1 * 1.65 + sb2 * 1.15 + sb3 * 1.35);
            gl_FragColor = vec4(c, 1.0);
          }`
      });
      envScene.add(new T.Mesh(g, m));
      W.scene.environment = pmrem.fromScene(envScene, 0.03).texture;
      pmrem.dispose();
    } catch (e) { }
  }

  function cycleTimeOfDay() {
    W.timeIdx = (W.timeIdx + 1) % TIME_PRESETS.length;
    const P = TIME_PRESETS[W.timeIdx];
    if (W.skyMat) {
      W.skyMat.uniforms.top.value.set(P.top);
      W.skyMat.uniforms.mid.value.set(P.mid);
      W.skyMat.uniforms.bot.value.set(P.bot);
    }
    if (W.hemi) {
      W.hemi.color.setHex(P.hemiSky);
      W.hemi.groundColor.setHex(P.hemiGnd);
      W.hemi.intensity = P.hemiInt;
    }
    if (W.sun) {
      W.sun.color.setHex(P.sunCol);
      W.sun.intensity = P.sunInt;
      W.sunOffset.set(...P.sunPos);
      W.sun.position.copy(W.sun.target.position).add(W.sunOffset);
    }
    if (W.renderer) W.renderer.toneMappingExposure = P.exposure;
    return P.name;
  }

  function buildSky() {
    // 截圖 Aurelia Garden 同款：溫潤奶油天藍晴空 (#78b6d8 -> #ece6da) 搭配柔和陽光光暈與遠方柔霧綠丘！
    const skyGeo = new T.SphereGeometry(520, 32, 20);
    const skyMat = W.skyMat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: {
        top: { value: new T.Color('#78b6d8') },
        mid: { value: new T.Color('#b8d9ec') },
        bot: { value: new T.Color('#ece6da') }
      },
      vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);} `,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP;
        void main(){
          float h = vP.y;
          vec3 c = h > 0.08 ? mix(mid, top, smoothstep(0.08, 0.65, h)) : mix(bot, mid, smoothstep(-0.06, 0.08, h));
          // 柔和太陽暖光暈與漫射雲層 (Aurelia Garden Soft Sun Glow & Clouds)
          float sunGlow = pow(max(0.0, dot(vP, normalize(vec3(-0.45, 0.35, 0.55)))), 12.0);
          float cloudWave = smoothstep(0.15, 0.65, sin(vP.x * 4.5 + 1.2) * cos(vP.z * 3.8 - 0.6) * (1.0 - abs(h - 0.26) * 3.2));
          c = mix(c, vec3(0.98, 0.97, 0.94), cloudWave * 0.42);
          c += vec3(1.0, 0.97, 0.88) * sunGlow * 0.38;
          gl_FragColor = vec4(c, 1.0);
#include <colorspace_fragment>
}`
    });
    W.scene.add(new T.Mesh(skyGeo, skyMat));

    // 截圖 Aurelia Garden 遠景同款：低飽和鼠尾草綠柔順起伏山丘 (Soft Sage-Green Rolling Hills)
    const hillCols = ['#a6b892', '#98ac84', '#b4c4a0'];
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      const dist = 205 + (i % 3) * 14;
      const r = 52 + (i % 4) * 12;
      const h = 19 + (i % 3) * 6;
      M(new T.SphereGeometry(r, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hillCols[i % 3], {
        x: Math.cos(ang) * dist, y: -4, z: Math.sin(ang) * dist,
        s: [1.55, h / r, 0.85], ry: -ang + Math.PI / 2,
        cast: false, pbr: { natural: true, roughness: 0.85 }
      });
    }
  }

  function buildAtmosphereParticles() {
    const dustGeo = sSph(0.16, 10, 8);
    for (let i = 0; i < 28; i++) {
      const mat = new T.MeshBasicMaterial({ color: '#f3ede2', transparent: true, opacity: 0, depthWrite: false });
      const m = new T.Mesh(dustGeo, mat);
      m.visible = false;
      m.userData = { life: 0, maxLife: 0.45, vx: 0, vy: 0, vz: 0 };
      W.scene.add(m);
      W.dustPool.push(m);
    }
    W.updaters.push((t, dt) => {
      W.dustPool.forEach(m => {
        if (!m.visible) return;
        const u = m.userData;
        u.life -= dt;
        if (u.life <= 0) { m.visible = false; return; }
        const p = 1 - u.life / u.maxLife;
        m.position.x += u.vx * dt;
        m.position.y += u.vy * dt;
        m.position.z += u.vz * dt;
        m.scale.setScalar(0.6 + p * 1.6);
        m.material.opacity = (1 - p) * 0.42;
      });
    });
  }

  function spawnDust(x, y, z, n = 4) {
    if (W.reduced || !W.dustPool.length) return;
    for (let i = 0; i < n; i++) {
      const m = W.dustPool[W.dustIdx = (W.dustIdx + 1) % W.dustPool.length];
      m.visible = true;
      m.position.set(x + (Math.random() - 0.5) * 0.35, y, z + (Math.random() - 0.5) * 0.35);
      m.scale.setScalar(0.5);
      m.userData.maxLife = 0.38 + Math.random() * 0.18;
      m.userData.life = m.userData.maxLife;
      m.userData.vx = (Math.random() - 0.5) * 1.1;
      m.userData.vy = 0.65 + Math.random() * 0.8;
      m.userData.vz = (Math.random() - 0.5) * 1.1;
    }
  }

  /* =====================================================================
   * 初始化渲染器與場景（淡水彩柔和光影、4096 動態跟隨角色真實陰影）
   * ===================================================================== */
  function init(container, opts = {}) {
    const hi = !isMobile;
    const r = W.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, hi ? 2 : 1.5));
    r.setSize(container.clientWidth, container.clientHeight);
    r.outputColorSpace = T.SRGBColorSpace;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.86;
    r.shadowMap.enabled = true;
    r.shadowMap.type = T.PCFSoftShadowMap;
    container.appendChild(r.domElement);

    const s = W.scene = new T.Scene();
    s.fog = null;
    W.camera = new T.PerspectiveCamera(isMobile ? 62 : 52, container.clientWidth / container.clientHeight, 0.3, 2400);

    buildEnvironmentMap();

    s.add(W.hemi = new T.HemisphereLight(0xd8ecff, 0x7ca658, 0.68));
    const sun = W.sun = new T.DirectionalLight(0xfff4df, 1.28);
    sun.position.copy(W.sunOffset);
    sun.castShadow = true;
    const sz = hi ? 4096 : 2048;
    sun.shadow.mapSize.set(sz, sz);
    Object.assign(sun.shadow.camera, { left: -62, right: 62, top: 62, bottom: -62, near: 10, far: 350 });
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.02;
    s.add(sun);
    s.add(sun.target);

    const fillLight = new T.DirectionalLight(0xc2e2ff, 0.38);
    fillLight.position.set(85, 75, -80);
    s.add(fillLight);
    const rimLight = new T.DirectionalLight(0xffdfba, 0.42);
    rimLight.position.set(45, 55, 95);
    s.add(rimLight);

    const prog = opts.onProgress || (() => { });
    const steps = [
      () => buildSky(opts.skyImage),
      buildGround,
      buildSurroundings,
      buildDynamicTraffic,
      buildCampusGround,
      buildTrack,
      buildCourt,
      buildBuildings,
      buildDome,
      buildSculptures,
      buildTowers,
      buildFenceGate,
      buildTrees,
      buildGarden,
      build3DGrass,
      buildWildlife,
      buildStations,
      buildKids,
      buildAtmosphereParticles
    ];
    const yieldNow = () => new Promise(res => setTimeout(res, 0));
    W.ready = (async () => {
      for (let i = 0; i < steps.length; i++) {
        steps[i]();
        prog(0.1 + 0.8 * (i + 1) / steps.length);
        await yieldNow();
      }
      try { if (r.compileAsync) await Promise.race([r.compileAsync(W.scene, W.camera), new Promise(res => setTimeout(res, 250))]); } catch (e) { }
      prog(0.96);
      bindInput(r.domElement);
      addEventListener('resize', () => resize(container));
      if ('ResizeObserver' in window) new ResizeObserver(() => resize(container)).observe(container);
      resize(container);
      animate();
      return W;
    })();
    return W;
  }

  function resize(c) {
    const w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    W.renderer.setSize(w, h);
    W.camera.aspect = w / h;
    W.baseFov = (w < h) ? 68 : (isMobile ? 60 : 52);
    W.camera.fov = W.baseFov;
    W.camera.updateProjectionMatrix();
  }

  /* ---------- Nano Banana 2 淡水彩風格貼圖產生器（自然淡綠草皮、柔和暖褐磚縫，絕不用黑色） ---------- */
  function noiseTex(base, dots, size = 512, rep = 1) {
    return canvasTex(size, size, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 3600; i++) {
        x.fillStyle = dots[i % dots.length];
        x.globalAlpha = 0.08 + (i % 6) * 0.02;
        x.fillRect((i * 97) % w, (i * 151) % h, 3 + (i % 5), 3 + ((i * 3) % 5));
      }
      x.globalAlpha = 1;
    }, { repeat: [rep, rep] });
  }

  // 截圖 Aurelia Garden 同款：擬真自然野草地與土壤草皮貼圖 (Photorealistic Meadow Grass & Earth)
  function grassTex(rep = [10, 10]) {
    const rArr = Array.isArray(rep) ? rep : [rep, rep];
    return canvasTex(512, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#6e8c42');
      g.addColorStop(0.5, '#789648');
      g.addColorStop(1, '#64823a');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      // 柔和泥土微光影
      for (let i = 0; i < 400; i++) {
        x.fillStyle = (i & 1) ? 'rgba(156, 138, 104, 0.12)' : 'rgba(72, 98, 42, 0.14)';
        x.beginPath();
        x.arc((i * 97) % w, (i * 151) % h, 8 + (i % 12), 0, Math.PI * 2);
        x.fill();
      }
      // 數千根細膩擬真草絲筆觸
      const bladeCols = ['#5a7a32', '#688a3c', '#7fa04e', '#8cae58', '#4e6c28', '#98b866'];
      x.lineCap = 'round';
      for (let i = 0; i < 3600; i++) {
        const bx = (i * 137.5) % w, by = (i * 293.7) % h;
        const bh = 7 + (i % 11), bend = ((i % 9) - 4) * 1.3;
        x.strokeStyle = bladeCols[i % bladeCols.length];
        x.lineWidth = 1.3 + (i % 3) * 0.4;
        x.beginPath();
        x.moveTo(bx, by);
        x.quadraticCurveTo(bx + bend * 0.5, by - bh * 0.5, bx + bend, by - bh);
        x.stroke();
      }
    }, { repeat: rArr });
  }

  // 溫潤攝影棚玩具感步道石磚貼圖
  function paveTex(base = '#ede3d2', line = '#d5c6b0', rep = [12, 12]) {
    return canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = base;
      x.fillRect(0, 0, w, h);
      const rows = 4, cols = 4, tw = w / cols, th = h / rows;
      for (let r = 0; r < rows; r++) {
        const off = (r % 2) * (tw / 2);
        for (let c = -1; c <= cols; c++) {
          const tx = c * tw + off, ty = r * th;
          x.fillStyle = ((r + c) & 1) ? 'rgba(255,253,248,0.22)' : 'rgba(195,175,150,0.12)';
          x.beginPath(); x.roundRect(tx + 3, ty + 3, tw - 6, th - 6, 8); x.fill();
        }
      }
      x.strokeStyle = line;
      x.lineWidth = 2.5;
      for (let r = 0; r <= rows; r++) {
        x.beginPath(); x.moveTo(0, r * th); x.lineTo(w, r * th); x.stroke();
      }
    }, { repeat: [rep[0], rep[1]] });
  }

  // 擬真茂密多層次四方連續無接縫樹葉簇貼圖 (Seamless Tileable Multi-Layered Botanical Leaf Cluster Texture)
  let _leafClusterTex = null;
  function getLeafClusterTex() {
    if (_leafClusterTex) return _leafClusterTex;
    _leafClusterTex = canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#78b048';
      x.fillRect(0, 0, w, h);
      const shadowCols = ['#528830', '#5c9438', '#669e40'];
      const midCols = ['#76ae48', '#84bc54', '#90c85e', '#7eb64c'];
      const sunCols = ['#a8dc6c', '#bce67c', '#ceef8c', '#def69e'];
      const TWO_PI = Math.PI * 2;
      for (let i = 0; i < 3600; i++) {
        const lx = (i * 97) % w, ly = (i * 163) % h;
        const ang = (i * 0.7) % Math.PI;
        const rx = 6 + (i % 9), ry = 3.5 + (i % 4.5);
        // 使用週期性正弦波團簇確保四方連續無接縫 (Seamless Tileable Clusters)
        const cluster = Math.sin((lx / w) * TWO_PI * 2) * Math.cos((ly / h) * TWO_PI * 2) * 0.5 + 0.5;
        let col;
        if (cluster < 0.30) {
          col = shadowCols[i % shadowCols.length];
        } else if (cluster < 0.68) {
          col = midCols[i % midCols.length];
        } else {
          col = sunCols[i % sunCols.length];
        }
        x.fillStyle = col;
        // 跨邊界繪製確保 100% 無接縫
        [[0, 0], [lx < 16 ? w : (lx > w - 16 ? -w : 0), ly < 16 ? h : (ly > h - 16 ? -h : 0)]].forEach(([ox, oy], pass) => {
          if (pass === 1 && ox === 0 && oy === 0) return;
          x.beginPath();
          x.ellipse(lx + ox, ly + oy, rx, ry, ang, 0, TWO_PI);
          x.fill();
          if (i % 4 === 0) {
            x.strokeStyle = 'rgba(255, 254, 220, 0.28)';
            x.lineWidth = 0.85;
            x.stroke();
          }
        });
      }
    }, { repeat: [2, 2] });
    return _leafClusterTex;
  }

  // 擬真立體光影樹幹木紋貼圖 (Photorealistic Shaded Tree Bark & Bump Texture)
  let _barkTex = null, _barkBumpTex = null;
  function getBarkTex() {
    if (_barkTex) return _barkTex;
    _barkTex = canvasTex(256, 512, (x, w, h) => {
      // 水平圓柱立體受光漸層（左亮、中暖棕、右深陰影、邊緣微反光）與垂直樹冠底部環境遮蔽 (AO)
      const hg = x.createLinearGradient(0, 0, w, 0);
      hg.addColorStop(0.0, '#5a3e28');
      hg.addColorStop(0.28, '#966b46');
      hg.addColorStop(0.52, '#7e5636');
      hg.addColorStop(0.82, '#422c1b');
      hg.addColorStop(1.0, '#5a3e28');
      x.fillStyle = hg;
      x.fillRect(0, 0, w, h);

      // 頂部樹冠下方陰影與根部泥土陰影
      const vg = x.createLinearGradient(0, 0, 0, h);
      vg.addColorStop(0.0, 'rgba(22, 14, 8, 0.55)');
      vg.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
      vg.addColorStop(0.82, 'rgba(0, 0, 0, 0)');
      vg.addColorStop(1.0, 'rgba(28, 20, 12, 0.48)');
      x.fillStyle = vg;
      x.fillRect(0, 0, w, h);

      // 擬真縱向交錯樹皮溝壑、亮部陽光脊線與青苔斑塊
      for (let i = 0; i < 650; i++) {
        const bx = (i * 53) % w, by = (i * 89) % h;
        const len = 28 + (i % 55);
        x.strokeStyle = (i % 3 === 0) ? 'rgba(32, 18, 10, 0.55)' : ((i % 3 === 1) ? 'rgba(185, 138, 92, 0.35)' : 'rgba(65, 42, 26, 0.42)');
        x.lineWidth = 1.5 + (i % 3) * 0.8;
        x.beginPath();
        x.moveTo(bx, by);
        x.bezierCurveTo(bx + ((i % 5) - 2) * 3, by + len * 0.35, bx - ((i % 5) - 2) * 3, by + len * 0.7, bx, by + len);
        x.stroke();
      }
      // 樹皮向陽側淡淡翠綠青苔細節
      for (let m = 0; m < 45; m++) {
        const mx = (m * 71) % w, my = (m * 113) % h;
        x.fillStyle = 'rgba(92, 128, 56, 0.16)';
        x.beginPath();
        x.ellipse(mx, my, 6 + (m % 8), 12 + (m % 14), 0, 0, Math.PI * 2);
        x.fill();
      }
    }, { repeat: [1, 1] });
    return _barkTex;
  }

  function getBarkBumpTex() {
    if (_barkBumpTex) return _barkBumpTex;
    _barkBumpTex = canvasTex(256, 512, (x, w, h) => {
      x.fillStyle = '#808080';
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 800; i++) {
        const bx = (i * 47) % w, by = (i * 83) % h, len = 24 + (i % 48);
        x.strokeStyle = (i & 1) ? '#ffffff' : '#181818';
        x.lineWidth = 1.8 + (i % 3);
        x.beginPath();
        x.moveTo(bx, by);
        x.lineTo(bx + ((i % 3) - 1) * 3, by + len);
        x.stroke();
      }
    }, { repeat: [1, 1] });
    return _barkBumpTex;
  }

  // 截圖 Aurelia Garden 最核心靈魂：5 款高解析「擬真大波斯菊與野花花冠貼圖（Photorealistic Cosmos & Daisy Corolla Textures）」
  // 具備真實花瓣脈絡、漸層花心暈染、鋸齒花瓣尖端與立體金黃花蕊！
  const _cosmosFlowerMats = [];
  function getCosmosFlowerMats() {
    if (_cosmosFlowerMats.length) return _cosmosFlowerMats;
    const palettes = [
      // 1. 截圖左側主打：薰衣草粉紫大波斯菊 (Lavender Pink Cosmos)
      { outer: '#e2a8d4', mid: '#d288c4', inner: '#9e3882', core: '#f59e0b', petals: 8, notched: true },
      // 2. 截圖左側深色點綴：皇家洋紅紫大波斯菊 (Deep Magenta Violet Cosmos)
      { outer: '#b83294', mid: '#9c1c78', inner: '#68084c', core: '#facc15', petals: 8, notched: true },
      // 3. 截圖右側主打：陽光奶油檸檬黃菊花 (Creamy Lemon Yellow Marguerite Daisy)
      { outer: '#fae278', mid: '#f5cb42', inner: '#d99416', core: '#b45309', petals: 13, notched: false },
      // 4. 截圖中景亮點：暖珊瑚粉橘波斯菊 (Warm Coral Orange Cosmos)
      { outer: '#fb9268', mid: '#f46d42', inner: '#b83214', core: '#fde047', petals: 8, notched: true },
      // 5. 截圖前景柔美：櫻花粉白波斯菊 (Soft Blush Pink Cosmos)
      { outer: '#f8cadc', mid: '#f0a6c4', inner: '#b84a78', core: '#f59e0b', petals: 8, notched: true }
    ];

    palettes.forEach(pal => {
      const tex = canvasTex(256, 256, (x, w, h) => {
        const cx = w / 2, cy = h / 2;
        x.clearRect(0, 0, w, h);
        const n = pal.petals;
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + (i % 2) * 0.04;
          x.save();
          x.translate(cx, cy);
          x.rotate(ang);
          // 花瓣放射漸層
          const grd = x.createLinearGradient(0, -14, 0, -116);
          grd.addColorStop(0, pal.inner);
          grd.addColorStop(0.32, pal.mid);
          grd.addColorStop(1, pal.outer);
          x.fillStyle = grd;
          x.beginPath();
          const pw = pal.notched ? 35 : 22;
          x.moveTo(0, -10);
          x.bezierCurveTo(-pw, -38, -pw * 1.08, -98, -pw * 0.45, -116);
          if (pal.notched) {
            x.lineTo(-pw * 0.15, -110);
            x.lineTo(0, -118);
            x.lineTo(pw * 0.15, -110);
          } else {
            x.quadraticCurveTo(0, -122, pw * 0.45, -116);
          }
          x.bezierCurveTo(pw * 1.08, -98, pw, -38, 0, -10);
          x.closePath();
          x.fill();

          // 擬真花瓣縱向細膩摺痕脈絡 (Delicate Petal Veins)
          x.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          x.lineWidth = 1.2;
          [-0.35, 0, 0.35].forEach(k => {
            x.beginPath();
            x.moveTo(0, -18);
            x.quadraticCurveTo(pw * k, -65, pw * k * 0.85, -106);
            x.stroke();
          });
          x.restore();
        }
        // 花心深色漸層光暈
        const cGrd = x.createRadialGradient(cx, cy, 4, cx, cy, 30);
        cGrd.addColorStop(0, pal.core);
        cGrd.addColorStop(0.68, '#d97706');
        cGrd.addColorStop(1, 'rgba(140, 45, 70, 0)');
        x.fillStyle = cGrd;
        x.beginPath(); x.arc(cx, cy, 30, 0, Math.PI * 2); x.fill();
        // 花蕊花粉顆粒細節
        for (let d = 0; d < 45; d++) {
          const da = d * 2.4, dr = 3 + (d % 7) * 2.6;
          x.fillStyle = (d & 1) ? '#fef08a' : '#b45309';
          x.beginPath();
          x.arc(cx + Math.cos(da) * dr, cy + Math.sin(da) * dr, 1.8, 0, Math.PI * 2);
          x.fill();
        }
      });
      _cosmosFlowerMats.push(new T.MeshStandardMaterial({
        map: tex,
        alphaTest: 0.32,
        transparent: true,
        side: T.DoubleSide,
        roughness: 0.48,
        metalness: 0.02
      }));
    });
    return _cosmosFlowerMats;
  }

  function flat(w, d, mat, x, z, y = 0.02) {
    const m = new T.Mesh(new T.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    W.scene.add(m);
    return m;
  }

  /* =====================================================================
   * 遠方草皮「淡水彩放射狀柔邊淡出 Shader」（徹底消除遠方低階重複貼圖感，與水彩遠景無縫融合）
   * ===================================================================== */
  function buildGround() {
    // 截圖同款：飽滿翠綠的歐式莊園連續草坪大地 (#58a628)，緊湊延伸至遠方翠綠山丘！
    const g = new T.Mesh(new T.CircleGeometry(245, 64), pbr('#ffffff', { map: grassTex([36, 36]), roughness: 0.68 }));
    g.rotation.x = -Math.PI / 2;
    g.position.y = -0.04;
    g.receiveShadow = true;
    W.scene.add(g);
  }

  function roadTex(lanes, vertical) {
    return canvasTex(256, 256, (x, w, h) => {
      // 歐式石板大道色調 (#8a8278)
      x.fillStyle = '#8a8278'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#f5efe6';
      for (let i = 1; i < lanes; i++) {
        const p = i * (vertical ? w : h) / lanes;
        for (let k = 0; k < 4; k++) vertical ? x.fillRect(p - 2, k * 64 + 10, 4, 30) : x.fillRect(k * 64 + 10, p - 2, 30, 4);
      }
    });
  }

  /* =====================================================================
   * 緊湊周邊道路、東側「國立國父紀念館」與北側「臺北大巨蛋」（歐式暖沙石與古典琉璃風格）
   * ===================================================================== */
  function buildSurroundings() {
    const C = LAYOUT.campus;
    const zt = roadTex(4, false); zt.wrapS = T.RepeatWrapping; zt.repeat.set(6, 1);
    flat(162, 14, pbr('#ffffff', { map: zt, roughness: 0.70 }), -6, C.z0 - 13, 0.04);

    const gt = roadTex(4, true); gt.wrapT = T.RepeatWrapping; gt.repeat.set(1, 6);
    flat(14, 196, pbr('#ffffff', { map: gt, roughness: 0.70 }), C.x0 - 13, 0, 0.045);
    for (let i = 0; i < 7; i++) flat(12, 1.1, pbr('#f5efe6', { roughness: 0.5 }), C.x0 - 13, 8 + i * 2.2, 0.06);
    flat(124, 14, pbr('#e6d7c0', { roughness: 0.70 }), 0, C.z1 + 10, 0.04);

    // ==================== 學校東側：王大閎建築師設計之「國立國父紀念館」（歐式暖米白沙石＋金橘瓦頂） ====================
    const hall = G(null, 128, 0, 10);
    addContactShadow(hall, 48, 0.03, 0.55);
    M(box(84, 1.4, 84), '#e8d8c2', { y: 0.7, parent: hall });
    M(box(76, 1.4, 76), '#f5ead8', { y: 2.1, parent: hall });
    for (let st = 0; st < 5; st++) {
      M(box(2.2, 0.45, 30 - st * 1.2), '#efe0ca', { x: -40 - st * 1.1, y: 0.22 + st * 0.42, parent: hall });
    }
    M(box(58, 15.5, 58), '#f5ead8', { y: 10.5, parent: hall });
    const colPts = [];
    for (let i = 0; i < 7; i++) {
      const offset = -30 + i * 10.0;
      [-34, 34].forEach(side => {
        colPts.push([128 + offset, 10.5, 10 + side]);
        colPts.push([128 + side, 10.5, 10 + offset]);
      });
    }
    instBoxes(colPts, box(2.1, 16.0, 2.1), '#faf3e8');

    const goldRoofMat = pbr('#e59838', { roughness: 0.38, metalness: 0.08 });
    M(box(80, 1.4, 80), '#d98a30', { y: 18.8, parent: hall, mat: goldRoofMat });
    M(new T.CylinderGeometry(28, 56, 9.5, 4), '#e59838', {
      y: 24.0, ry: Math.PI / 4, parent: hall, mat: goldRoofMat
    });
    M(box(10, 2.2, 38), '#f0a646', { y: 29.0, parent: hall, mat: goldRoofMat });
    [-1, 1].forEach(sideX => {
      const canopyG = G(hall, sideX * 35.5, 20.2, 0);
      M(box(12, 1.2, 24), '#e59838', { y: 3.2, rz: sideX * -0.28, parent: canopyG, mat: goldRoofMat });
      M(new T.ConeGeometry(14, 5.5, 3), '#d98a30', { x: sideX * 2.2, y: 4.4, ry: sideX > 0 ? 0 : Math.PI, s: [0.65, 1, 1.4], parent: canopyG, mat: goldRoofMat });
      M(box(1.2, 3.0, 11.0), '#faf3e8', { x: -sideX * 2.0, y: 0.4, parent: canopyG });
    });
    addLabel('國立國父紀念館\n王大閎建築師設計', 128, 38, 10);

    // ==================== 學校北側：「臺北大巨蛋」（古典玻璃金屬肋條巨蛋風格，與溫室穹頂呼應！） ====================
    const domeTpe = G(null, -24, 0, C.z0 - 78);
    M(cyl(40, 44, 12, 36), '#f0e2ce', { y: 6.0, s: [1.3, 1, 0.9], parent: domeTpe, pbr: { roughness: 0.45 } });
    M(cyl(41, 41, 1.8, 36), '#dfbfa2', { y: 11.2, s: [1.31, 1, 0.91], parent: domeTpe });
    M(new T.SphereGeometry(40, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), '#5b96c6', {
      y: 12, s: [1.3, 0.38, 0.9], parent: domeTpe, pbr: { roughness: 0.25, metalness: 0.35 }
    });
    addLabel('臺北大巨蛋', -24, 34, C.z0 - 78);
  }

  /* =====================================================================
   * 校園周邊道路高細節動態交通工具（含後照鏡、車牌、水箱罩、輪圈、公車路線牌、機車儀表、YouBike 車籃與踏板動畫）
   * ===================================================================== */
  function buildDynamicTraffic() {
    const C = LAYOUT.campus;
    const vehicles = [];

    // 1. 高細節 3D 轎車 / 小黃計程車 / 臺北市低底盤公車
    function makeCar(col, isBus = false, isTaxi = false) {
      const g = G(null);
      addContactShadow(g, isBus ? 2.8 : 1.8, 0.02, 0.65);
      const wheelMeshes = [];

      if (isBus) {
        // 臺北市低底盤公車（含車頂冷氣機、270 路線 LED 顯示牌、雙車門、分割車窗、後照鏡、保險桿、車牌）
        M(box(2.52, 2.55, 9.4), '#f8fafc', { y: 1.52, parent: g, edge: 28, pbr: { roughness: 0.35 } });
        M(box(2.56, 0.68, 9.44), '#74c69d', { y: 0.72, parent: g });
        M(box(2.55, 0.18, 9.42), '#52b788', { y: 2.68, parent: g });
        // 車頂空調機組
        M(box(1.65, 0.28, 3.2), '#e2e8f0', { y: 2.92, z: -0.6, parent: g, edge: 28 });
        // 兩側大面積觀景車窗與窗柱
        M(box(2.55, 0.96, 8.4), '#90caf9', { y: 1.92, parent: g, pbr: { metalness: 0.45, roughness: 0.2 } });
        for (let wz = -3.6; wz <= 3.6; wz += 1.44) {
          M(box(2.58, 0.98, 0.08), '#f1f5f9', { y: 1.92, z: wz, parent: g });
        }
        // 右側前後雙折疊上下車門
        [1.8, -2.2].forEach(dz => {
          M(box(0.06, 1.95, 1.15), '#cbd5e1', { x: 1.26, y: 1.32, z: dz, parent: g, edge: 25 });
          M(box(0.08, 1.15, 0.46), '#bae6fd', { x: 1.27, y: 1.55, z: dz - 0.25, parent: g });
          M(box(0.08, 1.15, 0.46), '#bae6fd', { x: 1.27, y: 1.55, z: dz + 0.25, parent: g });
        });
        // 車頭擋風玻璃與「270 光復國小」LED 路線牌
        M(box(2.36, 1.12, 0.10), '#7cc4f8', { y: 1.88, z: 4.68, parent: g, pbr: { metalness: 0.5, roughness: 0.15 } });
        const busSignTex = canvasTex(256, 64, (x, w, h) => {
          x.fillStyle = '#2b3445'; x.fillRect(0, 0, w, h);
          x.fillStyle = '#fbbf24'; x.font = `900 34px ${FONT_TC}`; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillText('270 光復國小', w / 2, h / 2 + 2);
        }, { text: true });
        M(box(1.85, 0.34, 0.12), '#ffffff', { y: 2.54, z: 4.69, parent: g, mat: new T.MeshBasicMaterial({ map: busSignTex }) });
        // 大外掛後照鏡
        [-1.38, 1.38].forEach(mx => {
          M(box(0.18, 0.38, 0.12), '#64748b', { x: mx, y: 1.85, z: 4.55, parent: g });
        });
        // 前後保險桿與車牌
        M(box(2.58, 0.26, 0.22), '#94a3b8', { y: 0.42, z: 4.68, parent: g });
        M(box(2.58, 0.26, 0.22), '#94a3b8', { y: 0.42, z: -4.68, parent: g });
        M(box(0.52, 0.20, 0.06), '#4ade80', { y: 0.44, z: 4.78, parent: g });
      } else {
        const bodyCol = isTaxi ? '#fcd34d' : col;
        // 流線型下層車體、引擎蓋與後車廂
        M(box(1.86, 0.62, 4.25), bodyCol, { y: 0.56, parent: g, edge: 28, pbr: { metalness: 0.25, roughness: 0.32 } });
        // 斜角上層車艙與車頂
        M(box(1.62, 0.56, 2.25), bodyCol, { y: 1.12, z: -0.18, parent: g, edge: 28, pbr: { metalness: 0.25, roughness: 0.32 } });
        // 前後斜擋風玻璃與側窗、B 柱
        M(box(1.52, 0.54, 0.10), '#bae6fd', { y: 1.08, z: 0.92, rx: -0.45, parent: g, pbr: { metalness: 0.6, roughness: 0.15 } });
        M(box(1.50, 0.50, 0.10), '#bae6fd', { y: 1.08, z: -1.28, rx: 0.45, parent: g, pbr: { metalness: 0.6, roughness: 0.15 } });
        M(box(1.66, 0.44, 1.85), '#bae6fd', { y: 1.12, z: -0.18, parent: g, pbr: { metalness: 0.6, roughness: 0.15 } });
        M(box(1.68, 0.46, 0.10), '#64748b', { y: 1.12, z: -0.15, parent: g }); // B 柱
        // 左右後照鏡与車門手把
        [-1.02, 1.02].forEach(mx => {
          M(box(0.20, 0.12, 0.14), bodyCol, { x: mx, y: 0.92, z: 0.65, parent: g });
          M(box(0.06, 0.05, 0.18), '#e2e8f0', { x: mx * 0.92, y: 0.78, z: 0.15, parent: g });
          M(box(0.06, 0.05, 0.18), '#e2e8f0', { x: mx * 0.92, y: 0.78, z: -0.65, parent: g });
        });
        // 車頭水箱護罩、前後保險桿與白色車牌
        M(box(1.10, 0.22, 0.08), '#64748b', { y: 0.52, z: 2.11, parent: g });
        M(box(1.92, 0.18, 0.18), '#cbd5e1', { y: 0.34, z: 2.08, parent: g });
        M(box(1.92, 0.18, 0.18), '#cbd5e1', { y: 0.34, z: -2.08, parent: g });
        M(box(0.42, 0.16, 0.06), '#ffffff', { y: 0.36, z: 2.16, parent: g });
        M(box(0.42, 0.16, 0.06), '#ffffff', { y: 0.36, z: -2.16, parent: g });
        if (isTaxi) {
          M(box(0.52, 0.20, 0.24), '#ffffff', { y: 1.48, z: 0.05, parent: g, edge: 25 });
          M(box(0.16, 0.08, 0.26), '#ef4444', { y: 1.48, z: 0.05, parent: g });
        }
      }

      const zLen = isBus ? 4.7 : 2.12;
      [-0.68, 0.68].forEach(wx => {
        M(box(0.32, 0.16, 0.08), '#fef08a', { x: wx, y: 0.62, z: zLen, parent: g, mat: new T.MeshBasicMaterial({ color: '#fef08a' }) });
        M(box(0.32, 0.16, 0.08), '#f87171', { x: wx, y: 0.62, z: -zLen, parent: g, mat: new T.MeshBasicMaterial({ color: '#f87171' }) });
      });
      // 含銀色鋁圈輪轂的可轉動車輪
      [[-0.92, zLen * 0.62], [0.92, zLen * 0.62], [-0.92, -zLen * 0.62], [0.92, -zLen * 0.62]].forEach(([wx, wz]) => {
        const wg = G(g, wx, 0.34, wz);
        M(cyl(0.34, 0.34, 0.24, 16), '#475569', { rz: Math.PI / 2, parent: wg });
        M(cyl(0.20, 0.20, 0.26, 12), '#e2e8f0', { rz: Math.PI / 2, parent: wg, pbr: { metalness: 0.6, roughness: 0.2 } });
        M(box(0.28, 0.06, 0.32), '#cbd5e1', { parent: wg });
        wheelMeshes.push(wg);
      });
      g.userData = { wheels: wheelMeshes };
      return g;
    }

    // 2. 高細節臺灣特色機車（含雙後照鏡、儀表板、雙色坐墊、後扶手、車牌、排氣管與雙手握把騎士）
    function makeScooter(col, helmetCol) {
      const g = G(null);
      addContactShadow(g, 0.85, 0.02, 0.65);
      const wF = M(cyl(0.24, 0.24, 0.12, 14), '#475569', { y: 0.24, z: 0.56, rz: Math.PI / 2, parent: g });
      const wB = M(cyl(0.24, 0.24, 0.12, 14), '#475569', { y: 0.24, z: -0.52, rz: Math.PI / 2, parent: g });
      M(cyl(0.13, 0.13, 0.14, 10), '#e2e8f0', { y: 0.24, z: 0.56, rz: Math.PI / 2, parent: g });
      M(cyl(0.13, 0.13, 0.14, 10), '#e2e8f0', { y: 0.24, z: -0.52, rz: Math.PI / 2, parent: g });
      // 前土除、斜板、腳踏板、側殼、雙色坐墊、後扶手、排氣管與車牌
      M(box(0.22, 0.14, 0.32), col, { y: 0.42, z: 0.58, rx: 0.25, parent: g });
      M(box(0.40, 0.10, 0.55), '#64748b', { y: 0.30, z: 0.08, parent: g });
      M(box(0.44, 0.38, 0.78), col, { y: 0.52, z: -0.26, parent: g });
      M(box(0.38, 0.12, 0.68), '#785a46', { y: 0.74, z: -0.24, parent: g }); // 皮革坐墊
      M(box(0.32, 0.06, 0.18), '#94a3b8', { y: 0.76, z: -0.64, parent: g }); // 後扶手
      M(cyl(0.05, 0.06, 0.48, 8), '#64748b', { x: 0.24, y: 0.32, z: -0.42, rx: Math.PI / 2 - 0.15, parent: g }); // 排氣管
      M(box(0.22, 0.14, 0.03), '#ffffff', { y: 0.46, z: -0.68, rx: -0.2, parent: g }); // 車牌
      // 前斜板、龍頭把手、儀表板、雙後照鏡与頭尾燈
      M(box(0.38, 0.72, 0.26), col, { y: 0.72, z: 0.42, rx: -0.22, parent: g });
      M(box(0.68, 0.07, 0.07), '#475569', { y: 1.06, z: 0.34, parent: g });
      M(box(0.18, 0.08, 0.10), '#38bdf8', { y: 1.09, z: 0.32, rx: -0.4, parent: g }); // 液晶儀表
      [-0.28, 0.28].forEach(mx => {
        tube(g, v(mx, 1.06, 0.34), v(mx * 1.18, 1.22, 0.36), 0.012, '#64748b');
        M(sSph(0.055, 8, 6), '#cbd5e1', { x: mx * 1.2, y: 1.23, z: 0.36, s: [1.2, 0.8, 0.4], parent: g });
      });
      M(sSph(0.12, 10, 8), '#fef08a', { y: 1.04, z: 0.45, parent: g, mat: new T.MeshBasicMaterial({ color: '#fef08a' }) });
      M(box(0.18, 0.09, 0.05), '#f87171', { y: 0.66, z: -0.66, parent: g, mat: new T.MeshBasicMaterial({ color: '#f87171' }) });
      // 騎士（含身體、雙手握把、安全帽與護目鏡）
      M(new T.CapsuleGeometry(0.15, 0.36, 6, 12), '#589ce0', { y: 0.98, z: -0.14, rx: 0.18, parent: g });
      [-0.18, 0.18].forEach(ax => tube(g, v(ax, 1.10, -0.08), v(ax * 1.5, 1.06, 0.32), 0.045, '#589ce0'));
      M(sSph(0.19, 14, 12), helmetCol, { y: 1.42, z: -0.06, parent: g });
      M(box(0.24, 0.11, 0.12), '#64748b', { y: 1.40, z: 0.09, parent: g });
      g.userData = { wheels: [wF, wB] };
      return g;
    }

    // 3. 高細節 YouBike 2.0 微笑單車與踩踏騎士
    function makeBicycle(shirtCol) {
      const g = G(null);
      addContactShadow(g, 0.78, 0.02, 0.6);
      const makeSpokeWheel = (zPos) => {
        const wg = G(g, 0, 0.31, zPos);
        M(new T.TorusGeometry(0.28, 0.032, 8, 20), '#475569', { ry: Math.PI / 2, parent: wg });
        for (let k = 0; k < 4; k++) {
          M(box(0.015, 0.54, 0.015), '#cbd5e1', { rx: (k / 4) * Math.PI, parent: wg });
        }
        return wg;
      };
      const wF = makeSpokeWheel(0.54), wB = makeSpokeWheel(-0.54);
      // 橘黃色低跨點 YouBike 車架、前後泥除、太陽能車機面板、菜籃与踏板曲柄
      tube(g, v(0, 0.31, -0.54), v(0, 0.72, -0.16), 0.028, '#f59e0b');
      tube(g, v(0, 0.31, 0.54), v(0, 0.94, 0.36), 0.028, '#f59e0b');
      tube(g, v(0, 0.34, -0.05), v(0, 0.78, 0.38), 0.034, '#fbbf24');
      tube(g, v(0, 0.31, -0.54), v(0, 0.34, -0.05), 0.026, '#f59e0b');
      M(box(0.18, 0.06, 0.28), '#475569', { y: 0.78, z: -0.18, parent: g }); // 坐墊
      M(box(0.32, 0.24, 0.26), '#8c6239', { y: 0.84, z: 0.52, parent: g, edge: 25 }); // 前置車籃
      M(box(0.56, 0.045, 0.045), '#475569', { y: 0.96, z: 0.34, parent: g }); // 車手把
      // 單車騎士
      M(new T.CapsuleGeometry(0.14, 0.35, 6, 12), shirtCol, { y: 1.02, z: -0.14, rx: 0.28, parent: g });
      [-0.16, 0.16].forEach(ax => tube(g, v(ax, 1.12, -0.06), v(ax * 1.4, 0.96, 0.32), 0.04, shirtCol));
      M(sSph(0.175, 14, 12), '#fae0cc', { y: 1.44, z: -0.02, parent: g });
      M(new T.SphereGeometry(0.19, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), '#543b2e', { y: 1.46, z: -0.04, rx: -0.3, parent: g });
      g.userData = { wF, wB };
      return g;
    }

    const carCols = ['#f28482', '#72bef5', '#84a59d', '#f8fafc', '#b8b8ff', '#f6bd60'];
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const laneX = (C.x0 - 14) + (dir > 0 ? 4.2 : -4.2) + (i % 4 < 2 ? dir * 3.6 : 0);
      const isBus = i === 0;
      const isTaxi = i === 3 || i === 6;
      const m = makeCar(carCols[i % carCols.length], isBus, isTaxi);
      m.rotation.y = dir > 0 ? 0 : Math.PI;
      vehicles.push({ m, axis: 'z', fixed: laneX, pos: -180 + i * 46, dir, speed: isBus ? 11.5 : (14.5 + (i % 3) * 2.5), min: -110, max: 110 });
    }
    const scootCols = ['#72bef5', '#f28482', '#f6bd60', '#84a59d', '#ffffff', '#b8b8ff'];
    for (let i = 0; i < 6; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const laneX = (C.x0 - 14) + dir * 9.6;
      const m = makeScooter(scootCols[i % scootCols.length], scootCols[(i + 2) % scootCols.length]);
      m.rotation.y = dir > 0 ? 0 : Math.PI;
      vehicles.push({ m, axis: 'z', fixed: laneX, pos: -160 + i * 54, dir, speed: 12.8 + (i % 3) * 1.8, min: -110, max: 110 });
    }
    for (let i = 0; i < 5; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const laneX = dir > 0 ? (C.x0 - 4.2) : (C.x0 - 30.2);
      const m = makeBicycle(carCols[(i + 1) % carCols.length]);
      m.rotation.y = dir > 0 ? 0 : Math.PI;
      vehicles.push({ m, axis: 'z', fixed: laneX, pos: -120 + i * 52, dir, speed: 5.8 + (i % 2) * 1.2, min: -105, max: 105, bike: true });
    }

    for (let i = 0; i < 6; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const laneZ = (C.z0 - 15) + dir * (4.5 + (i % 2) * 4.2);
      const m = makeCar(carCols[(i + 2) % carCols.length], i === 1, i === 4);
      m.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      vehicles.push({ m, axis: 'x', fixed: laneZ, pos: -180 + i * 62, dir, speed: 15.0 + (i % 3) * 2.2, min: -110, max: 110 });
    }

    const peds = [];
    for (let i = 0; i < (isMobile ? 6 : 10); i++) {
      const p = makeNPC(i % 2 === 0 ? 'pedM' : 'pedF');
      p.scale.setScalar(0.64);
      const dir = i % 2 === 0 ? 1 : -1;
      const isWestSidewalk = i < 7;
      const fixedCoord = isWestSidewalk ? (C.x0 - 2.6 + (i % 2) * 0.9) : (C.z0 - 2.8);
      const startPos = -95 + i * 24;
      W.scene.add(p);
      peds.push({ p, axis: isWestSidewalk ? 'z' : 'x', fixed: fixedCoord, pos: startPos, dir, speed: 2.2 + (i % 3) * 0.45, min: -105, max: 105 });
    }

    W.updaters.push((t, dt) => {
      if (W.reduced) return;
      vehicles.forEach(v0 => {
        v0.pos += v0.dir * v0.speed * dt;
        if (v0.dir > 0 && v0.pos > v0.max) v0.pos = v0.min;
        if (v0.dir < 0 && v0.pos < v0.min) v0.pos = v0.max;
        if (v0.axis === 'z') v0.m.position.set(v0.fixed, 0, v0.pos);
        else v0.m.position.set(v0.pos, 0, v0.fixed);
        if (v0.bike && v0.m.userData.wF) {
          v0.m.userData.wF.rotation.x += dt * v0.speed * 3;
          v0.m.userData.wB.rotation.x += dt * v0.speed * 3;
        }
        if (v0.m.userData.wheels) {
          v0.m.userData.wheels.forEach(w => { w.rotation.x += dt * v0.speed * 2.5; });
        }
      });
      peds.forEach(pd => {
        pd.pos += pd.dir * pd.speed * dt;
        if (pd.dir > 0 && pd.pos > pd.max) pd.pos = pd.min;
        if (pd.dir < 0 && pd.pos < pd.min) pd.pos = pd.max;
        if (pd.axis === 'z') {
          pd.p.position.set(pd.fixed, 0.05, pd.pos);
          pd.p.rotation.y = pd.dir > 0 ? 0 : Math.PI;
        } else {
          pd.p.position.set(pd.pos, 0.05, pd.fixed);
          pd.p.rotation.y = pd.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        pd.p.userData.anim(t, dt, false, pd.speed * 2.2, 0, 0, 0, false);
      });
    });
  }

  /* =====================================================================
   * 校內地面與 200m 跑道（套用 Nano Banana 2 淡水彩石磚與淡綠草皮貼圖）
   * ===================================================================== */
  function buildCampusGround() {
    const C = LAYOUT.campus, w = C.x1 - C.x0, d = C.z1 - C.z0;
    // 1. 校園溫潤奶油玩具感石磚地面與自然擬真草坪
    flat(w, d, pbr('#ffffff', { map: paveTex('#f2e9dc', '#dccdb8', [24, 32]), roughness: 0.36 }), (C.x0 + C.x1) / 2, (C.z0 + C.z1) / 2, 0.03);

    const P = LAYOUT.plaza;
    flat(P.x1 - P.x0, P.z1 - P.z0, pbr('#ffffff', { map: paveTex('#f8f1e6', '#e2d4c0', [12, 6]), roughness: 0.34 }), (P.x0 + P.x1) / 2, (P.z0 + P.z1) / 2, 0.045);

    // 迎賓大道中央暖珊瑚粉紅步道（如截圖花海中間蜿蜒的自然泥土石板小徑）
    flat(44, 3.8, pbr('#d8b898', { roughness: 0.48 }), -39, 14, 0.06);

    // 迎賓大道南北兩側長條花台（承載擬真搖曳草皮與大波斯菊花海）
    const planterGrassMat = pbr('#ffffff', { map: grassTex([10, 1]), natural: true });
    [-1, 1].forEach(s => {
      M(box(40, 0.42, 2.2), '#fff8ee', { x: -39, y: 0.21, z: 14 + s * 6.8 });
      M(box(39.4, 0.44, 1.8), '#ffffff', { x: -39, y: 0.22, z: 14 + s * 6.8, mat: planterGrassMat });
    });

    flat(w, 8, pbr('#ffffff', { map: grassTex([16, 2]), natural: true }), (C.x0 + C.x1) / 2, C.z0 + 4, 0.04);
    flat(6, 54, pbr('#ffffff', { map: grassTex([2, 10]), natural: true }), C.x0 + 3, -58, 0.042);
  }

  function buildTrack() {
    const Tk = LAYOUT.track, R = Tk.wid / 2, L = (Tk.len - Tk.wid) / 2;
    const px = 1024 / Tk.len, H = Math.round(Tk.wid * px);
    const tex = canvasTex(1024, H, (x, w, h) => {
      const cx = w / 2, cy = h / 2;
      const oval = (r) => {
        x.beginPath();
        x.moveTo(cx - L * px, cy - r * px);
        x.lineTo(cx + L * px, cy - r * px);
        x.arc(cx + L * px, cy, r * px, -Math.PI / 2, Math.PI / 2);
        x.lineTo(cx - L * px, cy + r * px);
        x.arc(cx - L * px, cy, r * px, Math.PI / 2, Math.PI * 1.5);
        x.closePath();
      };
      oval(R - 0.2); x.fillStyle = '#f26a78'; x.fill();
      x.strokeStyle = '#4cc9f0'; x.lineWidth = 6; oval(R - 0.5); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 2.4;
      for (let i = 1; i <= 5; i++) { oval(R - 0.5 - i * 1.05); x.stroke(); }
      oval(R - 6); x.fillStyle = '#52b788'; x.fill();

      const court = (ox) => {
        const cw = 15 * px, ch = 28 * px, X = cx + ox * px - cw / 2, Y = cy - ch / 2;
        x.fillStyle = '#48cae4'; x.fillRect(X, Y, cw, ch);
        x.fillStyle = '#f26a78';
        x.fillRect(X + cw / 2 - 2.45 * px, Y, 4.9 * px, 5.8 * px);
        x.fillRect(X + cw / 2 - 2.45 * px, Y + ch - 5.8 * px, 4.9 * px, 5.8 * px);
        x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.strokeRect(X, Y, cw, ch);
        x.beginPath(); x.moveTo(X, cy); x.lineTo(X + cw, cy); x.stroke();
        x.beginPath(); x.arc(X + cw / 2, cy, 1.8 * px, 0, 7); x.stroke();
        x.beginPath(); x.arc(X + cw / 2, Y + 1.6 * px, 6.75 * px, 0, Math.PI); x.stroke();
        x.beginPath(); x.arc(X + cw / 2, Y + ch - 1.6 * px, 6.75 * px, Math.PI, Math.PI * 2); x.stroke();
      };
      court(-21); court(0); court(21);
    });
    const m = new T.Mesh(
      new T.PlaneGeometry(Tk.len, Tk.wid),
      pbr('#ffffff', { map: tex, roughness: 0.35, transparent: true, alphaTest: 0.5 })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(Tk.cx, 0.07, Tk.cz);
    m.receiveShadow = true;
    W.scene.add(m);

    [-21, 0, 21].forEach(ox => [-1, 1].forEach(s => {
      const x = Tk.cx + ox, z = Tk.cz + s * 14.6, g = G(null, x, 0, z);
      addContactShadow(g, 0.65, 0.08, 0.65, 0, s * 0.9);
      M(cyl(0.12, 0.14, 3.4, 12), '#4895ef', { y: 1.7, z: s * 0.9, parent: g });
      M(box(1.8, 1.08, 0.08), '#ffffff', { y: 3.3, z: s * 0.1, parent: g });
      M(box(0.55, 0.42, 0.09), '#ef476f', { y: 3.2, z: s * 0.1, parent: g });
      M(new T.TorusGeometry(0.24, 0.03, 8, 20), '#fb8500', { y: 3.0, z: -s * 0.2, rx: Math.PI / 2, parent: g });
      M(new T.CylinderGeometry(0.23, 0.16, 0.34, 12, 1, true), '#f8fafc', {
        y: 2.82, z: -s * 0.2, parent: g,
        mat: pbr('#f8fafc', { side: T.DoubleSide, transparent: true, opacity: 0.72, wireframe: true })
      });
      W.circles.push({ x, z: z + s * 0.9, r: 0.3 });
    }));

    const st = G(null, Tk.cx, 0, Tk.cz + R + 2.6);
    M(box(9.6, 1.1, 3.8), '#fff8ee', { y: 0.55, parent: st });
    M(box(10.2, 0.35, 4.4), '#4895ef', { y: 4.0, parent: st });
    [-4.3, 4.3].forEach(x => M(cyl(0.16, 0.18, 2.9, 14), '#ffffff', { x, y: 2.55, z: -1.6, parent: st }));
    M(cyl(0.06, 0.11, 11, 12), '#e2e8f0', { x: 6.2, y: 5.5, z: -1.2, parent: st });
    W.boxes.push({ x0: Tk.cx - 4.9, x1: Tk.cx + 4.9, z0: Tk.cz + R + 0.7, z1: Tk.cz + R + 4.5, h: 1.1 });
  }

  function buildCourt() {
    const C = LAYOUT.court, w = C.x1 - C.x0, d = C.z1 - C.z0;
    const tex = canvasTex(512, Math.round(512 * d / w), (x, W0, H0) => {
      x.fillStyle = '#48cae4'; x.fillRect(0, 0, W0, H0);
      x.strokeStyle = '#ffffff'; x.lineWidth = 3.2;
      const k = W0 / w;
      [[2, 2], [w / 2 + 1, 2]].forEach(([ox, oz]) => {
        x.strokeRect(ox * k, oz * k, 11 * k, 6.1 * k);
        x.strokeRect(ox * k, (oz + 8) * k, 11 * k, 6.1 * k);
      });
      x.strokeRect(4 * k, 15 * k, w * k - 8 * k, 8 * k);
    });
    flat(w, d, pbr('#ffffff', { map: tex, roughness: 0.36 }), (C.x0 + C.x1) / 2, (C.z0 + C.z1) / 2, 0.06);

    const ox = C.x1 - 6.2, oz = C.z1 - 5.5;
    const owl = G(null, ox, 0, oz);
    owl.rotation.y = -0.45;

    const matPad = canvasTex(512, 512, (x, W0, H0) => {
      x.fillStyle = '#4cc9f0'; x.fillRect(0, 0, W0, H0);
      x.fillStyle = '#bae6fd'; x.beginPath(); x.arc(256, 256, 216, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#ffd166'; x.beginPath(); x.arc(256, 256, 152, 0, Math.PI * 2); x.fill();
    });
    const padMesh = new T.Mesh(new T.CircleGeometry(5.6, 36), pbr('#ffffff', { map: matPad, roughness: 0.35 }));
    padMesh.rotation.x = -Math.PI / 2;
    padMesh.position.y = 0.075;
    padMesh.receiveShadow = true;
    owl.add(padMesh);

    addContactShadow(owl, 2.8, 0.082, 0.72);

    const owlBodyTex = canvasTex(512, 512, (x, W0, H0) => {
      x.fillStyle = '#9c5a3c';
      x.fillRect(0, 0, W0, H0);
      x.fillStyle = '#fff8ee';
      x.beginPath();
      x.ellipse(256, 310, 115, 160, 0, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = '#b86e4c';
      x.lineWidth = 7;
      for (let row = 0; row < 5; row++) {
        const yy = 210 + row * 42;
        for (let col = -2; col <= 2; col++) {
          if (Math.abs(col) === 2 && row > 3) continue;
          const xx = 256 + col * 36 + (row % 2 ? 18 : 0);
          x.beginPath();
          x.arc(xx, yy, 16, 0.1 * Math.PI, 0.9 * Math.PI);
          x.stroke();
        }
      }
    });
    M(cyl(1.35, 1.55, 3.0, 28), '#ffffff', { y: 1.5, ry: Math.PI, parent: owl, mat: pbr('#ffffff', { map: owlBodyTex }) });
    M(sSph(1.42, 28, 20), '#9c5a3c', { y: 3.0, s: [1.02, 0.72, 0.98], parent: owl });

    [-1, 1].forEach(sx => {
      M(new T.ConeGeometry(0.42, 1.1, 12), '#7c4428', {
        x: sx * 0.95, y: 3.82, z: 0.15,
        rz: sx * -0.38, rx: 0.15, parent: owl
      });
    });

    [-1, 1].forEach(sx => {
      const eyeG = G(owl, sx * 0.56, 2.85, 1.32);
      eyeG.rotation.y = sx * 0.18;
      M(cyl(0.54, 0.54, 0.12, 28), '#ffffff', { rx: Math.PI / 2, parent: eyeG });
      M(cyl(0.42, 0.42, 0.15, 28), '#ffd166', { z: 0.02, rx: Math.PI / 2, parent: eyeG });
      M(cyl(0.26, 0.26, 0.18, 24), '#2b1e16', { z: 0.04, rx: Math.PI / 2, parent: eyeG });
      M(sSph(0.08, 12, 10), '#ffffff', { x: -0.09, y: 0.10, z: 0.12, parent: eyeG, mat: new T.MeshBasicMaterial({ color: '#ffffff' }) });
    });

    M(new T.ConeGeometry(0.28, 0.65, 4), '#ff9f1c', {
      y: 2.48, z: 1.55, rx: Math.PI / 2 + 0.35, ry: Math.PI / 4, parent: owl
    });

    [-1, 1].forEach(sx => {
      M(sSph(0.95, 18, 14), '#84482c', {
        x: sx * 1.48, y: 1.85, z: -0.05,
        s: [0.35, 1.25, 0.88], rz: sx * 0.22, parent: owl
      });
    });

    const slide1 = G(owl, 0, 0, 1.2);
    M(box(1.25, 0.14, 3.6), '#ffd166', { y: 0.92, z: 1.55, rx: 0.48, parent: slide1 });
    [-0.62, 0.62].forEach(sx => {
      M(box(0.12, 0.36, 3.65), '#4cc9f0', { x: sx, y: 1.06, z: 1.55, rx: 0.48, parent: slide1 });
    });
    M(box(1.35, 0.16, 0.85), '#ffd166', { y: 0.14, z: 3.35, parent: slide1 });

    const curvePts = [
      new V3(1.15, 2.15, 0.0),
      new V3(2.15, 1.80, 0.45),
      new V3(2.75, 1.35, 1.35),
      new V3(2.55, 0.85, 2.35),
      new V3(1.95, 0.42, 3.15),
      new V3(1.55, 0.28, 3.75)
    ];
    const slideCurve = new T.CatmullRomCurve3(curvePts);
    const tubeStripedTex = canvasTex(256, 64, (x, W0, H0) => {
      const cols = ['#4cc9f0', '#ffd166', '#4cc9f0', '#ff9f1c', '#4cc9f0', '#ffd166'];
      for (let i = 0; i < 6; i++) {
        x.fillStyle = cols[i];
        x.fillRect(i * (W0 / 6), 0, W0 / 6 + 1, H0);
      }
    });
    const tubeGeo = new T.TubeGeometry(slideCurve, 40, 0.44, 20, false);
    M(tubeGeo, '#ffffff', { parent: owl, mat: pbr('#ffffff', { map: tubeStripedTex }) });
    M(new T.TorusGeometry(0.44, 0.06, 12, 24), '#4895ef', { x: 1.55, y: 0.28, z: 3.75, ry: -0.45, parent: owl });

    W.circles.push({ x: ox, z: oz, r: 3.2 });
    addLabel('小光（貓頭鷹）溜滑梯', ox, 5.2, oz);
  }

  /* =====================================================================
   * 恢復光復國小實景校舍建築群与修澤蘭「光復樓（圓樓）」，並套用 Cute Vivid Designer Toy 材質（Studio Lighting, Octane Render）！
   * ===================================================================== */
  function winTex(cols, floors, wall, glass, band, accent) {
    return canvasTex(cols * 64, floors * 96, (x, w, h) => {
      x.fillStyle = wall; x.fillRect(0, 0, w, h);
      const pal = ['#ff8fab', '#ffd166', '#58b8f8', '#80ed99', '#b8b8ff'];
      for (let f = 0; f < floors; f++) {
        const y = f * 96;
        // 鮮明活潑的 Designer Toy 樓層色帶
        x.fillStyle = band; x.fillRect(0, y, w, 18);
        x.fillStyle = '#ffffff'; x.fillRect(0, y + 16, w, 4);
        for (let c = 0; c < cols; c++) {
          const X = c * 64;
          x.fillStyle = '#ffffff';
          x.fillRect(X, y + 18, 6, 78);
          if (accent && (c * 7 + f * 3) % 5 === 0) {
            x.fillStyle = pal[(c + f) % pal.length];
            x.beginPath(); x.roundRect(X + 9, y + 22, 46, 62, 8); x.fill();
            continue;
          }
          // 圓潤白色玩具窗框
          x.fillStyle = '#ffffff';
          x.beginPath(); x.roundRect(X + 8, y + 22, 48, 60, 9); x.fill();
          // 清澈高飽和天藍玩具玻璃窗
          const grd = x.createLinearGradient(X + 12, y + 26, X + 52, y + 78);
          grd.addColorStop(0, '#90e0ef');
          grd.addColorStop(0.5, glass);
          grd.addColorStop(1, '#0077b6');
          x.fillStyle = grd;
          x.beginPath(); x.roundRect(X + 12, y + 26, 40, 52, 6); x.fill();
          // 白色十字窗框與高光反光條
          x.fillStyle = '#ffffff';
          x.fillRect(X + 30, y + 26, 3.5, 52);
          x.fillRect(X + 12, y + 48, 40, 3.5);
          x.fillStyle = 'rgba(255,255,255,0.65)';
          x.beginPath(); x.moveTo(X + 15, y + 29); x.lineTo(X + 27, y + 29); x.lineTo(X + 16, y + 46); x.closePath(); x.fill();
        }
      }
    });
  }

  function taiwanTex(w, h) {
    return canvasTex(w, h, (x) => {
      x.fillStyle = '#ff9f1c'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.strokeRect(6, 6, w - 12, h - 12);
      const P = [[0.62, 0.04], [0.72, 0.07], [0.79, 0.13], [0.77, 0.22], [0.74, 0.33], [0.71, 0.45], [0.67, 0.58], [0.61, 0.70], [0.54, 0.81], [0.48, 0.9], [0.45, 0.97], [0.4, 0.9], [0.32, 0.8], [0.26, 0.7], [0.22, 0.58], [0.22, 0.45], [0.27, 0.33], [0.36, 0.21], [0.48, 0.11]];
      const pts = P.map(([a, b]) => [a * w, b * h]);
      x.fillStyle = '#80ed99'; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill();
      x.strokeStyle = '#ffffff'; x.lineWidth = 5; x.stroke();
    });
  }

  function instBoxes(pts, geo, col) {
    const n = pts.length, m = new T.InstancedMesh(geo, pbr(col), n), o = new T.Object3D();
    pts.forEach(([x, y, z], i) => { o.position.set(x, y, z); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.castShadow = m.receiveShadow = true;
    W.scene.add(m);
    return m;
  }

  function buildBuildings() {
    const colList = [];
    LAYOUT.buildings.forEach(b => {
      const w = b.x1 - b.x0, d = b.z1 - b.z0, h = b.floors * FLOOR_H, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
      const acc = !!b.color;
      const tW = winTex(Math.max(2, Math.round(w / 3.4)), b.floors, b.wall, b.glass, b.band, acc);
      const tD = winTex(Math.max(2, Math.round(d / 3.4)), b.floors, b.wall, b.glass, b.band, acc);
      const roofCol = b.roofCol || '#4ea8de';
      const roofMat = b.roofTex === 'taiwan'
        ? pbr('#ffffff', { map: taiwanTex(512, Math.round(512 * d / w)) })
        : pbr(roofCol);
      const sideW = pbr('#ffffff', { map: tW });
      const sideD = pbr('#ffffff', { map: tD });
      const m = new T.Mesh(box(w, h, d), [sideD, sideD, roofMat, sideW, sideW, sideW]);
      m.position.set(cx, h / 2, cz);
      m.castShadow = m.receiveShadow = true;
      W.scene.add(m);
      W.solids.push(m);

      if (b.roof !== 'arch' && b.roofTex !== 'taiwan') {
        const pm = pbr(b.band || '#ffffff');
        [[w + 0.5, 0.65, 0.45, 0, -d / 2], [w + 0.5, 0.65, 0.45, 0, d / 2], [0.45, 0.65, d + 0.5, -w / 2, 0], [0.45, 0.65, d + 0.5, w / 2, 0]].forEach(([a, bb, c, ox, oz]) =>
          M(box(a, bb, c), b.band, { x: cx + ox, y: h + 0.32, z: cz + oz, mat: pm }));
      }

      if (b.roof === 'arch') {
        const sq = G(null, cx, h, cz); sq.scale.y = 0.34;
        const ar = new T.Mesh(
          new T.CylinderGeometry(d / 2 - 0.5, d / 2 - 0.5, w - 1.0, 32, 1, false, 0, Math.PI),
          pbr('#48bfe3')
        );
        ar.rotation.z = Math.PI / 2;
        ar.castShadow = true; ar.receiveShadow = true;
        sq.add(ar);
        W.solids.push(ar);
      }

      if (b.floors >= 3 && w > 25) {
        const zf = cz + (cz > 0 ? -d / 2 - 0.95 : d / 2 + 0.95);
        M(box(w, 0.32, 1.9), b.band, { x: cx, y: FLOOR_H, z: zf });
        for (let x = b.x0 + 2; x < b.x1 - 1; x += 4) colList.push([x, FLOOR_H / 2, zf + (cz > 0 ? -0.7 : 0.7)]);
      }
      W.boxes.push({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, h });
      if (b.name) addLabel(b.name + (b.sub ? `\n${b.sub}` : ''), cx, h + (b.roof === 'arch' ? 9 : 5), cz);
    });
    instBoxes(colList, box(0.46, FLOOR_H, 0.46), '#ffffff');
  }

  /* =====================================================================
   * 恢復修澤蘭建築師「光復樓（圓樓）」原始實景建築（16根斜撐落柱、三層環形迴廊、藍色扁圓頂），套用 Cute Vivid Designer Toy Octane 材質！
   * ===================================================================== */
  function buildDome() {
    const D = LAYOUT.dome, g = G(null, D.x, 0, D.z), wallH = 11.4;
    const whiteToyMat = pbr('#ffffff');

    addContactShadow(g, D.r * 1.08, 0.04, 0.62);
    M(cyl(D.r * 0.98, D.r * 1.02, 0.45, 32), '#ffd166', { y: 0.225, parent: g });

    const wt = canvasTex(1024, 256, (x, w, h) => {
      x.fillStyle = '#fff9f2'; x.fillRect(0, 0, w, h);
      for (let f = 0; f < 3; f++) {
        const y = f * 84;
        x.fillStyle = '#72efdd'; x.fillRect(0, y, w, 14);
        for (let i = 0; i < 32; i++) {
          const grd = x.createLinearGradient(0, y + 20, 0, y + 68);
          grd.addColorStop(0, '#90e0ef'); grd.addColorStop(1, '#0096c7');
          x.fillStyle = grd;
          x.beginPath(); x.roundRect(i * 32 + 5, y + 20, 22, 48, 5); x.fill();
          x.strokeStyle = '#ffffff'; x.lineWidth = 2.5;
          x.strokeRect(i * 32 + 5, y + 20, 22, 48);
        }
      }
    });
    const walls = M(new T.CylinderGeometry(D.r * 0.80, D.r * 0.80, wallH, 32), '#fff9f2', {
      y: wallH / 2 + 0.3, parent: g,
      mat: pbr('#ffffff', { map: wt })
    });
    W.solids.push(walls);

    [3.8, 7.6, 11.4].forEach((yh, idx) => {
      M(cyl(D.r * 0.93, D.r * 0.91, 0.36, 32), '#ffffff', { y: yh, parent: g, mat: whiteToyMat });
      if (idx < 2) {
        M(new T.CylinderGeometry(D.r * 0.92, D.r * 0.92, 0.95, 32, 1, true), '#fff9f2', {
          y: yh + 0.55, parent: g, mat: pbr('#fff9f2', { side: T.DoubleSide })
        });
      }
    });

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      M(new T.CylinderGeometry(0.62, 0.38, wallH + 0.6, 14), '#ffffff', {
        x: Math.sin(a) * D.r * 0.90,
        y: (wallH + 0.6) / 2 + 0.2,
        z: Math.cos(a) * D.r * 0.90,
        ry: a, parent: g, mat: whiteToyMat
      });
      M(cyl(0.50, 0.56, 0.5, 12), '#ffd166', {
        x: Math.sin(a) * D.r * 0.90, y: 0.45, z: Math.cos(a) * D.r * 0.90, parent: g
      });
    }

    M(cyl(D.r * 0.99, D.r * 0.94, 0.48, 32), '#ffffff', { y: wallH + 0.55, parent: g, mat: whiteToyMat });
    const roof = M(
      new T.SphereGeometry(D.r * 0.94, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      '#3a86ff',
      { y: wallH + 0.65, s: [1, 0.26, 1], parent: g, pbr: { color: '#3a86ff' } }
    );
    W.solids.push(roof);
    M(cyl(3.6, 4.0, 1.8, 24), '#ffffff', { y: wallH + 0.65 + D.r * 0.24 + 0.5, parent: g, mat: whiteToyMat });
    M(new T.ConeGeometry(4.0, 1.5, 24), '#ffd166', { y: wallH + 0.65 + D.r * 0.24 + 2.1, parent: g });

    // 西側入口雨庇
    M(box(4.6, 0.42, 8.4), '#ffffff', { x: -D.r * 0.90, y: 4.1, parent: g, mat: whiteToyMat });
    [-3.4, 3.4].forEach(oz => M(cyl(0.32, 0.24, 4.0, 12), '#ffffff', { x: -D.r * 0.98, y: 2.0, z: oz, parent: g, mat: whiteToyMat }));

    W.circles.push({ x: D.x, z: D.z, r: D.r * 0.88 });
    addLabel('光復樓（圓樓）\n修澤蘭設計・布克斯王國', D.x, wallH + D.r * 0.26 + 7.5, D.z);
  }

  /* =====================================================================
   * 恢復圓樓正前方〈水袖〉雕塑與左右兩側「光」「復」二字景觀字碑（Designer Toy 質感）
   * ===================================================================== */
  function buildSculptures() {
    const sx = -21.8, sz = 15.8;
    const sg = G(null, sx, 0, sz);
    addContactShadow(sg, 4.2, 0.055, 0.72);
    M(cyl(3.2, 3.5, 0.48, 28), '#fff8ee', { y: 0.24, parent: sg });
    M(cyl(2.75, 2.75, 0.52, 28), '#4cc9f0', { y: 0.26, parent: sg });
    M(cyl(1.15, 1.45, 1.2, 18), '#ffffff', { y: 0.70, parent: sg });

    const sleeveMat = pbr('#ffffff', { roughness: 0.15, clearcoat: 0.85 });
    M(new T.TorusKnotGeometry(1.22, 0.28, 96, 20, 2, 3), '#ffffff', {
      y: 2.75, rx: 0.35, ry: 0.4, s: [0.88, 1.48, 0.88], parent: sg, mat: sleeveMat
    });
    M(new T.ConeGeometry(0.48, 2.3, 16), '#ffffff', { x: 0.2, y: 4.2, z: -0.1, rz: -0.35, s: [1, 1, 0.35], parent: sg, mat: sleeveMat });
    M(new T.ConeGeometry(0.40, 1.9, 16), '#ffffff', { x: -0.3, y: 3.7, z: 0.2, rz: 0.42, s: [1, 1, 0.35], parent: sg, mat: sleeveMat });

    const makeCharMonument = (ch, zOff) => {
      const mg = G(sg, -0.4, 0, zOff);
      M(box(0.75, 0.65, 1.65), '#ffd166', { y: 0.325, parent: mg });
      M(box(0.55, 1.95, 1.85), '#ffffff', { y: 1.55, parent: mg });
      M(box(0.65, 0.18, 2.0), '#ff9f1c', { y: 2.58, parent: mg });
      const chTex = canvasTex(256, 256, (x, w, h) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#ffd166'; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20);
        x.font = `900 176px "DFKai-SB","BiauKai","Kaiti TC",${FONT_TC}`;
        x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillStyle = 'rgba(255, 159, 28, 0.35)';
        x.fillText(ch, w / 2 + 5, h / 2 + 11);
        x.strokeStyle = '#ff9f1c'; x.lineWidth = 7;
        x.strokeText(ch, w / 2, h / 2 + 6);
        x.fillStyle = '#1d3557';
        x.fillText(ch, w / 2, h / 2 + 6);
      }, { text: true });
      [-1, 1].forEach(side => {
        const p = new T.Mesh(new T.PlaneGeometry(1.68, 1.68), new T.MeshBasicMaterial({ map: chTex }));
        p.position.set(side * 0.285, 1.55, 0);
        p.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        mg.add(p);
      });
    };
    makeCharMonument('光', -2.55);
    makeCharMonument('復', 2.55);

    W.circles.push({ x: sx, z: sz, r: 3.5 });
    addLabel('〈水袖〉雕塑與「光復」景觀字', sx, 6.2, sz);
  }

  function buildTowers() {
    LAYOUT.towers.forEach(t => {
      const g = G(null, t.x, 0, t.z);
      addContactShadow(g, t.r + 0.6, 0.04, 0.65);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        M(cyl(0.22, 0.24, t.h, 12), '#faf6ee', {
          x: Math.cos(a) * (t.r * 0.38),
          y: t.h / 2,
          z: Math.sin(a) * (t.r * 0.38),
          parent: g
        });
      }
      M(new T.TorusGeometry(t.r * 0.38, 0.22, 10, 24), '#e6decb', { y: t.h - 0.2, rx: Math.PI / 2, parent: g });

      const n = Math.round(t.h / 0.30);
      const step = new T.InstancedMesh(box(t.r * 0.95, 0.15, 0.72), pbr('#f0e8da', { roughness: 0.6 }), n);
      const o = new T.Object3D();
      for (let i = 0; i < n; i++) {
        const a = i * 0.38;
        o.position.set(Math.sin(a) * t.r * 0.52, i * 0.30 + 0.2, Math.cos(a) * t.r * 0.52);
        o.rotation.set(0, a + Math.PI / 2, 0);
        o.updateMatrix();
        step.setMatrixAt(i, o.matrix);
      }
      step.castShadow = true;
      g.add(step);

      for (let y = 1.1; y < t.h; y += 1.1) {
        M(new T.TorusGeometry(t.r, 0.055, 8, 28), '#7a8a9e', { y, rx: Math.PI / 2, parent: g, cast: true, pbr: { metalness: 0.4, roughness: 0.4 } });
      }
      M(cyl(t.r + 0.35, t.r + 0.35, 0.32, 28), '#faf8f2', { y: t.h, parent: g });
      W.circles.push({ x: t.x, z: t.z, r: t.r + 0.15 });
    });
  }

  /* =====================================================================
   * 光復南路 271 號校門口實景（淡水彩柔和色調、開放天際線、銅牌校名）
   * ===================================================================== */
  function buildFenceGate() {
    const C = LAYOUT.campus, Gt = LAYOUT.gate;
    const wm = pbr('#ebe2d0', { roughness: 0.70 }), rail = pbr('#4c7a62', { metalness: 0.3, roughness: 0.4 });
    const seg = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ry = Math.atan2(x1 - x0, z1 - z0);
      M(box(0.52, 0.95, len), '#ebe2d0', { x: cx, y: 0.475, z: cz, ry, edge: 28, mat: wm });
      M(box(0.12, 0.9, len), '#4c7a62', { x: cx, y: 1.38, z: cz, ry, mat: rail });
      M(box(0.24, 0.12, len), '#4c7a62', { x: cx, y: 1.88, z: cz, ry, edge: 28, mat: rail });
    };
    seg(C.x0, C.z0, C.x1, C.z0);
    seg(C.x1, C.z0, C.x1, C.z1);
    seg(C.x0, C.z1, C.x1, C.z1);
    seg(C.x0, C.z0, C.x0, Gt.z0 - 3.2);
    seg(C.x0, Gt.z1 + 5.8, C.x0, C.z1);

    const g = G(null, Gt.x, 0, (Gt.z0 + Gt.z1) / 2), half = (Gt.z1 - Gt.z0) / 2;

    [-1, 1].forEach(s => {
      const pz = s * (half + 0.5);
      addContactShadow(g, 1.8, 0.03, 0.68, 0, pz);
      M(box(1.5, 3.5, 1.8), '#f6f0e2', { y: 1.75, z: pz, parent: g, edge: 28 });
      M(box(1.58, 0.75, 1.88), '#dc886c', { y: 0.95, z: pz, parent: g, edge: 28 });
      M(box(1.58, 0.55, 1.88), '#dc886c', { y: 2.55, z: pz, parent: g, edge: 28 });
      M(box(1.75, 0.26, 2.05), '#e2d8c5', { y: 3.6, z: pz, parent: g, edge: 28 });
      M(box(0.55, 0.65, 0.55), '#fef3c7', { y: 4.05, z: pz, parent: g, edge: 28, mat: new T.MeshBasicMaterial({ color: '#fef3c7' }) });
      M(new T.ConeGeometry(0.52, 0.28, 4), '#64748b', { y: 4.50, z: pz, ry: Math.PI / 4, parent: g });
    });

    const gateSignTex = canvasTex(768, 220, (x, w, h) => {
      const grd = x.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, '#9c6e38'); grd.addColorStop(0.5, '#c89852'); grd.addColorStop(1, '#8c5e2c');
      x.fillStyle = grd; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#fde68a'; x.lineWidth = 5; x.strokeRect(12, 12, w - 24, h - 24);
      x.fillStyle = '#fffbeb'; x.font = `900 54px ${FONT_TC}`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('臺北市信義區光復國民小學', w / 2, h / 2 + 2);
    }, { text: true });
    if (window.GAME_ASSETS && window.GAME_ASSETS.gateSignNb2) {
      const img = new Image();
      img.onload = () => {
        const ctx = gateSignTex.image.getContext('2d');
        ctx.drawImage(img, 0, 0, 768, 220);
        gateSignTex.needsUpdate = true;
      };
      img.src = window.GAME_ASSETS.gateSignNb2;
    }

    const wingS = G(g, 0, 0, half + 3.2);
    M(box(1.15, 2.75, 4.8), '#f6f0e2', { y: 1.375, parent: wingS, edge: 28 });
    M(box(1.22, 0.55, 4.88), '#dc886c', { y: 0.55, parent: wingS, edge: 28 });
    M(box(1.32, 0.22, 5.05), '#e2d8c5', { y: 2.82, parent: wingS, edge: 28 });
    const signMeshS = new T.Mesh(new T.PlaneGeometry(4.3, 1.24), new T.MeshBasicMaterial({ map: gateSignTex }));
    signMeshS.position.set(-0.62, 1.68, 0);
    signMeshS.rotation.y = -Math.PI / 2;
    wingS.add(signMeshS);
    const signMeshIn = new T.Mesh(new T.PlaneGeometry(4.3, 1.24), new T.MeshBasicMaterial({ map: gateSignTex }));
    signMeshIn.position.set(0.62, 1.68, 0);
    signMeshIn.rotation.y = Math.PI / 2;
    wingS.add(signMeshIn);

    const addrTex = canvasTex(256, 110, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#2eb8a6'; x.fillRect(0, 0, w, 34);
      x.strokeStyle = '#269688'; x.lineWidth = 5; x.strokeRect(3, 3, w - 6, h - 6);
      x.fillStyle = '#ffffff'; x.font = `900 22px ${FONT_TC}`; x.textAlign = 'center';
      x.fillText('臺北市信義區', w / 2, 24);
      x.fillStyle = '#334155'; x.font = `900 32px ${FONT_TC}`;
      x.fillText('光復南路271號', w / 2, 76);
    }, { text: true });
    const addrMesh = new T.Mesh(new T.PlaneGeometry(1.15, 0.50), new T.MeshBasicMaterial({ map: addrTex }));
    addrMesh.position.set(-0.78, 2.15, -(half + 0.5));
    addrMesh.rotation.y = -Math.PI / 2;
    g.add(addrMesh);

    const wingN = G(g, 0, 0, -(half + 2.2));
    M(box(1.10, 2.45, 2.2), '#f6f0e2', { y: 1.225, parent: wingN, edge: 28 });
    M(box(1.18, 0.50, 2.28), '#dc886c', { y: 0.50, parent: wingN, edge: 28 });
    M(box(1.26, 0.20, 2.40), '#e2d8c5', { y: 2.52, parent: wingN, edge: 28 });

    [-1, 1].forEach(s => {
      const ig = G(g, 0, 0, s * (half - 1.55));
      M(box(0.10, 1.95, 2.4), '#4c7a62', { y: 1.05, parent: ig, mat: pbr('#4c7a62', { metalness: 0.4, roughness: 0.35 }) });
      for (let k = -1.0; k <= 1.0; k += 0.25) {
        M(cyl(0.025, 0.025, 2.05, 8), '#4c7a62', { y: 1.08, z: k, parent: ig });
        M(new T.ConeGeometry(0.05, 0.14, 6), '#f6c453', { y: 2.15, z: k, parent: ig });
      }
    });

    const guard = G(g, 2.8, 0, half + 3.4);
    addContactShadow(guard, 2.6, 0.03, 0.68);
    M(box(3.6, 2.9, 3.8), '#faf6ee', { y: 1.45, parent: guard, edge: 28 });
    M(box(3.68, 0.72, 3.88), '#dc886c', { y: 0.48, parent: guard, edge: 28 });
    M(box(3.75, 1.15, 3.95), '#90caf9', { y: 1.68, parent: guard, edge: 28, pbr: { roughness: 0.2, metalness: 0.45 } });
    M(box(4.2, 0.32, 4.4), '#5882b8', { y: 3.05, parent: guard, edge: 28 });

    W.circles.push({ x: Gt.x, z: Gt.z0 - 0.5, r: 1.1 }, { x: Gt.x, z: Gt.z1 + 0.5, r: 1.1 });
  }

  /* =====================================================================
   * 擬真自然樹木與椰林系統（Photorealistic Foliage Trees & Palms with Gentle Wind Sway）
   * ===================================================================== */
  function buildTrees() {
    const C = LAYOUT.campus, pts = [];
    const add = (x, z, s = 1, inside = true) => { pts.push([x, z, s]); if (inside) W.circles.push({ x, z, r: 0.55 * s }); };
    for (let x = C.x0 + 2; x < C.x1 - 1; x += 4.8) add(x + srnd(-0.6, 0.6), C.z0 + 3.5 + srnd(-0.8, 0.8), srnd(1, 1.35));
    for (let z = C.z0 + 9; z < -34; z += 5.2) add(C.x0 + 3 + srnd(-0.4, 0.4), z, srnd(0.95, 1.25));
    for (let z = -30; z < 20; z += 6) add(C.x1 - 1.6, z + srnd(-0.8, 0.8), 0.9);
    [[41, -74], [41, -36], [-30, -33], [-18, -33], [-44, -33]].forEach(([x, z]) => add(x, z, 1.15));
    [[82, -35], [82, -15], [82, 32], [82, 52], [-68, -98], [24, -98]].forEach(([x, z]) => add(x, z, 1.35, false));
    instTrees(pts);

    [
      [-55, 7.2], [-46, 7.2], [-37, 7.2], [-28, 7.2], [-19, 7.2],
      [-55, 20.8], [-46, 20.8], [-37, 20.8], [-28, 20.8], [-19, 20.8],
      [-54, -1.4], [-40, -1.4], [-26, -1.4], [-13, -1.4], [-56, 27.5], [-16, 29], [-12, 58]
    ].forEach(([x, z]) => palm(x, z, srnd(7.8, 10.0)));
  }

  function instTrees(pts) {
    // 為樹冠的 6 個子葉團賦予不同明暗與色溫頂點色（頂部嫩黃綠向陽高光、中層翠綠、底層與內側深林綠陰影），創造豐富立體層次！
    const lobeSpecs = [
      { r: 1.75, x: 0, y: 0.78, z: 0, c: '#9cd264' },
      { r: 1.38, x: 1.12, y: 0.22, z: 0.42, c: '#7cb848' },
      { r: 1.32, x: -1.08, y: 0.28, z: -0.38, c: '#88c452' },
      { r: 1.24, x: 0.12, y: 1.92, z: -0.25, c: '#d2f288' },
      { r: 1.18, x: -0.22, y: 0.35, z: 1.15, c: '#aadf70' },
      { r: 1.05, x: 0.65, y: 1.45, z: 0.55, c: '#e4fa9c' }
    ];
    const crownLobes = lobeSpecs.map(sp => {
      const g = sSph(sp.r, 16, 12).translate(sp.x, sp.y, sp.z);
      const pos = g.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const baseC = new T.Color(sp.c);
      const topC = new T.Color('#f4ffbe');
      const botC = new T.Color('#649638');
      const tmpC = new T.Color();
      for (let k = 0; k < pos.count; k++) {
        const vy = pos.getY(k);
        const t = T.MathUtils.clamp((vy + 0.8) / 3.4, 0, 1);
        tmpC.copy(botC).lerp(baseC, Math.min(1, t * 1.35)).lerp(topC, Math.max(0, (t - 0.52) * 1.25));
        colors[k * 3] = tmpC.r;
        colors[k * 3 + 1] = tmpC.g;
        colors[k * 3 + 2] = tmpC.b;
      }
      g.setAttribute('color', new T.BufferAttribute(colors, 3));
      return g;
    });
    const crownGeo = mergeGeos(crownLobes);

    // 樹幹加上根部張開與頂部分枝結構，並套用立體木紋與凹凸光影貼圖
    const trunkGeo = mergeGeos([
      cyl(0.22, 0.42, 3.0, 14).translate(0, 0, 0),
      cyl(0.11, 0.19, 1.35, 10).rotateZ(0.52).translate(-0.34, 1.15, 0.10),
      cyl(0.10, 0.18, 1.25, 10).rotateZ(-0.48).rotateY(0.8).translate(0.32, 1.08, -0.18)
    ]);

    const n = pts.length;
    const trunkMat = pbr('#ffffff', {
      map: getBarkTex(),
      bumpMap: getBarkBumpTex(),
      bumpScale: 0.08,
      natural: true,
      roughness: 0.82
    });
    const crownMat = pbr('#ffffff', {
      map: getLeafClusterTex(),
      vertexColors: true,
      natural: true,
      roughness: 0.52
    });
    const trunk = new T.InstancedMesh(trunkGeo, trunkMat, n);
    const crown = new T.InstancedMesh(crownGeo, crownMat, n);
    const shadowGeo = new T.PlaneGeometry(3.8, 3.8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new T.MeshBasicMaterial({ map: getAOShadowTex(), transparent: true, opacity: 0.58, depthWrite: false });
    const treeShadows = new T.InstancedMesh(shadowGeo, shadowMat, n);

    const o = new T.Object3D(), col = new T.Color();
    // 豐富四季校園樹種色調（翠綠樟樹、金綠楓香、深綠榕樹、暖橄欖台灣欒樹、嫩綠青楓）
    const greens = ['#ffffff', '#eef8d4', '#d8f0c8', '#f6f2c4', '#cce8b8', '#e4f6be'];
    const baseData = [];
    pts.forEach(([x, z, s], i) => {
      const ry = srnd(0, 6.28);
      o.position.set(x, 1.5 * s, z); o.rotation.set(0, ry, 0); o.scale.setScalar(s); o.updateMatrix();
      trunk.setMatrixAt(i, o.matrix);
      o.position.set(x, 3.4 * s, z); o.updateMatrix();
      crown.setMatrixAt(i, o.matrix);
      crown.setColorAt(i, col.set(greens[i % greens.length]));
      o.position.set(x, 0.055, z); o.rotation.set(0, 0, 0); o.scale.setScalar(s); o.updateMatrix();
      treeShadows.setMatrixAt(i, o.matrix);
      baseData.push({ x, z, s, ry, ph: x * 0.09 + z * 0.07 + i * 0.37 });
    });
    [trunk, crown].forEach(m => { m.castShadow = true; m.receiveShadow = true; W.scene.add(m); });
    W.scene.add(treeShadows);

    const dummy = new T.Object3D();
    W.updaters.push(t => {
      if (W.reduced) return;
      for (let i = 0; i < n; i++) {
        const b = baseData[i];
        const w1 = Math.sin(t * 1.8 + b.ph);
        const w2 = Math.cos(t * 1.4 + b.ph * 1.3);
        dummy.position.set(b.x + w1 * 0.14 * b.s, (3.4 + w2 * 0.04) * b.s, b.z + w2 * 0.10 * b.s);
        dummy.rotation.set(w2 * 0.07, b.ry + w1 * 0.05, w1 * 0.085);
        dummy.scale.set(b.s * (1 + w1 * 0.025), b.s * (1 - w1 * 0.02), b.s * (1 + w2 * 0.025));
        dummy.updateMatrix();
        crown.setMatrixAt(i, dummy.matrix);
      }
      crown.instanceMatrix.needsUpdate = true;
    });
  }

  function palm(x, z, h) {
    const g = G(null, x, 0, z), bend = srnd(-0.08, 0.08);
    addContactShadow(g, 1.85, 0.055, 0.65);
    M(cyl(0.22, 0.38, h, 14), '#d8cbb8', { y: h / 2, rz: bend, parent: g, pbr: { map: getBarkTex(), bumpMap: getBarkBumpTex(), bumpScale: 0.06, natural: true, roughness: 0.80 } });
    M(cyl(0.24, 0.22, 1.2, 12), '#5c8a3c', { y: h - 0.4, rz: bend, parent: g, pbr: { natural: true } });
    const top = G(g, -Math.sin(bend) * h, h, 0);
    const fronds = [];
    const palmCols = ['#96c854', '#5c8c34', '#7eb244', '#487426', '#88bc4c', '#52822c', '#a2d260', '#4e7c2a', '#76aa3e', '#629438'];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2, l = G(top);
      l.rotation.y = a;
      const tier = (i & 1) ? -0.12 : 0.10;
      const palmTintCols = ['#e6f9b8', '#b8e088', '#d2f29c', '#9ec86e', '#daf6a8', '#aad478', '#f0fcc8', '#a4ce72', '#c8ec92', '#b2dc80'];
      const frond = M(new T.ConeGeometry(0.58, 3.9, 5), palmTintCols[i], { y: -0.22 + tier, z: 1.75, rx: Math.PI / 2 + 0.48 - tier * 0.6, s: [1, 1, 0.22], parent: l, pbr: { map: getLeafClusterTex(), natural: true, roughness: 0.52 } });
      fronds.push({ m: frond, ph: i * 0.65, baseRx: Math.PI / 2 + 0.48 - tier * 0.6 });
    }
    const ph = srnd(0, 6);
    W.updaters.push(t => {
      if (W.reduced) return;
      top.rotation.z = Math.sin(t * 1.5 + ph) * 0.085;
      top.rotation.x = Math.cos(t * 1.2 + ph) * 0.065;
      fronds.forEach(f => {
        f.m.rotation.x = f.baseRx + Math.sin(t * 2.5 + ph + f.ph) * 0.09;
      });
    });
    W.circles.push({ x, z, r: 0.45 });
  }

  /* =====================================================================
   * 西南生態花園：恢復實景「荷花生態池」＋ 全面植入截圖「Aurelia Garden 擬真自然大波斯菊與菊科野花海（隨風輕輕搖曳）」！
   * ===================================================================== */
  function buildGarden() {
    const Gd = LAYOUT.garden, cx = (Gd.x0 + Gd.x1) / 2, cz = (Gd.z0 + Gd.z1) / 2;
    flat(Gd.x1 - Gd.x0, Gd.z1 - Gd.z0, pbr('#ffffff', { map: grassTex([10, 8]), natural: true }), cx, cz, 0.05);

    // 截圖 Aurelia Garden 花海中央同款：柔和溫潤泥土步道穿梭於左右兩側盛開的大波斯菊花海之間！
    const path = new T.Mesh(new T.RingGeometry(9.6, 11.4, 48), pbr('#b8a486', { natural: true, roughness: 0.78 }));
    path.rotation.x = -Math.PI / 2; path.position.set(cx, 0.07, cz); path.receiveShadow = true; W.scene.add(path);
    flat(11, 2.2, pbr('#b8a486', { natural: true, roughness: 0.78 }), Gd.x0 + 4, cz, 0.07);
    flat(2.2, 7.5, pbr('#b8a486', { natural: true, roughness: 0.78 }), cx, Gd.z0 + 3, 0.07);

    const px = cx + 2.2, pz = cz + 1.5, pr = 5.6;
    const pondG = G(null, px, 0, pz);

    // 池底深淺鵝卵石與水草水底漸層貼圖
    const bedTex = canvasTex(256, 256, (x, w, h) => {
      const g = x.createRadialGradient(w / 2, h / 2, 12, w / 2, h / 2, w / 2);
      g.addColorStop(0, '#164e63');
      g.addColorStop(0.65, '#1e606e');
      g.addColorStop(1, '#3b6e5c');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 180; i++) {
        x.fillStyle = (i & 1) ? 'rgba(20, 50, 45, 0.35)' : 'rgba(120, 175, 160, 0.18)';
        x.beginPath();
        x.arc((i * 73) % w, (i * 139) % h, 4 + (i % 9), 0, Math.PI * 2);
        x.fill();
      }
    });
    const pondBed = new T.Mesh(new T.CircleGeometry(pr, 48), pbr('#ffffff', { map: bedTex, natural: true, roughness: 0.85 }));
    pondBed.rotation.x = -Math.PI / 2; pondBed.position.y = 0.05; pondG.add(pondBed);

    // 擬真動態波光瀲灩與同心漣漪荷花池水面 Shader (Animated Caustics, Concentric Lotus Ripples & Sun Sparkles)
    const waterUniforms = {
      uTime: { value: 0 }
    };
    const waterShaderMat = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: waterUniforms,
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying float vWave;
        void main() {
          vUv = uv;
          vec3 p = position;
          float r = length(p.xy);
          float w1 = sin(p.x * 2.8 + uTime * 2.2) * cos(p.y * 2.6 - uTime * 1.8) * 0.018;
          float w2 = sin(r * 6.5 - uTime * 3.0) * 0.012;
          p.z += w1 + w2;
          vWave = w1 + w2;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying float vWave;
        void main() {
          vec2 p = (vUv - 0.5) * 11.2;
          float dist = length(p);

          // 多重交織水波紋與陽光焦散網紋 (Water Caustics & Wave Interference)
          float c1 = sin(p.x * 3.4 + uTime * 1.9 + sin(p.y * 2.7 + uTime * 1.4));
          float c2 = cos(p.y * 3.8 - uTime * 2.1 + cos(p.x * 3.1 - uTime * 1.6));
          float caustics = smoothstep(0.35, 0.95, (c1 * c2) * 0.5 + 0.5);

          // 荷葉與錦鯉周圍擴散的同心圓漣漪環 (Expanding Concentric Ripples)
          float rip1 = smoothstep(0.72, 0.96, sin(length(p - vec2(-1.6, -1.5)) * 8.5 - uTime * 3.4));
          float rip2 = smoothstep(0.72, 0.96, sin(length(p - vec2(1.8, 1.3)) * 8.0 - uTime * 3.1 + 1.8));
          float rip3 = smoothstep(0.72, 0.96, sin(length(p - vec2(0.3, -0.5)) * 9.0 - uTime * 3.8 + 3.5));
          float rip4 = smoothstep(0.75, 0.97, sin(dist * 6.0 + uTime * 2.2));
          float ripples = clamp(rip1 + rip2 + rip3 + rip4 * 0.45, 0.0, 1.0);

          // 水色由池心深碧綠藍過渡至池岸清澈淺翠藍
          vec3 deepCol = vec3(0.14, 0.48, 0.58);
          vec3 midCol  = vec3(0.24, 0.66, 0.76);
          vec3 edgeCol = vec3(0.46, 0.80, 0.84);
          float edgeFactor = smoothstep(0.0, 5.4, dist);
          vec3 col = mix(deepCol, midCol, smoothstep(0.0, 3.8, dist));
          col = mix(col, edgeCol, smoothstep(3.8, 5.5, dist));

          // 疊加天空柔光反射、水波焦散與白色細緻漣漪線
          col += vec3(0.22, 0.34, 0.38) * caustics * 0.55;
          col = mix(col, vec3(0.92, 0.98, 1.0), ripples * 0.48);

          // 閃爍的陽光波光亮點 (Sun Specular Glints)
          float glint = pow(max(0.0, sin(p.x * 6.2 + uTime * 3.2) * cos(p.y * 5.8 - uTime * 2.9)), 10.0);
          col += vec3(1.0, 0.99, 0.90) * glint * 0.75;

          float alpha = mix(0.86, 0.74, edgeFactor);
          gl_FragColor = vec4(col, alpha);
        }
      `
    });
    const pondSurface = new T.Mesh(new T.CircleGeometry(pr - 0.08, 64), waterShaderMat);
    pondSurface.rotation.x = -Math.PI / 2;
    pondSurface.position.y = 0.14;
    pondG.add(pondSurface);
    W.updaters.push(t => {
      waterUniforms.uTime.value = t;
    });

    // 擬真不規則自然岩石池岸（消除反光金屬感，採用高粗糙度啞光花崗岩／溪石貼圖與不規則多面體頂點置換！）
    const rockTex = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#8b8378';
      x.fillRect(0, 0, w, h);
      // 礦物結晶顆粒、暗色石紋裂隙與池畔自然青苔斑點
      for (let i = 0; i < 2200; i++) {
        const rx = (i * 79) % w, ry = (i * 131) % h;
        x.fillStyle = (i % 4 === 0) ? 'rgba(42, 38, 34, 0.38)' : ((i % 4 === 1) ? 'rgba(215, 206, 192, 0.32)' : ((i % 7 === 0) ? 'rgba(84, 112, 58, 0.28)' : 'rgba(118, 110, 98, 0.25)'));
        x.fillRect(rx, ry, 2 + (i % 4), 2 + (i % 3));
      }
      x.strokeStyle = 'rgba(38, 34, 30, 0.35)';
      for (let k = 0; k < 28; k++) {
        x.lineWidth = 1 + (k % 2);
        x.beginPath();
        const sx = (k * 67) % w, sy = (k * 97) % h;
        x.moveTo(sx, sy);
        x.lineTo(sx + 18 - (k % 9) * 4, sy + 14 + (k % 7) * 3);
        x.stroke();
      }
    });

    // 預建立 4 種不同不規則切面與稜角的自然溪石幾何體
    const craggyRockGeos = [0, 1, 2, 3].map(seed => {
      const rg = new T.DodecahedronGeometry(1, 1);
      const pos = rg.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        const vx = pos.getX(k), vy = pos.getY(k), vz = pos.getZ(k);
        // 利用確定性三角函數對每個頂點做不規則自然岩石切削與底部壓平
        const n1 = Math.sin(vx * 3.7 + seed * 1.9) * Math.cos(vy * 3.2 - seed * 1.3) * 0.22;
        const n2 = Math.cos(vz * 4.1 + vx * 2.3 + seed * 2.7) * 0.16;
        const sc = 1.0 + n1 + n2;
        pos.setXYZ(k, vx * sc, vy < 0 ? vy * 0.55 : vy * sc * 0.88, vz * sc);
      }
      rg.computeVertexNormals();
      return rg;
    });

    const rockCols = ['#8c8479', '#9e9588', '#787167', '#a69d8e', '#6e685f', '#82877a'];
    const rockMats = rockCols.map(c => new T.MeshStandardMaterial({
      color: c,
      map: rockTex,
      bumpMap: rockTex,
      bumpScale: 0.045,
      roughness: 0.92,
      metalness: 0.0
    }));

    for (let i = 0; i < 42; i++) {
      const ang = (i / 42) * Math.PI * 2 + srnd(-0.04, 0.04);
      const rr = pr - 0.12 + srnd(-0.24, 0.26);
      const rx = Math.cos(ang) * rr, rz = Math.sin(ang) * rr;
      // 避開左側木棧觀察平台區域，不讓石頭穿模在木棧板上
      if (rx < -pr + 1.85 && Math.abs(rz) < 2.65) continue;
      const sx = srnd(0.42, 0.82), sy = srnd(0.24, 0.48), sz = srnd(0.42, 0.78);
      const rMesh = new T.Mesh(craggyRockGeos[i % craggyRockGeos.length], rockMats[i % rockMats.length]);
      rMesh.position.set(rx, sy * 0.36, rz);
      rMesh.rotation.set(srnd(-0.18, 0.18), srnd(0, 6.28), srnd(-0.18, 0.18));
      rMesh.scale.set(sx, sy, sz);
      rMesh.castShadow = true;
      rMesh.receiveShadow = true;
      pondG.add(rMesh);
    }

    const deck = G(pondG, -pr + 0.4, 0, 0);
    M(box(2.8, 0.18, 5.2), '#c48b60', { y: 0.32, parent: deck });
    [-2.3, -0.8, 0.8, 2.3].forEach(dz => {
      M(cyl(0.12, 0.12, 0.95, 10), '#9c6842', { x: 1.2, y: 0.48, z: dz, parent: deck });
      M(cyl(0.12, 0.12, 0.95, 10), '#9c6842', { x: -1.2, y: 0.48, z: dz, parent: deck });
    });
    M(box(0.14, 0.12, 5.0), '#a87248', { x: 1.2, y: 0.95, parent: deck });

    const padCoords = [
      [-1.8, -1.6, 0.62], [-0.5, -2.4, 0.52], [1.6, -1.9, 0.68], [2.5, -0.6, 0.55],
      [2.1, 1.4, 0.64], [0.6, 2.3, 0.58], [-1.4, 2.1, 0.66], [-2.2, 0.8, 0.50],
      [0.2, -0.4, 0.60], [1.2, 0.4, 0.48], [-0.8, 0.9, 0.54], [2.9, 0.6, 0.46]
    ];
    padCoords.forEach(([lx, lz, lr], idx) => {
      const lg = G(pondG, lx, 0.16, lz);
      const padGeo = new T.CircleGeometry(lr, 20, 0.15, Math.PI * 2 - 0.30);
      const padM = M(padGeo, idx % 2 === 0 ? '#689e3c' : '#588c30', { rx: -Math.PI / 2, rz: idx * 1.1, parent: lg, cast: false, pbr: { natural: true } });
      padM.receiveShadow = true;
      if (idx % 2 === 0) {
        const flG = G(lg, 0.12, 0.04, 0.08);
        const petalCol = idx % 4 === 0 ? '#f472b6' : '#ffffff';
        for (let p = 0; p < 8; p++) {
          const pa = (p / 8) * Math.PI * 2;
          M(new T.ConeGeometry(0.09, 0.26, 6), petalCol, {
            x: Math.cos(pa) * 0.10, y: 0.08, z: Math.sin(pa) * 0.10,
            rx: Math.PI / 2 - 0.45, ry: -pa + Math.PI / 2, parent: flG
          });
        }
        M(sSph(0.075, 10, 8), '#fde047', { y: 0.09, parent: flG });
      }
    });

    // 荷花池裡悠游的錦鯉群
    const kois = [];
    const koiCols = [['#f97316', '#ffffff'], ['#ef4444', '#fde047'], ['#ffffff', '#ef4444'], ['#fb923c', '#ffffff']];
    for (let i = 0; i < 10; i++) {
      const [c1, c2] = koiCols[i % koiCols.length];
      const kg = G(pondG);
      M(sSph(0.14, 12, 10), c1, { s: [0.55, 0.42, 1.65], parent: kg });
      M(sSph(0.09, 10, 8), c2, { y: 0.02, z: 0.05, s: [0.58, 0.45, 0.9], parent: kg });
      const tail = M(new T.ConeGeometry(0.09, 0.22, 4), c1, { z: -0.26, rx: -Math.PI / 2, s: [0.35, 1, 1.2], parent: kg });
      kois.push({ kg, tail, r: 1.2 + (i % 4) * 0.95, spd: 0.38 + (i % 3) * 0.12, ph: i * 1.1, dir: i % 2 === 0 ? 1 : -1 });
    }
    W.updaters.push(t => {
      if (W.reduced) return;
      kois.forEach(k => {
        const a = t * k.spd * k.dir + k.ph;
        const kx = Math.cos(a) * k.r, kz = Math.sin(a * 1.2) * k.r * 0.85;
        const dx = -Math.sin(a) * k.r * k.spd * k.dir, dz = Math.cos(a * 1.2) * 1.2 * k.r * 0.85 * k.spd * k.dir;
        k.kg.position.set(kx, 0.11, kz);
        k.kg.rotation.y = Math.atan2(dx, dz);
        k.tail.rotation.y = Math.sin(t * 12 + k.ph) * 0.35;
      });
    });

    // ==================== 植入截圖「Aurelia Garden 擬真自然大波斯菊與野花花海（隨風輕輕搖曳）」！ ====================
    // 調整為精緻可愛的小腿至膝蓋以下高度（約 0.24m ～ 0.42m，花冠直徑約 0.24m），絕不遮擋學童主角與鏡頭視線！
    const stemGeo = mergeGeos([
      cyl(0.009, 0.014, 0.34, 6).translate(0, 0.17, 0),
      new T.ConeGeometry(0.024, 0.12, 4).scale(1, 1, 0.25).rotateZ(0.68).translate(-0.04, 0.15, 0),
      new T.ConeGeometry(0.024, 0.11, 4).scale(1, 1, 0.25).rotateZ(-0.65).translate(0.04, 0.21, 0)
    ]);
    const stemMat = pbr('#587e34', { natural: true, roughness: 0.68 });

    // 精緻比例 3D 立體多角度盛開大波斯菊與瑪格麗特花冠（高度約 0.35m，完美襯托學童腳邊花海！）
    const dish1 = new T.PlaneGeometry(0.28, 0.28);
    dish1.rotateX(-Math.PI / 2 + 0.48);
    dish1.translate(0, 0.345, 0.012);
    const dish2 = new T.PlaneGeometry(0.26, 0.26);
    dish2.rotateZ(Math.PI / 8);
    dish2.rotateX(-Math.PI / 2 - 0.45);
    dish2.rotateY(Math.PI * 0.45);
    dish2.translate(0, 0.35, -0.01);
    const dish3 = new T.PlaneGeometry(0.25, 0.25);
    dish3.rotateZ(Math.PI / 12);
    dish3.rotateX(-Math.PI / 2 + 0.16);
    dish3.translate(0, 0.355, 0.0);
    const corollaGeo = mergeGeos([dish1, dish2, dish3]);

    const flowerMats = getCosmosFlowerMats(); // 5 種截圖擬真花色材質 (薰衣草粉紫、洋紅紫、奶油黃、珊瑚橘、櫻花粉)
    const buckets = [[], [], [], [], []];

    const addFlowerInstance = (fx, fy, fz, sc, matIdx) => {
      const tiltX = srnd(-0.22, 0.26);
      const ry = srnd(0, Math.PI * 2);
      buckets[matIdx % 5].push({
        x: fx, y: fy, z: fz, sc, ry, tiltX,
        ph: fx * 0.22 + fz * 0.18 + srnd(0, 3.14)
      });
    };

    // 1. 生態花園與步道兩側分群種植（重現截圖左側薰衣草粉紫花海、右側奶油檸檬黃與珊瑚橘花海的絕美自然聚落！）
    for (let i = 0; i < (isMobile ? 650 : 1280); i++) {
      const fx = srnd(Gd.x0 + 0.8, Gd.x1 - 0.8);
      const fz = srnd(Gd.z0 + 0.8, Gd.z1 - 0.8);
      const distCenter = Math.hypot(fx - cx, fz - cz);
      const distPond = Math.hypot(fx - px, fz - pz);
      if ((distCenter > 9.1 && distCenter < 11.7) || distPond < pr + 0.35) continue;
      // 左半側以薰衣草粉紫 (0)、洋紅紫 (1)、櫻花粉 (4) 為主；右半側以奶油黃 (2)、珊瑚橘 (3) 為主並自然交織！
      const isRightSide = fx > cx - 1.5;
      let mIdx;
      const r = srnd(0, 1);
      if (!isRightSide) {
        mIdx = r < 0.46 ? 0 : (r < 0.68 ? 1 : (r < 0.84 ? 4 : (r < 0.93 ? 3 : 2)));
      } else {
        mIdx = r < 0.52 ? 2 : (r < 0.72 ? 3 : (r < 0.86 ? 0 : (r < 0.94 ? 4 : 1)));
      }
      addFlowerInstance(fx, 0.02, fz, srnd(0.68, 1.12), mIdx);
    }

    // 2. 校門迎賓大道南北兩側花台也種滿隨風搖曳的 Aurelia Garden 大波斯菊花海！
    [-1, 1].forEach(side => {
      for (let i = 0; i < 95; i++) {
        const fx = srnd(-58.0, -20.0);
        const fz = 14 + side * 6.8 + srnd(-0.72, 0.72);
        const mIdx = side < 0 ? (i % 5 === 0 ? 2 : (i % 3 === 0 ? 1 : 0)) : (i % 4 === 0 ? 0 : (i % 3 === 0 ? 3 : 2));
        addFlowerInstance(fx, 0.38, fz, srnd(0.68, 1.05), mIdx);
      }
    });

    const allFlowers = buckets.flat();
    const totalF = allFlowers.length;
    const instStems = new T.InstancedMesh(stemGeo, stemMat, totalF);
    instStems.castShadow = true;
    W.scene.add(instStems);

    const instMeshes = buckets.map((bList, mIdx) => {
      const im = new T.InstancedMesh(corollaGeo, flowerMats[mIdx], Math.max(1, bList.length));
      im.castShadow = true;
      im.receiveShadow = true;
      W.scene.add(im);
      return im;
    });

    const dummyF = new T.Object3D();
    // 預先填入靜態初始矩陣
    let gIdx = 0;
    buckets.forEach((bList, mIdx) => {
      const im = instMeshes[mIdx];
      bList.forEach((fd, j) => {
        fd.globalIdx = gIdx++;
        dummyF.position.set(fd.x, fd.y, fd.z);
        dummyF.rotation.set(fd.tiltX, fd.ry, 0);
        dummyF.scale.setScalar(fd.sc);
        dummyF.updateMatrix();
        instStems.setMatrixAt(fd.globalIdx, dummyF.matrix);
        im.setMatrixAt(j, dummyF.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    });
    instStems.instanceMatrix.needsUpdate = true;

    // 隨風輕輕搖曳的柔和自然風場動畫 (Gentle Sinusoidal Breeze Animation)
    W.updaters.push(t => {
      if (W.reduced) return;
      buckets.forEach((bList, mIdx) => {
        const im = instMeshes[mIdx];
        for (let j = 0; j < bList.length; j++) {
          const fd = bList[j];
          const breezeX = Math.sin(t * 1.65 + fd.ph) * 0.14;
          const breezeZ = Math.cos(t * 1.25 + fd.ph * 0.85) * 0.11;
          dummyF.position.set(fd.x, fd.y, fd.z);
          dummyF.rotation.set(fd.tiltX + breezeX, fd.ry, breezeZ);
          dummyF.scale.setScalar(fd.sc);
          dummyF.updateMatrix();
          instStems.setMatrixAt(fd.globalIdx, dummyF.matrix);
          im.setMatrixAt(j, dummyF.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      });
      instStems.instanceMatrix.needsUpdate = true;
    });

    W.circles.push({ x: px, z: pz, r: pr - 0.2 });
    addLabel('植物詩文步道・荷花生態池', px, 5.2, pz);
  }

  /* =====================================================================
   * 3D 立體擬真自然草浪系統（隨風輕輕搖曳，與 Aurelia Garden 野花海完美交織）
   * ===================================================================== */
  function build3DGrass() {
    const bladeGeos = [];
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * Math.PI * 2 + (k % 3) * 0.18;
      const dist = k < 2 ? 0.04 : 0.10 + (k % 4) * 0.09;
      const h = 0.16 + (k % 4) * 0.045;
      const g = new T.ConeGeometry(0.020, h, 4);
      g.scale(1.0, 1.0, 0.28);
      g.rotateX(0.18 + (k % 3) * 0.09);
      g.rotateY(ang);
      g.translate(Math.cos(ang) * dist, h * 0.46, Math.sin(ang) * dist);
      bladeGeos.push(g);
    }
    const tuftGeo = mergeGeos(bladeGeos);

    const tufts = [];
    const Gd = LAYOUT.garden, gcx = (Gd.x0 + Gd.x1) / 2, gcz = (Gd.z0 + Gd.z1) / 2;
    for (let i = 0; i < (isMobile ? 1100 : 2100); i++) {
      const x = srnd(Gd.x0 + 0.6, Gd.x1 - 0.6);
      const z = srnd(Gd.z0 + 0.6, Gd.z1 - 0.6);
      const distCenter = Math.hypot(x - gcx, z - gcz);
      const distPond = Math.hypot(x - (gcx + 2.2), z - (gcz + 1.5));
      if ((distCenter > 9.2 && distCenter < 11.6) || distPond < 6.0) continue;
      tufts.push({ x, y: 0.04, z, s: srnd(0.95, 1.55), ry: srnd(0, 6.28) });
    }
    [-1, 1].forEach(side => {
      for (let i = 0; i < 180; i++) {
        tufts.push({
          x: srnd(-58.2, -19.5),
          y: 0.42,
          z: 14 + side * 6.8 + srnd(-0.72, 0.72),
          s: srnd(0.85, 1.35),
          ry: srnd(0, 6.28)
        });
      }
    });
    const C = LAYOUT.campus;
    for (let i = 0; i < 360; i++) {
      tufts.push({ x: srnd(C.x0 + 1.5, C.x1 - 1.5), y: 0.04, z: srnd(C.z0 + 0.8, C.z0 + 7.2), s: srnd(0.9, 1.45), ry: srnd(0, 6.28) });
    }

    const n = tufts.length;
    const grassMat = new T.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.62,
      metalness: 0.01
    });
    const instGrass = new T.InstancedMesh(tuftGeo, grassMat, n);
    instGrass.castShadow = true;
    instGrass.receiveShadow = true;

    const dummy = new T.Object3D();
    const col = new T.Color();
    // 截圖 Aurelia Garden 擬真自然草本色階（草綠、橄欖綠、嫩芽綠）
    const grassPalette = ['#5c8234', '#6c9240', '#4e7228', '#7aa24c', '#648a3a', '#86ae56'];
    tufts.forEach((tf, i) => {
      dummy.position.set(tf.x, tf.y, tf.z);
      dummy.rotation.set(0, tf.ry, 0);
      dummy.scale.setScalar(tf.s);
      dummy.updateMatrix();
      instGrass.setMatrixAt(i, dummy.matrix);
      instGrass.setColorAt(i, col.set(grassPalette[i % grassPalette.length]));
      tf.ph = tf.x * 0.18 + tf.z * 0.14 + (i % 7) * 0.25;
    });
    W.scene.add(instGrass);

    W.updaters.push(t => {
      if (W.reduced) return;
      for (let i = 0; i < n; i++) {
        const tf = tufts[i];
        const wave = Math.sin(t * 1.9 + tf.ph);
        const gust = Math.cos(t * 1.4 + tf.ph * 0.85);
        dummy.position.set(tf.x, tf.y, tf.z);
        dummy.rotation.set(wave * 0.18, tf.ry, gust * 0.14);
        dummy.scale.setScalar(tf.s);
        dummy.updateMatrix();
        instGrass.setMatrixAt(i, dummy.matrix);
      }
      instGrass.instanceMatrix.needsUpdate = true;
    });
  }

  /* =====================================================================
   * 校園動態生態系統：展翅飛翔小鳥群與花間飛舞彩蝶 (buildWildlife)
   * ===================================================================== */
  function buildWildlife() {
    const birds = [];
    const birdTypes = [
      { body: '#589ce0', wing: '#4285cc', tail: '#ffffff', beak: '#f26a6a', s: 1.15 },
      { body: '#f8fafc', wing: '#ffffff', tail: '#f1f5f9', beak: '#f6bd60', s: 1.25 },
      { body: '#b08264', wing: '#94684c', tail: '#785038', beak: '#fde047', s: 0.88 }
    ];

    for (let i = 0; i < 16; i++) {
      const bt = birdTypes[i % birdTypes.length];
      const bg = G(null);
      bg.scale.setScalar(bt.s);
      M(sSph(0.18, 12, 10), bt.body, { s: [0.65, 0.55, 1.35], parent: bg });
      M(sSph(0.12, 10, 8), bt.body, { y: 0.08, z: 0.22, parent: bg });
      M(new T.ConeGeometry(0.045, 0.14, 6), bt.beak, { y: 0.08, z: 0.35, rx: Math.PI / 2, parent: bg });
      M(box(0.14, 0.03, 0.38), bt.tail, { y: 0.02, z: -0.32, rx: -0.15, parent: bg });
      const wL = G(bg, 0.10, 0.06, 0.02);
      const wR = G(bg, -0.10, 0.06, 0.02);
      M(box(0.48, 0.025, 0.24), bt.wing, { x: 0.24, parent: wL });
      M(box(0.48, 0.025, 0.24), bt.wing, { x: -0.24, parent: wR });

      const cx = (i % 4 === 0) ? -25 : ((i % 4 === 1) ? 6 : ((i % 4 === 2) ? -6 : -35));
      const cz = (i % 4 === 0) ? 44 : ((i % 4 === 1) ? 16 : ((i % 4 === 2) ? -52 : 14));
      birds.push({
        bg, wL, wR, cx, cz,
        rx: 10 + (i % 5) * 4.5,
        rz: 8 + (i % 4) * 4.2,
        yBase: 5.2 + (i % 5) * 1.8,
        speed: 0.52 + (i % 4) * 0.12,
        ph: i * 1.15
      });
    }

    const butterflies = [];
    const bfCols = ['#fde047', '#7dd3fc', '#f9a8d4', '#d8b4fe', '#fdba74'];
    for (let i = 0; i < 14; i++) {
      const col = bfCols[i % bfCols.length];
      const bfg = G(null);
      const bwL = G(bfg, 0.01, 0, 0);
      const bwR = G(bfg, -0.01, 0, 0);
      M(new T.CircleGeometry(0.11, 8), col, { x: 0.08, rx: -Math.PI / 2, parent: bwL, cast: false, mat: new T.MeshBasicMaterial({ color: col, side: T.DoubleSide }) });
      M(new T.CircleGeometry(0.11, 8), col, { x: -0.08, rx: -Math.PI / 2, parent: bwR, cast: false, mat: new T.MeshBasicMaterial({ color: col, side: T.DoubleSide }) });
      const bx = i < 9 ? srnd(-44, -10) : srnd(-54, -22);
      const bz = i < 9 ? srnd(30, 56) : (14 + (i % 2 ? 6.8 : -6.8));
      butterflies.push({ bfg, bwL, bwR, bx, bz, ph: i * 0.9 });
    }

    W.updaters.push((t, dt) => {
      if (W.reduced) return;
      birds.forEach(b => {
        const ang = t * b.speed + b.ph;
        const x = b.cx + Math.cos(ang) * b.rx;
        const z = b.cz + Math.sin(ang) * b.rz;
        const y = b.yBase + Math.sin(t * 1.6 + b.ph) * 0.85;
        const dx = -Math.sin(ang) * b.rx * b.speed;
        const dz = Math.cos(ang) * b.rz * b.speed;
        b.bg.position.set(x, y, z);
        b.bg.rotation.y = Math.atan2(dx, dz);
        b.bg.rotation.z = -Math.cos(ang) * 0.22;
        const flap = Math.sin(t * 15 + b.ph) * 0.62;
        b.wL.rotation.z = flap;
        b.wR.rotation.z = -flap;
      });
      butterflies.forEach(bf => {
        const ang = t * 1.8 + bf.ph;
        bf.bfg.position.set(
          bf.bx + Math.cos(ang) * 1.4,
          0.65 + Math.sin(t * 3.5 + bf.ph) * 0.25,
          bf.bz + Math.sin(ang * 1.3) * 1.4
        );
        bf.bfg.rotation.y = ang + Math.PI / 2;
        const flap = Math.sin(t * 24 + bf.ph) * 0.85;
        bf.bwL.rotation.z = flap;
        bf.bwR.rotation.z = -flap;
      });
    });
  }

  /* =====================================================================
   * 闖關站：老師 NPC、地上光圈、頭頂科目牌、導航光柱
   * ===================================================================== */
  function badgeTex(info) {
    const c = document.createElement('canvas'); c.width = 320; c.height = 200;
    const x = c.getContext('2d');
    const draw = () => {
      x.clearRect(0, 0, 320, 200);
      x.fillStyle = info.done ? '#ffd166' : '#ffffff';
      x.strokeStyle = info.color || '#3b82f6';
      x.lineWidth = 10;
      x.beginPath(); x.roundRect(10, 10, 300, 140, 40); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(140, 148); x.lineTo(160, 185); x.lineTo(180, 148); x.closePath();
      x.fillStyle = info.color || '#3b82f6'; x.fill();
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      x.fillText(info.done ? '✅' : (info.icon || '❓'), 78, 82);
      x.fillStyle = '#243452'; x.font = `900 48px ${FONT_TC}`;
      const tw = x.measureText(info.label || '').width;
      if (tw > 190) x.font = `900 ${Math.floor(48 * 190 / tw)}px ${FONT_TC}`;
      x.fillText(info.label || '', 205, 84);
    };
    draw();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    if (document.fonts) document.fonts.ready.then(() => { draw(); t.needsUpdate = true; });
    return t;
  }

  function buildStations() {
    LAYOUT.stations.forEach((s, i) => {
      const npc = makeNPC(s.outfit);
      npc.scale.setScalar(s.outfit === 'principal' ? 0.78 : 0.74);
      npc.position.set(s.x, 0.05, s.z);
      const face = s.face || (s.id === 'campus' ? [LAYOUT.spawn.x, LAYOUT.spawn.z] : s.id === 'pe' ? [s.x, s.z + 10] : [-20, 14]);
      npc.rotation.y = Math.atan2(face[0] - s.x, face[1] - s.z);
      npc.userData.baseYaw = npc.rotation.y;
      W.scene.add(npc);
      W.circles.push({ x: s.x, z: s.z, r: 0.5 });

      const ring = new T.Mesh(
        new T.RingGeometry(1.7, 2.25, 48),
        new T.MeshBasicMaterial({ color: '#589ce0', transparent: true, opacity: 0.72, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2; ring.position.set(s.x, 0.1, s.z); W.scene.add(ring);

      const sp = new T.Sprite(new T.SpriteMaterial({ map: badgeTex({ label: '' }), depthTest: true, transparent: true }));
      sp.scale.set(1.55, 0.96, 1); sp.position.set(s.x, 3.1, s.z); sp.renderOrder = 10; W.scene.add(sp);

      const beam = new T.Mesh(
        new T.CylinderGeometry(0.65, 1.25, 12, 20, 1, true),
        new T.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })
      );
      beam.position.set(s.x, 6, s.z); beam.visible = false; W.scene.add(beam);

      // 若為 6 大互動體驗關卡，建立專屬 3D 特殊機關物件與 Nano Banana 2 立繪展板與地板材質！
      if (s.prop) {
        const pg = G(null, s.x, 0.05, s.z);
        const GA = window.GAME_ASSETS || {};
        // 載入 Nano Banana 2 場地材質貼於關卡互動底座
        if (s.texKey && GA[s.texKey]) {
          const padMat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 });
          const imgT = new Image();
          imgT.onload = () => {
            const tx = new T.Texture(imgT);
            tx.colorSpace = T.SRGBColorSpace;
            tx.needsUpdate = true;
            padMat.map = tx;
            padMat.needsUpdate = true;
          };
          imgT.src = GA[s.texKey];
          const pad = new T.Mesh(new T.CylinderGeometry(2.3, 2.45, 0.10, 32), padMat);
          pad.position.y = 0.04;
          pad.receiveShadow = true;
          pg.add(pad);
        }
        // 已移除懸浮 2D 立繪牌，改將 Nano Banana 2 表情直接貼合於 3D 關主頭部模型！
        // 依 6 大遊戲打造專屬 3D 校園特殊裝置物件
        if (s.prop === 'lava') {
          // 1. 地板是岩漿：冒煙熔岩裂縫與三座分類浮空石島
          [[-1.3, 0.55, -1.1, '#f97316'], [1.3, 0.72, -1.0, '#10b981'], [0, 0.88, -1.7, '#3b82f6']].forEach(([ix, iy, iz, col], idx) => {
            const isl = G(pg, ix, iy, iz);
            M(cyl(0.65, 0.45, 0.28, 8), '#57534e', { parent: isl, edge: 28 });
            M(cyl(0.68, 0.65, 0.08, 8), col, { y: 0.16, parent: isl });
            W.updaters.push(t => { isl.position.y = iy + Math.sin(t * 2.4 + idx * 1.5) * 0.14; });
          });
        } else if (s.prop === 'magnet') {
          // 2. 磁鐵滾球推推樂：巨型紅藍 U 型磁鐵拱門與懸浮磁力球
          const arch = G(pg, 0, 0, -1.4);
          M(cyl(0.24, 0.24, 1.8, 16), '#ef4444', { x: -0.95, y: 0.9, parent: arch });
          M(cyl(0.24, 0.24, 1.8, 16), '#3b82f6', { x: 0.95, y: 0.9, parent: arch });
          M(cyl(0.25, 0.25, 0.35, 16), '#e2e8f0', { x: -0.95, y: 0.18, parent: arch });
          M(cyl(0.25, 0.25, 0.35, 16), '#e2e8f0', { x: 0.95, y: 0.18, parent: arch });
          M(new T.TorusGeometry(0.95, 0.24, 14, 24, Math.PI), '#a855f7', { y: 1.8, parent: arch });
          const orb = M(sSph(0.36, 20, 16), '#38bdf8', { y: 1.15, parent: arch, pbr: { metalness: 0.5, roughness: 0.2 } });
          W.updaters.push(t => { orb.position.y = 1.15 + Math.sin(t * 3.2) * 0.22; orb.rotation.y = t * 1.8; });
        } else if (s.prop === 'rhythm') {
          // 3. 節奏字音跳舞機：發光四聲調霓虹彈跳踏墊與音符拱門
          const stg = G(pg, 0, 0, -1.45);
          ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6'].forEach((col, idx) => {
            const pad = M(cyl(0.46, 0.50, 0.18, 20), col, { x: (idx - 1.5) * 1.08, y: 0.12, parent: stg, pbr: { emissive: col, emissiveIntensity: 0.28 } });
            W.updaters.push(t => { pad.scale.y = 1 + Math.max(0, Math.sin(t * 4.5 + idx * 1.2)) * 0.65; });
          });
        } else if (s.prop === 'angle') {
          // 4. 角度投石車攻城防衛戰：3D 木造攻城投石車與紙箱怪靶標
          const cat = G(pg, -0.9, 0, -1.3);
          M(box(1.2, 0.22, 1.6), '#92400e', { y: 0.22, parent: cat, edge: 28 });
          [[-0.65, -0.55], [0.65, -0.55], [-0.65, 0.55], [0.65, 0.55]].forEach(([wx, wz]) => {
            M(cyl(0.28, 0.28, 0.14, 16), '#451a03', { x: wx, y: 0.28, z: wz, rz: Math.PI / 2, parent: cat });
          });
          const arm = G(cat, 0, 0.45, 0.2);
          M(box(0.14, 0.14, 1.65), '#b45309', { z: -0.6, parent: arm });
          M(sSph(0.24, 12, 10), '#38bdf8', { y: 0.15, z: -1.35, parent: arm });
          W.updaters.push(t => { arm.rotation.x = 0.35 + Math.abs(Math.sin(t * 2.2)) * 0.65; });
          // 紙箱怪目標
          const mon = G(pg, 1.35, 0, -1.4);
          M(box(0.85, 0.95, 0.85), '#d97706', { y: 0.48, parent: mon, edge: 28 });
          M(sSph(0.11, 10, 8), '#ffffff', { x: -0.18, y: 0.65, z: 0.43, parent: mon });
          M(sSph(0.11, 10, 8), '#ffffff', { x: 0.18, y: 0.65, z: 0.43, parent: mon });
        } else if (s.prop === 'eco') {
          // 5. 食物鏈大逃殺：森林生態圖騰柱（植物->毛毛蟲->麻雀->老鷹）
          const tot = G(pg, 0, 0, -1.4);
          M(cyl(0.42, 0.52, 2.2, 16), '#78350f', { y: 1.1, parent: tot, edge: 28 });
          M(new T.TorusGeometry(0.68, 0.06, 10, 24), '#84cc16', { y: 0.7, rx: Math.PI / 2, parent: tot });
          M(new T.TorusGeometry(0.56, 0.06, 10, 24), '#facc15', { y: 1.3, rx: Math.PI / 2, parent: tot });
          const eagle = G(tot, 0, 2.45, 0);
          M(sSph(0.28, 12, 10), '#f59e0b', { parent: eagle });
          M(box(1.35, 0.06, 0.32), '#d97706', { y: 0.08, parent: eagle });
          W.updaters.push(t => { eagle.rotation.y = t * 1.4; });
        } else if (s.prop === 'gear') {
          // 6. 齒輪光影解謎迷宮：黃金咬合齒輪塔與發光三稜鏡方尖碑
          const temple = G(pg, 0, 0, -1.45);
          M(cyl(0.35, 0.58, 1.8, 4), '#d97706', { y: 0.9, ry: Math.PI / 4, parent: temple, edge: 28 });
          const g1 = M(new T.TorusGeometry(0.52, 0.10, 8, 12), '#eab308', { x: -0.55, y: 1.1, z: 0.38, parent: temple });
          const g2 = M(new T.TorusGeometry(0.36, 0.09, 8, 10), '#facc15', { x: 0.32, y: 1.45, z: 0.38, parent: temple });
          const prism = M(new T.OctahedronGeometry(0.34, 0), '#38bdf8', { y: 2.25, parent: temple, pbr: { emissive: '#38bdf8', emissiveIntensity: 0.55 } });
          W.updaters.push(t => { g1.rotation.z = t * 1.5; g2.rotation.z = -t * 2.2; prism.rotation.y = t * 2.0; });
        }
      }
      const st = W.stations[s.id] = { ...s, npc, ring, sprite: sp, beam, info: {}, wave: 0, ph: i * 1.3, talkUntil: 0 };
      W.npcs.push(st);
      W.updaters.push((t, dt) => {
        const u = npc.userData, near = W.mode === 'play' && W._npc === s.id;
        const goal = near ? Math.atan2(cam.pos.x - npc.position.x, cam.pos.z - npc.position.z) : u.baseYaw;
        npc.rotation.y += (nearestAngle(npc.rotation.y, goal) - npc.rotation.y) * Math.min(1, dt * 4);
        u.head.rotation.y = near ? 0 : Math.sin(t * 0.7 + st.ph) * 0.28;
        u.anim(t, dt, st.talkUntil > t, 0, 0, 0, 0, false);
        st.wave = Math.max(0, st.wave - dt);
        if (st.wave > 0) {
          u.armR.rotation.z = 2.6 + Math.sin(t * 10) * 0.3;
          u.elR.rotation.z = 0.4;
        } else {
          u.elR.rotation.z = 0;
        }
        const k = W.reduced ? 1 : 1 + Math.sin(t * 3 + st.ph) * 0.08;
        ring.scale.set(k, k, k);
        sp.position.y = 3.1 + (W.reduced ? 0 : Math.sin(t * 2 + st.ph) * 0.10);
        const dist = W.camera.position.distanceTo(sp.position), sc = W.mode === 'play' ? Math.min(0.95, Math.max(0.62, dist / 28)) : Math.min(1.2, Math.max(0.8, dist / 42));
        sp.scale.set(1.55 * sc, 0.96 * sc, 1);
        sp.material.opacity = W.mode === 'play' ? T.MathUtils.clamp((dist - 5) / 7, 0.12, 1) : 1;
        if (beam.visible) beam.material.opacity = (W.mode === 'play' ? 0.10 : 0.0) + Math.sin(t * 2.5) * 0.03;
      });
    });
  }

  function setStationInfo(id, info) {
    const st = W.stations[id]; if (!st) return;
    st.info = info;
    st.sprite.material.map && st.sprite.material.map.dispose();
    st.sprite.material.map = badgeTex(info);
    st.sprite.material.needsUpdate = true;
    st.ring.material.color.set(info.done ? '#ffd166' : (info.color || '#3b82f6'));
  }
  function setGuide(id) { Object.values(W.stations).forEach(s => (s.beam.visible = s.id === id)); W.guide = id; }

  W.labels = [];
  function addLabel(text, x, y, z) {
    const lines = text.split('\n');
    const t = canvasTex(384, 108, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = 'rgba(30, 48, 72, 0.78)';
      c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 36); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `900 40px ${FONT_TC}`;
      c.fillText(lines[0], w / 2, h / 2 + 2);
    }, { text: true });
    const sp = new T.Sprite(new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    sp.position.set(x, y + 2.5, z); sp.scale.set(7.2, 2.0, 1); W.scene.add(sp); W.labels.push(sp);
  }

  /* =====================================================================
   * 校園裡的學童 NPC（含跑道跑步學童 ＋ 籃球場「正在投籃球的學童與進籃拋物線籃球動畫」）
   * ===================================================================== */
  function buildKids() {
    const Tk = LAYOUT.track, R = Tk.wid / 2 - 2.2, L = (Tk.len - Tk.wid) / 2, per = 4 * L + 2 * Math.PI * R;
    const at = (s) => {
      s = ((s % per) + per) % per;
      if (s < 2 * L) return [Tk.cx - L + s, Tk.cz - R, Math.PI / 2];
      s -= 2 * L;
      if (s < Math.PI * R) { const a = -Math.PI / 2 + s / R; return [Tk.cx + L + Math.cos(a) * R, Tk.cz + Math.sin(a) * R, Math.PI / 2 - s / R]; }
      s -= Math.PI * R;
      if (s < 2 * L) return [Tk.cx + L - s, Tk.cz + R, -Math.PI / 2];
      s -= 2 * L;
      const a = Math.PI / 2 + s / R;
      return [Tk.cx - L + Math.cos(a) * R, Tk.cz + Math.sin(a) * R, -Math.PI / 2 - s / R];
    };
    for (let i = 0; i < (isMobile ? 4 : 6); i++) {
      const k = makeNPC(i % 2 === 0 ? 'kidM' : 'kidF');
      k.scale.setScalar(0.56);
      const sp = 5.2 + srnd(0, 1.8), off = i * per / 6;
      W.scene.add(k); W.kids.push(k);
      W.updaters.push((t, dt) => {
        const [x, z, yaw] = at(t * sp + off);
        k.position.set(x, 0.05, z);
        k.rotation.y = yaw;
        k.userData.anim(t, dt, false, sp * 1.4, 0, 0, 0, false);
      });
    }

    // ==================== 籃球場正在投籃球的學童與 3D 拋物線進籃籃球動畫 ====================
    const bballTex = canvasTex(128, 128, (x, w, h) => {
      x.fillStyle = '#ea6a2a'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#6e3418'; x.lineWidth = 5;
      x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();
      x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
      x.beginPath(); x.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); x.stroke();
    });
    const bballMat = pbr('#ffffff', { map: bballTex, roughness: 0.55 });
    const bballGeo = sSph(0.145, 16, 12);

    // 在 3 座籃球場設置 6 位投籃與傳球學童（面對北側與南側籃框進行跳投，籃球畫出完美拋物線空心入網！）
    const shooters = [
      { ox: -21, side: 1, g: 'kidM', ph: 0.0 },
      { ox: -21, side: -1, g: 'kidF', ph: 1.3 },
      { ox: 0,   side: 1, g: 'kidF', ph: 0.7 },
      { ox: 0,   side: -1, g: 'kidM', ph: 2.0 },
      { ox: 21,  side: 1, g: 'kidM', ph: 0.4 },
      { ox: 21,  side: -1, g: 'kidF', ph: 1.7 }
    ];

    shooters.forEach(sh => {
      const hoopX = Tk.cx + sh.ox;
      const hoopZ = Tk.cz + sh.side * 14.4; // 籃框中心位置 (y = 3.0m)
      const standX = hoopX + (sh.side > 0 ? -0.35 : 0.35);
      const standZ = Tk.cz + sh.side * 9.8; // 罰球線投籃位置

      const k = makeNPC(sh.g);
      k.scale.setScalar(0.58);
      k.position.set(standX, 0.05, standZ);
      k.rotation.y = Math.atan2(hoopX - standX, hoopZ - standZ);
      W.scene.add(k);
      W.kids.push(k);
      W.circles.push({ x: standX, z: standZ, r: 0.35 });

      const ball = new T.Mesh(bballGeo, bballMat);
      ball.castShadow = true;
      W.scene.add(ball);
      const ballShadow = addContactShadow( null, 0.22, 0.08, 0.65, standX, standZ);

      W.updaters.push((t, dt) => {
        if (W.reduced) return;
        const cycle = 2.6;
        const tc = (t + sh.ph) % cycle;
        const u = k.userData;

        if (tc < 0.55) {
          // 階段 1：運球與屈膝準備起跳投籃
          const p = tc / 0.55;
          const dribbleY = 0.16 + Math.abs(Math.sin(p * Math.PI * 2)) * 0.48;
          k.userData.anim(t, dt, false, 0.5, 0, 0, 0, false);
          u.armR.rotation.x = -0.85 - Math.sin(p * Math.PI) * 0.55;
          u.armL.rotation.x = -0.75;
          const bx = standX + Math.sin(k.rotation.y) * 0.32;
          const bz = standZ + Math.cos(k.rotation.y) * 0.32;
          ball.position.set(bx, dribbleY, bz);
          ballShadow.position.set(bx, 0.08, bz);
        } else if (tc < 0.85) {
          // 階段 2：起跳雙手高舉出手投籃！
          const p = (tc - 0.55) / 0.30;
          const jy = Math.sin(p * Math.PI) * 0.34;
          k.userData.anim(t, dt, false, 0.5, jy, 1.2, 0, false);
          u.armL.rotation.x = -2.35;
          u.armR.rotation.x = -2.45;
          u.elL.rotation.x = 0.25;
          u.elR.rotation.x = 0.25;
          const bx = standX + Math.sin(k.rotation.y) * 0.26;
          const bz = standZ + Math.cos(k.rotation.y) * 0.26;
          ball.position.set(bx, 1.15 + jy, bz);
          ballShadow.position.set(bx, 0.08, bz);
        } else if (tc < 1.85) {
          // 階段 3：籃球沿高拋物線飛向籃框並空心穿網 (y = 3.0m)！
          const p = (tc - 0.85) / 1.0;
          k.userData.anim(t, dt, false, 0, 0, 0, 0, false);
          u.armL.rotation.x = T.MathUtils.lerp(-2.35, -0.2, p);
          u.armR.rotation.x = T.MathUtils.lerp(-2.45, -0.2, p);
          const startX = standX + Math.sin(k.rotation.y) * 0.26;
          const startZ = standZ + Math.cos(k.rotation.y) * 0.26;
          const bx = T.MathUtils.lerp(startX, hoopX, p);
          const bz = T.MathUtils.lerp(startZ, hoopZ, p);
          // 拋物線高度：從 1.35m 升至最高點 4.05m 再精準落入 3.0m 籃框！
          const by = (1 - p) * 1.35 + p * 3.0 + 4 * p * (1 - p) * 1.88;
          ball.position.set(bx, by, bz);
          ball.rotation.x -= dt * 10;
          ballShadow.position.set(bx, 0.08, bz);
        } else {
          // 階段 4：籃球穿過籃網垂直落下並在地板彈跳回傳！
          const p = (tc - 1.85) / 0.75;
          k.userData.anim(t, dt, false, 0.8, 0, 0, 0, false);
          const bx = T.MathUtils.lerp(hoopX, standX, p);
          const bz = T.MathUtils.lerp(hoopZ, standZ, p);
          const by = Math.max(0.16, (1 - p) * 2.85 * Math.abs(Math.cos(p * Math.PI * 2.2)));
          ball.position.set(bx, by, bz);
          ball.rotation.x += dt * 8;
          ballShadow.position.set(bx, 0.08, bz);
        }
      });
    });

    const C = LAYOUT.court;
    for (let i = 0; i < 4; i++) {
      const k = makeNPC(i % 2 === 0 ? 'kidF' : 'kidM');
      k.scale.setScalar(0.56);
      const x = C.x0 + 4 + i * 4.2, z = C.z0 + 5 + (i % 2) * 5.5, ph = i * 1.5;
      k.position.set(x, 0.05, z);
      k.rotation.y = i * 1.4;
      W.scene.add(k); W.kids.push(k); W.circles.push({ x, z, r: 0.35 });
      W.updaters.push((t, dt) => {
        const jy = Math.max(0, Math.sin(t * 3.2 + ph)) * 0.42;
        k.userData.anim(t, dt, false, 1.2, jy, Math.cos(t * 3.2 + ph) * 1.5, 0, false);
      });
    }
  }

  /* =====================================================================
   * 相機穩定系統（徹底消除主角行走時在特定視角的畫面左右晃動！）
   * ===================================================================== */
  const cam = {
    target: new V3(0, 0, 0), dist: 200, az: 0.6, el: 0.62,
    pos: new V3(LAYOUT.spawn.x, 0, LAYOUT.spawn.z),
    smoothFocus: new V3(LAYOUT.spawn.x, 1.24, LAYOUT.spawn.z),
    yaw: LAYOUT.spawn.yaw, pitch: -0.18,
    vel: new V3(), tpDist: 5.5, curDist: 5.5, jumpY: 0, vy: 0, prevYaw: 0
  };
  W.cam = cam;
  const nearestAngle = (from, to) => {
    let d = to - from;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return from + d;
  };

  function setMode(m) {
    if (m === W.mode) return;
    W.mode = m;
    if (m === 'bird') { cam.target.copy(cam.pos); cam.dist = 120; cam.el = 0.95; cam.az = cam.yaw; }
    if (m === 'title') { cam.target.set(0, 0, 0); cam.dist = 155; cam.el = 0.58; }
    if (m === 'play') { ensureAvatar(); W.snap = true; }
    if (m !== 'play' && W._npc) { W._npc = null; W.listeners.npc.forEach(f => f(null)); }
    W.listeners.mode.forEach(f => f(m));
  }
  function ensureAvatar() {
    if (W.avatar) return;
    W.avatar = makeNPC(W.avatarG === 'f' ? 'kidF' : 'kidM');
    W.avatar.scale.setScalar(0.60);
    W.scene.add(W.avatar);
  }
  function setAvatar(g) {
    W.avatarG = g;
    if (W.avatar) { W.scene.remove(W.avatar); W.avatar = null; }
    if (W.mode === 'play') ensureAvatar();
  }
  function triggerJump() {
    if (W.mode !== 'play' || W.locked) return;
    if (cam.jumpY <= 0.02) {
      cam.vy = 5.8;
      cam.jumpY = 0.03;
      spawnDust(cam.pos.x, 0.1, cam.pos.z, 5);
    }
  }

  function bindInput(el) {
    let pinch = null; const ptrs = new Map();
    el.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, e); el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return;
      const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, e);
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinch) zoom(pinch / d); pinch = d; return;
      }
      const dx = e.clientX - prev.clientX, dy = e.clientY - prev.clientY;
      if (W.mode === 'bird' || W.mode === 'title') {
        cam.az -= dx * 0.005; cam.el = T.MathUtils.clamp(cam.el + dy * 0.003, 0.2, 1.4);
      } else {
        cam.yaw -= dx * 0.0055; cam.pitch = T.MathUtils.clamp(cam.pitch - dy * 0.004, -0.9, 0.6);
      }
    });
    const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { e.preventDefault(); zoom(1 + Math.sign(e.deltaY) * 0.08); }, { passive: false });
    addEventListener('keydown', e => {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      W.keys[e.code] = true;
      if (e.code === 'Space') triggerJump();
    });
    addEventListener('keyup', e => { W.keys[e.code] = false; });
    addEventListener('blur', () => { W.keys = {}; });
  }
  function zoom(k) {
    if (W.mode === 'bird' || W.mode === 'title') cam.dist = T.MathUtils.clamp(cam.dist * k, 30, 175);
    else if (W.view === 'third') cam.tpDist = T.MathUtils.clamp(cam.tpDist * k, 2.4, 14);
  }

  const PR = 0.35;
  function resolveCollision(p) {
    const C = LAYOUT.campus;
    p.x = T.MathUtils.clamp(p.x, C.x0 + 0.8, C.x1 - 0.8);
    p.z = T.MathUtils.clamp(p.z, C.z0 + 0.8, C.z1 - 0.8);
    for (const b of W.boxes) {
      if (p.x > b.x0 - PR && p.x < b.x1 + PR && p.z > b.z0 - PR && p.z < b.z1 + PR) {
        const dl = p.x - (b.x0 - PR), dr = b.x1 + PR - p.x, dt = p.z - (b.z0 - PR), db = b.z1 + PR - p.z, m = Math.min(dl, dr, dt, db);
        if (m === dl) p.x = b.x0 - PR; else if (m === dr) p.x = b.x1 + PR; else if (m === dt) p.z = b.z0 - PR; else p.z = b.z1 + PR;
      }
    }
    for (const c of W.circles) {
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), rr = c.r + PR;
      if (d < rr && d > 0.0001) { p.x = c.x + dx / d * rr; p.z = c.z + dz / d * rr; }
    }
  }

  function getZoneName(x, z) {
    if (Math.hypot(x - (-21.8), z - 15.8) < 7) return '〈水袖〉與「光復」景觀字廣場';
    if (Math.hypot(x - LAYOUT.dome.x, z - LAYOUT.dome.z) < 25) return '光復樓（修澤蘭圓樓）';
    if (Math.hypot(x - (LAYOUT.court.x1 - 6.2), z - (LAYOUT.court.z1 - 5.5)) < 8) return '小光（貓頭鷹）溜滑梯';
    if (z < -32) return '200m 操場與籃球場';
    if (x < -12 && z > -6 && z < 26) return '椰林迎賓大道';
    if (x < -4 && z >= 26 && z <= 62) return '植物詩文步道・荷花生態池';
    if (x >= 12 && x <= 42 && z >= 22 && z <= 50) return '中庭綜合球場';
    if (z > 60) return '實踐樓／力行樓走廊';
    if (x > 38) return '仁愛樓／信義樓走廊';
    return '光復國小校園';
  }

  const ray = new T.Raycaster();
  function updatePlay(dt) {
    const k = W.keys;
    if (k.ArrowLeft) cam.yaw += dt * 2.3;
    if (k.ArrowRight) cam.yaw -= dt * 2.3;
    const fx = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) + W.move.y;
    const sx = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0) + W.move.x;
    const isRunning = k.ShiftLeft || k.ShiftRight || Math.hypot(W.move.x, W.move.y) > 0.92;
    const runMult = isRunning ? 1.78 : 1;
    const sp = 10.2 * runMult * (W.locked ? 0 : 1);
    const fwd = new V3(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)), right = new V3(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
    const want = fwd.multiplyScalar(fx).add(right.multiplyScalar(sx));
    if (want.lengthSq() > 1) want.normalize();
    cam.vel.lerp(want.multiplyScalar(sp), Math.min(1, dt * 14));
    const next = cam.pos.clone().addScaledVector(cam.vel, dt);
    resolveCollision(next);
    cam.pos.x = next.x; cam.pos.z = next.z;

    if (W.sun) {
      W.sun.target.position.set(cam.pos.x, 0, cam.pos.z);
      W.sun.position.copy(W.sun.target.position).add(W.sunOffset);
      W.sun.target.updateMatrixWorld();
    }

    if (cam.jumpY > 0 || cam.vy !== 0) {
      cam.jumpY += cam.vy * dt;
      cam.vy -= 15.5 * dt;
      if (cam.jumpY <= 0) {
        cam.jumpY = 0;
        cam.vy = 0;
        if (W.avatar) W.avatar.userData.landSquash = 1.0;
        spawnDust(cam.pos.x, 0.1, cam.pos.z, 6);
        W.listeners.land.forEach(fn => fn());
      }
    }

    const speed = cam.vel.length(), av = W.avatar;
    if (av) {
      av.visible = W.view === 'third';
      av.position.set(cam.pos.x, 0.05, cam.pos.z);
      let turnRate = 0;
      if (speed > 0.35) {
        const yaw = Math.atan2(cam.vel.x, cam.vel.z);
        const targetYaw = nearestAngle(av.rotation.y, yaw);
        turnRate = (targetYaw - av.rotation.y) / Math.max(dt, 0.016);
        av.rotation.y += (targetYaw - av.rotation.y) * Math.min(1, dt * 14);
      }
      av.userData.anim(W.clock.elapsedTime, dt, false, speed, cam.jumpY, cam.vy, turnRate, true);
    }

    // ==================== 零晃動穩定相機算法 ====================
    // 1. 讓目標點 cam.smoothFocus 平滑跟隨主角中心（不含角色走路的左右擺動，避免視角搖晃）
    const targetHead = new V3(cam.pos.x, 1.24 + cam.jumpY * 0.6, cam.pos.z);
    if (W.snap) {
      cam.smoothFocus.copy(targetHead);
      cam.curDist = cam.tpDist;
      W.snap = false;
    } else {
      cam.smoothFocus.lerp(targetHead, Math.min(1, dt * 18));
    }

    if (W.view === 'third') {
      const back = new V3(
        Math.sin(cam.yaw) * Math.cos(cam.pitch),
        -Math.sin(cam.pitch) + 0.24,
        Math.cos(cam.yaw) * Math.cos(cam.pitch)
      ).normalize();
      let wantDist = cam.tpDist;
      ray.set(cam.smoothFocus, back);
      ray.far = wantDist;
      const hit = ray.intersectObjects(W.solids, false)[0];
      if (hit) wantDist = Math.max(1.3, hit.distance - 0.45);
      // 平滑過渡相機距離，並讓 camera.position 與 camera.lookAt 完全鎖定同一個 smoothFocus，徹底消除任何視角左右偏擺晃動！
      cam.curDist = T.MathUtils.lerp(cam.curDist, wantDist, Math.min(1, dt * (wantDist < cam.curDist ? 16 : 8)));
      W.camera.position.copy(cam.smoothFocus).addScaledVector(back, cam.curDist);
      W.camera.position.y = Math.max(0.65, W.camera.position.y);
      W.camera.lookAt(cam.smoothFocus.x, cam.smoothFocus.y + 0.22, cam.smoothFocus.z);
    } else {
      const py = 1.25 + cam.jumpY;
      W.camera.position.set(cam.smoothFocus.x, py, cam.smoothFocus.z);
      W.camera.lookAt(
        cam.smoothFocus.x - Math.sin(cam.yaw) * Math.cos(cam.pitch),
        py + Math.sin(cam.pitch),
        cam.smoothFocus.z - Math.cos(cam.yaw) * Math.cos(cam.pitch)
      );
    }

    let near = null, best = 1e9;
    W.npcs.forEach(n => {
      const dd = Math.hypot(cam.pos.x - n.x, cam.pos.z - n.z);
      if (dd < 3.8 && dd < best) { best = dd; near = n.id; }
    });
    if (near !== W._npc) {
      W._npc = near;
      if (near) W.stations[near].wave = 2;
      W.listeners.npc.forEach(f => f(near));
    }
  }

  function updateOrbit(dt) {
    if (W.mode === 'title' && !W.reduced) cam.az += dt * 0.04;
    if (W.mode === 'bird') cam.target.lerp(new V3(cam.pos.x, 0, cam.pos.z), Math.min(1, dt * 2));
    const ce = Math.cos(cam.el);
    W.camera.position.set(
      cam.target.x + Math.sin(cam.az) * ce * cam.dist,
      cam.target.y + Math.sin(cam.el) * cam.dist,
      cam.target.z + Math.cos(cam.az) * ce * cam.dist
    );
    W.camera.lookAt(cam.target);
    if (W.sun) {
      W.sun.target.position.copy(cam.target);
      W.sun.position.copy(cam.target).add(W.sunOffset);
      W.sun.target.updateMatrixWorld();
    }
    if (W.avatar) {
      W.avatar.visible = W.mode === 'bird';
      W.avatar.position.set(cam.pos.x, 0.05, cam.pos.z);
    }
  }

  let frames = 0, fpsT = 0, low = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    const dt = Math.min(W.clock.getDelta(), 0.1), t = W.clock.elapsedTime;
    W.updaters.forEach(f => f(t, dt));
    if (W.mode === 'play') updatePlay(dt); else updateOrbit(dt);

    const far = W.mode === 'play' ? 85 : 1e9, cp = cam.pos;
    W.npcs.forEach(n => (n.npc.visible = Math.hypot(n.x - cp.x, n.z - cp.z) < far));
    W.kids.forEach(k => (k.visible = Math.hypot(k.position.x - cp.x, k.position.z - cp.z) < far * 0.85));
    W.labels.forEach(l => (l.visible = (W.mode === 'bird' && W.camera.position.distanceTo(l.position) > 52)));
    W.renderer.render(W.scene, W.camera);
    W.listeners.frame.forEach(f => f(dt));
    frames++; fpsT += dt;
    if (fpsT > 2) {
      const fps = frames / fpsT; frames = 0; fpsT = 0; W.fps = Math.round(fps);
      if (fps < 24 && ++low >= 3) {
        low = 0;
        const pr = W.renderer.getPixelRatio();
        if (pr > 1) W.renderer.setPixelRatio(Math.max(1, pr - 0.5));
      }
    }
  }

  const tmp = new V3();
  window.World = {
    init, setMode, setAvatar, setStationInfo, setGuide,
    jump: triggerJump,
    cycleTime: cycleTimeOfDay,
    getZoneName: () => getZoneName(cam.pos.x, cam.pos.z),
    get ready() { return W.ready; }, get mode() { return W.mode; }, get fps() { return W.fps; },
    get layout() { return LAYOUT; },
    get playerPos() { return cam.pos; }, get camYaw() { return cam.yaw; },
    get view() { return W.view; }, setView: v => { W.view = v; },
    setLocked: v => { W.locked = v; if (v) cam.vel.set(0, 0, 0); },
    setMoveInput: (x, y) => { W.move.x = x; W.move.y = y; },
    setReducedMotion: v => { W.reduced = v; },
    npcTalk: (id, sec) => { const s = W.stations[id]; if (s) s.talkUntil = W.clock.elapsedTime + sec; },
    npcWave: id => { const s = W.stations[id]; if (s) s.wave = 1.8; },
    goTo: id => {
      const s = W.stations[id]; if (!s) return;
      const yaw = s.npc.userData.baseYaw;
      const p = new V3(s.x + Math.sin(yaw) * 3.2, 0, s.z + Math.cos(yaw) * 3.2);
      resolveCollision(p);
      cam.pos.copy(p); cam.vel.set(0, 0, 0); W.snap = true;
      cam.yaw = Math.atan2(p.x - s.x, p.z - s.z); cam.pitch = -0.12;
    },
    respawn: () => {
      W.snap = true;
      cam.pos.set(LAYOUT.spawn.x, 0, LAYOUT.spawn.z);
      cam.yaw = LAYOUT.spawn.yaw;
      cam.vel.set(0, 0, 0);
    },
    project: (x, y, z) => {
      tmp.set(x, y, z).project(W.camera);
      const c = W.renderer.domElement;
      return { x: (tmp.x + 1) / 2 * c.clientWidth, y: (1 - tmp.y) / 2 * c.clientHeight, visible: tmp.z < 1 };
    },
    on: (ev, f) => W.listeners[ev] && W.listeners[ev].push(f),
    _W: W
  };
})();
