/*
 * Dorothy hero: the goddess as a sculpture in a dark gallery.
 * She is unveiled by a single rising light, a ring of fire (thiruvachi) traces itself
 * behind her, and the visitor's pointer becomes the light that rakes across the carving.
 * Where the pointer touches her, the stone gives way to sand that pours down and slowly
 * gathers back into form.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, ShaderMaterial, Mesh, Group,
  TextureLoader, SRGBColorSpace, LinearFilter, Vector2, Vector3, Color, AdditiveBlending,
  Raycaster, DataTexture, RedFormat, UnsignedByteType, Points, BufferGeometry, BufferAttribute,
  DynamicDrawUsage,
} from "three";

const IMG_W = 1024, IMG_H = 1063;
const ASPECT = IMG_W / IMG_H;

const figureVert = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(uDepth, uv).r * uDepthScale;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const figureFrag = /* glsl */ `
  uniform sampler2D uColor;
  uniform sampler2D uNormal;
  uniform sampler2D uDepth;
  uniform vec3 uLight;
  uniform float uLightAmt;
  uniform vec3 uEmber;
  uniform float uEmberAmt;
  uniform sampler2D uErode;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec4 c = texture2D(uColor, vUv);
    float a = smoothstep(0.3, 0.75, c.a) * smoothstep(0.0, 0.18, vUv.y);
    if (a < 0.01) discard;

    vec3 n = normalize(texture2D(uNormal, vUv).xyz * 2.0 - 1.0);
    float h = texture2D(uDepth, vUv).r;
    float alb = pow(c.r, 1.05);
    vec3 L = normalize(uLight);
    vec3 V = vec3(0.0, 0.0, 1.0);

    // soft wrapped studio light over the large forms; the sculpture keeps its own shading
    float wrap = (max(dot(n, L), 0.0) + 0.35) / 1.35;
    float sheen = pow(max(dot(n, normalize(L + V)), 0.0), 12.0) * 0.12;
    vec3 col = vec3(1.0, 0.975, 0.95) * alb * (0.62 + 0.5 * wrap);
    col += vec3(1.0, 0.97, 0.93) * sheen * alb;

    // a wide pool of light that follows the pointer and falls off gently
    vec2 lp = vec2(0.5, 0.55) + L.xy * vec2(0.32, 0.3);
    vec2 dp = (vUv - lp) * vec2(1.0, 0.85);
    float pool = exp(-dot(dp, dp) * 2.4);
    col *= mix(0.62, 1.04, pool);

    col *= mix(0.86, 1.0, h);
    col *= uLightAmt;
    col += uEmber * texture2D(uDepth, vUv).g * alb * 0.12 * uEmberAmt;

    // sand: where the stone has been touched it breaks along a grainy edge
    float e = texture2D(uErode, vUv).r;
    if (e > 0.003) {
      float g = vnoise(vUv * vec2(${(300 * ASPECT).toFixed(1)}, 300.0)) * 0.55 + vnoise(vUv * vec2(${(70 * ASPECT).toFixed(1)}, 70.0)) * 0.45;
      float cut = e * 1.08;
      float keep = smoothstep(cut - 0.015, cut + 0.015, g);
      float rim = (1.0 - smoothstep(0.0, 0.07, g - cut)) * keep;
      col = mix(col, col * 1.25 + vec3(0.42, 0.25, 0.12) * alb, rim * 0.85);
      a *= keep;
      if (a < 0.01) discard;
    }

    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

/* Sand grains: each carries the tone of the stone it broke from */
const sandVert = /* glsl */ `
  attribute float aLum;
  attribute float aAlpha;
  attribute float aSize;
  attribute float aHot;
  uniform float uPx;
  uniform float uLight;
  varying float vLum;
  varying float vAlpha;
  varying float vHot;
  void main() {
    vLum = aLum * uLight;
    vAlpha = aAlpha;
    vHot = aHot;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (2.6 / -mv.z);
  }
`;
const sandFrag = /* glsl */ `
  varying float vLum;
  varying float vAlpha;
  varying float vHot;
  void main() {
    if (vAlpha < 0.01) discard;
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;
    float soft = smoothstep(0.25, 0.12, r);
    vec3 stone = vec3(1.0, 0.965, 0.92) * (0.22 + 1.0 * vLum);
    vec3 hot = vec3(1.0, 0.74, 0.42) * (1.1 + 0.3 * (1.0 - r * 4.0));
    vec3 col = mix(stone, hot, vHot);
    gl_FragColor = vec4(col, vAlpha * soft);
    #include <colorspace_fragment>
  }
`;

const haloVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* Thiruvachi: a fine ring with small flame tips, traced once and then left to breathe */
const haloFrag = /* glsl */ `
  uniform float uTime;
  uniform float uDraw;
  uniform vec3 uEmber;
  varying vec2 vUv;
  #define PI 3.14159265

  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(float x) { float i = floor(x), f = fract(x); return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f)); }

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float ang = atan(p.x, -p.y);            // 0 at the bottom, increases clockwise
    float t = (ang + PI) / (2.0 * PI);       // 0..1 around the ring
    float drawn = smoothstep(uDraw, uDraw - 0.02, abs(t - 0.5) * 2.0);

    float R = 0.415;
    // flame tips around the outer edge
    float flick = noise(t * 70.0 + uTime * 0.9) * 0.7 + noise(t * 160.0 - uTime * 1.7) * 0.3;
    float tongue = 0.012 * smoothstep(0.35, 1.0, flick);   // a living edge, not beads

    float line = exp(-abs(r - R) * 700.0);
    float inner = exp(-abs(r - (R - 0.018)) * 1400.0) * 0.35;
    float flame = exp(-max(r - R, 0.0) / max(tongue, 0.001) * 2.2) * step(R, r) * smoothstep(0.35, 1.0, flick) * 0.55;
    float glow = exp(-abs(r - R) * 30.0) * 0.12;

    float fadeBottom = smoothstep(0.02, 0.2, t) * smoothstep(0.98, 0.8, t);
    float shimmer = 0.85 + 0.15 * noise(t * 30.0 - uTime * 0.8);
    float v = (line * 0.75 + inner * 0.6 + flame * 0.55 + glow * 0.8) * drawn * fadeBottom * shimmer;

    vec3 hot = vec3(1.0, 0.72, 0.5);
    vec3 col = mix(uEmber, hot, clamp(line * 0.6 + flame * 0.5, 0.0, 1.0));
    gl_FragColor = vec4(col * v, v);
  }
`;

export function mountGoddess(stage) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 860px)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { stage.classList.add("is-static"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 20);

  const loader = new TextureLoader();
  const load = (url, srgb) => new Promise((res, rej) => loader.load(url, (t) => {
    if (srgb) t.colorSpace = SRGBColorSpace;
    t.minFilter = LinearFilter; t.generateMipmaps = false;
    res(t);
  }, undefined, rej));

  const base = stage.dataset.goddess || "assets/goddess/";
  Promise.all([
    load(base + "color.webp", true), load(base + "normal.webp", false), load(base + "depth.webp", false),
  ]).then(([color, normal, depth]) => {
    const ember = new Color(0xe1251b);
    const u = {
      uColor: { value: color }, uNormal: { value: normal }, uDepth: { value: depth },
      uDepthScale: { value: 0.07 },
      uLight: { value: new Vector3(-0.2, -0.9, 0.4) }, uLightAmt: { value: reduce ? 1 : 0 },
      uEmber: { value: ember }, uEmberAmt: { value: reduce ? 1 : 0 },
      uErode: { value: null },
    };

    /* Erosion map: how much of the stone has turned to sand at each point (0 = intact). */
    const GW = 200, GH = Math.round(GW / ASPECT);
    const erode = new Float32Array(GW * GH);
    const erodeBytes = new Uint8Array(GW * GH);
    const erodeTex = new DataTexture(erodeBytes, GW, GH, RedFormat, UnsignedByteType);
    erodeTex.minFilter = erodeTex.magFilter = LinearFilter;
    erodeTex.needsUpdate = true;
    u.uErode.value = erodeTex;

    /* CPU copies of the statue's tone, coverage and depth, to seed grains where stone breaks */
    const SW = 256, SH = Math.round(SW / ASPECT);
    const sample = (img) => {
      const c = document.createElement("canvas");
      c.width = SW; c.height = SH;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.drawImage(img, 0, 0, SW, SH);
      return x.getImageData(0, 0, SW, SH).data;
    };
    const colPx = sample(color.image), depPx = sample(depth.image);
    const at = (px, uvx, uvy, ch) => {
      const x = Math.min(SW - 1, Math.max(0, Math.floor(uvx * SW)));
      const y = Math.min(SH - 1, Math.max(0, Math.floor((1 - uvy) * SH)));
      return px[(y * SW + x) * 4 + ch] / 255;
    };
    const solid = (ux, uy) => uy > 0.12 && at(colPx, ux, uy, 3) > 0.55;
    const seg = small ? 160 : 260;
    const figure = new Mesh(
      new PlaneGeometry(ASPECT, 1, seg, Math.round(seg / ASPECT)),
      new ShaderMaterial({ uniforms: u, vertexShader: figureVert, fragmentShader: figureFrag, transparent: true })
    );

    const hu = { uTime: { value: 0 }, uDraw: { value: reduce ? 1 : 0 }, uEmber: { value: ember } };
    const halo = new Mesh(
      new PlaneGeometry(1.12, 1.12),
      new ShaderMaterial({ uniforms: hu, vertexShader: haloVert, fragmentShader: haloFrag, transparent: true, depthWrite: false, blending: AdditiveBlending })
    );
    halo.position.set(0, 0.06, -0.12);

    const MAX = small ? 2400 : 5200;
    const gPos = new Float32Array(MAX * 3), gVel = new Float32Array(MAX * 3);
    const gLum = new Float32Array(MAX), gAlpha = new Float32Array(MAX), gSize = new Float32Array(MAX);
    const gAge = new Float32Array(MAX), gLife = new Float32Array(MAX).fill(-1), gSeed = new Float32Array(MAX);
    const gHot = new Float32Array(MAX), gHeat = new Float32Array(MAX);
    const sandGeo = new BufferGeometry();
    const posAttr = new BufferAttribute(gPos, 3).setUsage(DynamicDrawUsage);
    const alphaAttr = new BufferAttribute(gAlpha, 1).setUsage(DynamicDrawUsage);
    const lumAttr = new BufferAttribute(gLum, 1).setUsage(DynamicDrawUsage);
    const sizeAttr = new BufferAttribute(gSize, 1).setUsage(DynamicDrawUsage);
    const hotAttr = new BufferAttribute(gHot, 1).setUsage(DynamicDrawUsage);
    sandGeo.setAttribute("position", posAttr);
    sandGeo.setAttribute("aAlpha", alphaAttr);
    sandGeo.setAttribute("aLum", lumAttr);
    sandGeo.setAttribute("aSize", sizeAttr);
    sandGeo.setAttribute("aHot", hotAttr);
    const su = { uPx: { value: renderer.getPixelRatio() }, uLight: { value: 1 } };
    const sand = new Points(sandGeo, new ShaderMaterial({
      uniforms: su, vertexShader: sandVert, fragmentShader: sandFrag, transparent: true, depthWrite: false,
    }));
    sand.frustumCulled = false;
    let head = 0, liveGrains = 0;

    const spawn = (ux, uy, ox, oy) => {
      const k = head; head = (head + 1) % MAX;
      gPos[k * 3] = (ux - 0.5) * ASPECT;
      gPos[k * 3 + 1] = uy - 0.5;
      gPos[k * 3 + 2] = at(depPx, ux, uy, 0) * 0.07 + 0.004;
      const out = 0.045 + Math.random() * 0.05;
      gVel[k * 3] = ox * out + (Math.random() - 0.5) * 0.05;
      gVel[k * 3 + 1] = oy * out * 0.6 + Math.random() * 0.05;
      gVel[k * 3 + 2] = 0.01 + Math.random() * 0.06;
      gLum[k] = Math.pow(at(colPx, ux, uy, 0), 1.05);
      gSize[k] = 1.5 + Math.pow(Math.random(), 3) * 3.2;
      gAge[k] = 0; gLife[k] = 1.7 + Math.random() * 1.6; gSeed[k] = Math.random() * 6.283;
      gHeat[k] = Math.random() < 0.26 ? 0.75 + Math.random() * 0.25 : 0; // some grains break off still warm
    };

    const root = new Group();
    root.add(halo, figure, sand);
    scene.add(root);
    stage.appendChild(renderer.domElement);

    /* Touch point on the statue, found by casting the pointer onto her plane */
    const ray = new Raycaster(), ndc = new Vector2();
    const touch = { on: false, u: 0, v: 0, pu: 0, pv: 0, has: false };
    const onTouch = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { touch.on = false; return; }
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(figure)[0];
      if (!hit || !hit.uv) { touch.on = false; return; }
      touch.on = true; touch.u = hit.uv.x; touch.v = hit.uv.y;
    };
    if (!reduce) {
      addEventListener("pointermove", onTouch, { passive: true });
      addEventListener("pointerdown", onTouch, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => { touch.on = false; });
      addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") touch.on = false; }, { passive: true });
    }

    const BRUSH = 0.06; // radius, as a fraction of her height
    function erodeStep(dt, t) {
      let changed = false;
      // heal: sand slowly gathers back into stone
      for (let k = 0; k < erode.length; k++) {
        if (erode[k] > 0) { erode[k] = Math.max(0, erode[k] - dt * 0.24); changed = true; }
      }
      if (touch.on && t > 2.4) {
        // paint along the path since the last frame so fast strokes stay continuous
        const steps = touch.has ? Math.min(12, Math.ceil(Math.hypot((touch.u - touch.pu) * ASPECT, touch.v - touch.pv) / (BRUSH * 0.35))) : 1;
        for (let s = 1; s <= Math.max(1, steps); s++) {
          const f = touch.has ? s / steps : 1;
          const cu = touch.pu + (touch.u - touch.pu) * f, cv = touch.pv + (touch.v - touch.pv) * f;
          const x0 = Math.max(0, Math.floor((cu - BRUSH / ASPECT) * GW)), x1 = Math.min(GW - 1, Math.ceil((cu + BRUSH / ASPECT) * GW));
          const y0 = Math.max(0, Math.floor((cv - BRUSH) * GH)), y1 = Math.min(GH - 1, Math.ceil((cv + BRUSH) * GH));
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
              const ux = (x + 0.5) / GW, uy = (y + 0.5) / GH;
              const dx = (ux - cu) * ASPECT, dy = uy - cv;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d > BRUSH) continue;
              const jag = 0.82 + 0.36 * Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);
              const target = Math.min(1, Math.max(0, (1 - d / (BRUSH * jag)) * 1.9));
              const k = y * GW + x;
              const before = erode[k];
              if (target > before) {
                erode[k] = target; changed = true;
                // stone that has just given way becomes grains
                if (before < 0.45 && target >= 0.45 && solid(ux, uy)) {
                  const n = 2 + (Math.random() < 0.5 ? 1 : 0);
                  for (let g = 0; g < n; g++) {
                    const gx = ux + (Math.random() - 0.5) / GW, gy = uy + (Math.random() - 0.5) / GH;
                    spawn(gx, gy, dx / (d || 1), dy / (d || 1));
                  }
                }
              }
            }
          }
        }
        // a steady pour from the broken edge while the pointer rests on her
        for (let g = 0; g < (small ? 8 : 16); g++) {
          const ang = Math.random() * 6.283, rr = BRUSH * (0.6 + Math.random() * 0.45);
          const ux = touch.u + (Math.cos(ang) * rr) / ASPECT, uy = touch.v + Math.sin(ang) * rr;
          if (solid(ux, uy)) spawn(ux, uy, Math.cos(ang), Math.sin(ang));
        }
        touch.pu = touch.u; touch.pv = touch.v; touch.has = true;
      } else {
        touch.has = false;
      }
      if (changed) {
        for (let k = 0; k < erode.length; k++) erodeBytes[k] = erode[k] * 255;
        erodeTex.needsUpdate = true;
      }
    }

    function sandStep(dt, t) {
      liveGrains = 0;
      for (let k = 0; k < MAX; k++) {
        if (gLife[k] < 0) { gAlpha[k] = 0; continue; }
        gAge[k] += dt;
        if (gAge[k] >= gLife[k]) { gLife[k] = -1; gAlpha[k] = 0; continue; }
        liveGrains++;
        const i = k * 3;
        gVel[i + 1] -= 0.62 * dt;                                       // weight
        gVel[i] += Math.sin(t * 1.4 + gSeed[k]) * 0.035 * dt;           // a breath of air
        const drag = Math.pow(0.35, dt);
        gVel[i] *= drag; gVel[i + 2] *= drag;
        gPos[i] += gVel[i] * dt; gPos[i + 1] += gVel[i + 1] * dt; gPos[i + 2] += gVel[i + 2] * dt;
        const life = gAge[k] / gLife[k];
        gHot[k] = gHeat[k] * Math.max(0, 1 - life * 1.6);               // warm grains cool as they fall
        gAlpha[k] = Math.min(1, gAge[k] / 0.08) * Math.pow(1 - life, 1.6) * (gPos[i + 1] > -0.62 ? 1 : 0.4);
      }
      posAttr.needsUpdate = alphaAttr.needsUpdate = lumAttr.needsUpdate = sizeAttr.needsUpdate = hotAttr.needsUpdate = true;
    }

    /* pointer = light. When nobody is steering, the light drifts slowly on its own. */
    const aim = new Vector2(-0.55, 0.45), cur = new Vector2(-0.55, 0.45);
    let lastMove = -1e9, scrollK = 0;
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      aim.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      aim.clampScalar(-1.2, 1.2);
      lastMove = performance.now();
    };
    const onScroll = () => {
      const r = stage.getBoundingClientRect();
      scrollK = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    };
    if (!reduce) {
      if (finePointer) addEventListener("pointermove", onMove, { passive: true });
      addEventListener("scroll", onScroll, { passive: true });
    }

    let fitZ = 3;
    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const tan = Math.tan((camera.fov * Math.PI) / 360);
      fitZ = Math.max(0.98 / (2 * tan), (ASPECT * 1.04) / (2 * tan) / camera.aspect);
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(stage);
    resize();

    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
    const t0 = performance.now();
    let visible = true, raf = 0;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(stage);
    document.addEventListener("visibilitychange", () => !document.hidden && loop());

    let last = performance.now();
    function frame(now) {
      const t = (now - t0) / 1000;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      hu.uTime.value = t;
      if (!reduce) { erodeStep(dt, t); sandStep(dt, t); }

      // the unveiling: light rises from below, the ring traces itself, the camera settles
      const lightIn = reduce ? 1 : ease(clamp01(t / 2.8));
      const ringIn = reduce ? 1 : ease(clamp01((t - 1.0) / 2.6));
      u.uLightAmt.value = lightIn * (1 - scrollK * 0.5);
      u.uEmberAmt.value = ringIn;
      hu.uDraw.value = ringIn;
      camera.position.z = fitZ * (1 + 0.07 * (1 - ease(clamp01(t / 4.5)))) * (reduce ? 1 : 1);

      // light path: intro sweep, then pointer, or a slow idle orbit
      const idle = now - lastMove > 2600;
      if (idle) {
        const s = t * 0.22;
        aim.set(-0.35 + Math.sin(s) * 0.75, 0.42 + Math.cos(s * 0.8) * 0.28);
      }
      const k = reduce ? 1 : idle ? 0.02 : 0.07;
      cur.lerp(aim, k);
      const introY = -1.1 + 1.55 * lightIn;     // rises from beneath her
      const ly = lightIn < 1 ? Math.min(introY, cur.y) : cur.y;
      u.uLight.value.set(cur.x * 0.9, ly * 0.85, 0.7);

      // a sculpture on a slow turntable of breath: barely there
      root.rotation.y = reduce ? 0 : cur.x * 0.06 + Math.sin(t * 0.25) * 0.012;
      root.rotation.x = reduce ? 0 : -cur.y * 0.03 + scrollK * 0.08;
      root.position.y = -0.02 - scrollK * 0.06;
      halo.rotation.z = reduce ? 0 : t * 0.01;
      su.uLight.value = u.uLightAmt.value;

      renderer.render(scene, camera);
    }
    function loop() {
      cancelAnimationFrame(raf);
      const tick = (now) => {
        if (!visible || document.hidden) return;
        frame(now);
        if (!reduce || now - t0 < 100) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    loop();
    stage.classList.add("is-live");
  }).catch(() => stage.classList.add("is-static"));
}

const el = document.querySelector("[data-goddess]");
if (el) mountGoddess(el);
