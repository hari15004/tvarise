import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { stageInput } from "@/motion/state";
import { EASE } from "@/motion/tokens";

// Hero stage: liquid-metal wave background (bronze at the top of the page,
// sapphire at the bottom), rising forge sparks, and a standing golden horse
// statue loaded from /models/bronze_horse.glb. The horse fades in on load,
// zooms out and turns 90 degrees while the hero scrolls, and faces front again
// for the final CTA. The exported names are unchanged, so SculptureStage keeps working.

export type PieceDef = { id: string };

export type Sculpture = {
  assemble: () => void;
  setActive: (on: boolean) => void;
  dispose: () => void;
};

type Options = {
  canvas: HTMLCanvasElement;
  pieces: PieceDef[];
  tier: "full" | "lite";
  onSlow: () => void;
  onContextLost: () => void;
};

// ---- Easy knobs to tweak ----
const HORSE_URL = "/models/bronze_horse.glb";
const HORSE_SIZE = 3.2; // biggest side of the horse, in scene units
const HORSE_YAW = -0.6; // starting turn of the horse (radians). Change this if it faces the wrong way.
const HORSE_COLOR = 0xa87028; // deep golden bronze

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const VERTEX = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uIntro;

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    float aspect = uResolution.x / uResolution.y;
    float time = uTime * 0.08;
    float scroll = uScroll;

    float angle1 = 0.6;
    float angle2 = -0.7;
    float angle3 = 1.2;
    float freq1 = 2.4;
    float freq2 = 3.2;
    float freq3 = 4.0;

    vec2 warpedUv = uv;
    float scrollDeform = scroll * 5.0;

    warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
    warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;
    warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
    warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;

    vec2 scrollDrift = vec2(scroll * 0.04, -scroll * 0.02);
    vec2 mouseShift = vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);
    warpedUv += scrollDrift + mouseShift;

    vec2 dir1 = vec2(cos(angle1), sin(angle1));
    vec2 dir2 = vec2(cos(angle2), sin(angle2));
    vec2 dir3 = vec2(cos(angle3), sin(angle3));

    float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
    float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
    float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);

    float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;

    float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
    float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
    float crest = wideSheen * 0.5 + crispSpecular * 0.9;

    vec3 c0_shadow = vec3(0.0010, 0.0006, 0.0004);
    vec3 c0_wave1  = vec3(0.085, 0.040, 0.015);
    vec3 c0_wave2  = vec3(0.050, 0.022, 0.008);
    vec3 c0_crest  = vec3(0.45, 0.30, 0.18);

    vec3 c1_shadow = vec3(0.0004, 0.0006, 0.0012);
    vec3 c1_wave1  = vec3(0.015, 0.035, 0.065);
    vec3 c1_wave2  = vec3(0.008, 0.020, 0.045);
    vec3 c1_crest  = vec3(0.18, 0.35, 0.55);

    float t = smoothstep(0.0, 1.0, scroll);
    vec3 colShadow = mix(c0_shadow, c1_shadow, t);
    vec3 colWave1  = mix(c0_wave1, c1_wave1, t);
    vec3 colWave2  = mix(c0_wave2, c1_wave2, t);
    vec3 colCrest  = mix(c0_crest, c1_crest, t);

    vec3 color = colShadow;
    color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
    color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));
    color += colCrest * crest * 1.4;

    float vignette = 1.0 - dot(uv, uv) * 0.12;
    color *= vignette * uIntro;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function makeSparkTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(0.6, "rgba(255,255,255,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new THREE.CanvasTexture(c);
}

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,240,200,1)");
    g.addColorStop(0.18, "rgba(255,200,100,0.75)");
    g.addColorStop(0.5, "rgba(210,120,35,0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSculpture({ canvas, tier, onSlow, onContextLost }: Options): Sculpture {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: tier === "full",
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  /* ---- Reflections for the metal (built in code, no extra file) ---- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  /* ---- Lights: bright key, cool rim, faint warm fill ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.04));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(4, 6, 3);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xe3f2ff, 2.2);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);
  const fillLight = new THREE.DirectionalLight(0xfff3e6, 0.25);
  fillLight.position.set(-2, -4, 2);
  scene.add(fillLight);

  /* ---- Background wave shader (full-screen quad) ---- */
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uIntro: { value: 0 },
  };
  const bgMat = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const bgGeo = new THREE.PlaneGeometry(2, 2);
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  /* ---- Forge sparks ---- */
  const sparkCount = tier === "full" ? 320 : 90;
  const positions = new Float32Array(sparkCount * 3);
  const colors = new Float32Array(sparkCount * 3);
  const data: { sx: number; sy: number; sz: number; sway: number; radius: number; phase: number }[] = [];

  for (let i = 0; i < sparkCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

    if (Math.random() < 0.6) {
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.05 + Math.random() * 0.1;
    } else {
      colors[i * 3] = 0.55 + Math.random() * 0.15;
      colors[i * 3 + 1] = 0.82 + Math.random() * 0.12;
      colors[i * 3 + 2] = 1.0;
    }

    data.push({
      sx: (Math.random() - 0.5) * 0.4,
      sy: 0.15 + Math.random() * 0.3,
      sz: (Math.random() - 0.5) * 0.4,
      sway: 0.5 + Math.random() * 1.5,
      radius: 0.05 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    });
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const sparkTex = makeSparkTexture();
  const sparkMat = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: sparkTex,
    toneMapped: false,
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  /* ---- The golden horse ---- */
  const rig = new THREE.Group();
  scene.add(rig);

  // Warm glow that sits behind the horse (hero) and bursts open at the final CTA.
  const glowTex = makeGlowTexture();
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.frustumCulled = false;
  scene.add(glow);

  const horseMat = new THREE.MeshStandardMaterial({
    color: HORSE_COLOR,
    metalness: 0.92,
    roughness: 0.42,
    envMapIntensity: 0.4,
    transparent: true,
    opacity: 0,
  });

  let horse: THREE.Group | null = null; // sits inside the rig, centred on its middle
  const horseGeos: THREE.BufferGeometry[] = [];

  const loader = new GLTFLoader();
  loader.load(
    HORSE_URL,
    (gltf) => {
      const model = gltf.scene;
      if (disposed) {
        model.traverse((child) => {
          const m = child as THREE.Mesh;
          if (m.isMesh) m.geometry.dispose();
        });
        return;
      }
      model.traverse((child) => {
        const m = child as THREE.Mesh;
        if (m.isMesh) {
          m.material = horseMat;
          m.frustumCulled = false;
          horseGeos.push(m.geometry);
        }
      });

      // Scale so the biggest side equals HORSE_SIZE, then centre it exactly.
      const box1 = new THREE.Box3().setFromObject(model);
      const size1 = box1.getSize(new THREE.Vector3());
      const maxDim = Math.max(size1.x, size1.y, size1.z);
      model.scale.setScalar(HORSE_SIZE / (maxDim > 0.0001 ? maxDim : 1));
      model.updateMatrixWorld(true);
      const box2 = new THREE.Box3().setFromObject(model);
      const center = box2.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const pivot = new THREE.Group();
      pivot.add(model);
      rig.add(pivot);
      horse = pivot;
    },
    undefined,
    (err) => {
      console.error("Could not load the horse model:", err);
    }
  );

  /* ---- Size ---- */
  const size = new THREE.Vector2();
  let baseX = 0;
  let baseY = 0;
  let baseScale = 1;
  let wide = false;
  const layout = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === "full" ? 1.75 : 1));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(size);
    uniforms.uResolution.value.copy(size);
    wide = camera.aspect > 1.1;
    const halfW = 6 * Math.tan((25 * Math.PI) / 180) * camera.aspect;
    baseX = wide ? Math.min(2.5, halfW * 0.5) : 0;
    baseY = wide ? 0 : 1.5;
    baseScale = wide ? Math.min(0.8, camera.aspect * 0.45) : 0.5;
  };
  layout();
  window.addEventListener("resize", layout);

  /* ---- Frame loop (GSAP ticker) ---- */
  const state = { intro: 0 };
  let t = 0;
  let active = true;
  let disposed = false;
  const cur = { x: 0, y: 0 };
  let pageScroll = 0;
  let slowFrames = 0;
  let slowTotal = 0;
  let slowChecked = false;

  const tick = (_time: number, deltaMs: number) => {
    if (!active || disposed || document.hidden) return;
    const dt = Math.min(deltaMs, 50) / 1000;
    t += dt;

    // Smooth pointer
    const follow = Math.min(1, dt * 3);
    cur.x += (stageInput.pointerX - cur.x) * follow;
    cur.y += (stageInput.pointerY - cur.y) * follow;

    // Whole-page scroll (0 to 1), smoothed. Drives the bronze to sapphire shift.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const targetScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    pageScroll += (targetScroll - pageScroll) * Math.min(1, dt * 2.5);
    const velocity = Math.abs(targetScroll - pageScroll);

    // Sparks: faster and more turbulent while scrolling fast
    const speedMul = 1 + velocity * 9;
    const turbulence = velocity * 0.8;
    const arr = sparkGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < sparkCount; i++) {
      const k = i * 3;
      const d = data[i];
      arr[k] += d.sx * dt * speedMul;
      arr[k + 1] += d.sy * dt * speedMul;
      arr[k + 2] += d.sz * dt * speedMul;
      const sway = d.radius * (1 + turbulence * 4);
      arr[k] += Math.sin(t * d.sway + d.phase) * sway * dt;
      arr[k + 2] += Math.cos(t * d.sway + d.phase) * sway * dt;
      if (arr[k + 1] > 4.2 || Math.abs(arr[k]) > 7.5 || Math.abs(arr[k + 2]) > 4) {
        arr[k + 1] = -4.2;
        arr[k] = (Math.random() - 0.5) * 14;
        arr[k + 2] = (Math.random() - 0.5) * 6;
      }
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkMat.opacity = 0.85 * state.intro;

    // Gentle camera parallax from the pointer
    camera.position.x = cur.x * 0.4;
    camera.position.y = -cur.y * 0.25;
    camera.lookAt(0, 0, 0);

    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(cur.x, -cur.y);
    uniforms.uScroll.value = pageScroll;
    uniforms.uIntro.value = state.intro;

    // Stage dims behind the content once the hero is done, returns for the final CTA.
    const p = stageInput.heroProgress;
    const ce = smooth(0, 1, stageInput.ctaProgress);
    canvas.style.opacity = String(lerp(1 - 0.65 * smooth(0.7, 1, p), 0.7, ce));

    // Horse: starts close up, zooms out and turns 90 degrees while the hero
    // scrolls, then lifts away. Scrolling back up reverses it. At the final CTA
    // it comes back to the centre.
    const z = smooth(0, 0.7, p);
    const rise = smooth(0.7, 1, p) * 1.4;

    if (horse) {
      const k = smooth(0, 1, state.intro);
      const bob = Math.sin(t * 0.9) * 0.04;
      horse.position.y = lerp(-1.0, 0, k) + bob;
    }
    // Visibility: the horse fades out completely as the hero ends (when the
    // services line arrives), then at the final CTA it comes back out of a big
    // glow and zooms toward you.
    const heroVis = 1 - smooth(0.6, 0.95, p);
    const ctaVis = smooth(0.2, 0.8, ce);
    horseMat.opacity = Math.max(heroVis * (1 - ce), ctaVis) * state.intro;

    const cm = smooth(0, 0.03, ce); // switches the CTA behaviour on cleanly
    const ceE = smooth(0.05, 1, ce); // zoom-in progress at the CTA

    let sc = lerp(baseScale * 1.5, baseScale * 0.85, z);
    sc = lerp(sc, wide ? baseScale * 0.9 : baseScale * 0.75, ce);
    const px = lerp(baseX, 0, ce);
    const py = lerp(baseY, wide ? 0 : 0.5, ce) + rise;
    const pz = lerp(0, lerp(-2.5, 0.8, ceE), cm); // starts behind the glow, ends in front
    const zoomMul = lerp(1, lerp(0.45, 1.1, ceE), cm);

    // Glow: soft and breathing behind the horse in the hero, big burst at the CTA.
    const heroGlow = (0.5 + 0.08 * Math.sin(t * 1.3)) * heroVis * (1 - ce);
    const ctaGlow = smooth(0, 0.3, ce) * (1 - 0.3 * smooth(0.55, 1, ce));
    glowMat.opacity = Math.max(heroGlow, ctaGlow) * state.intro;
    const burstMul = lerp(1, lerp(2.4, 1.5, ceE), cm);
    const glowSize = 6 * sc * burstMul;
    glow.position.set(px, py, -1.2);
    glow.scale.set(glowSize, glowSize, 1);

    rig.position.set(px, py, pz);
    rig.scale.setScalar(sc * zoomMul * (0.94 + 0.06 * state.intro));
    rig.rotation.y = HORSE_YAW + z * (Math.PI / 2) * (1 - ce) + cur.x * 0.15;
    rig.rotation.x = -cur.y * 0.08;

    renderer.render(scene, camera);

    // Runtime downgrade: if the first seconds of frames are slow, tell the app.
    if (!slowChecked && t > 2.5) {
      slowFrames++;
      slowTotal += deltaMs;
      if (slowFrames >= 120) {
        slowChecked = true;
        if (slowTotal / slowFrames > 38) window.setTimeout(onSlow, 0);
      }
    }
  };
  gsap.ticker.add(tick);

  const handleLost = (e: Event) => {
    e.preventDefault();
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  tick(0, 16); // draw once so the canvas is sized and ready

  return {
    // Kept the old name: fades the stage in and brings the horse up.
    assemble: () => {
      if (disposed) return;
      gsap.to(state, { intro: 1, duration: 2.2, ease: EASE.inOut, overwrite: true });
    },
    setActive: (on: boolean) => {
      active = on;
      canvas.style.visibility = on ? "visible" : "hidden";
    },
    dispose: () => {
      disposed = true;
      gsap.ticker.remove(tick);
      gsap.killTweensOf(state);
      window.removeEventListener("resize", layout);
      canvas.removeEventListener("webglcontextlost", handleLost);
      bgGeo.dispose();
      bgMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      sparkTex.dispose();
      horseGeos.forEach((g) => g.dispose());
      horseMat.dispose();
      glowMat.dispose();
      glowTex.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
