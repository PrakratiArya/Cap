export default function JodoLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div className={`jodo-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Jodo logo">
        <rect width="48" height="48" rx="12" fill="#0B1528" />
        <circle cx="24" cy="18" r="6" fill="#10B981" />
        <path d="M12 34c4-6 8-8 12-8s8 2 12 8" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 28l6 4 6-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showText && <span className="brand-name" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: size * 0.42, color: 'var(--navy)' }}>Jodo</span>}
    </div>
  );
}
