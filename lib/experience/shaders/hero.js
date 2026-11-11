/**
 * Hero background shaders: cursor-reactive glow, glassy amber droplets, golden dust with depth of field.
 */
/* ---------------------------------------------------------------------------
   5. HERO SCENE — metaball amber fluid, instanced droplets, golden dust with DOF
   --------------------------------------------------------------------------- */
export const FLUID_FRAG = /* glsl */`
  precision highp float;
  uniform vec2 uRes, uMouse, uCenter; uniform float uTime, uScale, uMouseOn, uIntensity;
  uniform vec3 uDeep, uMid, uLight;
  varying vec2 vUv;
  void main(){
    vec2 p = (vUv-.5)*vec2(uRes.x/uRes.y, 1.);
    float f = 0.; vec2 g = vec2(0.);
    for(int i=0;i<9;i++){
      float fi = float(i);
      float a = fi*.698 + uTime*(.11 + .04*mod(fi,3.));
      vec2 off = vec2(cos(a)*(.12+.05*sin(fi*1.7+uTime*.35)), sin(a*1.3+fi)*.05 + .018*sin(uTime*.8+fi));
      vec2 b = uCenter + vec2(0.,-.04) + off*vec2(2.,1.)*uScale;
      vec2 tm = uMouse-b; b += tm*.3*smoothstep(.45,.0,length(tm))*uMouseOn;   // blobs are drawn toward the cursor
      float r = (.03 + .022*fract(fi*.618))*uScale;
      vec2 d = p-b; float d2 = dot(d,d)+1e-5;
      f += r*r/d2; g += -2.*r*r*d/(d2*d2);
    }
    { vec2 d = p-uMouse; float r=.036*uScale*uMouseOn; float d2=dot(d,d)+1e-5; f += r*r/d2; g += -2.*r*r*d/(d2*d2); }

    float body = smoothstep(.92,1.06,f);
    vec3 n = normalize(vec3(-g*.012*uScale, 1.));
    vec3 L = normalize(vec3(-.45,.6,.7));
    float diff = clamp(dot(n,L),0.,1.);
    float spec = pow(clamp(dot(reflect(-L,n), vec3(0,0,1)),0.,1.), 36.);
    float fres = pow(1.-n.z, 1.6);
    float thick = clamp((f-1.)*.35, 0., 1.);                       // thicker liquid = deeper colour
    vec3 col = mix(uMid, uDeep, thick*.8);
    col = mix(col, uLight, fres*.7 + (1.-diff)*.1);
    col += spec*1.1 + pow(diff,6.)*.15;
    float a = 0.;   // liquid body now lives in the pool; keep the soft cursor-reactive glow
    float halo = smoothstep(.12,1.2,f)*.42*uIntensity;  // soft peach glow around the fluid
    vec3 haloCol = mix(vec3(.96,.83,.73), uLight, .25);
    float A = a + halo*(1.-a);
    vec3 C = (col*a + haloCol*halo*(1.-a)) / max(A,1e-4);
    gl_FragColor = vec4(C, A);
  }
`;

export const DROP_VERT = /* glsl */`
  attribute vec4 aSeed;  // x: angle, y: speed, z: size, w: phase
  uniform float uTime, uScale; uniform vec3 uOrigin, uMouseW;
  varying vec3 vN; varying vec3 vView; varying float vLife;
  void main(){
    float t = fract(uTime*(.06+.05*aSeed.y) + aSeed.w);
    float T = t*3.;
    vec3 v = vec3(cos(aSeed.x)*(.7+aSeed.y*1.1), sin(aSeed.x)*(.6+aSeed.y*.9)+.85, (aSeed.y-.5)*1.4);
    vec3 pos = uOrigin + v*T*uScale + vec3(0.,-.95,0.)*T*T*.5*uScale;
    vec2 dm = pos.xy-uMouseW.xy; float dl = length(dm);
    pos.xy += normalize(dm+1e-4)*smoothstep(1.3*uScale,0.,dl)*.7*uScale;  // droplets dodge the cursor
    float s = aSeed.z*sin(3.14159*t)*uScale;
    vLife = t;
    vec4 mv = modelViewMatrix*vec4(position*s + pos, 1.);
    vN = normalize(normalMatrix*normal); vView = -mv.xyz;
    gl_Position = projectionMatrix*mv;
  }
`;

export const DROP_FRAG = /* glsl */`
  uniform vec3 uDeep, uMid, uLight;
  varying vec3 vN; varying vec3 vView; varying float vLife;
  void main(){
    vec3 n = normalize(vN), V = normalize(vView);
    float fr = pow(1.-max(dot(n,V),0.), 2.2);
    vec3 L = normalize(vec3(-.5,.8,.6));
    float sp = pow(max(dot(reflect(-L,n),V),0.), 70.);
    float d = max(dot(n,L),0.);
    // like the photographed droplets: dark amber rim, clear warm centre, crisp white highlight
    float rim = smoothstep(.15, .9, fr);
    vec3 col = mix(mix(uMid, uLight, .35), uDeep*.75, rim);
    float caustic = pow(max(dot(n, -L),0.), 3.);
    col += uLight*caustic*.35*(1.-rim);
    col += vec3(1.)*smoothstep(.55,.9,sp)*1.4;
    float a = (mix(.3,.95,rim) + sp) * smoothstep(0.,.06,vLife) * smoothstep(1.,.82,vLife);
    gl_FragColor = vec4(col, a);
  }
`;

export const DUST_VERT = /* glsl */`
  attribute vec3 aRnd;
  uniform float uTime, uPx, uFocus, uSize;
  varying float vCoc; varying float vTw;
  void main(){
    vec3 p = position;
    p.y = mod(p.y + uTime*(.06+aRnd.x*.1) + 4.5, 9.) - 4.5;
    p.x += sin(uTime*.25 + aRnd.z*6.283)*.35;
    p.z += cos(uTime*.2 + aRnd.y*6.283)*.3;
    vec4 mv = modelViewMatrix*vec4(p,1.);
    float z = -mv.z;
    float coc = clamp(abs(z-uFocus)/4.5, 0., 1.);          // circle of confusion → depth of field
    vCoc = coc;
    vTw = .6 + .4*sin(uTime*2. + aRnd.x*40.);
    gl_PointSize = uSize*uPx*(.4+aRnd.x*.9)*(1.+coc*7.)/z;
    gl_Position = projectionMatrix*mv;
  }
`;

export const DUST_FRAG = /* glsl */`
  uniform vec3 uGold;
  varying float vCoc; varying float vTw;
  void main(){
    vec2 c = gl_PointCoord-.5; float r = length(c)*2.;
    if(r>1.) discard;
    float soft = mix(.25,.95,vCoc);
    float disc = 1.-smoothstep(1.-soft, 1., r);
    float ring = smoothstep(.72,.92,r)*(1.-smoothstep(.92,1.,r))*vCoc*.5;   // bokeh rim
    float core = (1.-smoothstep(0.,.35,r))*(1.-vCoc);
    float a = (disc*.55 + ring + core*.5) / (1.+vCoc*vCoc*9.) * vTw;
    gl_FragColor = vec4(mix(uGold, vec3(1.,.93,.78), core*.6), a);
  }
`;
