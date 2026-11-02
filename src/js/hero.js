/*
 * Dorothy hero: the goddess as a sculpture in a dark gallery.
 * She is unveiled by a single rising light, a ring of fire (thiruvachi) traces itself
 * behind her, and the visitor's pointer becomes the light that rakes across the carving.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, ShaderMaterial, Mesh, Group,
  TextureLoader, SRGBColorSpace, LinearFilter, Vector2, Vector3, Color, AdditiveBlending,
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
  varying vec2 vUv;

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

    gl_FragColor = vec4(col, a);
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
    };
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

    const root = new Group();
    root.add(halo, figure);
    scene.add(root);
    stage.appendChild(renderer.domElement);

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

    function frame(now) {
      const t = (now - t0) / 1000;
      hu.uTime.value = t;

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
