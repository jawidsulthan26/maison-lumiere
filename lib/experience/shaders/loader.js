/**
 * Loader shader: the real perfume bottle fills with amber, tips, pours and floods into the hero.
 */
import { GLSL_NOISE } from './common';

/* ---------------------------------------------------------------------------
   4. LOADER — the real perfume bottle fills with amber (shader), its cap lifts off,
      it tips and pours, the amber floods the screen and drains away into the hero
   --------------------------------------------------------------------------- */
export const LOADER_FRAG = /* glsl */`
  precision highp float;
  uniform vec2 uRes; uniform float uTime, uFill, uTilt, uPour, uFlood, uReveal, uReady, uCapLift;
  uniform sampler2D uBody, uCap; uniform vec2 uBodySize;
  varying vec2 vUv;
  ${GLSL_NOISE}
  float sdRoundBox(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  void main(){
    vec2 uv = vUv;
    float asp = uRes.x/uRes.y;
    vec2 p = (uv-.5)*vec2(asp,1.);
    // background: warm cream with a soft peach glow
    vec3 col = mix(vec3(.984,.953,.925), vec3(.965,.905,.86), smoothstep(.1,.9,length(p*vec2(.8,1.))));
    col = mix(col, vec3(.96,.86,.79), .35*exp(-dot(p,p)*9.));

    // ---- the real perfume bottle (photo), rotating about its body centre while it pours ----
    vec2 c = vec2(0., -.035);
    vec2 B = uBodySize;                                   // body size in screen-height units
    vec2 q = rot(uTilt)*(p-c);
    vec2 bUv = q/B + .5;
    float inB = step(0.,bUv.x)*step(bUv.x,1.)*step(0.,bUv.y)*step(bUv.y,1.);
    vec4 bt = texture2D(uBody, clamp(bUv,.001,.999))*inB;
    // the cap sits just above, then lifts off before the pour
    float capH = B.y*312./850.;
    vec2 qc = q - vec2(0., B.y*.5 + .012 + capH*.5 + uCapLift);
    vec2 cUv = qc/vec2(B.x, capH) + .5;
    float inC = step(0.,cUv.x)*step(cUv.x,1.)*step(0.,cUv.y)*step(cUv.y,1.);
    vec4 ct = texture2D(uCap, clamp(cUv,.001,.999))*inC;
    ct.a *= 1.-smoothstep(.08,.3,uCapLift);

    // inside of the glass — the photo's liquid chamber (measured: 13–87% wide, 20–66% high)
    float sdIn = sdRoundBox(bUv-vec2(.5,.4275), vec2(.37,.2275), .035);
    float interior = smoothstep(.004,-.004, sdIn) * inB;

    // liquid: its surface stays level in world space as the bottle tilts, and drains as it pours
    float level = mix(-B.y*.3, B.y*.152, uFill) - uPour*.42;
    float wave = sin(p.x*36.+uTime*3.2)*.004*(1.+uPour*5.) + sin(p.x*15.-uTime*2.1)*.003;
    float liq = smoothstep(.003,-.003, (p.y-c.y)-level-wave) * interior;
    float depth = clamp((level-(p.y-c.y))*4.5, 0., 1.);
    vec3 bc = bt.rgb;                                    // straight (non-premultiplied) alpha
    float lum = dot(bc, vec3(.299,.587,.114));
    // the liquid layer sits inside the glass: clear when empty, rich amber as it fills
    float sideShade = smoothstep(.5,.0,abs(bUv.x-.5))*.12;                       // rounder, darker centre
    vec3 amber = mix(vec3(.99,.76,.4), vec3(.62,.27,.07), depth) * (.92 + sideShade);
    amber += vec3(1.,.9,.7)*smoothstep(.03,.0,abs(bUv.x-.22))*.35;               // vertical glass highlight through the liquid
    vec3 inCol = mix(vec3(.975,.965,.955), amber, liq);
    float inA = interior*mix(.16, .93, liq);
    float meni = smoothstep(.009,.0,abs((p.y-c.y)-level-wave))*interior*step(.001,uFill);
    inCol += vec3(.35,.25,.12)*meni;
    // glass edges, nozzle and base come straight from the photo (its liquid tint neutralised)
    float sat = max(bc.r,max(bc.g,bc.b)) - min(bc.r,min(bc.g,bc.b));
    vec3 bottleCol = mix(bc, vec3(lum*1.04+.04), smoothstep(.04,.2,sat)*interior);
    float ready = uReady;
    // soft contact shadow under the bottle (gone once it tips)
    vec2 sp = vec2(p.x/(B.x*.75), (p.y-(c.y-B.y*.5-.006))/.016);
    col = mix(col, vec3(.6,.47,.38), exp(-dot(sp,sp))*.22*ready*(1.-smoothstep(0.,.35,uTilt)));
    col = mix(col, inCol, inA*ready);
    col = mix(col, bottleCol, bt.a*ready*(1.-liq*.55));
    vec3 cc = ct.rgb;
    col = mix(col, cc, ct.a*ready);

    // pour stream leaving the vial mouth, falling with a parabola
    vec2 mouth = c + rot(-uTilt)*vec2(0., B.y*.49);       // the spray nozzle
    float sOn = smoothstep(.12,.3,uPour)*(1.-smoothstep(.85,1.,uPour));
    float fall = max(mouth.y-p.y, 0.);
    float sx = mouth.x + .05*sqrt(fall) + sin(p.y*24.+uTime*9.)*.003;
    float sw = mix(.013,.006,clamp(fall*.8,0.,1.))*sOn;
    float streamEnd = mix(mouth.y, -.75, smoothstep(.12,.55,uPour));
    float stream = smoothstep(sw, sw*.4, abs(p.x-sx)) * step(streamEnd,p.y) * step(p.y,mouth.y);
    col = mix(col, mix(vec3(.95,.66,.32), vec3(.7,.33,.1), smoothstep(-.6,.2,p.y)), stream);

    // flood: amber rising from the bottom of the screen
    float fy = mix(-.62, .7, uFlood) + (fbm(vec2(p.x*3.+uTime*.6, uTime*.4))-.5)*.08;
    float flood = smoothstep(.004,-.004, p.y-fy);
    vec3 floodCol = mix(vec3(.9,.58,.27), vec3(.55,.23,.06), clamp((fy-p.y)*1.4,0.,1.));
    floodCol += vec3(.3,.2,.1)*smoothstep(.02,.0,abs(p.y-fy));
    col = mix(col, floodCol, flood);

    // reveal: the amber drains downward, uncovering the hero
    float ry = mix(.72, -.78, uReveal) + (fbm(vec2(p.x*2.6-uTime*.5, uTime*.3))-.5)*.12*sin(uReveal*3.1416);
    float keep = uReveal > 0. ? smoothstep(-.004,.004, ry-p.y) : 1.;
    col += vec3(.25,.16,.07)*smoothstep(.025,.0,abs(p.y-ry))*step(.001,uReveal);
    gl_FragColor = vec4(col*keep, keep);
  }
`;
