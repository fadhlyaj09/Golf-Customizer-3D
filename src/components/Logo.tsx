export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="60"
      height="45"
      viewBox="0 0 60 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="45" fill="black"/>
      <path d="M15.36 10.5H23.6V13.62H18.48V19.32H23.04V22.44H18.48V31.5H15.36V10.5Z" fill="white"/>
      <path d="M26.435 31.5V10.5H37.795V13.62H29.555V19.08H37.235V22.2H29.555V28.38H37.795V31.5H26.435Z" fill="white"/>
      <text x="15" y="42" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="white">
        HAVIOUR
      </text>
    </svg>
  );
}
