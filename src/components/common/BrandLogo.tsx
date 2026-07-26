interface BrandLogoProps {
  size?: number
  showWordmark?: boolean
}

export function BrandLogo({ size = 28, showWordmark = true }: BrandLogoProps) {
  return (
    <div className="brand-logo">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="brand-mark">
        <defs>
          <linearGradient id="brand-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-strong)" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" stroke="url(#brand-gradient)" strokeWidth="2" />
        <path d="M16 7L20 16L16 25L12 16L16 7Z" fill="url(#brand-gradient)" />
        <circle cx="16" cy="16" r="2.5" fill="var(--bg)" />
      </svg>
      {showWordmark && <span className="brand-wordmark">Waypoint</span>}
    </div>
  )
}
