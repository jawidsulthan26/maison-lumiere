/** Copper sparkle-flower mark. */
export default function Logo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E2A777" /><stop offset="1" stopColor="#B26E40" /></linearGradient></defs>
      <g fill="url(#lg)">
        <circle cx="20" cy="20" r="5.2" />
        <path d="M20 2c3.4 4 3.4 8.6 0 12.4C16.6 10.6 16.6 6 20 2Z" />
        <path d="M20 38c-3.4-4-3.4-8.6 0-12.4 3.4 3.8 3.4 8.4 0 12.4Z" />
        <path d="M2 20c4-3.4 8.6-3.4 12.4 0C10.6 23.4 6 23.4 2 20Z" />
        <path d="M38 20c-4 3.4-8.6 3.4-12.4 0 3.8-3.4 8.4-3.4 12.4 0Z" />
        <path d="M7.3 7.3c5.2.4 8.5 3.6 8.8 8.8-5.1-.3-8.4-3.6-8.8-8.8Z" opacity=".75" />
        <path d="M32.7 32.7c-5.2-.4-8.5-3.6-8.8-8.8 5.1.3 8.4 3.6 8.8 8.8Z" opacity=".75" />
        <path d="M32.7 7.3c-.4 5.2-3.6 8.5-8.8 8.8.3-5.1 3.6-8.4 8.8-8.8Z" opacity=".75" />
        <path d="M7.3 32.7c.4-5.2 3.6-8.5 8.8-8.8-.3 5.1-3.6 8.4-8.8 8.8Z" opacity=".75" />
      </g>
    </svg>
  );
}
