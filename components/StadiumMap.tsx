import React from 'react';

export default function StadiumMap({ activeZone }: { activeZone?: string }) {
  // A stylized representation of a stadium for the vintage poster theme
  return (
    <div className="w-full h-auto flex items-center justify-center p-4">
      <svg viewBox="0 0 400 300" className="w-full max-w-md drop-shadow-[4px_4px_0px_#1A1A1A]">
        {/* Background / Pitch Area */}
        <rect x="90" y="40" width="220" height="220" rx="0" fill="#133824" stroke="#1A1A1A" strokeWidth="4" />
        
        {/* Pitch Lines (Vintage Cream) */}
        <circle cx="200" cy="150" r="30" fill="none" stroke="#EFE9DF" strokeWidth="3" opacity="0.8" />
        <line x1="200" y1="40" x2="200" y2="260" stroke="#EFE9DF" strokeWidth="3" opacity="0.8" />
        <rect x="90" y="100" width="40" height="100" fill="none" stroke="#EFE9DF" strokeWidth="3" opacity="0.8" />
        <rect x="270" y="100" width="40" height="100" fill="none" stroke="#EFE9DF" strokeWidth="3" opacity="0.8" />
        
        {/* North Stand */}
        <path d="M 90 30 L 310 30 L 290 10 L 110 10 Z" 
          fill={activeZone === 'NorthStand' ? '#CC5803' : '#EFE9DF'} 
          stroke="#1A1A1A" strokeWidth="3"
          className="transition-colors duration-500" 
        />
        <text x="200" y="24" fill="#1A1A1A" fontSize="12" textAnchor="middle" className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>North Stand</text>

        {/* South Stand */}
        <path d="M 90 270 L 310 270 L 290 290 L 110 290 Z" 
          fill={activeZone === 'SouthStand' ? '#CC5803' : '#EFE9DF'} 
          stroke="#1A1A1A" strokeWidth="3"
          className="transition-colors duration-500" 
        />
        <text x="200" y="284" fill="#1A1A1A" fontSize="12" textAnchor="middle" className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>South Stand</text>

        {/* West Stand */}
        <path d="M 80 40 L 80 260 L 50 240 L 50 60 Z" 
          fill={activeZone === 'WestStand' ? '#CC5803' : '#EFE9DF'} 
          stroke="#1A1A1A" strokeWidth="3"
          className="transition-colors duration-500" 
        />
        <text x="65" y="150" fill="#1A1A1A" fontSize="12" textAnchor="middle" transform="rotate(-90 65 150)" className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>West Stand</text>

        {/* East Stand */}
        <path d="M 320 40 L 320 260 L 350 240 L 350 60 Z" 
          fill={activeZone === 'EastStand' ? '#CC5803' : '#EFE9DF'} 
          stroke="#1A1A1A" strokeWidth="3"
          className="transition-colors duration-500" 
        />
        <text x="335" y="150" fill="#1A1A1A" fontSize="12" textAnchor="middle" transform="rotate(90 335 150)" className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-oswald)' }}>East Stand</text>
      </svg>
    </div>
  );
}
