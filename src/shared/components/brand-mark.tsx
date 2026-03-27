/**
 * FairTradeWorker brand mark — custom SVG, not a library icon.
 *
 * Geometric "F" with a rightward crossbar suggesting forward motion,
 * inside a rounded container. Construction-weight strokes.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#C41E3A" />
      {/* Vertical stroke of F */}
      <rect x="9" y="7" width="4" height="18" rx="1.5" fill="white" />
      {/* Top crossbar — full width */}
      <rect x="9" y="7" width="15" height="4" rx="1.5" fill="white" />
      {/* Middle crossbar — shorter, offset slightly right */}
      <rect x="9" y="14.5" width="11" height="3.5" rx="1.5" fill="white" />
    </svg>
  );
}
