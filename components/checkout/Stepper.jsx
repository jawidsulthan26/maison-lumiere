const STEPS = ['Cart', 'Details', 'Delivery', 'Payment'];

/** 4-step progress with a liquid line that fills between steps. */
export default function Stepper({ step }) {
  return (
    <div className="steps" data-rise>
      <span className="steps__fill" style={{ width: `${(step / 3) * 75}%` }} />
      {STEPS.map((n, i) => (
        <div key={n} className={`step ${i === step ? 'is-on' : ''} ${i < step ? 'is-done' : ''}`} aria-current={i === step ? 'step' : undefined}>
          <i>{i < step ? '✓' : i + 1}</i><span>{n}</span>
        </div>
      ))}
    </div>
  );
}
