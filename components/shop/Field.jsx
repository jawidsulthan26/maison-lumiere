/** Floating-label text field with inline error. */
export default function Field({ id, label, error, value, onChange, type = 'text', className = '', ...rest }) {
  return (
    <div className={`field ${error ? 'is-err' : ''} ${className}`}>
      <input id={`f-${id}`} name={id} type={type} placeholder=" " value={value ?? ''} onChange={e => onChange(e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `e-${id}` : undefined} {...rest} />
      <label htmlFor={`f-${id}`}>{label}</label>
      {error && <p className="err" id={`e-${id}`}>{error}</p>}
    </div>
  );
}
