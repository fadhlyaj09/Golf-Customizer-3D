export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_105_2)">
        <text
          x="40"
          y="30"
          fontFamily="sans-serif"
          fontSize="24"
          fontWeight="bold"
          fill="currentColor"
          className="fill-current"
        >
          GOLF
        </text>
        <path
          d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0ZM28.536 29.58C25.79 31.572 22.462 32.74 19.016 32.74C12.392 32.74 6.98 27.886 6.98 21.366C6.98 14.846 12.392 9.992 19.016 9.992C22.462 9.992 25.79 11.16 28.536 13.152L26.312 15.76C24.238 14.28 21.71 13.33 19.016 13.33C14.73 13.33 11.236 16.924 11.236 21.366C11.236 25.808 14.73 29.402 19.016 29.402C21.71 29.402 24.238 28.452 26.312 26.972L28.536 29.58Z"
          fill="hsl(var(--primary))"
          className="fill-primary"
        />
      </g>
      <defs>
        <clipPath id="clip0_105_2">
          <rect width="120" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
