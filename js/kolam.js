/*
 * Dorothy — 3D Kolam
 * A single unbroken line woven around a grid of pulli (dots), the way a sikku
 * kolam is drawn at a Tamil threshold each morning. Rendered as a lit tube
 * that draws itself once, then rests and follows the pointer.
 */
import * as THREE from "three";

const RED = 0xe1251b;

/* A closed curve that loops around each dot of a diamond grid.
   Built from a hypotrochoid plus a gentle over/under wave in z. */
class KolamCurve extends THREE.Curve {
  constructor(scale = 1) { super(); this.scale = scale; }
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    const R = 4, r = 1, d = 2.35;            // 4-fold symmetry, looping petals
    const k = (R - r) / r;
    const x = (R - r) * Math.cos(a) + d * Math.cos(k * a);
    const y = (R - r) * Math.sin(a) - d * Math.sin(k * a);
    const z = 0.42 * Math.sin(8 * a);        // weave: over, under, over…
    return target.set(x, y, z).multiplyScalar(this.scale);
  }
}

class InnerCurve extends THREE.Curve {
  constructor(scale = 1) { super(); this.scale = scale; }
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    const r = 1.25 + 0.42 * Math.cos(4 * a);
    return target.set(r * Math.cos(a + Math.PI / 4), r * Math.sin(a + Math.PI / 4), 0.22 * Math.sin(4 * a)).multiplyScalar(this.scale);
  }
}

export function mountKolam(stage) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return null; // keep SVG fallback
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 16.5);

  /* Lights: low ambient, warm key, red rim — sculptural, not glossy */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a0503, 0.35));
  const key = new THREE.DirectionalLight(0xfff1e6, 2.4);
  key.position.set(-5, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(RED, 60, 30, 1.6);
  rim.position.set(6, -4, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffffff, 12, 30, 2);
  fill.position.set(4, 3, 6);
  scene.add(fill);

  const root = new THREE.Group();
  scene.add(root);

  /* Main woven line */
  const segs = 1400, radial = 20;
  const tubeGeo = new THREE.TubeGeometry(new KolamCurve(0.78), segs, 0.085, radial, true);
  const tubeMat = new THREE.MeshPhysicalMaterial({
    color: RED, roughness: 0.38, metalness: 0.08, clearcoat: 0.6, clearcoatRoughness: 0.35,
    sheen: 0.4, sheenColor: new THREE.Color(0xff6a5c),
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  root.add(tube);

  /* Inner line — chalk white, thinner */
  const innerGeo = new THREE.TubeGeometry(new InnerCurve(0.78), 600, 0.04, 12, true);
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xf3f1ee, roughness: 0.75, metalness: 0 });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  root.add(inner);

  /* Pulli — the dot grid the line is drawn around (diamond layout) */
  const dotGeo = new THREE.SphereGeometry(0.075, 20, 20);
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xf3f1ee, roughness: 0.4, emissive: 0x2a2a2a });
  const dots = new THREE.InstancedMesh(dotGeo, dotMat, 41);
  const m = new THREE.Matrix4();
  let n = 0;
  const step = 1.15;
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      if (Math.abs(i) + Math.abs(j) > 4 || (i + j) % 2 !== 0) continue;
      m.makeTranslation(i * step * 0.78 * 1.1, j * step * 0.78 * 1.1, 0);
      dots.setMatrixAt(n++, m);
    }
  }
  dots.count = n;
  root.add(dots);

  root.rotation.set(-0.42, 0.28, Math.PI / 4);

  /* Draw-in: reveal the line along its length, once */
  const fullTube = tubeGeo.index.count;
  const fullInner = innerGeo.index.count;
  const drawDur = reduce ? 0 : 2600;
  const t0 = performance.now();
  const ease = (x) => 1 - Math.pow(1 - x, 4);

  /* Pointer — eased toward target, never snaps */
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onMove = (e) => {
    const p = e.touches ? e.touches[0] : e;
    target.x = (p.clientX / window.innerWidth) * 2 - 1;
    target.y = (p.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  let visible = true, raf = 0, last = performance.now();
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }, { threshold: 0 });
  io.observe(stage);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loop(); });

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const p = drawDur ? Math.min((now - t0) / drawDur, 1) : 1;
    const e = ease(p);
    tubeGeo.setDrawRange(0, Math.floor((fullTube * e) / 3) * 3);
    innerGeo.setDrawRange(0, Math.floor((fullInner * Math.max(0, (e - 0.25) / 0.75)) / 3) * 3);
    dotMat.opacity = 1;

    cur.x += (target.x - cur.x) * 0.045;
    cur.y += (target.y - cur.y) * 0.045;

    if (!reduce) root.rotation.z += dt * 0.06;
    root.rotation.x = -0.42 + cur.y * 0.22 + (1 - e) * -0.35;
    root.rotation.y = 0.28 + cur.x * 0.32;
    inner.rotation.z = -root.rotation.z * 0.5 + Math.PI / 4;
    rim.position.x = 6 + cur.x * 3;

    renderer.render(scene, camera);
    return p < 1 || !reduce;
  }

  function loop() {
    cancelAnimationFrame(raf);
    const tick = (now) => {
      if (!visible || document.hidden) return;
      const more = frame(now);
      if (more) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  loop();
  document.documentElement.classList.add("has-webgl");

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect(); io.disconnect();
    window.removeEventListener("pointermove", onMove);
    renderer.dispose();
  };
}

const stage = document.querySelector("[data-kolam]");
if (stage) mountKolam(stage);
