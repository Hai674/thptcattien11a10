import React, { useState, useEffect, useRef } from 'react';
import { cyberAudio } from '@/utils/cyberAudio';

export interface PrismPalette {
  background?: string;
  blue?: string;
  violet?: string;
  magenta?: string;
  cyan?: string;
  gold?: string;
}

export interface PrismCometPreloaderProps {
  children?: React.ReactNode;
  loop?: boolean;
  progress?: number;
  durationMs?: number;
  word?: string;
  caption?: string;
  passes?: string[];
  palette?: PrismPalette;
  intensity?: number;
  speed?: number;
  quality?: number;
  grid?: boolean;
  hud?: boolean;
  grain?: boolean;
  fontFamily?: string;
  height?: string;
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_PALETTE: Required<PrismPalette> = {
  background: "#03030b",
  blue: "#2c55ff",
  violet: "#8a3dff",
  magenta: "#ff3fc8",
  cyan: "#86e6ff",
  gold: "#ffc35c"
};

const DEFAULT_PASSES: string[] = [
  "Khởi tạo không gian\nCát Tiên High School",
  "Tọa độ tập thể\nNiên khóa 2025 - 2028",
  "Hội tụ năng lượng\nBứt phá tương lai",
  "Kết nối thành viên\n11A10 Vươn xa",
  "Sẵn sàng"
];

const FONT_DISPLAY = '"Space Grotesk", "Sora", "Outfit", "Inter", "Helvetica Neue", Arial, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace';
const STAR_SVG_PATH = "M0-1C.07-.24.24-.07 1 0 .24.07.07.24 0 1-.07.24-.24.07-1 0-.24-.07-.07-.24 0-1Z";

const DURATION_IGNITE = 1600;
const DURATION_REVEAL = 2000;
const DURATION_LIFT = 1200;

const TWO_PI = Math.PI * 2;
const GRAIN_RATE = 0.1;
const STAR_BURST_MAX = 0.28;
const STAR_BURST_MIN = 0.38;
const STAR_CORE_RADIUS = 0.05;

const clamp01 = (v: number) => (v <= 0 ? 0 : v >= 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (v: number) => v * v * (3 - 2 * v);

const SIMULATED_POINTS: [number, number][] = [
  [0, 0],
  [0.16, 0.22],
  [0.27, 0.26],
  [0.55, 0.62],
  [0.66, 0.66],
  [0.84, 0.9],
  [1, 1]
];

function pcpSimulated(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 0; i < SIMULATED_POINTS.length - 1; i++) {
    const [t0, p0] = SIMULATED_POINTS[i];
    const [t1, p1] = SIMULATED_POINTS[i + 1];
    if (t <= t1) {
      return p0 + (p1 - p0) * smoothstep((t - t0) / (t1 - t0));
    }
  }
  return 1;
}

function pcpEase(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function pcpMorph(p: number): number {
  const scaled = clamp01(p) * 4;
  const floor = Math.min(3, Math.floor(scaled));
  return floor + smoothstep(clamp01((scaled - floor - 0.3) / 0.7));
}

function pcpPass(m: number, count: number): number {
  if (count < 1) return -1;
  const clamped = Math.min(4, Math.max(0, m));
  return Math.min(count - 1, Math.round((clamped / 4) * (count - 1)));
}

function pcpView(aspect: number) {
  const zoom = Math.max(1, 0.92 / Math.max(aspect, 0.1));
  return { zoom, w: aspect * zoom, h: zoom };
}

function pcpHead(aspect: number) {
  const v = pcpView(aspect);
  const x = -Math.min(v.w * 0.3, 0.52);
  const y = -v.h * 0.2;
  const tail = lerp(1.05, 0.5, clamp01((aspect - 0.5) / 1));
  const room = Math.min((v.w / 2 - x) / Math.cos(tail), (v.h / 2 - y) / Math.sin(tail));
  return { x, y, tail, room };
}

function pcpRig(morph: number, aspect: number) {
  const { zoom, w, h } = pcpView(aspect);
  const m0 = smoothstep(clamp01(morph));
  const m1 = smoothstep(clamp01(morph - 1));
  const m2 = smoothstep(clamp01(morph - 2));
  const m3 = smoothstep(clamp01(morph - 3));

  let phi = Math.max(0.02, m0 * TWO_PI);
  const rho0 = ((1 - m0) * w) / phi;
  let ax = 0;
  let ay = (h / 2) * (1 - m0) + rho0;
  let beta = -Math.PI / 2;
  let kv = lerp(1 / h, 2.6, m0);

  beta += m1 * Math.PI;
  phi = lerp(phi, 0.85, m1);
  ay = lerp(ay, -0.3, m1);
  kv = lerp(kv, 1.45, m1);

  const head = pcpHead(aspect);
  beta = lerp(beta, head.tail, m2);
  phi = lerp(phi, 0.55, m2);
  ax = lerp(ax, head.x, m2);
  ay = lerp(ay, head.y, m2);
  kv = lerp(kv, Math.max(0.75, 0.8 / (head.room * 0.92)), m2);

  const closed = smoothstep(clamp01((phi / TWO_PI - 0.9) / 0.1));

  return {
    zoom,
    ax,
    ay,
    beta,
    phi,
    rho0,
    kv,
    vf: lerp(1, 0.32, m2),
    narrow: lerp(lerp(1, 0.55, m1), 0.3, m2),
    wave: m2,
    bulge: m1 * (1 - m2),
    edge: clamp01(m0 * 4) * (1 - closed),
    closed,
    star: m3,
    lines: m3
  };
}

function pcpIgnite(igniteT: number, aspect: number) {
  const head = pcpHead(aspect);
  const c = clamp01(igniteT);
  const eased = pcpEase(c);
  const midX = head.x * 0.15 + 0.22;
  const midY = head.y - 0.1;
  const inv = 1 - eased;

  return {
    x: inv * inv * head.x + 2 * inv * eased * midX + eased * eased * 0,
    y: inv * inv * head.y + 2 * inv * eased * midY + eased * eased * GRAIN_RATE,
    r: lerp(STAR_CORE_RADIUS, STAR_BURST_MAX, smoothstep(clamp01((c - 0.08) / 0.8))),
    rot: lerp(0, STAR_BURST_MIN + TWO_PI, eased),
    mode: smoothstep(clamp01((c - 0.3) / 0.55)),
    comet: 1 - smoothstep(clamp01((c - 0.05) / 0.5)),
    retract: smoothstep(clamp01(c / 0.5)),
    lines: 1 - smoothstep(clamp01((c - 0.4) / 0.4)),
    bloom: Math.exp(-Math.pow((c - 0.32) / 0.08, 2))
  };
}

function pcpHex(color: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? match[1].replace(/./g, (d) => d + d) : match[1];
  return [0, 2, 4].map((d) => parseInt(hex.slice(d, d + 2), 16) / 255) as [number, number, number];
}

const VERTEX_SHADER_SRC = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT_SHADER_SRC = "precision highp float;\n\nuniform vec2 uRes;\nuniform float uZoom;\nuniform float uTime;\n\nuniform vec2 uApex;\nuniform float uBeta;\nuniform float uPhi;\nuniform float uRho0;\nuniform float uKv;\nuniform float uVf;\nuniform float uNarrow;\nuniform float uWave;\nuniform float uBulge;\nuniform float uEdge;\nuniform float uClosed;\nuniform float uComet;\nuniform float uLines;\nuniform float uLineDir;\n\nuniform vec2 uStarC;\nuniform float uStarR;\nuniform float uStarAmt;\nuniform float uStarMode;\nuniform float uStarRot;\nuniform float uSwirl;\nuniform vec2 uTilt;\nuniform float uHoleOpen;\nuniform float uFlash;\nuniform float uBloom;\n\nuniform vec3 uPtr;\nuniform vec3 uBg;\nuniform vec3 uBlue;\nuniform vec3 uViolet;\nuniform vec3 uMagenta;\nuniform vec3 uCyan;\nuniform vec3 uGold;\nuniform float uExposure;\nuniform float uGrain;\n\n#define PI 3.14159265\n#define TAU 6.28318531\n\nfloat hash(vec2 p) {\n  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\n  p3 += dot(p3, p3.yzx + 33.33);\n  return fract((p3.x + p3.y) * p3.z);\n}\n\n// Value noise that tiles every 'per' cells across x, so the sheet closes into\n// a ring without a seam.\nfloat pnoise(vec2 p, float per) {\n  vec2 i = floor(p);\n  vec2 f = fract(p);\n  vec2 w = f * f * (3.0 - 2.0 * f);\n  float x0 = mod(i.x, per);\n  float x1 = mod(i.x + 1.0, per);\n  float a = hash(vec2(x0, i.y));\n  float b = hash(vec2(x1, i.y));\n  float c = hash(vec2(x0, i.y + 1.0));\n  float d = hash(vec2(x1, i.y + 1.0));\n  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\n}\n\nfloat fbm(vec2 p, float per) {\n  float s = 0.0;\n  float amp = 0.5;\n  for (int i = 0; i < 4; i++) {\n    s += amp * pnoise(p, per);\n    p = p * 2.0 + vec2(0.0, 17.3);\n    per *= 2.0;\n    amp *= 0.5;\n  }\n  return s / 0.9375;\n}\n\nmat2 rot(float a) {\n  float c = cos(a);\n  float s = sin(a);\n  return mat2(c, s, -s, c);\n}\n\n// The one layer everything is made of: ridged fractal-noise curtains hanging\n// from a flare along v = 0, in sheet space (u across 0–1, v down).\nvec3 sheet(float u, float v, float t) {\n  float X = u * 20.0;\n  float vy = v * uVf;\n  float w = fbm(vec2(X * 0.5, vy * 1.3 - t * 0.12), 10.0);\n  float wave = sin(v * 9.0 - t * 2.2) * uWave * 0.9;\n  float n = fbm(vec2(X + (w - 0.5) * 5.0 + wave, vy * 1.6 - t * 0.22), 20.0);\n  float ridge = 1.0 - abs(n * 2.0 - 1.0);\n  float ribbons = pow(ridge, mix(5.0, 2.6, uWave));\n  float blob = pnoise(vec2(X * 0.25, v * 2.2 - t * 0.18), 5.0);\n  float len = 0.5 + 0.42 * pnoise(vec2(X * 0.5, 3.7 + t * 0.03), 10.0);\n  float body = smoothstep(len + 0.08, len - 0.42, v) * smoothstep(-0.02, 0.07, v);\n  float I = ribbons * body * (0.3 + 1.25 * blob);\n\n  float hue = pnoise(vec2(X * 0.5, v * 0.7 + t * 0.04 + 9.0), 10.0);\n  vec3 c = mix(uBlue, uViolet, smoothstep(0.22, 0.58, hue));\n  c = mix(c, uMagenta, smoothstep(0.6, 0.9, hue) * 0.85);\n  vec3 col = c * I * 1.7;\n  // chromatic fringe where a ribbon turns hot, warm on one side, cool on the other\n  float fringe = smoothstep(0.42, 0.62, I) * smoothstep(1.0, 0.68, I);\n  col += mix(uGold, uCyan, smoothstep(0.3, 0.7, hue)) * fringe * 0.55;\n  col += vec3(1.0, 0.97, 0.93) * smoothstep(0.72, 1.25, I) * 1.4;\n\n  // the optical flare the sheet hangs from\n  float across = mix(1.0 - 0.7 * smoothstep(0.0, 0.5, abs(u - 0.5)), 1.0, uClosed);\n  float flare = exp(-abs(v) * 6.5) * 0.6 + exp(-abs(v) * 30.0) * 1.3;\n  col += mix(uCyan, vec3(1.0), 0.45) * flare * across;\n\n  // sparks drifting down the curtains\n  vec2 g = vec2(u * 64.0, v * 20.0 - t * 0.7);\n  vec2 id = floor(g);\n  id.x = mod(id.x, 64.0);\n  float h = hash(id + 11.0);\n  vec2 off = vec2(hash(id + 3.7), hash(id + 9.1)) - 0.5;\n  float spark = step(0.93, h) * smoothstep(0.17, 0.0, length(fract(g) - 0.5 - off * 0.6));\n  spark *= (0.55 + 0.45 * sin(t * 6.0 + h * 40.0)) * smoothstep(0.05, 0.2, v) * smoothstep(1.15, 0.6, v);\n  col += mix(uGold, vec3(1.0), 0.35) * spark * 1.5;\n  return col;\n}\n\nvoid main() {\n  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;\n  vec2 a = p * uZoom;\n  float t = uTime;\n\n  // the pointer is a displacement pass by hand: a small eddy that drags the light\n  vec2 pd = a - uPtr.xy;\n  float pr = dot(pd, pd);\n  vec2 aw = uPtr.xy + rot(uPtr.z * 1.5 * exp(-pr * 14.0)) * pd * (1.0 - uPtr.z * 0.22 * exp(-pr * 24.0));\n\n  vec3 col = uBg + uBlue * 0.05 * smoothstep(1.2, 0.0, length(p));\n  float alpha = 1.0;\n\n  if (uComet > 0.001) {\n    vec2 d = aw - uApex;\n    float rho = length(d);\n    float ang = mod(atan(d.y, d.x) - uBeta + PI, TAU) - PI;\n    float v = (rho - uRho0) * uKv;\n    float u = ang / uPhi * (1.0 - uBulge * 0.45 * sin(clamp(v, 0.0, 1.0) * PI)) + 0.5;\n    float mask = mix(1.0, smoothstep(0.0, 0.07, u) * smoothstep(1.0, 0.93, u), uEdge);\n    col += sheet(0.5 + (u - 0.5) * uNarrow, v, t) * mask * uComet;\n    col += mix(uViolet, uCyan, 0.5) * exp(-pr * 70.0) * uPtr.z * 0.1;\n  }\n\n  // speed lines streaming back past the comet\n  if (uLines > 0.001) {\n    vec2 dir = vec2(cos(uLineDir), sin(uLineDir));\n    float along = dot(a, dir);\n    float across = dot(a, vec2(-dir.y, dir.x)) * 38.0;\n    float h = hash(vec2(floor(across), 3.1));\n    float lane = fract(across) - 0.5;\n    float seg = fract(along * 0.45 - t * (0.5 + h * 1.3) + h * 9.0);\n    float line = step(0.8, h) * exp(-lane * lane * 40.0) * smoothstep(0.0, 0.08, seg) * smoothstep(0.42, 0.1, seg);\n    col += mix(uBlue, uViolet, hash(vec2(h, 1.0))) * line * uLines * 0.85;\n  }\n\n  if (uStarAmt > 0.001) {\n    vec2 q = a - uStarC;\n    float den = max(0.2, 1.0 + dot(q, uTilt));\n    q /= den;\n    float rr = length(q);\n    float R = max(uStarR, 0.0001);\n    q = rot(uStarRot + uSwirl * min(rr / R, 3.0)) * q;\n    float e = mix(0.46, 0.6, uStarMode);\n    vec2 qa = abs(q) / R + 0.00001;\n    float S = pow(pow(qa.x, e) + pow(qa.y, e), 1.0 / e);\n    float ang = atan(q.y, q.x);\n\n    // the sparkle riding the comet's head: a crisp white star in a magenta halo\n    vec3 spark = vec3(1.0) * smoothstep(1.0, 0.5, S) * 2.4;\n    spark += mix(uMagenta, uViolet, 0.35) * (0.7 / (1.0 + S * S * 0.5));\n    spark += uMagenta * exp(-rr / R * 0.8) * 0.5;\n    col += spark * uStarAmt * (1.0 - uStarMode);\n\n    if (uStarMode > 0.001) {\n      // the portal: a star-shaped hole in a dark membrane, white-hot inside,\n      // with thin-film bands running round the rim\n      float aa = 2.5 * uZoom * den / (uRes.y * R);\n      float inside = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, S);\n      float sf = S + 0.05 * sin(ang * 2.0 + t * 0.6) + 0.03 * sin(rr / R * 9.0 - t);\n      vec3 ic = vec3(2.6, 2.55, 2.7);\n      ic = mix(ic, mix(vec3(1.6), uMagenta * 1.9, 0.65), smoothstep(0.42, 0.66, sf));\n      ic = mix(ic, uViolet * 1.7, smoothstep(0.66, 0.82, sf));\n      ic = mix(ic, uCyan * 1.7, smoothstep(0.82, 0.94, sf));\n      ic += vec3(0.9, 0.95, 1.0) * smoothstep(0.93, 1.0, S) * 1.3;\n\n      float o = max(S - 1.0, 0.0);\n      float fold = 0.5 + 0.5 * sin(ang * 2.0 + 0.7);\n      vec3 mem = mix(uBg, uBlue, 0.1) * 1.3;\n      mem += uBlue * (0.1 + 0.16 * fold) * exp(-o * 0.55);\n      mem += uBlue * 0.45 * exp(-o * 4.5) + uCyan * 0.75 * exp(-o * 26.0);\n      mem -= vec3(0.05) * exp(-o * 9.0) * (1.0 - exp(-o * 60.0));\n      float rays = pow(0.5 + 0.5 * sin(ang * 6.0 + sin(ang * 3.0 + t * 0.2) * 1.6 + t * 0.05), 7.0);\n      mem += mix(uCyan, vec3(1.0), 0.4) * rays * exp(-rr / R * 0.7) * 0.7;\n      // light spilling past the rim\n      mem += mix(uCyan, vec3(1.0), 0.6) * exp(-o * 7.0) * 0.32;\n\n      vec3 portal = mix(max(mem, vec3(0.0)), ic, inside);\n      col = mix(col, portal, uStarMode);\n      float hole = inside * (1.0 - smoothstep(0.5, 0.88, S));\n      alpha = 1.0 - uHoleOpen * hole * uStarMode;\n    }\n  }\n\n  // the star catching: a bloom off the star, not a white frame\n  float bd = length(a - uStarC);\n  col += vec3(1.0, 0.95, 1.0) * uBloom * (exp(-bd * 18.0) * 3.0 + exp(-bd * 5.5) * 1.1 + 0.03);\n\n  col = 1.0 - exp(-col * uExposure);\n  col *= 1.0 - 0.5 * smoothstep(0.35, 1.25, length(p * vec2(0.9, 1.0)));\n  col += (hash(gl_FragCoord.xy + fract(t * 7.0) * 311.0) - 0.5) * uGrain;\n  col = mix(col, vec3(1.0), uFlash);\n  alpha = mix(alpha, 1.0, uFlash);\n  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);\n}\n";

const UNIFORM_NAMES = [
  "uRes", "uZoom", "uTime", "uApex", "uBeta", "uPhi", "uRho0", "uKv", "uVf",
  "uNarrow", "uWave", "uBulge", "uEdge", "uClosed", "uComet", "uLines", "uLineDir",
  "uStarC", "uStarR", "uStarAmt", "uStarMode", "uStarRot", "uSwirl", "uTilt",
  "uHoleOpen", "uFlash", "uBloom", "uPtr", "uBg", "uBlue", "uViolet", "uMagenta",
  "uCyan", "uGold", "uExposure", "uGrain"
];

function linkProgram(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  for (const [type, source] of [
    [gl.VERTEX_SHADER, vsSrc],
    [gl.FRAGMENT_SHADER, fsSrc]
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }

  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

const PCP_STYLES = `
.pcp-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
}
.pcp-root:not([data-phase="done"]) { background: var(--pcp-bg); }
.pcp-root svg, .pcp-root canvas, .pcp-root img { max-width: none; }
.pcp-dest {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;
}
.pcp-root[data-phase="lift"] .pcp-dest, .pcp-dest[data-active="true"] { opacity: 1; pointer-events: auto; }
.pcp-gate {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  background: var(--pcp-bg);
  color: #f3f1ff;
  font-family: var(--pcp-mono);
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.pcp-root[data-phase="lift"] .pcp-gate { pointer-events: none; }
.pcp-root[data-phase="lift"][data-hole="true"] .pcp-gate {
  background: transparent;
  opacity: 0;
  transition: opacity 0.5s ease 0.6s;
}
.pcp-root[data-phase="lift"][data-hole="true"][data-gl="false"] .pcp-gate { transition-delay: 0.3s; }
.pcp-gate:focus-visible .pcp-frame { box-shadow: inset 0 0 0 1px rgba(170, 185, 255, 0.55); }
.pcp-layer, .pcp-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

/* ---- no WebGL: the same story in CSS, smaller ---- */
.pcp-fallback {
  background:
    radial-gradient(circle at 50% 50%, var(--pcp-magenta) 0%, transparent 28%),
    radial-gradient(ellipse 60% 45% at 50% 50%, var(--pcp-violet) 0%, transparent 70%),
    radial-gradient(ellipse 90% 70% at 50% 40%, var(--pcp-blue) 0%, transparent 75%),
    var(--pcp-bg);
  opacity: calc(0.25 + var(--pcp-p) * 0.5);
  transition: opacity 1s ease;
}
.pcp-root:not([data-phase="load"]) .pcp-fallback { opacity: 0.9; }
.pcp-fbstar {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--pcp-u) * 0.6);
  height: calc(var(--pcp-u) * 0.6);
  margin: calc(var(--pcp-u) * -0.3) 0 0 calc(var(--pcp-u) * -0.3);
  fill: #fff;
  filter: drop-shadow(0 0 calc(var(--pcp-u) * 0.03) var(--pcp-magenta)) drop-shadow(0 0 calc(var(--pcp-u) * 0.08) var(--pcp-cyan));
  transform: scale(calc(0.05 + var(--pcp-p) * 0.2));
  transition: transform 1.6s cubic-bezier(0.5, 0, 0.1, 1);
}
.pcp-root:not([data-phase="load"]) .pcp-fbstar { transform: rotate(45deg) scale(1); }

/* ---- the compositing grid ---- */
.pcp-grid {
  background-image:
    linear-gradient(rgba(150, 170, 255, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(150, 170, 255, 0.075) 1px, transparent 1px);
  background-size: calc(var(--pcp-u) * 0.065) calc(var(--pcp-u) * 0.065);
  background-position: 50% 50%;
  mix-blend-mode: screen;
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 30%, transparent 85%);
  mask-image: radial-gradient(ellipse at 50% 50%, #000 30%, transparent 85%);
  transition: opacity 1.4s ease;
}
.pcp-root:not([data-phase="load"]) .pcp-grid { opacity: 0; }

/* ---- letterbox: disabled so preloader is 100% fullscreen edge-to-edge ---- */
.pcp-bar { display: none !important; }

/* ---- HUD ---- */
.pcp-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-size: clamp(9px, calc(var(--pcp-u) * 0.017), 13px);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: opacity 0.7s ease;
}
.pcp-root[data-phase="lift"] .pcp-hud { opacity: 0; }
.pcp-bl {
  position: absolute;
  left: calc(var(--pcp-u) * 0.05);
  bottom: calc(var(--pcp-u) * 0.05);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.6, 0, 0.2, 1);
}
.pcp-root:not([data-phase="load"]) .pcp-bl { opacity: 0; transform: translateY(1.2em); }
.pcp-count {
  font-family: var(--pcp-display);
  font-size: clamp(30px, calc(var(--pcp-u) * 0.13), 112px);
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin: 0;
  text-shadow: -1px 0 color-mix(in srgb, var(--pcp-cyan) 60%, transparent), 1px 0 color-mix(in srgb, var(--pcp-magenta) 60%, transparent);
}
.pcp-count small { font-size: 0.3em; letter-spacing: 0.1em; margin-left: 0.3em; vertical-align: top; opacity: 0.6; }
.pcp-segs { display: flex; gap: 4px; margin-top: 0.9em; width: clamp(120px, calc(var(--pcp-u) * 0.36), 300px); }
.pcp-seg { position: relative; flex: 1; height: 2px; background: rgba(200, 205, 255, 0.16); overflow: hidden; }
.pcp-seg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--pcp-cyan), var(--pcp-violet), var(--pcp-magenta));
  transform-origin: 0 50%;
  transform: scaleX(clamp(0, calc(var(--pcp-p) * 4 - var(--k)), 1));
}

/* ---- the wordmark under the portal ---- */
.pcp-title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  transition: opacity 0.6s ease, transform 1.7s cubic-bezier(0.6, 0, 0.3, 1), filter 1.2s ease;
}
.pcp-root[data-phase="lift"] .pcp-title { opacity: 0; transform: scale(1.35); filter: blur(10px); }
.pcp-word {
  margin: 0;
  font-family: var(--pcp-display);
  font-size: clamp(26px, calc(var(--pcp-u) * 0.085), 110px);
  font-weight: 300;
  letter-spacing: 0.34em;
  text-indent: 0.34em;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
}
.pcp-letter {
  display: inline-block;
  opacity: 0;
  filter: blur(14px);
  transform: translateY(0.35em) scale(1.4);
  text-shadow:
    -0.04em 0 color-mix(in srgb, var(--pcp-cyan) 75%, transparent),
    0.04em 0 color-mix(in srgb, var(--pcp-magenta) 75%, transparent),
    0 0 0.5em color-mix(in srgb, var(--pcp-violet) 60%, transparent);
  transition: opacity 1s ease, filter 1.2s ease, transform 1.4s cubic-bezier(0.15, 0.8, 0.15, 1);
}
.pcp-root[data-phase="reveal"] .pcp-letter, .pcp-root[data-phase="lift"] .pcp-letter {
  opacity: 1;
  filter: blur(0);
  transform: none;
}
.pcp-caption, .pcp-hint {
  margin: 1.4em 0 0;
  font-size: clamp(9px, calc(var(--pcp-u) * 0.017), 13px);
  letter-spacing: 0.4em;
  text-indent: 0.4em;
  text-transform: uppercase;
  color: rgba(225, 228, 255, 0.72);
  opacity: 0;
  transition: opacity 1s ease 0.7s, letter-spacing 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s;
}
.pcp-hint { margin-top: 0.9em; color: rgba(225, 228, 255, 0.45); transition-delay: 1.6s; }
.pcp-root[data-phase="reveal"] .pcp-caption { opacity: 1; letter-spacing: 0.5em; }
.pcp-root[data-phase="reveal"] .pcp-hint { opacity: 1; animation: pcp-breathe 2.4s ease-in-out 2.4s infinite; }

.pcp-frame { position: absolute; inset: 0; pointer-events: none; }
.pcp-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@keyframes pcp-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

@media (prefers-reduced-motion: reduce) {
  .pcp-root[data-phase="reveal"] .pcp-hint { animation: none; }
  .pcp-letter { filter: none; transform: none; transition: opacity 0.4s ease; }
  .pcp-root[data-phase="lift"] .pcp-title { transform: none; filter: none; }
  .pcp-bar, .pcp-bl, .pcp-fbstar { transition-duration: 0.01s; }
  .pcp-root[data-phase="lift"][data-hole="true"] .pcp-gate { transition-delay: 0s; }
}
.pcp-root[data-phase="done"] { height: auto !important; min-height: 100vh; overflow: visible !important; }
.pcp-root[data-phase="done"] .pcp-dest { position: static !important; inset: auto !important; overflow-y: visible !important; height: auto !important; min-height: 100vh; }
`;

export const PrismCometPreloader: React.FC<PrismCometPreloaderProps> = ({
  children,
  loop = false,
  progress,
  durationMs = 4500,
  word = "11A10",
  caption = "THPT Cát Tiên · Niên Khóa 2025 - 2028",
  passes = DEFAULT_PASSES,
  palette,
  intensity = 1,
  speed = 1,
  quality = 0.75,
  grid = true,
  hud = true,
  grain = true,
  fontFamily = FONT_DISPLAY,
  height = "100svh",
  onComplete,
  className = ""
}) => {
  const [phase, setPhase] = useState<"load" | "ignite" | "reveal" | "lift" | "done">("load");
  const [displayPercent, setDisplayPercent] = useState(0);
  const [activePassIndex, setActivePassIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [isFallback, setIsFallback] = useState(false);
  const [contextLostCount, setContextLostCount] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 1280, h: 800 });

  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerTargetRef = useRef<{ x: number; y: number } | null>(null);
  const isSkipRequestedRef = useRef(false);
  const progressRatioRef = useRef(0);
  const phaseRef = useRef<"load" | "ignite" | "reveal" | "lift" | "done">("load");
  const phaseStartTimeRef = useRef(0);
  const loadStartTimeRef = useRef(0);
  const loopCountRef = useRef(loopCount);
  loopCountRef.current = loopCount;

  const externalProgressRef = useRef(progress);
  externalProgressRef.current = progress;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const hasHole = !loop && children != null;
  const mergedPalette: Required<PrismPalette> = { ...DEFAULT_PALETTE, ...palette };

  const renderConfig = {
    colors: mergedPalette,
    exposure: 1.25 * Math.min(2, Math.max(0.4, intensity)),
    speed: Math.min(3, Math.max(0, speed)),
    quality: Math.min(1, Math.max(0.35, quality)),
    grain: grain ? 0.035 : 0,
    hole: hasHole,
    passes: passes.length
  };
  const configRef = useRef(renderConfig);
  configRef.current = renderConfig;

  const durationIgniteActual = reducedMotion ? 600 : DURATION_IGNITE;
  const durationLiftActual = reducedMotion ? 700 : DURATION_LIFT;

  useEffect(() => {
    phaseRef.current = phase;
    phaseStartTimeRef.current = performance.now();
    if (phase === "load") {
      loadStartTimeRef.current = phaseStartTimeRef.current;
    }
  }, [phase, loopCount]);

  // Window resize observer
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Progress animation ticker
  useEffect(() => {
    if (phase !== "load") return;
    const el = rootRef.current;
    let animId = 0;
    let currentP = 0;
    let lastTime = performance.now();
    const startTime = lastTime;
    let lastPct = -1;
    isSkipRequestedRef.current = false;

    const paint = (pVal: number) => {
      progressRatioRef.current = pVal;
      el?.style.setProperty("--pcp-p", pVal.toFixed(4));
      const pct = Math.round(pVal * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        setDisplayPercent(pct);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - lastTime);
      lastTime = now;
      const ext = externalProgressRef.current;
      let targetP = ext !== undefined ? clamp01(ext / 100) : pcpSimulated((now - startTime) / Math.max(400, durationMs));
      if (isSkipRequestedRef.current) {
        targetP = 1;
      }
      const smoothing = isSkipRequestedRef.current ? 0.06 : ext !== undefined ? 0.08 : 1;
      currentP += (targetP - currentP) * Math.min(1, smoothing * (dt / 16.7));
      if (targetP - currentP < 0.002) {
        currentP = targetP;
      }
      paint(currentP);
      if (currentP >= 1) {
        setPhase("ignite");
        return;
      }
      animId = requestAnimationFrame(tick);
    };

    paint(0);
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [phase, loopCount, durationMs]);

  // WebGL Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance"
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      setIsFallback(true);
      return;
    }

    const program = linkProgram(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
    if (!program) {
      setIsFallback(true);
      return;
    }

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    for (const name of UNIFORM_NAMES) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    let animId = 0;
    let prevTime = performance.now();
    let timeAccum = 0;
    let morphSmooth = 0;
    let igniteSmooth = 0;
    let lastPassIdx = -1;
    let isIntersecting = true;

    const pointerState = { x: 0, y: 0, on: 0, nx: 0, ny: 0 };
    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          isIntersecting = entries[entries.length - 1].isIntersecting;
        })
      : null;
    io?.observe(canvas);

    const getRgb = (hexA?: string, hexB?: string): [number, number, number] =>
      (hexA ? pcpHex(hexA) : null) ?? (hexB ? pcpHex(hexB) : null) ?? [0, 0, 0];

    const frame = (now: number) => {
      animId = requestAnimationFrame(frame);
      const dt = Math.min(0.064, (now - prevTime) / 1000);
      prevTime = now;

      if (!isIntersecting || (typeof document !== "undefined" && document.hidden) || !gl) return;

      const cfg = configRef.current;
      if (!reducedMotion) {
        timeAccum += dt * cfg.speed;
      }
      const curTime = reducedMotion ? 4 : timeAccum % 600;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.max(1, Math.round(canvas.clientWidth * dpr * cfg.quality));
      const targetH = Math.max(1, Math.round(canvas.clientHeight * dpr * cfg.quality));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const aspect = targetW / targetH;
      const curPhase = phaseRef.current;
      const phaseElapsed = now - phaseStartTimeRef.current;
      const kFactor = (rate: number) => (reducedMotion ? 1 : 1 - Math.exp(-dt * rate));

      const targetMorph = curPhase === "load" ? pcpMorph(progressRatioRef.current) : 4;
      morphSmooth += (targetMorph - morphSmooth) * kFactor(curPhase === "load" && targetMorph < morphSmooth ? 30 : 6);

      if (curPhase === "load") {
        igniteSmooth = 0;
      } else if (curPhase === "ignite") {
        igniteSmooth = Math.max(igniteSmooth, clamp01(phaseElapsed / durationIgniteActual));
      } else {
        igniteSmooth += (1 - igniteSmooth) * kFactor(5);
      }

      const liftProgress = curPhase === "lift" ? clamp01(phaseElapsed / durationLiftActual) : 0;
      const rig = pcpRig(morphSmooth, aspect);
      const ign = pcpIgnite(igniteSmooth, aspect);
      const isLoading = curPhase === "load";
      const passIdx = isLoading ? pcpPass(morphSmooth, cfg.passes) : cfg.passes - 1;

      if (passIdx !== lastPassIdx) {
        lastPassIdx = passIdx;
        setActivePassIndex(passIdx);
      }

      const ptrTarget = pointerTargetRef.current;
      pointerState.on += ((ptrTarget && !reducedMotion ? 1 : 0) - pointerState.on) * kFactor(4);
      if (ptrTarget) {
        pointerState.nx += (ptrTarget.x - pointerState.nx) * kFactor(7);
        pointerState.ny += (ptrTarget.y - pointerState.ny) * kFactor(7);
      } else {
        pointerState.nx += (0 - pointerState.nx) * kFactor(1.5);
        pointerState.ny += (0 - pointerState.ny) * kFactor(1.5);
      }
      pointerState.x = pointerState.nx * (aspect * rig.zoom) * 0.5;
      pointerState.y = -pointerState.ny * rig.zoom * 0.5;

      const starMode = isLoading ? 0 : ign.mode;
      const starBob = reducedMotion ? 0 : Math.sin(curTime * 1.3) * 0.025 * starMode;
      const liftScale = reducedMotion ? 1 : Math.exp(smoothstep(liftProgress) * 7.5);
      const starCenterX = isLoading ? rig.ax : ign.x + pointerState.x * 0.04 * starMode;
      const starCenterY = isLoading ? rig.ay : ign.y + pointerState.y * 0.04 * starMode;
      const starRadius = (isLoading ? STAR_CORE_RADIUS : ign.r) * (1 + starBob) * liftScale;
      const invLift = 1 - liftProgress;
      const cometAmt = isLoading ? 1 : ign.comet;
      const colPalette = cfg.colors;

      gl.viewport(0, 0, targetW, targetH);
      gl.uniform2f(uniforms.uRes, targetW, targetH);
      gl.uniform1f(uniforms.uZoom, rig.zoom);
      gl.uniform1f(uniforms.uTime, curTime);
      gl.uniform2f(uniforms.uApex, isLoading ? rig.ax : ign.x, isLoading ? rig.ay : ign.y);
      gl.uniform1f(uniforms.uBeta, rig.beta);
      gl.uniform1f(uniforms.uPhi, rig.phi);
      gl.uniform1f(uniforms.uRho0, rig.rho0);
      gl.uniform1f(uniforms.uKv, rig.kv * (1 + (isLoading ? 0 : ign.retract) * 5));
      gl.uniform1f(uniforms.uVf, rig.vf);
      gl.uniform1f(uniforms.uNarrow, rig.narrow);
      gl.uniform1f(uniforms.uWave, rig.wave);
      gl.uniform1f(uniforms.uBulge, rig.bulge);
      gl.uniform1f(uniforms.uEdge, rig.edge);
      gl.uniform1f(uniforms.uClosed, rig.closed);
      gl.uniform1f(uniforms.uComet, cometAmt);
      gl.uniform1f(uniforms.uLines, (isLoading ? rig.lines : ign.lines) * invLift);
      gl.uniform1f(uniforms.uLineDir, pcpHead(aspect).tail);
      gl.uniform2f(uniforms.uStarC, starCenterX, starCenterY);
      gl.uniform1f(uniforms.uStarR, starRadius);
      gl.uniform1f(uniforms.uStarAmt, isLoading ? rig.star : 1);
      gl.uniform1f(uniforms.uStarMode, starMode);
      gl.uniform1f(uniforms.uStarRot, (isLoading ? 0 : ign.rot) + (reducedMotion ? 0 : Math.sin(curTime * 0.3) * 0.05 * starMode));
      gl.uniform1f(uniforms.uSwirl, starMode * (0.55 + (reducedMotion ? 0 : Math.sin(curTime * 0.7) * 0.08)));
      gl.uniform2f(uniforms.uTilt, (0.32 - pointerState.nx * 0.4 * pointerState.on) * starMode * invLift, (0.22 + pointerState.ny * 0.34 * pointerState.on) * starMode * invLift);
      gl.uniform1f(uniforms.uHoleOpen, cfg.hole ? (reducedMotion ? liftProgress : smoothstep(clamp01(liftProgress / 0.4))) : 0);
      gl.uniform1f(uniforms.uBloom, isLoading || reducedMotion ? 0 : ign.bloom * (1 - liftProgress));

      let flashVal = 0;
      if (!cfg.hole && curPhase === "lift") {
        flashVal = reducedMotion ? liftProgress : smoothstep(clamp01((liftProgress - 0.5) / 0.5));
      }
      if (isLoading && loopCountRef.current > 0 && !reducedMotion) {
        flashVal = Math.exp(-phaseElapsed / 450);
      }
      gl.uniform1f(uniforms.uFlash, flashVal);
      gl.uniform3f(uniforms.uPtr, pointerState.x, pointerState.y, pointerState.on * (isLoading ? 1 : 1 - starMode));

      gl.uniform3fv(uniforms.uBg, getRgb(colPalette.background, DEFAULT_PALETTE.background));
      gl.uniform3fv(uniforms.uBlue, getRgb(colPalette.blue, DEFAULT_PALETTE.blue));
      gl.uniform3fv(uniforms.uViolet, getRgb(colPalette.violet, DEFAULT_PALETTE.violet));
      gl.uniform3fv(uniforms.uMagenta, getRgb(colPalette.magenta, DEFAULT_PALETTE.magenta));
      gl.uniform3fv(uniforms.uCyan, getRgb(colPalette.cyan, DEFAULT_PALETTE.cyan));
      gl.uniform3fv(uniforms.uGold, getRgb(colPalette.gold, DEFAULT_PALETTE.gold));

      gl.uniform1f(uniforms.uExposure, cfg.exposure);
      gl.uniform1f(uniforms.uGrain, reducedMotion ? 0 : cfg.grain);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    animId = requestAnimationFrame(frame);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animId);
      animId = 0;
    };
    const onRestored = () => setContextLostCount((c) => c + 1);

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(animId);
      io?.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (gl && !gl.isContextLost()) {
        gl.deleteProgram(program);
        gl.deleteBuffer(quadBuffer);
      }
    };
  }, [reducedMotion, contextLostCount, durationIgniteActual, durationLiftActual]);

  // Phase progression timers
  useEffect(() => {
    if (phase === "ignite") {
      try { cyberAudio.playAccessGranted(); } catch {}
      const timer = setTimeout(() => setPhase("reveal"), durationIgniteActual);
      return () => clearTimeout(timer);
    }
    if (phase === "reveal") {
      const timer = setTimeout(() => setPhase("lift"), DURATION_REVEAL);
      return () => clearTimeout(timer);
    }
    if (phase === "lift") {
      const timer = setTimeout(() => {
        if (loop) {
          setDisplayPercent(0);
          setLoopCount((c) => c + 1);
          setPhase("load");
        } else {
          setPhase("done");
          onCompleteRef.current?.();
        }
      }, durationLiftActual);
      return () => clearTimeout(timer);
    }
  }, [phase, loop, durationIgniteActual, durationLiftActual]);

  const onActivate = () => {
    try { cyberAudio.playClick(); } catch {}
    setPhase("done");
    onCompleteRef.current?.();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointerTargetRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1
    };
  };

  const onPointerLeave = () => {
    pointerTargetRef.current = null;
  };

  const isLoading = phase === "load";
  const minDim = Math.min(dimensions.w, dimensions.h);
  const titleZoom = pcpView(dimensions.w / Math.max(1, dimensions.h)).zoom;
  const titleTopPercent = (0.5 + (STAR_BURST_MAX * 0.92 - GRAIN_RATE + 0.05) / titleZoom) * 100;
  const currentPassIndex = isFallback
    ? isLoading
      ? pcpPass(pcpMorph(displayPercent / 100), passes.length)
      : passes.length - 1
    : activePassIndex;
  const currentPassText = currentPassIndex >= 0 && currentPassIndex < passes.length ? passes[currentPassIndex] : "";
  const hintText = loop ? "Nhấn để phát lại" : "Nhấn chuột hoặc Enter để vào nhanh";

  return (
    <div
      ref={rootRef}
      className={`pcp-root ${className}`}
      data-phase={phase}
      data-hole={hasHole}
      data-gl={!isFallback}
      style={{
        height,
        '--pcp-u': `${minDim}px`,
        '--pcp-p': 0,
        '--pcp-bg': mergedPalette.background,
        '--pcp-blue': mergedPalette.blue,
        '--pcp-violet': mergedPalette.violet,
        '--pcp-magenta': mergedPalette.magenta,
        '--pcp-cyan': mergedPalette.cyan,
        '--pcp-display': fontFamily,
        '--pcp-mono': FONT_MONO,
      } as React.CSSProperties}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <style>{PCP_STYLES}</style>
      {hasHole && (
        <div
          className="pcp-dest"
          data-active={phase === "done"}
          aria-hidden={phase !== "done" && phase !== "lift"}
        >
          {children}
        </div>
      )}
      {phase !== "done" && (
        <div
          className="pcp-gate"
          role="progressbar"
          aria-label={`${word} đang tải...`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={displayPercent}
          aria-valuetext={isLoading ? `${displayPercent}%` : "Đã tải xong. Nhấn Enter để tiếp tục."}
          tabIndex={0}
          onClick={onActivate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onActivate();
            }
          }}
        >
          {isFallback ? (
            <div className="pcp-layer pcp-fallback" aria-hidden="true">
              <svg className="pcp-fbstar" viewBox="-1 -1 2 2">
                <path d={STAR_SVG_PATH} />
              </svg>
            </div>
          ) : (
            <canvas ref={canvasRef} className="pcp-canvas" aria-hidden="true" key={contextLostCount} />
          )}

          {grid && <div className="pcp-layer pcp-grid" aria-hidden="true" />}

          <div className="pcp-title" style={{ top: `${titleTopPercent}%` }} aria-hidden="true">
            <p className="pcp-word">
              {Array.from(word).map((char, idx) => (
                <span
                  key={`${contextLostCount}:${idx}`}
                  className="pcp-letter"
                  style={{ transitionDelay: `${0.05 + idx * 0.08}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
            {caption && <p className="pcp-caption">{caption}</p>}
            <p className="pcp-hint">{hintText}</p>
          </div>



          {hud && (
            <div className="pcp-hud" aria-hidden="true">
              <div className="pcp-bl">
                <p className="pcp-count">
                  {String(displayPercent).padStart(3, "0")}
                  <small>%</small>
                </p>
                <div className="pcp-segs">
                  {[0, 1, 2, 3].map((k) => (
                    <i key={k} className="pcp-seg" style={{ '--k': k } as React.CSSProperties} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pcp-frame" />
          <span className="pcp-sr" aria-live="polite">
            {isLoading ? currentPassText.replace(/\n/g, ", ") : `${word}${caption ? " — " + caption : ""}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default PrismCometPreloader;
