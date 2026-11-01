/*
 * Dorothy hero: the goddess as a lit 3D relief.
 * A dense plane is displaced by a reconstructed depth map, relit per pixel from that
 * surface, and turned toward the viewer's pointer so the sculpture reveals real depth.
 * The flowers in her hands and the raised hands sway on their own pivots.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, ShaderMaterial, Mesh, Group,
  TextureLoader, SRGBColorSpace, LinearFilter, Vector2, Vector3, BufferGeometry,
  Float32BufferAttribute, Points, AdditiveBlending, Color,
} from "three";

const IMG_W = 1024, IMG_H = 1063;
const ASPECT = IMG_W / IMG_H;

/* Pivot (wrist) and centre of each moving part, in image pixels, with its reach and swing. */
const PARTS = [
  // flowers held up and out
  { pivot: [150, 345], center: [140, 190], r: 150, amp: 0.05, speed: 0.55, phase: 0.0 },
  { pivot: [905, 345], center: [920, 190], r: 150, amp: 0.05, speed: 0.5, phase: 1.7 },
  // small flowers held at the side
  { pivot: [100, 545], center: [105, 470], r: 95, amp: 0.06, speed: 0.7, phase: 0.9 },
  { pivot: [955, 545], center: [965, 470], r: 95, amp: 0.06, speed: 0.65, phase: 2.6 },
  // vines hanging from the lowest hands, a pendulum
  { pivot: [125, 830], center: [110, 945], r: 140, amp: 0.07, speed: 0.6, phase: 0.4 },
  { pivot: [935, 830], center: [955, 960], r: 140, amp: 0.07, speed: 0.58, phase: 2.1 },
  // raised hands, a slow mudra
  { pivot: [325, 175], center: [335, 95], r: 95, amp: 0.035, speed: 0.4, phase: 1.2 },
  { pivot: [720, 175], center: [710, 95], r: 95, amp: 0.035, speed: 0.42, phase: 3.0 },
];

const toUv = ([x, y]) => new Vector2(x / IMG_W, 1 - y / IMG_H);

const WARP_GLSL = /* glsl */ `
  #define NP ${PARTS.length}
  uniform vec2 uPivot[NP];
  uniform vec2 uCenter[NP];
  uniform float uRadius[NP];
  uniform float uAngle[NP];
  const float ASPECT = ${ASPECT.toFixed(5)};
  vec2 warp(vec2 uv) {
    vec2 p = vec2(uv.x * ASPECT, uv.y);
    vec2 acc = vec2(0.0);
    for (int i = 0; i < NP; i++) {
      vec2 c = vec2(uCenter[i].x * ASPECT, uCenter[i].y);
      float w = 1.0 - smoothstep(0.0, uRadius[i], distance(p, c));
      w = w * w * (3.0 - 2.0 * w);
      float a = -uAngle[i] * w;
      vec2 pv = vec2(uPivot[i].x * ASPECT, uPivot[i].y);
      vec2 d = p - pv;
      vec2 r = vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a));
      acc += (pv + r) - p;
    }
    p += acc;
    return vec2(p.x / ASPECT, p.y);
  }
`;

const vert = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform float uRise;
  varying vec2 vUv;
  varying vec2 vWarp;
  ${WARP_GLSL}
  void main() {
    vUv = uv;
    vWarp = warp(uv);
    float d = texture2D(uDepth, vWarp).r;
    vec3 pos = position;
    pos.z += d * uDepthScale * uRise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uColor;
  uniform sampler2D uDepth;
  uniform vec2 uTexel;
  uniform vec3 uKey;
  uniform vec3 uRim;
  uniform vec3 uRimColor;
  uniform float uReveal;
  uniform float uTime;
  varying vec2 vUv;
  varying vec2 vWarp;

  void main() {
    vec4 c = texture2D(uColor, vWarp);
    float h  = texture2D(uDepth, vWarp).r;
    float hx = texture2D(uDepth, vWarp + vec2(uTexel.x, 0.0)).r - texture2D(uDepth, vWarp - vec2(uTexel.x, 0.0)).r;
    float hy = texture2D(uDepth, vWarp + vec2(0.0, uTexel.y)).r - texture2D(uDepth, vWarp - vec2(0.0, uTexel.y)).r;
    vec3 n = normalize(vec3(-hx * 9.0, -hy * 9.0, 1.0));

    float albedo = c.r;
    vec3 V = vec3(0.0, 0.0, 1.0);
    float key = max(dot(n, normalize(uKey)), 0.0);
    vec3 H = normalize(normalize(uKey) + V);
    float spec = pow(max(dot(n, H), 0.0), 38.0) * 0.55;
    float rim = pow(max(dot(n, normalize(uRim)), 0.0), 3.0);
    float edge = pow(1.0 - n.z, 1.6);

    vec3 stone = vec3(albedo) * (0.42 + 0.62 * key) * vec3(0.93, 0.92, 0.9);
    stone += spec * albedo * vec3(1.0, 0.97, 0.94);
    stone += uRimColor * (rim * 0.5 + edge * 0.35) * albedo;
    stone *= 0.72 + 0.28 * h;

    // entrance: a band of light travels up the figure as it rises out of the dark
    float front = uReveal * 1.25 - 0.1;
    float shown = smoothstep(front, front - 0.12, 1.0 - vUv.y);
    float band = exp(-pow((1.0 - vUv.y - front) * 14.0, 2.0)) * (1.0 - smoothstep(0.85, 1.0, uReveal));
    stone += vec3(1.0, 0.82, 0.78) * band * 0.9 * c.a;

    float a = smoothstep(0.3, 0.75, c.a) * shown * smoothstep(0.0, 0.16, vUv.y);
    if (a < 0.01) discard;
    gl_FragColor = vec4(stone, a);
    #include <colorspace_fragment>
  }
`;

const dustVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPx;
  varying float vAlpha;
  varying float vRed;
  void main() {
    vec3 p = position;
    float t = uTime * (0.025 + aSeed * 0.03) + aSeed * 10.0;
    p.y = mod(p.y + t + 0.7, 1.6) - 0.7;
    p.x += sin(t * 3.0 + aSeed * 20.0) * 0.03;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (2.2 / -mv.z);
    vAlpha = smoothstep(-0.7, -0.45, p.y) * (1.0 - smoothstep(0.6, 0.9, p.y));
    vRed = step(0.62, aSeed);
  }
`;
const dustFrag = /* glsl */ `
  uniform vec3 uRimColor;
  varying float vAlpha;
  varying float vRed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float s = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(1.0, 0.96, 0.92), uRimColor, vRed);
    gl_FragColor = vec4(col, s * vAlpha * 0.55);
  }
`;

export function mountGoddess(stage) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 860px)").matches;
  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { stage.classList.add("is-static"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 2.15);

  const loader = new TextureLoader();
  const load = (url, srgb) => new Promise((res, rej) => loader.load(url, (t) => {
    if (srgb) t.colorSpace = SRGBColorSpace;
    t.minFilter = LinearFilter; t.generateMipmaps = false;
    res(t);
  }, undefined, rej));

  const base = stage.dataset.goddess || "assets/goddess/";
  Promise.all([load(base + "color.webp", true), load(base + "depth.webp", false)]).then(([color, depth]) => {
    const seg = small ? 200 : 340;
    const geo = new PlaneGeometry(ASPECT, 1, seg, Math.round(seg / ASPECT));
    const uniforms = {
      uColor: { value: color }, uDepth: { value: depth },
      uTexel: { value: new Vector2(1.5 / IMG_W, 1.5 / IMG_H) },
      uDepthScale: { value: 0.2 }, uRise: { value: reduce ? 1 : 0 }, uReveal: { value: reduce ? 1 : 0 },
      uKey: { value: new Vector3(-0.5, 0.6, 0.9) }, uRim: { value: new Vector3(0.8, -0.2, 0.5) },
      uRimColor: { value: new Color(0xe1251b) }, uTime: { value: 0 },
      uPivot: { value: PARTS.map((p) => toUv(p.pivot)) },
      uCenter: { value: PARTS.map((p) => toUv(p.center)) },
      uRadius: { value: PARTS.map((p) => p.r / IMG_H) },
      uAngle: { value: PARTS.map(() => 0) },
    };
    const mat = new ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true });
    const figure = new Mesh(geo, mat);

    // dust and embers drifting through the space around her
    const N = small ? 90 : 170;
    const pos = new Float32Array(N * 3), size = new Float32Array(N), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = Math.random() * 1.6 - 0.7;
      pos[i * 3 + 2] = (Math.random() - 0.3) * 0.9;
      size[i] = 1.2 + Math.random() * 2.8;
      seed[i] = Math.random();
    }
    const dg = new BufferGeometry();
    dg.setAttribute("position", new Float32BufferAttribute(pos, 3));
    dg.setAttribute("aSize", new Float32BufferAttribute(size, 1));
    dg.setAttribute("aSeed", new Float32BufferAttribute(seed, 1));
    const dust = new Points(dg, new ShaderMaterial({
      uniforms: { uTime: uniforms.uTime, uPx: { value: renderer.getPixelRatio() }, uRimColor: uniforms.uRimColor },
      vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false, blending: AdditiveBlending,
    }));

    const root = new Group();
    root.add(figure, dust);
    scene.add(root);
    stage.appendChild(renderer.domElement);

    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let scrollK = 0;
    const onMove = (e) => {
      target.x = (e.clientX / innerWidth) * 2 - 1;
      target.y = (e.clientY / innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const r = stage.getBoundingClientRect();
      scrollK = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    };
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("scroll", onScroll, { passive: true });
    }

    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // fit the figure's height, leave room for the turn
      const fitH = 0.96, fitW = ASPECT * 1.16;
      const dist = Math.max(fitH / (2 * Math.tan((camera.fov * Math.PI) / 360)), fitW / (2 * Math.tan((camera.fov * Math.PI) / 360)) / camera.aspect);
      camera.position.z = dist;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(stage);
    resize();

    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    let visible = true, raf = 0;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(stage);
    document.addEventListener("visibilitychange", () => !document.hidden && loop());

    function frame(now) {
      const t = (now - t0) / 1000;
      uniforms.uTime.value = t;
      if (!reduce) {
        uniforms.uReveal.value = Math.min(t / 2.6, 1);
        uniforms.uRise.value = ease(Math.min(Math.max((t - 0.3) / 2.4, 0), 1));
        PARTS.forEach((p, i) => { uniforms.uAngle.value[i] = Math.sin(t * p.speed + p.phase) * p.amp + Math.sin(t * p.speed * 2.3 + p.phase) * p.amp * 0.25; });
      }
      cur.x += (target.x - cur.x) * 0.04;
      cur.y += (target.y - cur.y) * 0.04;
      const idle = reduce ? 0 : Math.sin(t * 0.35) * 0.05;
      root.rotation.y = cur.x * 0.34 + idle;
      root.rotation.x = cur.y * 0.12 + scrollK * 0.25;
      root.position.y = Math.sin(t * 0.6) * 0.008 - 0.035 - scrollK * 0.12;
      // the red light follows the pointer, the key light stays high and to the left
      uniforms.uRim.value.set(0.9 + cur.x * 0.6, -0.15 - cur.y * 0.6, 0.12);
      uniforms.uKey.value.set(-0.55 + Math.sin(t * 0.2) * 0.15, 0.65, 0.85);
      renderer.render(scene, camera);
    }
    function loop() {
      cancelAnimationFrame(raf);
      const tick = (now) => {
        if (!visible || document.hidden) return;
        frame(now);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    loop();
    stage.classList.add("is-live");
  }).catch(() => stage.classList.add("is-static"));
}

const el = document.querySelector("[data-goddess]");
if (el) mountGoddess(el);
