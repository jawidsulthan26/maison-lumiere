/** − 1 + quantity stepper */
export default function Qty({ value, onChange, small = false, min = 1, max = 10 }) {
  return (
    <div className={`qty ${small ? 'qty--sm' : ''}`}>
      <button type="button" onClick={() => onChange(-1)} disabled={value <= min} aria-label="Decrease quantity">−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(1)} disabled={value >= max} aria-label="Increase quantity">+</button>
    </div>
  );
}
