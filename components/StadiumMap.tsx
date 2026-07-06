import React from 'react';

export default function StadiumMap({ activeZone }: { activeZone?: string }) {
  // A simple representation of a stadium with zones
  return (
    <div className="w-full h-auto flex items-center justify-center p-4">
      <svg viewBox="0 0 400 300" className="w-full max-w-md drop-shadow-lg">
        {/* Pitch */}
        <rect x="100" y="50" width="200" height="200" rx="10" fill="#22c55e" stroke="#166534" strokeWidth="4" />
        <circle cx="200" cy="150" r="30" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        <line x1="200" y1="50" x2="200" y2="250" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        
        {/* North Stand */}
        <path d="M 100 40 L 300 40 L 280 10 L 120 10 Z" 
          fill={activeZone === 'NorthStand' ? '#f59e0b' : '#334155'} 
          className="transition-colors duration-500" 
        />
        <text x="200" y="28" fill="white" fontSize="12" textAnchor="middle" className="font-bold">North Stand</text>

        {/* South Stand */}
        <path d="M 100 260 L 300 260 L 280 290 L 120 290 Z" 
          fill={activeZone === 'SouthStand' ? '#f59e0b' : '#334155'} 
          className="transition-colors duration-500" 
        />
        <text x="200" y="280" fill="white" fontSize="12" textAnchor="middle" className="font-bold">South Stand</text>

        {/* West Stand */}
        <path d="M 90 50 L 90 250 L 60 230 L 60 70 Z" 
          fill={activeZone === 'WestStand' ? '#f59e0b' : '#334155'} 
          className="transition-colors duration-500" 
        />
        <text x="75" y="150" fill="white" fontSize="12" textAnchor="middle" transform="rotate(-90 75 150)" className="font-bold">West Stand</text>

        {/* East Stand */}
        <path d="M 310 50 L 310 250 L 340 230 L 340 70 Z" 
          fill={activeZone === 'EastStand' ? '#f59e0b' : '#334155'} 
          className="transition-colors duration-500" 
        />
        <text x="325" y="150" fill="white" fontSize="12" textAnchor="middle" transform="rotate(90 325 150)" className="font-bold">East Stand</text>
      </svg>
    </div>
  );
}
