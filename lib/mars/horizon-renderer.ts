// The Martian horizon of the home hero: one fragment shader raymarches the dunes over a transparent sky, so the CSS sky and the real
// <h1> show through. The skyline, the horizon and the sun are placed from the measured title layout, never from guessed numbers.
// Ported from the approved reference (REF/index.html, "the horizon: one fragment shader"). components/home/MarsHorizon.tsx loads this
// file lazily and calls mountHorizon() from an effect; there is no React here and no DOM access at module scope.
import { watchDarkTheme } from '../theme'

export interface HorizonElements {
  hero: HTMLElement
  canvas: HTMLCanvasElement
  fallback: SVGSVGElement
  title: HTMLElement
}
export interface HorizonHandle {
  destroy(): void
}

type RGB = [number, number, number]
interface Palette {
  z: RGB
  m: RGB
  h: RGB
  far: RGB
  sd: RGB
  mon: RGB
  haze: RGB
  glow: RGB
  sun: RGB
  amb: RGB
  pl: RGB
  sl: RGB
  sdk: RGB
  hm: number
}
type CssKey = 'z' | 'm' | 'h' | 'far' | 'sd' | 'mon'

const rgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const mixc = (a: RGB, b: RGB, k: number): RGB => a.map((v, i) => lerp(v, b[i], k)) as RGB
const hex = (c: RGB) =>
  '#' +
  c
    .map((v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
const norm = (v: RGB): RGB => {
  const l = Math.hypot(v[0], v[1], v[2])
  return v.map((q) => q / l) as RGB
}

// Two palettes: Martian afternoon (light) and Martian sunset with its blue glow (dark). The six sky/ground/name colours
// (z m h far sd mon) are the --rh-sky-z, --rh-sky-m, --rh-sky-h, --rh-far, --rh-sand-d and --rh-monument tokens.
const PAL: { day: Palette; dusk: Palette } = {
  day: {
    z: rgb('#c19870'),
    m: rgb('#dab894'),
    h: rgb('#ecd7b9'),
    far: rgb('#c79c79'),
    sd: rgb('#7d4a2d'),
    mon: rgb('#1c1712'),
    haze: rgb('#ead2b0'),
    glow: rgb('#fff7ea'),
    sun: rgb('#ffe6c4'),
    amb: rgb('#b98f6b'),
    pl: rgb('#cf9064'),
    sl: rgb('#a0603d'),
    sdk: rgb('#5c3527'),
    hm: 0.35,
  },
  dusk: {
    z: rgb('#0e131e'),
    m: rgb('#202838'),
    h: rgb('#4a4352'),
    far: rgb('#332a31'),
    sd: rgb('#1c1412'),
    mon: rgb('#ede3cf'),
    haze: rgb('#5a5869'),
    glow: rgb('#a8cdf3'),
    sun: rgb('#d39468'),
    amb: rgb('#323a4d'),
    pl: rgb('#5e3b2b'),
    sl: rgb('#532f22'),
    sdk: rgb('#1f1511'),
    hm: 0.28,
  },
}
const CSSV: Record<CssKey, string> = {
  z: '--rh-sky-z',
  m: '--rh-sky-m',
  h: '--rh-sky-h',
  far: '--rh-far',
  sd: '--rh-sand-d',
  mon: '--rh-monument',
}

const sunDay: RGB = (() => {
  const az = (75 * Math.PI) / 180
  const el = (19 * Math.PI) / 180
  return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
})()

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R,PD;uniform float T,K,U,F,H0,CN,HK,HM,SX,BL;uniform vec4 V;uniform vec3 C,S,cHaze,cGlow,cSun,cAmb,cPL,cSL,cSD,cFar;
float h12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1,0)),f.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),f.x),f.y);}
float dn(vec2 p,float lod){
  vec2 q=p+22.*(vec2(n2(p*.021),n2(p*.021+7.7))-.5);
  q+=5.*(1.-lod)*(vec2(n2(q*.09+3.1),n2(q*.09+11.4))-.5);
  float s=fract(dot(q,vec2(.906,.423))/13.);
  float a=s/.75,b=(1.-s)*4.,k=mix(.09,.22,lod);
  float r=-k*log(exp(-a/k)+exp(-b/k));
  return pow(max(r,0.),1.6)*smoothstep(.12,.5,n2(p*.012+2.));
}
float terr(vec2 p){
  float dc=length(p-C.xz),lod=smoothstep(28.,100.,dc);
  float h=1.9*dn(p,lod)+.5*n2(p*.06)+.12*(1.-lod)*n2(p*.27);
  return h*U*smoothstep(3.,10.,dc)*(1.-.6*smoothstep(35.,120.,dc));
}
float march(vec3 ro,vec3 rd){
  if(rd.y>-.0005)return -1.;
  float t=max(.5,(ro.y-2.55)/-rd.y),lt=t,ld=1.;
  for(int i=0;i<110;i++){
    vec3 p=ro+rd*t;float d=p.y-terr(p.xz);
    if(d<.002*t){
      if(d>=0.)return t;
      float a=lt,da=ld,b=t,db=d;
      for(int j=0;j<4;j++){float m=a+(b-a)*da/max(da-db,1e-5);vec3 q=ro+rd*m;float dm=q.y-terr(q.xz);if(dm<0.){b=m;db=dm;}else{a=m;da=dm;}}
      return a+(b-a)*da/max(da-db,1e-5);
    }
    lt=t;ld=d;t+=max(.45*d,.02+.02*t);if(t>160.)return -1.;
  }
  return t;
}
vec3 nor(vec2 p,float t){float e=.03+.006*t;float h=terr(p);return normalize(vec3(h-terr(p+vec2(e,0.)),e,h-terr(p+vec2(0.,e))));}
float shd(vec3 p){float s=1.,t=.2;for(int i=0;i<12;i++){vec3 q=p+S*t;float d=q.y-terr(q.xz);s=min(s,10.*d/t);t+=clamp(d,.25,2.5);if(s<.02||q.y>2.5)break;}return clamp(s,0.,1.);}
vec3 shade(vec3 p,vec3 rd,float t){
  vec3 n=nor(p.xz,t);
  float w=(1.-smoothstep(4.,16.,t))*.06;vec2 kd=vec2(.906,.423);
  float c=cos(dot(p.xz,kd)*9.+n2(p.xz*1.1)*5.);
  n=normalize(n-w*c*vec3(kd.x,0.,kd.y));
  float dif=max(dot(n,S),0.);
  float sh=dif<.001?0.:1.;
  if(dif>=.001&&t<48.)sh=mix(shd(p+n*.05),1.,smoothstep(34.,48.,t));
  float lod=smoothstep(28.,100.,t),du=dn(p.xz,lod);
  vec3 sand=mix(cSD,cSL,smoothstep(.2,1.,du)*(.8+.2*n2(p.xz*.4)));
  float ws=mix(n2(vec2(dot(p.xz,kd)*2.6,dot(p.xz,vec2(-kd.y,kd.x))*.22)),.5,lod);
  vec3 alb=mix(cPL*(.88+.2*n2(p.xz*.7)),sand,smoothstep(.04,.22,du))*(.92+.14*ws);
  vec3 col=alb*(cSun*dif*sh*1.45+cAmb*(.45+.55*n.y));
  float fs=max(dot(rd,S),0.);
  col+=mix(cSun,cGlow,.3)*pow(clamp(1.+dot(n,rd),0.,1.),3.)*pow(fs,4.)*(.12+.5*K);
  float f=1.-exp(-pow(t*.013,1.5));
  col=mix(col,cFar,f);
  return col+cGlow*pow(fs,24.)*f*(.07+.09*K);
}
float mesa(float u){
  float m=.85*smoothstep(-1.02,-.97,u)*(1.-smoothstep(-.78,-.74,u));
  m=max(m,.42*smoothstep(-.80,-.62,u)*(1.-smoothstep(-.40,-.22,u)));
  m=max(m,.62*smoothstep(-.20,-.16,u)*(1.-smoothstep(-.02,.02,u)));
  m=max(m,.30*smoothstep(.02,.12,u)*(1.-smoothstep(.22,.34,u)));
  m=max(m,.75*smoothstep(.62,.72,u)*(1.-smoothstep(1.05,1.15,u)));
  return m;
}
vec4 over(vec4 a,vec4 b){return a+b*(1.-a.a);}
void main(){
  vec2 ndc=gl_FragCoord.xy/R*2.-1.;
  float asp=R.x/R.y,pit=atan(-H0*F);
  vec3 rc=normalize(vec3(ndc.x*asp*F,ndc.y*F,1.));
  float cp=cos(pit),sp=sin(pit);
  vec3 rd=vec3(rc.x,rc.y*cp+rc.z*sp,rc.z*cp-rc.y*sp);
  float dy=max(ndc.y-H0,0.),cs=dot(rd,S);
  // sky: stars, moons, haze, sun glow (premultiplied, transparent so the CSS sky and the name show through)
  vec4 sky=vec4(0.);
  float st=step(.9979,h12(floor(gl_FragCoord.xy*.7)))*K*smoothstep(.55,1.25,dy)*(.6+.4*sin(T*1.7+h12(floor(gl_FragCoord.xy*.7)+3.)*40.));
  sky=over(vec4(vec3(st*.8),st*.8),sky);
  vec2 pc=vec2(-.5+.05*sin(T*.013),.62);vec2 d=(ndc-pc)*vec2(asp,1.);
  float pa=atan(d.y,d.x),pr2=length(d/vec2(1.,.74)),rr=.017*(1.+.14*n2(vec2(pa*2.,3.)));
  float pm=smoothstep(rr,rr-.0035,pr2);
  vec2 L=normalize(vec2(S.x,S.y+.15));
  float lit=clamp(.3+1.1*dot(d/max(pr2,1e-4),L)*min(pr2/rr,1.),0.,1.);
  float pA=pm*(.2+.7*K);
  sky=over(vec4(mix(mix(vec3(.62,.52,.44),vec3(.24,.21,.2),K),vec3(.9,.85,.78),lit)*pA,pA),sky);
  float dA=smoothstep(.0065,.002,length((ndc-vec2(-.13,.85))*vec2(asp,1.)))*(.35+.55*K);
  sky=over(vec4(vec3(.9)*dA,dA),sky);
  float ha=HM*exp(-dy*HK)+(h12(gl_FragCoord.xy+fract(T))-.5)*.006;ha=max(ha,0.);
  float disc=smoothstep(.999955,.999975,cs);
  float halo=pow(max(cs,0.),2400.)*.75+pow(max(cs,0.),160.)*.24+pow(max(cs,0.),12.)*(.03+.15*K);
  float ga=clamp(disc+halo,0.,1.);
  sky=over(vec4(mix(cGlow,vec3(1.),disc)*ga,ga),over(vec4(cHaze*ha,ha),sky));
  // ground: raymarched dunes in front, a far mesa skyline behind them
  float su=ndc.x;
  float full=min(.05+.05*n2(vec2(su*70.,2.))+.03*n2(vec2(su*13.,5.))+.38*mesa(su)*(.82+.18*n2(vec2(su*24.,1.)))*smoothstep(.035,.13,abs(su-SX)),.35);
  float low=(.006+.032*n2(vec2(su*9.,7.)))*smoothstep(PD.y*.9,PD.y*2.2,abs(su-PD.x));
  float skl=BL+CN*U*mix(full,low,smoothstep(V.x,V.y,su)*(1.-smoothstep(V.z,V.w,su)));
  vec4 g=vec4(0.);
  float t=march(C,rd);
  if(t>0.)g=vec4(shade(C+rd*t,rd,t),1.);
  else if(rd.y<0.)g=vec4(cFar+cGlow*pow(max(cs,0.),24.)*(.07+.09*K),1.);
  else{
    float e=smoothstep(skl,skl-2.4/R.y,ndc.y);
    if(e>0.){
      float hz=clamp((ndc.y-H0)/max(skl-H0,1e-3),0.,1.);
      float strata=.05*sin((ndc.y-H0)/CN*30.+n2(vec2(su*9.,ndc.y*40.))*4.);
      vec3 fc=cFar*(mix(.84,1.03,hz)+strata)*(.94+.08*n2(vec2(su*38.,ndc.y*26.)))+cGlow*pow(max(cs,0.),40.)*.5;
      g=vec4(fc*e,e);
    }
  }
  vec4 o=over(g,sky);
  // wind-blown dust drifting along the horizon
  float band=exp(-abs(ndc.y-H0)*5.);
  float du=n2(vec2(ndc.x*2.2*asp-T*.05,ndc.y*7.+T*.012))*n2(vec2(ndc.x*5.*asp-T*.09,ndc.y*15.));
  float da=band*du*.2*U;
  gl_FragColor=over(vec4(cHaze*da,da),o);
}`

const UNIFORMS = [
  'R',
  'PD',
  'T',
  'K',
  'U',
  'F',
  'H0',
  'CN',
  'HK',
  'HM',
  'SX',
  'BL',
  'V',
  'C',
  'S',
  'cHaze',
  'cGlow',
  'cSun',
  'cAmb',
  'cPL',
  'cSL',
  'cSD',
  'cFar',
]
// A lost context hands out no extensions, so the object that can bring it back is kept per canvas while the context is alive
// (a mount on a canvas whose previous mount released its context, such as a Fast Refresh in development, needs it).
const loseExt = new WeakMap<HTMLCanvasElement, WEBGL_lose_context>()

/**
 * Starts the horizon on the hero. Everything it starts (frame loop, observers, listeners, GL context) is released by destroy().
 * When WebGL is unavailable, lost, or the visitor asked to save data, the SVG fallback is drawn from the same measured layout.
 */
export function mountHorizon(
  el: HorizonElements,
  opts: { reducedMotion: boolean; dark: boolean }
): HorizonHandle {
  const { hero, canvas: cv, fallback: fb } = el
  const still = opts.reducedMotion
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true

  // While the theme cross-fades, the hero carries inline copies of the six palette tokens; clearing them hands the colours back to the tokens.
  const paintCss = (k: number, clear: boolean) => {
    for (const key of Object.keys(CSSV) as CssKey[]) {
      if (clear) hero.style.removeProperty(CSSV[key])
      else hero.style.setProperty(CSSV[key], hex(mixc(PAL.day[key], PAL.dusk[key], k)))
    }
  }

  let gl: WebGLRenderingContext | null = null
  let prog: WebGLProgram | null = null
  let buf: WebGLBuffer | null = null
  const loc: Record<string, WebGLUniformLocation | null> = {}
  let raf = 0
  let rafOn = 0
  let running = false
  let visible = true
  let destroyed = false
  let fellBack = false
  // render scale (x device pixels): capable machines start at 0.75, small/touch/low-core ones at 0.5; steps down only when frames run over budget
  const lowPower =
    matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4
  let scale = lowPower ? 0.5 : 0.75
  let frames = 0
  let acc = 0
  let last = 0
  let time = 0
  let rise = 0
  let W = 2
  let H = 2
  let F = 0.364
  let CN = 0.3
  let asp = 1
  let SX = 0.35
  let BL = -0.1
  let H0 = -0.1
  let V = [9, 9, 9, 9]
  let PD = [9, 0.01]
  let capRatio = 0.72 // Archivo cap height / em, re-measured once the font loads
  let K = opts.dark ? 1 : 0
  let Kt = K
  let px = 0
  let py = 0
  let cx = 0
  let cy = 0
  let ro: ResizeObserver | null = null
  let fbRo: ResizeObserver | null = null
  let io: IntersectionObserver | null = null
  let stopTheme: (() => void) | null = null
  let restoreTimer = 0

  const sunDusk = (): RGB => {
    // a point just above the notch in the skyline (screen column SX), turned into a world direction with the shader's camera
    const x = SX
    const y = H0 + CN * 0.32
    const pit = Math.atan(-H0 * F)
    const r = [x * asp * F, y * F, 1]
    const l = Math.hypot(r[0], r[1], r[2])
    const cp = Math.cos(pit)
    const sp = Math.sin(pit)
    const v = r.map((q) => q / l)
    return [v[0], v[1] * cp + v[2] * sp, v[2] * cp - v[1] * sp]
  }

  function fail() {
    running = false
    cancelAnimationFrame(raf)
    // No frame will finish a theme cross-fade that was still running: settle it, so the inline colour overrides on the hero
    // are removed and the CSS tokens apply (otherwise the still stays half-way between the two themes).
    K = Kt
    paintCss(K, true)
    fellBack = true
    cv.hidden = true
    // a class, not [hidden]: SVG elements have no .hidden property (REF's `fb.hidden = false` changed nothing)
    fb.classList.add('rh-on')
    drawFallback()
    if (!fbRo) {
      fbRo = new ResizeObserver(drawFallback)
      fbRo.observe(hero)
    }
  }
  function drawFallback() {
    measure()
    const r = hero.getBoundingClientRect()
    const Wd = Math.round(r.width)
    const Hd = Math.round(r.height)
    const yOf = (n: number) => ((1 - n) / 2) * Hd
    const ss = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
      return t * t * (3 - 2 * t)
    }
    // CPU twin of the shader's mesa() in FS (the SVG still draws the same skyline): change both together
    const mesa = (u: number) =>
      Math.max(
        0.85 * ss(-1.02, -0.97, u) * (1 - ss(-0.78, -0.74, u)),
        0.42 * ss(-0.8, -0.62, u) * (1 - ss(-0.4, -0.22, u)),
        0.62 * ss(-0.2, -0.16, u) * (1 - ss(-0.02, 0.02, u)),
        0.3 * ss(0.02, 0.12, u) * (1 - ss(0.22, 0.34, u)),
        0.75 * ss(0.62, 0.72, u) * (1 - ss(1.05, 1.15, u))
      )
    let d = 'M0 ' + Hd
    for (let i = 0; i <= 96; i++) {
      const u = (i / 96) * 2 - 1
      const full = Math.min(0.06 + 0.38 * mesa(u) * ss(0.035, 0.13, Math.abs(u - SX)), 0.35)
      const low = 0.02 * ss(PD[1] * 0.9, PD[1] * 2.2, Math.abs(u - PD[0]))
      const v = ss(V[0], V[1], u) * (1 - ss(V[2], V[3], u))
      d +=
        ' L' +
        ((i / 96) * Wd).toFixed(1) +
        ' ' +
        yOf(BL + CN * (full + (low - full) * v)).toFixed(1)
    }
    const hz = yOf(H0)
    const sand =
      'M0 ' +
      Hd +
      ' V' +
      (hz + Hd * 0.06).toFixed(1) +
      ' C' +
      Wd * 0.2 +
      ' ' +
      (hz + Hd * 0.02) +
      ' ' +
      Wd * 0.45 +
      ' ' +
      (hz + Hd * 0.11) +
      ' ' +
      Wd * 0.62 +
      ' ' +
      (hz + Hd * 0.05) +
      ' S' +
      Wd * 0.88 +
      ' ' +
      (hz + Hd * 0.03) +
      ' ' +
      Wd +
      ' ' +
      (hz + Hd * 0.07) +
      ' V' +
      Hd +
      'z'
    fb.setAttribute('viewBox', '0 0 ' + Wd + ' ' + Hd)
    fb.style.top = '0'
    fb.style.height = '100%'
    fb.children[0]?.setAttribute('d', d + ' L' + Wd + ' ' + Hd + 'z')
    fb.children[1]?.setAttribute('d', sand)
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
    const f = sh(g.FRAGMENT_SHADER, FS)
    if (!v || !f) return false
    prog = g.createProgram()
    if (!prog) return false
    g.attachShader(prog, v)
    g.attachShader(prog, f)
    g.linkProgram(prog)
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      if (!g.isContextLost()) console.warn(g.getProgramInfoLog(prog))
      return false
    }
    g.useProgram(prog)
    buf = g.createBuffer()
    g.bindBuffer(g.ARRAY_BUFFER, buf)
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
    const a = g.getAttribLocation(prog, 'p')
    g.enableVertexAttribArray(a)
    g.vertexAttribPointer(a, 2, g.FLOAT, false, 0, 0)
    for (const n of UNIFORMS) loc[n] = g.getUniformLocation(prog, n)
    return true
  }
  function measure() {
    // Everything in the scene that touches the name is placed from the real text layout:
    // horizon on the baseline, sun in the word gap, low valley under "LEE.", period kept clear.
    const h1 = el.title.querySelector<HTMLElement>('h1')
    const w1 = el.title.querySelector<HTMLElement>('.rh-w1')
    const w2 = el.title.querySelector<HTMLElement>('.rh-w2')
    const dotEl = el.title.querySelector<HTMLElement>('.rh-dot')
    const blEl = el.title.querySelector<HTMLElement>('.rh-bl')
    if (!h1 || !w1 || !w2 || !dotEl || !blEl) return
    const r = hero.getBoundingClientRect()
    const Wr = Math.max(r.width, 1)
    const Hr = Math.max(r.height, 1)
    const nx = (x: number) => ((x - r.left) / Wr) * 2 - 1
    const ny = (y: number) => 1 - ((y - r.top) / Hr) * 2
    const a = w1.getBoundingClientRect()
    const b = w2.getBoundingClientRect()
    const dot = dotEl.getBoundingClientRect()
    const base = blEl.getBoundingClientRect()
    const oneLine = Math.abs(a.top - b.top) < 4
    asp = Wr / Hr
    F = asp < 0.8 ? 0.5 : 0.364
    CN = (2 * parseFloat(getComputedStyle(h1).fontSize) * capRatio) / Hr
    BL = ny(base.top)
    H0 = BL - 0.012 * CN
    SX = nx(oneLine ? (a.right + b.left) / 2 : (b.right + r.right) / 2)
    const end = nx(dot.right) + 0.015
    V = oneLine
      ? [nx(a.right), nx(b.left), end, end + 0.08]
      : [-1.4, -1.3, Math.max(end, SX + 0.12), Math.max(end, SX + 0.12) + 0.12]
    PD = [nx((dot.left + dot.right) / 2), (dot.right - dot.left) / Wr]
    hero.style.setProperty('--rh-hz', ((1 - (H0 + 1) / 2) * 100).toFixed(2) + '%')
  }
  function resize() {
    measure()
    const r = hero.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = r.width * dpr * scale
    const h = r.height * dpr * scale
    const cap = Math.min(1, 1600 / w)
    W = cv.width = Math.max(2, Math.round(w * cap))
    H = cv.height = Math.max(2, Math.round(h * cap))
    if (gl) gl.viewport(0, 0, W, H)
  }
  function draw() {
    const g = gl
    if (!g) return
    const k = K * K * (3 - 2 * K)
    const u = 1 - Math.pow(1 - rise, 3)
    const P = (n: Exclude<keyof Palette, 'hm'>) => mixc(PAL.day[n], PAL.dusk[n], k)
    g.uniform2f(loc.R, W, H)
    g.uniform1f(loc.T, time)
    g.uniform1f(loc.K, k)
    g.uniform1f(loc.U, u)
    g.uniform1f(loc.F, F)
    g.uniform1f(loc.H0, H0)
    g.uniform1f(loc.CN, CN)
    g.uniform1f(loc.HK, 1.2 / CN)
    g.uniform1f(loc.HM, lerp(PAL.day.hm, PAL.dusk.hm, k))
    g.uniform3f(loc.C, cx * 1.8, 3.6 - cy * 0.3, time * 0.7)
    g.uniform3fv(loc.S, norm(mixc(sunDay, sunDusk(), k)))
    g.uniform3fv(loc.cHaze, P('haze'))
    g.uniform3fv(loc.cGlow, P('glow'))
    g.uniform3fv(loc.cSun, P('sun'))
    g.uniform3fv(loc.cAmb, P('amb'))
    g.uniform1f(loc.SX, SX)
    g.uniform1f(loc.BL, BL)
    g.uniform4fv(loc.V, V)
    g.uniform2fv(loc.PD, PD)
    g.uniform3fv(loc.cPL, P('pl'))
    g.uniform3fv(loc.cSL, P('sl'))
    g.uniform3fv(loc.cSD, P('sdk'))
    g.uniform3fv(loc.cFar, P('far'))
    g.drawArrays(g.TRIANGLES, 0, 3)
  }
  function frame(now: number) {
    if (destroyed) return
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
    last = now
    time += dt
    if (++frames > 20) {
      acc += dt
      if (frames === 60) {
        if (acc / 40 > 0.022 && scale > 0.3) {
          scale = Math.max(0.3, scale * 0.85)
          resize()
        }
        frames = 20
        acc = 0
      }
    }
    if (K !== Kt) {
      K += (Kt - K) * Math.min(1, dt * 2.2)
      if (Math.abs(Kt - K) < 0.003) K = Kt
      paintCss(K, K === Kt)
    }
    if (rise < 1) rise = Math.min(1, rise + dt / 1.7)
    cx += (px - cx) * 0.04
    cy += (py - cy) * 0.04
    draw()
    raf = running ? requestAnimationFrame(frame) : 0
  }
  function sync() {
    if (destroyed) return
    const go = visible && !document.hidden && !still && !fellBack
    if (go && !running) {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    } else if (!go && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }
  // Re-places the scene from the current text layout. The name's letter-spacing settles and its font swaps in after the
  // first measurement, and neither changes the hero's size, so the resize observer alone would miss them.
  function refit() {
    if (destroyed) return
    if (fellBack) drawFallback()
    else {
      resize()
      if (!running && gl) draw()
    }
  }
  function onFontsReady() {
    if (destroyed) return
    try {
      const h1 = el.title.querySelector('h1')
      const c = document.createElement('canvas').getContext('2d')
      if (h1 && c) {
        // the family of the real name, so the measurement uses the same face the page draws
        c.font = `800 100px ${getComputedStyle(h1).fontFamily}`
        const m = c.measureText('E').actualBoundingBoxAscent / 100
        if (m > 0.5 && m < 0.9) capRatio = m
      }
    } catch {
      // keep the default cap ratio
    }
    refit()
  }
  function onContextLost(e: Event) {
    e.preventDefault()
    fail()
  }
  function onContextRestored() {
    if (!build()) return
    fellBack = false
    fbRo?.disconnect()
    fbRo = null
    cv.hidden = false
    fb.classList.remove('rh-on')
    resize()
    draw()
    sync()
  }
  function onTheme(dark: boolean) {
    Kt = dark ? 1 : 0
    if (still || !running) {
      K = Kt
      paintCss(K, true)
      draw()
    } else paintCss(K, false)
  }
  function onPointerMove(e: PointerEvent) {
    const r = hero.getBoundingClientRect()
    px = ((e.clientX - r.left) / r.width) * 2 - 1
    py = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  function onPointerLeave() {
    px = py = 0
  }
  function boot() {
    // Registered before any early return to fail(): the SVG still must also be re-fitted once the name has settled and its
    // font has swapped in (both handlers route to drawFallback() when fellBack), or the skyline stays placed from the first,
    // mid-settle measurement.
    if (document.fonts) void document.fonts.ready.then(onFontsReady)
    el.title.querySelector('h1')?.addEventListener('animationend', refit)
    if (saveData) return fail()
    gl = cv.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    })
    if (!gl) return fail()
    if (gl.isContextLost()) {
      // A re-mount on the same canvas is handed the context the previous mount released: ask for it back, and
      // webglcontextrestored finishes the set-up. The request waits a task so that the loss event the release queued has
      // been dispatched (restoreContext() is refused before that).
      const ext = loseExt.get(cv)
      if (!ext) return fail()
      cv.addEventListener('webglcontextrestored', start, { once: true })
      restoreTimer = window.setTimeout(() => ext.restoreContext(), 0)
      return
    }
    start()
  }
  // The set-up that needs a live context: the program, the observers and listeners, the first frame.
  function start() {
    if (destroyed || !gl) return
    const ext = gl.getExtension('WEBGL_lose_context')
    if (ext) loseExt.set(cv, ext)
    if (!build()) return fail()
    resize()
    ro = new ResizeObserver(() => {
      resize()
      if (!running && gl) draw()
    })
    ro.observe(hero)
    cv.addEventListener('webglcontextlost', onContextLost)
    cv.addEventListener('webglcontextrestored', onContextRestored)
    stopTheme = watchDarkTheme(onTheme)
    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onPointerLeave)
    if (still) {
      rise = 1
      time = 30
    }
    draw()
    rafOn = requestAnimationFrame(() => cv.classList.add('rh-on'))
    io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(hero)
    document.addEventListener('visibilitychange', sync)
    sync()
  }

  boot()

  return {
    destroy() {
      if (destroyed) return
      destroyed = true
      running = false
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rafOn)
      ro?.disconnect()
      fbRo?.disconnect()
      io?.disconnect()
      stopTheme?.()
      document.removeEventListener('visibilitychange', sync)
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
      cv.removeEventListener('webglcontextlost', onContextLost)
      cv.removeEventListener('webglcontextrestored', onContextRestored)
      cv.removeEventListener('webglcontextrestored', start)
      window.clearTimeout(restoreTimer)
      el.title.querySelector('h1')?.removeEventListener('animationend', refit)
      paintCss(0, true)
      // the elements go back to the markup's first state, in case the same ones are mounted again
      cv.classList.remove('rh-on')
      cv.hidden = false
      fb.classList.remove('rh-on')
      if (gl && !gl.isContextLost()) {
        // the loss event has to be cancelled once, or the context could never be restored by a later mount on this canvas
        cv.addEventListener('webglcontextlost', (e) => e.preventDefault(), { once: true })
        loseExt.get(cv)?.loseContext()
      }
    },
  }
}
