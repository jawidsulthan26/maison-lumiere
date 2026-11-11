/**
 * GLSL helpers shared by every shader + the Élan / Noir colour palettes.
 */
/* ---------------------------------------------------------------------------
   2. Shared GLSL snippets
   --------------------------------------------------------------------------- */
export const GLSL_NOISE = /* glsl */`
  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }
`;

export const VERT_UV = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
`;

export const VERT_FULLSCREEN = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

/* Fragrance palettes (sRGB 0..1) — used by the splash, droplets and the hero bottle */
export const PALETTES = {
  elan: { deep: [0.52, 0.22, 0.06], mid: [0.82, 0.48, 0.18], light: [1.0, 0.86, 0.6] },
  noir: { deep: [0.09, 0.05, 0.035], mid: [0.32, 0.19, 0.11], light: [0.86, 0.68, 0.44] },
};
