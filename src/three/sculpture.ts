import * as THREE from "three";
import { gsap } from "gsap";
import { stageInput } from "@/motion/state";
import { EASE } from "@/motion/tokens";

// Atmosphere stage: a slow liquid-metal wave shader (bronze at the top of the
// page, sapphire at the bottom), rising forge sparks, and a liquid-metal hero
// object with orbiting rings. This replaces the
// old placeholder solids. The exported names are unchanged, so SculptureStage
// and the rest of the app keep working. A real 3D model can be added later.

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


const OBJ_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vWN;
  varying vec3 vWP;

  vec3 displace(vec3 p) {
    float t = uTime * 0.35;
    float n = sin(p.x * 2.1 + t) * sin(p.y * 2.5 + t * 1.2) * sin(p.z * 2.3 - t * 0.9) * 0.28
            + sin(p.x * 4.6 - t * 1.6 + p.y * 3.1) * 0.06
            + sin(p.y * 5.2 + p.z * 4.1 + t * 1.3) * 0.04;
    return p * (1.0 + n * uAmp);
  }

  void main() {
    vec3 nrm = normalize(position);
    vec3 up = abs(nrm.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 tang = normalize(cross(up, nrm));
    vec3 bit = cross(nrm, tang);
    float e = 0.02;
    vec3 p0 = displace(nrm);
    vec3 p1 = displace(normalize(nrm + tang * e));
    vec3 p2 = displace(normalize(nrm + bit * e));
    vec3 nn = normalize(cross(p1 - p0, p2 - p0));
    vWN = normalize(mat3(modelMatrix) * nn);
    vec4 wp = modelMatrix * vec4(p0, 1.0);
    vWP = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const OBJ_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  varying vec3 vWN;
  varying vec3 vWP;

  void main() {
    vec3 n = normalize(vWN);
    vec3 v = normalize(cameraPosition - vWP);
    vec3 r = reflect(-v, n);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);

    float bands = sin(r.y * 7.0 + r.x * 3.0 + uTime * 0.4) * 0.5 + 0.5;
    float bands2 = sin(r.y * 13.0 - r.z * 4.0 - uTime * 0.3) * 0.5 + 0.5;
    vec3 warm = vec3(1.0, 0.58, 0.26);
    vec3 cool = vec3(0.30, 0.58, 1.0);
    vec3 tint = mix(warm, cool, smoothstep(-0.4, 0.5, r.x));
    float studio = smoothstep(0.55, 0.95, bands) * 0.9 + smoothstep(0.8, 0.98, bands2) * 0.6;

    vec3 col = vec3(0.015, 0.015, 0.02) + tint * studio;
    vec3 l = normalize(vec3(0.5, 0.8, 0.6));
    float spec = pow(max(dot(r, l), 0.0), 40.0);
    col += vec3(1.0, 0.92, 0.85) * spec * 1.2;
    col += tint * fres * 0.8;

    gl_FragColor = vec4(col * uIntro, 1.0);
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

export function createSculpture({ canvas, tier, onSlow, onContextLost }: Options): Sculpture {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

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
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  /* ---- Hero object: liquid-metal blob + orbiting rings ---- */
  const rig = new THREE.Group();
  scene.add(rig);
  const objUniforms = {
    uTime: { value: 0 },
    uAmp: { value: 1 },
    uIntro: { value: 0 },
  };
  const blobGeo = new THREE.IcosahedronGeometry(1, tier === "full" ? 32 : 14);
  const blobMat = new THREE.ShaderMaterial({
    vertexShader: OBJ_VERTEX,
    fragmentShader: OBJ_FRAGMENT,
    uniforms: objUniforms,
  });
  const blob = new THREE.Mesh(blobGeo, blobMat);
  blob.frustumCulled = false;
  rig.add(blob);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd9a066,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring1Geo = new THREE.TorusGeometry(1.7, 0.006, 8, 180);
  const ring2Geo = new THREE.TorusGeometry(2.0, 0.005, 8, 180);
  const ring1 = new THREE.Mesh(ring1Geo, ringMat);
  const ring2 = new THREE.Mesh(ring2Geo, ringMat);
  rig.add(ring1, ring2);

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
    baseY = wide ? -0.1 : 1.7;
    baseScale = wide ? Math.min(1.0, camera.aspect * 0.6) : 0.75;
  };
  layout();
  window.addEventListener("resize", layout);

  /* ---- Frame loop (GSAP ticker, same as before) ---- */
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

    // Hero object placement (same scroll choreography as before)
    const pe = smooth(0, 1, p);
    const spread = pe * (1 - ce);
    rig.position.set(
      lerp(baseX - (baseX > 0 ? pe * 1.4 : 0), 0, ce),
      lerp(baseY + pe * 1.6, wide ? 0.2 : 0.9, ce),
      lerp(-pe * 1.5, 0, ce),
    );
    rig.scale.setScalar(lerp(baseScale * (1 - pe * 0.2), wide ? 1.3 : 0.95, ce) * (0.35 + 0.65 * state.intro));
    rig.rotation.y = t * 0.12 + cur.x * 0.4 + spread * 1.2;
    rig.rotation.x = -cur.y * 0.25 + spread * 0.3;
    objUniforms.uTime.value = t;
    objUniforms.uAmp.value = Math.min(2, 1 + velocity * 6);
    objUniforms.uIntro.value = state.intro;
    ring1.rotation.set(t * 0.25, t * 0.15, 0);
    ring2.rotation.set(1.1 + Math.sin(t * 0.3) * 0.2, 0, -t * 0.2);
    ringMat.opacity = 0.5 * state.intro;

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
    // Kept the old name: fades the stage in once the intro is done.
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
      blobGeo.dispose();
      blobMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ringMat.dispose();
      renderer.dispose();
    },
  };
}
