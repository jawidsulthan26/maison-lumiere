/**
 * Hero bottle state shared by heroBottle.js and the liquid pool.
 */
export let variant = 'elan';      // 'elan' | 'noir'
export let heroShown = 0;         // 0 = Élan, 1 = Noir (what the liquid wipe currently shows)
export let heroItem = null;       // stage item for the hero bottle plane
export let heroParts = null;      // particle sculpture of the hero bottle
export let poolItem = null;       // liquid pool under the bottle

export function setHeroState(s) {
  if ('variant' in s) variant = s.variant;
  if ('heroShown' in s) heroShown = s.heroShown;
  if ('heroItem' in s) heroItem = s.heroItem;
  if ('heroParts' in s) heroParts = s.heroParts;
  if ('poolItem' in s) poolItem = s.poolItem;
}
export function resetHeroState() {
  setHeroState({ variant: 'elan', heroShown: 0, heroItem: null, heroParts: null, poolItem: null });
}
