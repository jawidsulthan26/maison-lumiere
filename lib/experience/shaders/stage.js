/**
 * Shaders for the fixed WebGL stage: particle sculptures, ripple planes, liquid-wipe hero, essence, wordmark, liquid pool, orbit.
 */
import { GLSL_NOISE } from './common';

/* ---------------------------------------------------------------------------
   6. STAGE — one fixed WebGL canvas that draws every bottle as a plane
      synced to its DOM <img> (products, carousel, hero bottle, essence, wordmark)
   --------------------------------------------------------------------------- */
/* -------- Particle sculptures: every bottle is rebuilt from its own pixels as GPU points.
   uForm 0 → 1 assembles them from swirling dust, uDissolve scatters them into a falling
   stream, uBurst throws a halo outward (hover / variant swap). The crisp texture plane
   fades in only when the particles have fully settled. -------- */
export const PARTICLE_VERT = /* glsl */`
  attribute vec2 aUv; attribute vec4 aCol; attribute vec3 aRnd;
  uniform float uTime, uForm, uDissolve, uBurst, uCell, uPx, uCamZ, uNoir, uSpread;
  uniform vec2 uMouse;
  varying vec4 vCol; varying float vA;
  ${GLSL_NOISE}
  vec3 toNoir(vec3 c){
    float l = pow(dot(c, vec3(.299,.587,.114)), 1.35);
    float sat = max(c.r,max(c.g,c.b)) - min(c.r,min(c.g,c.b));
    vec3 n = mix(vec3(.05,.03,.022), vec3(.36,.2,.1), smoothstep(.12,.7,l));
    n = mix(n, vec3(.96,.8,.52), smoothstep(.62,.95,l));
    return mix(c, n, smoothstep(.08,.3,sat));
  }
  void main(){
    vec4 world = modelMatrix*vec4(aUv-.5, 0., 1.);
    float delay = aRnd.x*.28 + (1.-aUv.y)*.12;
    float f = smoothstep(delay, delay+.45, uForm);
    float sc = 1.-f;
    vec3 dir = normalize(vec3(aRnd.y-.5, aRnd.z-.5, aRnd.x-.5) + 1e-3);
    float t = uTime*.45 + aRnd.x*6.283;
    vec3 swirl = vec3(sin(t+aUv.y*7.), cos(t*1.3+aUv.x*6.), sin(t*.8+aUv.x*3.))*70.;
    vec3 off = (dir*uSpread*(.35+aRnd.y) + swirl*1.4)*sc*sc;
    // dissolve: starts at noisy edges, pours down and toward the viewer
    float th = noise(aUv*7.+3.)*.55 + aRnd.x*.3;
    float d = smoothstep(th*.75, th*.75+.32, uDissolve);
    off += (vec3((aRnd.y-.5)*650., -(260.+aRnd.z*1000.), (aRnd.x-.3)*1100.) + swirl*3.5)*d;
    off += dir*uBurst*(30.+aRnd.y*170.) + swirl*uBurst*.6;
    // cursor pushes loose particles away
    vec2 dm = world.xy + off.xy - uMouse; float dl = length(dm);
    off.xy += normalize(dm+1e-4)*smoothstep(160.,0.,dl)*70.*max(sc, max(d, uBurst));
    world.xyz += off;
    vec4 mv = viewMatrix*world;
    gl_Position = projectionMatrix*mv;
    gl_PointSize = uCell*uPx*(1.7 + sc*.9 + d*1.2 + uBurst*.6)*(uCamZ/max(-mv.z, 1.));
    vCol = vec4(mix(aCol.rgb, toNoir(aCol.rgb), uNoir), aCol.a);
    float glint = .75 + .25*sin(uTime*3. + aRnd.z*40.);
    // fully visible while forming; hands over to the crisp plane only at the very end
    float formVis = (1. - smoothstep(.93, 1., uForm)) * mix(.38, 1., f*f);   // loose dust is faint, solidifies as it lands
    vA = clamp(max(max(formVis, d), uBurst*.8), 0., 1.) * (1. - d*d*.9) * mix(1., glint, max(sc, d));
  }
`;

export const PARTICLE_FRAG = /* glsl */`
  varying vec4 vCol; varying float vA;
  void main(){
    float r = length(gl_PointCoord-.5)*2.; if(r > 1.) discard;
    float a = vCol.a*vA*(1.-smoothstep(.45,1.,r));
    gl_FragColor = vec4(vCol.rgb*a, a);
  }
`;

export const PLANE_FRAG = /* glsl */`
  uniform sampler2D uTex; uniform float uTime, uHover, uDistort, uAlpha, uVel; uniform vec2 uMouse;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv;
    // liquid ripple from the cursor (hover)
    vec2 dm = uv-uMouse; float d = length(dm*vec2(1.,1.35));
    float rip = sin(d*44.-uTime*7.)*exp(-d*5.5)*uHover;
    uv += normalize(dm+1e-5)*rip*.011;
    uv.x += sin(uv.y*11.+uTime*2.6)*.0045*uHover;
    uv.x += sin(uv.y*7.+uTime*4.)*.022*uVel*(1.-uv.y*.4);           // liquid wobble with scroll speed
    uv.y += uVel*.02*(uv.x-.5);
    // glass refraction while the carousel moves
    float ridge = sin((uv.x+uv.y*.35)*26.+uTime*3.)*.5+.5;
    uv += vec2(ridge-.5, sin(uv.y*8.-uTime*2.)*.5)*.055*uDistort;
    float ca = .009*uDistort + .0025*uHover;
    vec4 cr = texture2D(uTex, uv+vec2(ca,0.)), cg = texture2D(uTex, uv), cb = texture2D(uTex, uv-vec2(ca,0.));
    vec4 c = vec4(cr.r, cg.g, cb.b, max(cg.a, max(cr.a, cb.a)));
    c.rgb += vec3(1.,.92,.82)*pow(ridge,10.)*.3*uDistort*c.a;   // glass sheen
    gl_FragColor = c*uAlpha;   // premultiplied output
  }
`;

export const HERO_FRAG = /* glsl */`
  uniform sampler2D uTex; uniform float uTime, uWipe, uFrom, uTo, uAlpha;
  varying vec2 vUv;
  ${GLSL_NOISE}
  vec3 variant(vec3 c, float v){
    // v = 0 : Elan (original amber) · v = 1 : Noir (smoked, near-black juice with gold highlights)
    float l = dot(c, vec3(.299,.587,.114));
    float sat = max(c.r,max(c.g,c.b)) - min(c.r,min(c.g,c.b));
    float lc = pow(l, 1.35);
    vec3 noir = mix(vec3(.05,.03,.022), vec3(.36,.2,.1), smoothstep(.12,.7,lc));
    noir = mix(noir, vec3(.96,.8,.52), smoothstep(.62,.95,lc));
    return mix(c, mix(c, noir, smoothstep(.08,.3,sat)), v);
  }
  void main(){
    float n = fbm(vUv*vec2(3.,2.)+vec2(0.,uTime*.25));
    float front = uWipe*1.5 - .25;                         // liquid wipe front (rises from the bottom)
    float k = vUv.y*.7 + (1.-vUv.x)*.3 + (n-.5)*.35;
    float m = smoothstep(front-.03, front+.03, k);         // 1 = still old variant
    float band = smoothstep(.09,.0,abs(k-front))*step(.001,uWipe)*step(uWipe,.999);
    vec2 uv = vUv + vec2(n-.5, .5-n)*.035*band;
    vec4 t = texture2D(uTex, uv);
    vec3 c = t.a>0. ? t.rgb/t.a : t.rgb;
    vec3 col = mix(variant(c,uTo), variant(c,uFrom), m);
    col += vec3(1.,.78,.45)*band*.45;                      // bright meniscus on the front
    gl_FragColor = vec4(col*t.a, t.a)*uAlpha;
  }
`;

export const ESSENCE_FRAG = /* glsl */`
  uniform sampler2D uTex; uniform float uTime, uAlpha, uSpin;
  varying vec2 vUv;
  void main(){
    vec4 t = texture2D(uTex, vUv);
    // moving specular band = light sweeping across rotating glass
    float x = vUv.x + sin(uSpin)*.35;
    float sheen = smoothstep(.06,.0,abs(x-.38))*.5 + smoothstep(.03,.0,abs(x-.62))*.3;
    vec3 c = t.rgb + vec3(1.,.97,.9)*sheen*t.a*.55;
    c *= 1. - .18*abs(sin(uSpin))*smoothstep(.2,.5,abs(vUv.x-.5));   // edge shading
    gl_FragColor = vec4(c, t.a)*uAlpha;
  }
`;

export const WORD_FRAG = /* glsl */`
  uniform sampler2D uTex; uniform vec2 uMouse, uSize; uniform float uStr, uTime;
  varying vec2 vUv;
  ${GLSL_NOISE}
  void main(){
    vec2 d = (vUv-uMouse)*vec2(uSize.x/uSize.y, 1.);
    float l = length(d);
    float fall = exp(-l*l*14.)*uStr;
    vec2 flow = vec2(noise(vUv*vec2(9.,3.)+uTime*.7), noise(vUv*vec2(9.,3.)-uTime*.6+7.))-.5;
    vec2 uv = vUv + flow*fall*.07 + normalize(d+1e-5)*sin(l*38.-uTime*6.)*fall*.012*vec2(uSize.y/uSize.x,1.);
    float sh = fall*.006;
    float r = texture2D(uTex, uv+vec2(sh,0.)).a, g = texture2D(uTex, uv).a, b = texture2D(uTex, uv-vec2(sh,0.)).a;
    float a = max(g, max(r,b));
    vec3 ink = vec3(.137,.102,.082), amber = vec3(.78,.5,.29);
    vec3 col = mix(ink, amber, clamp(fall*1.3,0.,1.));
    col += vec3(.2,.1,0.)*(r-b);
    gl_FragColor = vec4(col*a, a);
  }
`;

/* Liquid amber pool the hero bottle rises from — fake-perspective water with
   travelling ripples (cursor, clicks, drips), fresnel sky reflection and sparkles */
export const POOL_FRAG = /* glsl */`
  /* The liquid takes its picture from the bottle itself:
     – reflection: the bottle + splash mirrored about the waterline, warped by ripples
     – refraction: the part of the bottle below the waterline, bent and tinted amber,
       so the photo's bottom edge disappears *into* the liquid instead of being cut
     – a bright meniscus where the glass touches the surface                          */
  uniform float uTime, uAlpha, uNoir, uWater; uniform vec2 uSize; uniform vec4 uRip[8];
  uniform vec4 uMap;           // pool uv → bottle uv: (x offset, x scale, y offset, y scale), y measured from the bottle top
  uniform sampler2D uTex;
  uniform vec3 uDeep, uMid, uLight;
  varying vec2 vUv;
  ${GLSL_NOISE}
  vec2 surf(vec2 uv){ float t = clamp(uv.y,0.,.995); float z = mix(1., 8., pow(t,1.7)); return vec2((uv.x-.5)*(uSize.x/uSize.y)*z*.42, z); }
  float height(vec2 uv){
    vec2 p = surf(uv);
    float h = sin(p.x*2.3+uTime*1.15)*.045 + sin(p.y*3.1-uTime*1.5+p.x*.7)*.04 + (noise(p*1.7+uTime*.3)-.5)*.07
            + (noise(p*vec2(6.,3.)-uTime*.6)-.5)*.025;                                   // fine surface detail
    for(int i=0;i<8;i++){
      vec4 r = uRip[i]; float age = uTime-r.z;
      if(age < 0. || age > 4.5) continue;
      vec2 c = surf(r.xy); float d = length(p-c); float front = age*1.5;
      float env = r.w*exp(-age*.9)*smoothstep(front+.5, front-.1, d);
      h += sin(d*8.5-age*9.)*.16*env/(1.+d*1.2);
    }
    return h;
  }
  vec3 toNoir(vec3 c){
    float l = pow(dot(c, vec3(.299,.587,.114)), 1.35);
    float sat = max(c.r,max(c.g,c.b)) - min(c.r,min(c.g,c.b));
    vec3 n = mix(vec3(.05,.03,.022), vec3(.36,.2,.1), smoothstep(.12,.7,l));
    n = mix(n, vec3(.96,.8,.52), smoothstep(.62,.95,l));
    return mix(c, n, smoothstep(.08,.3,sat));
  }
  vec4 bottle(vec2 buv){
    vec4 t = texture2D(uTex, clamp(buv, .001, .999));
    float inb = step(0.,buv.x)*step(buv.x,1.)*step(0.,buv.y)*step(buv.y,1.);
    vec3 c = t.a > .001 ? t.rgb/t.a : vec3(0.);
    return vec4(mix(c, toNoir(c), uNoir), t.a*inb);
  }
  void main(){
    vec2 uv = vUv; float e = .003;
    float h0 = height(uv), hx = height(uv+vec2(e,0.)), hy = height(uv+vec2(0.,e));
    vec2 g = vec2(hx-h0, hy-h0)/e*.018;
    vec3 n = normalize(vec3(-g.x*3., 1., -g.y*3.));
    float graze = smoothstep(0.,1.,uv.y);
    vec2 p = surf(uv);

    // where this pixel sits in the bottle photo (y from the top)
    float bu = uMap.x + uv.x*uMap.y;
    float by = uMap.z + (1.-uv.y)*uMap.w;
    float yW = uMap.z + (1.-uWater)*uMap.w;            // waterline
    float below = max(by - yW, 0.);
    float depth = clamp(below/(uMap.w*.55), 0., 1.);

    // liquid body — same amber as the splash, deeper further down
    vec3 liquid = mix(uMid*1.08, uDeep*.9, depth*.85 + (1.-graze)*.1);
    liquid += uLight*pow(noise(p*3.5+vec2(uTime*.4,-uTime*.3)),4.)*.5*(1.-graze);   // caustics
    vec3 col = liquid;

    // refraction: submerged bottle, bent by the surface and swallowed by depth
    vec4 rf = bottle(vec2(bu + g.x*.035, 1.-by + g.y*.02 + depth*.01));
    col = mix(col, mix(rf.rgb, rf.rgb*uMid*1.45, .55), rf.a*(1.-depth*.8)*.92);

    // reflection: mirrored about the waterline, stretched + rippled, fading with distance
    vec4 rl = bottle(vec2(bu + g.x*.08, 1.-(yW - below*1.08) + g.y*.06));
    float fres = mix(.35, .75, graze);
    col = mix(col, rl.rgb*vec3(1.,.92,.82), rl.a*fres*.7*(1.-smoothstep(0., uMap.w*.5, below)));

    // sky sheen + specular + sparkles
    col = mix(col, vec3(.99,.95,.9), fres*.18*(1.-rl.a));
    float spec = pow(clamp(dot(reflect(normalize(vec3(-.35,-.8,.5)), n), normalize(vec3(0.,.6,-1.))),0.,1.), 30.);
    col += vec3(1.,.96,.88)*spec*.85;
    col += vec3(1.,.95,.85)*step(.978, noise(p*vec2(16.,11.)+uTime*vec2(.8,-.6)))*smoothstep(.3,.9,graze)*.3;

    // meniscus: bright line at the waterline, strongest where the glass meets the liquid
    // the waterline laps: it undulates with the waves and ripples instead of a ruled line
    float W = uWater + (noise(vec2(uv.x*9.+uTime*.55, uTime*.35))-.5)*.035 + sin(uv.x*22.+uTime*1.7)*.006 + g.y*.03;
    float contact = bottle(vec2(bu, 1.-yW)).a;
    float wl = smoothstep(.016, 0., abs(uv.y-W));
    col += mix(uLight*.08, vec3(1.,.9,.72)*.38, contact)*wl;

    // organic puddle: crisp waterline, soft far edges
    float m = length(vec2((uv.x-.5)/.5, (uv.y-.58)/.62)) + (noise(uv*vec2(7.,3.)+uTime*.15)-.5)*.12;
    float a = (1.-smoothstep(.72,1.,m)) * smoothstep(W+.012, W-.006, uv.y) * smoothstep(0.,.32,uv.y);
    a = max(a, wl*contact*.6*step(uv.y, W+.02));
    a *= mix(.82, .96, rf.a);
    gl_FragColor = vec4(col*a, a)*uAlpha;
  }
`;

export const ORBIT_VERT = /* glsl */`
  attribute vec3 aRnd; attribute float aAng;
  uniform float uTime, uR, uPx, uShow; uniform vec4 uNotes; uniform vec4 uNoteAng;
  varying float vGlow; varying float vA;
  void main(){
    float ang = aAng + uTime*(.04+aRnd.x*.05)*(aRnd.z>.5?1.:-.7);
    float r = uR*(1. + (aRnd.y-.5)*.055 + sin(uTime*.8+aRnd.x*20.)*.012);
    vec3 p = position + vec3(cos(ang)*r, sin(ang)*r, 0.);
    // particles near an activated note brighten and swell
    float boost = 0.;
    for(int i=0;i<4;i++){ float da = abs(atan(sin(ang-uNoteAng[i]), cos(ang-uNoteAng[i]))); boost += uNotes[i]*smoothstep(.55,.0,da); }
    vGlow = boost; vA = uShow*(.35+aRnd.x*.65);
    gl_PointSize = (2. + aRnd.z*4. + boost*7.)*uPx;
    gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.);
  }
`;

export const ORBIT_FRAG = /* glsl */`
  varying float vGlow; varying float vA;
  void main(){
    float r = length(gl_PointCoord-.5)*2.; if(r>1.) discard;
    float a = (1.-smoothstep(.0,1.,r)) * vA * (.55+vGlow*.8);
    vec3 col = mix(vec3(.78,.5,.3), vec3(1.,.82,.6), clamp(vGlow,0.,1.));
    gl_FragColor = vec4(col*a, a);
  }
`;
