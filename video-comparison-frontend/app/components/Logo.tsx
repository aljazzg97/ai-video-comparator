export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Film strip icon */}
      <rect x="2" y="4" width="24" height="22" rx="3" fill="url(#filmGradient)" />
      <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      <rect x="15" y="7" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      <rect x="7" y="14" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      <rect x="15" y="14" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      <rect x="7" y="21" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      <rect x="15" y="21" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      
      {/* Sparkle icon */}
      <path
        d="M36 15L38 13L40 15L38 17L36 15Z"
        fill="url(#sparkleGradient)"
      />
      <path
        d="M34 10L35.5 8.5L37 10L35.5 11.5L34 10Z"
        fill="url(#sparkleGradient)"
        opacity="0.7"
      />
      <path
        d="M34 20L35.5 18.5L37 20L35.5 21.5L34 20Z"
        fill="url(#sparkleGradient)"
        opacity="0.7"
      />

      {/* Text */}
      <text x="48" y="20" fill="white" fontSize="14" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
        AI Video
      </text>
      <text x="48" y="28" fill="#60A5FA" fontSize="10" fontWeight="500" fontFamily="Inter, system-ui, sans-serif">
        COMPARATOR
      </text>

      <defs>
        <linearGradient id="filmGradient" x1="2" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="sparkleGradient" x1="34" y1="8.5" x2="40" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
    </svg>
  );
}