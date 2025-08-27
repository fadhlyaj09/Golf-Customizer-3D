export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="120"
      height="28"
      viewBox="0 0 140 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="24"
        fontFamily="sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
        className="tracking-tighter"
      >
        Articogolf
      </text>
    </svg>
  );
}
