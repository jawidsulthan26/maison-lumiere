/**
 * Environment for the WebGL / animation engine. Only ever imported in the browser
 * (the home page loads the engine with a dynamic import inside useEffect).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { CONFIG } from '@/lib/config';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger, THREE, CONFIG };

export const HAS_GSAP = true;
/** Motion is always on: the full 3D / scroll experience plays for every visitor. */
export const REDUCED = false;

export const $ = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => [...c.querySelectorAll(s)];
export const html = document.documentElement;

export const IS_TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
export const isMobile = () => innerWidth < 768;
export const DPR = () => Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 2);
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}
export const GL = webglAvailable();

/** Pointer state shared by every effect (updated by the engine's pointermove listener). */
export const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, vx: 0, vy: 0, active: false };
export function trackPointer(e) {
  mouse.vx = e.clientX - mouse.x; mouse.vy = e.clientY - mouse.y;
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ny = (e.clientY / innerHeight) * 2 - 1;
  mouse.active = true;
}
