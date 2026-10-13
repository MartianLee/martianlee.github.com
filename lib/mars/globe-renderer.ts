// The About page's Mars: one fragment shader paints the planet, lit by the Sun where it really stands right now, from a table of
// real Martian features (albedo, volcanoes, basins, Valles Marineris, polar caps). The reticle, the Jezero pin and the Sun mark are
// DOM on top of the canvas. Ported from the approved reference (REF/about.html, "the eyepiece"), with the Mars24 clock replaced by
// lib/mars/clock.ts. components/about/MarsGlobe.tsx loads this file lazily and calls mountGlobe() from an effect; there is no
// React here and no DOM access at module scope.
import { watchDarkTheme } from '../theme'
import { JEZERO, type MarsClock } from './clock'
import { formatClock } from './format'

export interface GlobeElements {
  port: HTMLElement
  canvas: HTMLCanvasElement
  still: SVGSVGElement
  pin: HTMLElement
  pinText: HTMLElement
  sunMark: SVGElement
}
export interface GlobeHandle {
  faceSun(): void
  faceJezero(): void
  update(clock: MarsClock): void
  destroy(): void
}
export interface GlobeOptions {
  reducedMotion: boolean
  dark: boolean
  clock: MarsClock
  /** Called with true once the canvas takes over from the SVG still, and with false when it gives the still back (no WebGL, context lost). */
  onLive?: (live: boolean) => void
}

type Vec3 = [number, number, number]
interface Basis {
  e: Vec3
  n: Vec3
  o: Vec3
}
interface Tween {
  t: number
  d: number
  lon0: number
  dl: number
  lat0: number
  lat1: number
}

const D2R = Math.PI / 180
const mod = (a: number, n: number): number => ((a % n) + n) % n
const ll = (lat: number, lon: number): Vec3 => [
  Math.cos(lat * D2R) * Math.cos(lon * D2R),
  Math.cos(lat * D2R) * Math.sin(lon * D2R),
  Math.sin(lat * D2R),
]
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const clampLat = (v: number): number => Math.max(-75, Math.min(75, v))

// ---------- shader, generated from a table of real Martian features (lat °N, lon °E) ----------
const f = (x: number): string => (+x).toFixed(4)
const V = (lat: number, lon: number): string => 'vec3(' + ll(lat, lon).map(f).join(',') + ')'
const K2 = (r: number): string => f(1 / (r * D2R) ** 2)
// albedo: [lat, lon, radius°, darkness (negative = brighter)]
const ALB: ReadonlyArray<readonly [number, number, number, number]> = [
  [18, 66, 3.5, 0.55],
  [12, 67.5, 5, 0.75],
  [5, 70, 6.5, 0.82],
  [-3, 72, 8, 0.7],
  [-9, 74, 8, 0.45],
  [-2, 357, 6, 0.62],
  [-6, 8, 7, 0.55],
  [-8, 22, 8, 0.5],
  [-9, 37, 8, 0.45],
  [48, 336, 11, 0.62],
  [57, 318, 9, 0.42],
  [39, 350, 7, 0.32],
  [-25, 328, 11, 0.5],
  [-31, 345, 9, 0.38],
  [-17, 104, 11, 0.48],
  [-22, 124, 10, 0.42],
  [-22, 146, 12, 0.52],
  [-27, 166, 10, 0.42],
  [-32, 196, 11, 0.48],
  [-36, 215, 8, 0.32],
  [-26.5, 272, 4.5, 0.55],
  [45, 112, 14, 0.28],
  [63, 150, 12, 0.28],
  [62, 55, 10, 0.22],
  [-42.4, 70.5, 12, -0.62],
  [-49.7, 316, 7.5, -0.5],
  [5, 245, 18, -0.34],
  [18.65, 226.2, 4, -0.2],
  [20, 10, 16, -0.32],
  [15, 200, 15, -0.28],
  [25, 147, 7, -0.18],
]
// Valles Marineris: [lat, lon, half-width] points of a tapered segment chain
const VM: ReadonlyArray<readonly [number, number, number]> = [
  [-7, 253, 3.2],
  [-6.5, 262, 1.1],
  [-7.5, 270, 1.4],
  [-8.5, 279, 2.4],
  [-9.5, 287, 3.3],
  [-12, 295, 1.6],
  [-13.5, 303, 1.2],
  [-13, 311, 1.9],
  [-11, 319, 3],
  [-7, 326, 2.6],
]
const VM2: ReadonlyArray<readonly [number, number, number]> = [
  [-4.2, 282, 1.2],
  [-5.5, 292, 1.5],
]
// relief: [lat, lon, radius°, height, kind] kind 0 = smooth bump, 1 = shield volcano, 2 = crater / basin
const REL: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [18.65, 226.2, 3.8, 1.0, 1],
  [-8.3, 239.9, 2.6, 0.62, 1],
  [1.5, 247, 2.6, 0.62, 1],
  [11.9, 255.9, 2.6, 0.62, 1],
  [25, 147.2, 2.4, 0.45, 1],
  [40.5, 250.4, 8, 0.24, 0],
  [2, 250, 24, 0.34, 0],
  [-42.4, 70.5, 15, -0.7, 2],
  [-49.7, 316, 8.5, -0.45, 2],
  [12.9, 87, 10, -0.22, 2],
  [-13.9, 55.6, 4, -0.26, 2],
  [-2.7, 16.7, 3.9, -0.26, 2],
  [23.4, 32.1, 3.5, -0.22, 2],
  [21.3, 60.8, 3.3, -0.2, 2],
  [-14.5, 129.6, 2.6, -0.2, 2],
  [-40.5, 201.9, 2.5, -0.2, 2],
  [-48.8, 191.2, 2.5, -0.2, 2],
  [50.5, 29.3, 2, -0.18, 2],
  [-5.4, 137.8, 1.3, -0.2, 2],
]

function fragmentSource(): string {
  let alb = ''
  let rel = ''
  for (const [la, lo, r, s] of ALB) {
    alb += `dk+=${f(s)}*exp(-(2.-2.*dot(w,${V(la, lo)}))*${K2(r)});`
  }
  let vm = ''
  for (let i = 1; i < VM.length; i++) {
    const [a, b] = [VM[i - 1], VM[i]]
    vm += `v=min(v,seg(p,vec2(${f(a[1] * 0.98)},${f(a[0])}),vec2(${f(b[1] * 0.98)},${f(b[0])}),${f(a[2])},${f(b[2])}));`
  }
  vm += `v=min(v,seg(p,vec2(${f(VM2[0][1] * 0.98)},${f(VM2[0][0])}),vec2(${f(VM2[1][1] * 0.98)},${f(VM2[1][0])}),${f(VM2[0][2])},${f(VM2[1][2])}));`
  for (const [la, lo, r, s, k] of REL) {
    const x = `x=sqrt(max(2.-2.*dot(q,${V(la, lo)}),0.))*${f(1 / (r * D2R))};`
    if (k === 0) rel += `h+=${f(s)}*exp(-(2.-2.*dot(q,${V(la, lo)}))*${K2(r)});`
    else if (k === 1) rel += x + `h+=${f(s)}*(pow(max(1.-x,0.),1.6)-.35*exp(-x*x*30.));`
    else rel += x + `h+=(${f(s)})*(1.-smoothstep(0.,1.,x)-.32*exp(-(x-1.)*(x-1.)*40.));`
  }
  return `precision highp float;
uniform vec2 R;uniform mat3 VR;uniform vec3 S;uniform float K,DR;uniform vec2 CAP;
float hs(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),u=fract(x);u=u*u*(3.-2.*u);
return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),u.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),u.x),u.y),
mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),u.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),u.x),u.y),u.z);}
float fb(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.07+vec3(3.1,1.7,7.3);a*=.5;}return s;}
float fb3(vec3 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.11+vec3(5.2,1.3,2.9);a*=.5;}return s;}
float seg(vec2 p,vec2 a,vec2 b,float wa,float wb){vec2 pa=p-a,ba=b-a;float t=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*t)/mix(wa,wb,t);}
float VMd(float la,float lo){if(lo<245.||lo>335.||la<-24.||la>4.)return 9.;vec2 p=vec2(lo*.98,la);float v=9.;
${vm}
return v;}
float crat(vec3 q,float F,float dens,float dep){vec3 p=q*F,b=floor(p-.5);float h=0.;
for(int k=0;k<8;k++){vec3 o=vec3(mod(float(k),2.),mod(floor(float(k)/2.),2.),floor(float(k)/4.));vec3 c0=b+o;
if(hs(c0+9.1)>dens)continue;
vec3 c=normalize(c0+.5+.5*(vec3(hs(c0),hs(c0+1.3),hs(c0+2.7))-.5))*F;
float r=.14+.26*hs(c0+5.7),x=length(p-c)/r;
h+=dep*r*(.38*exp(-(x-1.)*(x-1.)*16.)-(1.-smoothstep(0.,1.,x)));}return h;}
float H(vec3 q){float h=0.,x;float la=degrees(asin(clamp(q.z,-1.,1.)));
float hi=smoothstep(12.,-8.,la+22.*(fb3(q*2.3)-.5));
float lo=mod(degrees(atan(q.y,q.x))+360.,360.);
h-=.45*smoothstep(1.,.3,VMd(la+.6*(vn(q*40.)-.5),lo));
h+=.16*hi;
${rel}
float cw=.35+.65*hi;
h+=cw*(crat(q,8.,.22,.4)+crat(q,19.,.15,.3));
h+=.05*(fb3(q*15.)-.5);return h;}
vec3 ALB(vec3 q,float la,float lo){float dk=0.;
vec3 w=normalize(q+.07*(vec3(vn(q*4.3),vn(q*4.3+11.),vn(q*4.3+23.))-.5));
${alb}
float belt=smoothstep(-2.,-12.,la)*smoothstep(-53.,-38.,la);
float th=mod(lo-262.+540.,360.)-180.;
dk+=belt*(.34+.4*(fb(w*3.1)-.5))*(1.-.75*exp(-th*th/1024.));
dk+=.3*(fb(w*5.3)-.5);
dk+=.5*smoothstep(1.2,.3,VMd(la+1.6*(vn(q*22.)-.5),lo+1.6*(vn(q*22.+5.)-.5)));
float D=smoothstep(.16,.74,dk)*(.72+.38*fb(q*9.)),B=smoothstep(.08,.55,-dk);
vec3 c=mix(vec3(.78,.52,.34),vec3(.33,.24,.19),D);
c=mix(c,c*vec3(1.07,1.03,.9),smoothstep(.42,.72,fb3(q*1.7+9.)));
c=mix(c,vec3(.9,.71,.51),B*.7);
c*=(.93+.14*fb(q*7.))*(.95+.1*fb3(q*27.));
float nl=la+10.*(fb3(q*5.)-.5),sl=la-8.*(fb3(q*5.+4.)-.5);
float cn=smoothstep(CAP.x-1.5,CAP.x+1.,nl),cs=smoothstep(CAP.y+1.5,CAP.y-1.,sl);
float col=exp(-(nl-CAP.x+3.5)*(nl-CAP.x+3.5)/9.)*(1.-cn);
c*=1.-.32*col;
vec3 ice=vec3(.95,.93,.9)*(.9+.1*fb3(q*31.));
return mix(c,ice,max(cn,cs));}
void main(){
float m=min(R.x,R.y);vec2 uv=(gl_FragCoord.xy-.5*R)/(.5*m)/DR;float r=length(uv),px=2.6/(m*DR);
vec3 col=mix(vec3(.034,.028,.03),vec3(.016,.021,.038),K);
vec2 sc=floor(gl_FragCoord.xy/max(1.,m/420.));float st=hs(vec3(sc,7.));
col+=smoothstep(.9972,1.,st)*(.25+.75*hs(vec3(sc,3.)))*vec3(1.,.95,.88)*smoothstep(1.05,1.25,r);
if(r>.98){vec3 lb=VR*vec3(uv/r,0.);float mm=dot(lb,S),g=exp(-max(r-1.,0.)/.022);
col+=g*(vec3(.82,.5,.34)*smoothstep(-.25,.4,mm)*.5+vec3(.32,.52,.9)*exp(-mm*mm/.015)*.32);}
if(r<1.+px){float z=sqrt(max(1.-r*r,0.));vec3 q=normalize(VR*vec3(uv,z));
float la=degrees(asin(q.z)),lo=mod(degrees(atan(q.y,q.x))+360.,360.);
vec3 al=ALB(q,la,lo);
vec3 e=normalize(vec3(-q.y,q.x,0.)+vec3(1e-4,0.,0.)),nn=cross(q,e);
float h0=H(q),h1=H(normalize(q+e*.004)),h2=H(normalize(q+nn*.004));
vec3 n=normalize(q-.016*((h1-h0)*e+(h2-h0)*nn)/.004);
float mu0=dot(q,S),mu=dot(n,S);
float day=smoothstep(-.07,.16,mu0);
vec3 c=al*(.03+1.12*pow(max(mu,0.),.85));
c=mix(al*.022,c,day);
float tw=exp(-(mu0-.015)*(mu0-.015)/.0049);
c+=tw*vec3(.12,.06,.04)*.55;
float hz=pow(1.-z,3.);
c+=hz*(vec3(.52,.34,.27)*smoothstep(-.12,.4,mu0)*.85+vec3(.25,.42,.7)*tw*.75);
col=mix(col,c,smoothstep(1.+px,1.-px,r));}
col+=(hs(vec3(gl_FragCoord.xy,1.))-.5)/255.;
gl_FragColor=vec4(col,1.);}`
}

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = fragmentSource()
const UNIFORMS = ['R', 'VR', 'S', 'K', 'DR', 'CAP']
// A lost context hands out no extensions, so the object that can bring it back is kept per canvas while the context is alive
// (a mount on a canvas whose previous mount released its context, such as a Fast Refresh in development, needs it).
const loseExt = new WeakMap<HTMLCanvasElement, WEBGL_lose_context>()
// arrow keys: [latitude step, longitude step] in degrees
const KEY_STEP = new Map<string, readonly [number, number]>([
  ['ArrowLeft', [0, 20]],
  ['ArrowRight', [0, -20]],
  ['ArrowUp', [-12, 0]],
  ['ArrowDown', [12, 0]],
])

/**
 * Starts the globe in the eyepiece. Everything it starts (frame loop, observers, listeners, GL context) is released by destroy().
 * When WebGL is unavailable or lost, the SVG still stays (or comes back) and opts.onLive(false) tells the caller to drop the controls.
 */
export function mountGlobe(el: GlobeElements, opts: GlobeOptions): GlobeHandle {
  const { port, canvas: cv, still, pin, pinText, sunMark } = el
  const reduce = opts.reducedMotion
  let dark = opts.dark
  let m: MarsClock = opts.clock
  let sun: Vec3 = ll(m.subsolarLatDeg, m.subsolarLonEastDeg)

  let gl: WebGLRenderingContext | null = null
  let prog: WebGLProgram | null = null
  const loc: Record<string, WebGLUniformLocation | null> = {}
  const vr = new Float32Array(9)
  let W = 0
  let Hh = 0
  let scale = 1
  let raf = 0
  let rafOn = 0
  let running = false
  let visible = true
  let ready = false
  let destroyed = false
  const DR = 0.8 // the planet fills this fraction of the eyepiece, the rest is the glow and the stars
  const JZ = ll(JEZERO.latDeg, JEZERO.lonEastDeg)
  let pinW = pin.offsetWidth
  // camera: the view starts 38° of longitude west of the Sun, looking down from 16°N
  let lon = mod(m.subsolarLonEastDeg - 38, 360)
  let lat = 16
  let vLon = 0
  let vLat = 0
  let idle = 9
  let tween: Tween | null = null
  let drag: { x: number; y: number; t: number } | null = null
  let last = 0
  let frames = 0
  let acc = 0
  let ro: ResizeObserver | null = null
  let io: IntersectionObserver | null = null
  let stopTheme: (() => void) | null = null
  // the Sun mark's last angle (see overlay)
  let sunAng = 0

  const setPinText = () => {
    const t = formatClock(m.lmstJezero, false)
    if (pinText.textContent !== t) pinText.textContent = t
  }
  const basis = (): Basis => {
    const o = ll(lat, lon)
    const cl = Math.cos(lon * D2R)
    const sl = Math.sin(lon * D2R)
    const ca = Math.cos(lat * D2R)
    const sa = Math.sin(lat * D2R)
    return { e: [-sl, cl, 0], n: [-sa * cl, -sa * sl, ca], o }
  }
  const caps = (): [number, number] => {
    // Seasonal cap edges (approximate): north largest near Ls 345, south largest near Ls 165.
    const L = m.ls * D2R
    return [70 - 12 * Math.cos(L - 345 * D2R), -(70 - 15 * Math.cos(L - 165 * D2R))]
  }

  function build(): boolean {
    const g = gl
    if (!g) return false
    const sh = (type: number, src: string): WebGLShader | null => {
      const s = g.createShader(type)
      if (!s) return null
      g.shaderSource(s, src)
      g.compileShader(s)
      if (!g.getShaderParameter(s, g.COMPILE_STATUS) && !g.isContextLost()) {
        console.warn(g.getShaderInfoLog(s))
        return null
      }
      return s
    }
    const v = sh(g.VERTEX_SHADER, VS)
    const fr = sh(g.FRAGMENT_SHADER, FS)
    if (!v || !fr) return false
    prog = g.createProgram()
    if (!prog) return false
    g.attachShader(prog, v)
    g.attachShader(prog, fr)
    g.linkProgram(prog)
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      if (!g.isContextLost()) console.warn(g.getProgramInfoLog(prog))
      return false
    }
    g.useProgram(prog)
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
    const a = g.getAttribLocation(prog, 'p')
    g.enableVertexAttribArray(a)
    g.vertexAttribPointer(a, 2, g.FLOAT, false, 0, 0)
    for (const k of UNIFORMS) loc[k] = g.getUniformLocation(prog, k)
    return true
  }
  function resize() {
    const s = port.getBoundingClientRect().width
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    W = cv.width = Math.max(2, Math.round(s * dpr * scale))
    Hh = cv.height = W
    if (gl) gl.viewport(0, 0, W, Hh)
  }
  function draw() {
    const g = gl
    if (!g) return
    const b = basis()
    g.uniform2f(loc.R, W, Hh)
    vr.set(b.e, 0)
    vr.set(b.n, 3)
    vr.set(b.o, 6)
    g.uniformMatrix3fv(loc.VR, false, vr)
    g.uniform3fv(loc.S, sun)
    g.uniform1f(loc.K, dark ? 1 : 0)
    g.uniform1f(loc.DR, DR)
    g.uniform2fv(loc.CAP, caps())
    g.drawArrays(g.TRIANGLES, 0, 3)
    overlay(b)
  }
  function overlay(b: Basis) {
    // Pin Jezero by projection; the reticle's Sun mark points at the Sun's direction in the view.
    const s = port.clientWidth
    const half = s / 2
    const x = dot(JZ, b.e)
    const y = dot(JZ, b.n)
    const z = dot(JZ, b.o)
    const X = half + x * DR * half
    const Y = half - y * DR * half
    const flip = x > 0.15
    pin.classList.toggle('rh-flip', flip)
    pin.style.transform = `translate(${(flip ? X - pinW + 4.5 : X - 4.5).toFixed(1)}px,${Y.toFixed(1)}px) translateY(-50%)`
    pin.classList.toggle('rh-away', z < 0.18)
    // Facing the Sun head-on leaves both components at float noise, and atan2 of noise points anywhere (west, right after
    // "Face the Sun"): the mark keeps the angle it had.
    if (Math.abs(dot(sun, b.o)) <= 0.995) sunAng = Math.atan2(dot(sun, b.n), dot(sun, b.e)) / D2R
    sunMark.setAttribute('transform', `rotate(${(90 - sunAng).toFixed(2)})`)
  }
  function step(now: number) {
    if (destroyed) return
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
    last = now
    if (++frames > 20) {
      acc += dt
      if (frames === 60) {
        if (acc / 40 > 0.024 && scale > 0.5) {
          scale = Math.max(0.5, scale * 0.85)
          resize()
        }
        frames = 20
        acc = 0
      }
    }
    idle += dt
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / tween.d)
      const k = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2
      lon = mod(tween.lon0 + tween.dl * k, 360)
      lat = tween.lat0 + (tween.lat1 - tween.lat0) * k
      if (tween.t >= 1) tween = null
    } else if (!drag) {
      lon = mod(lon + vLon * dt, 360)
      lat = clampLat(lat + vLat * dt)
      vLon *= Math.exp(-3 * dt)
      vLat *= Math.exp(-3 * dt)
      if (idle > 2.5) {
        // Slow camera orbit, slower while the day side faces us so the lit hemisphere lingers.
        const face = dot(ll(lat, lon), sun)
        const ramp = Math.min(1, (idle - 2.5) / 2)
        lon = mod(lon - ramp * dt * 4.2 * (0.95 - 0.55 * face), 360)
        lat += (16 + 5 * Math.sin(now / 9000) - lat) * Math.min(1, dt * 0.25 * ramp)
      }
    }
    draw()
    raf = running ? requestAnimationFrame(step) : 0
  }
  function sync() {
    if (destroyed) return
    const go = ready && visible && !document.hidden && (!reduce || tween !== null || drag !== null)
    if (go && !running) {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(step)
    } else if (!go && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }
  function goTo(la: number, lo: number) {
    if (destroyed) return
    // a fling that is still coasting must not carry the view on past the target once the move has arrived
    vLon = vLat = 0
    idle = -4
    const dl = mod(lo - lon + 540, 360) - 180
    if (reduce || !ready) {
      lon = mod(lo, 360)
      lat = la
      if (ready) draw()
      return
    }
    tween = { t: 0, d: 1.4, lon0: lon, dl, lat0: lat, lat1: la }
    sync()
  }

  // ---------- input ----------
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    drag = { x: e.clientX, y: e.clientY, t: performance.now() }
    tween = null
    idle = 0
    vLon = vLat = 0
    port.setPointerCapture(e.pointerId)
    port.classList.add('rh-drag')
    sync()
  }
  function onPointerMove(e: PointerEvent) {
    if (!drag) return
    const now = performance.now()
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    const k = 180 / Math.max(port.clientWidth, 1)
    lon = mod(lon - dx * k, 360)
    lat = clampLat(lat + dy * k)
    const dts = Math.max((now - drag.t) / 1000, 0.008)
    vLon = ((-dx * k) / dts) * 0.6
    vLat = ((dy * k) / dts) * 0.6
    drag.x = e.clientX
    drag.y = e.clientY
    drag.t = now
    idle = 0
    if (!running && ready) draw()
  }
  function endDrag() {
    if (!drag) return
    drag = null
    port.classList.remove('rh-drag')
    if (reduce) vLon = vLat = 0
    idle = 0
    sync()
  }
  function onKeyDown(e: KeyboardEvent) {
    const s = KEY_STEP.get(e.key)
    // Alt+Left, Cmd+Left and the like are the browser's (history), not the globe's
    if (!s || e.altKey || e.ctrlKey || e.metaKey) return
    e.preventDefault()
    goTo(clampLat(lat + s[0]), lon + s[1])
  }

  // ---------- life cycle ----------
  function fail() {
    // the SVG still stays (or comes back) and the caller drops the controls: nothing can rotate it
    ready = false
    endDrag()
    tween = null
    cv.hidden = true
    cv.classList.remove('rh-on')
    still.classList.remove('rh-off')
    pin.classList.add('rh-away')
    opts.onLive?.(false)
    sync()
  }
  function initGl(): boolean {
    if (!build()) return false
    ready = true
    cv.hidden = false
    resize()
    draw()
    cancelAnimationFrame(rafOn)
    rafOn = requestAnimationFrame(() => {
      cv.classList.add('rh-on')
      still.classList.add('rh-off')
    })
    opts.onLive?.(true)
    sync()
    return true
  }
  function onContextLost(e: Event) {
    e.preventDefault()
    fail()
  }
  function onContextRestored() {
    if (!destroyed && !initGl()) fail()
  }
  function onResize() {
    pinW = pin.offsetWidth
    if (!ready) return
    resize()
    if (!running) draw()
  }
  function onTheme(d: boolean) {
    dark = d
    if (!running && ready) draw()
  }
  function boot() {
    port.addEventListener('pointerdown', onPointerDown)
    port.addEventListener('pointermove', onPointerMove)
    port.addEventListener('pointerup', endDrag)
    port.addEventListener('pointercancel', endDrag)
    port.addEventListener('keydown', onKeyDown)
    cv.addEventListener('webglcontextlost', onContextLost)
    cv.addEventListener('webglcontextrestored', onContextRestored)
    document.addEventListener('visibilitychange', sync)
    stopTheme = watchDarkTheme(onTheme)
    ro = new ResizeObserver(onResize)
    ro.observe(port)
    ro.observe(pin)
    io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      sync()
    })
    io.observe(port)
    setPinText()
    pinW = pin.offsetWidth
    gl = cv.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) return fail()
    if (gl.isContextLost()) {
      // a re-mount on the same canvas is handed the context the previous mount released: ask for it back,
      // and webglcontextrestored finishes the set-up
      const ext = loseExt.get(cv)
      if (ext) ext.restoreContext()
      else fail()
      return
    }
    const ext = gl.getExtension('WEBGL_lose_context')
    if (ext) loseExt.set(cv, ext)
    if (!initGl()) fail()
  }

  boot()

  return {
    faceSun() {
      goTo(clampLat(m.subsolarLatDeg), m.subsolarLonEastDeg)
    },
    faceJezero() {
      goTo(JEZERO.latDeg, JEZERO.lonEastDeg)
    },
    update(clock) {
      if (destroyed) return
      m = clock
      sun = ll(m.subsolarLatDeg, m.subsolarLonEastDeg)
      setPinText()
      pinW = pin.offsetWidth
      if (!running && ready && visible && !document.hidden) draw()
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      running = false
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rafOn)
      ro?.disconnect()
      io?.disconnect()
      stopTheme?.()
      document.removeEventListener('visibilitychange', sync)
      port.removeEventListener('pointerdown', onPointerDown)
      port.removeEventListener('pointermove', onPointerMove)
      port.removeEventListener('pointerup', endDrag)
      port.removeEventListener('pointercancel', endDrag)
      port.removeEventListener('keydown', onKeyDown)
      cv.removeEventListener('webglcontextlost', onContextLost)
      cv.removeEventListener('webglcontextrestored', onContextRestored)
      // the elements go back to the markup's first state, in case the same ones are mounted again
      port.classList.remove('rh-drag')
      cv.hidden = false
      cv.classList.remove('rh-on')
      still.classList.remove('rh-off')
      pin.classList.add('rh-away')
      pin.classList.remove('rh-flip')
      pin.style.transform = ''
      sunMark.removeAttribute('transform')
      if (gl && !gl.isContextLost()) {
        // the loss event has to be cancelled once, or the context could never be restored by a later mount on this canvas
        cv.addEventListener('webglcontextlost', (e) => e.preventDefault(), { once: true })
        loseExt.get(cv)?.loseContext()
      }
    },
  }
}
