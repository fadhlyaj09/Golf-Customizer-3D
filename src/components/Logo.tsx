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
        fill="currentColor"
        className="font-bold"
      >
        Artico
      </text>
      <text
        x="70"
        y="26"
        fontFamily="sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary))"
        className="fill-primary"
      >
        <tspan>G</tspan>
        <tspan dx="-2">o</tspan>
        <tspan dx="-2">l</tspan>
        <tspan dx="-2">f</tspan>
      </text>
    </svg>
  );
}
