/** "Tue 17 Nov – Thu 19 Nov" for a range of working days from today. */
export function deliveryWindow([from, to]) {
  if (to === 0) return 'Today, by 9 pm';
  const add = n => { const x = new Date(); let k = 0; while (k < n) { x.setDate(x.getDate() + 1); if (x.getDay() % 6) k++; } return x; };
  const fmt = x => x.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${fmt(add(from))} – ${fmt(add(to))}`;
}
