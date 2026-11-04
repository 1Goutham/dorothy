export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 120 32" role="img" aria-hidden="true">
      <text x="0" y="23" style={{ fontFamily: "var(--font-poppins), sans-serif" }} fontWeight="600" fontSize="22" letterSpacing="-0.6" fill="#f3f1ee">
        Dorothy
      </text>
      <g transform="translate(106 15)">
        <circle r="10" fill="#e1251b" />
        <g fill="none" stroke="#fff" strokeWidth="1.2">
          <circle cx="0" cy="-3.3" r="2.7" />
          <circle cx="3.3" cy="0" r="2.7" />
          <circle cx="0" cy="3.3" r="2.7" />
          <circle cx="-3.3" cy="0" r="2.7" />
        </g>
        <circle r="1.1" fill="#fff" />
      </g>
    </svg>
  );
}
