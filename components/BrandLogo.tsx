import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "", size = 40 }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="#ef4444" />
          <circle cx="50" cy="50" r="42" fill="#064e3b" stroke="white" strokeWidth="1" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="2" />
          <path d="M50 32 L50 68 M32 50 L68 50" stroke="white" strokeWidth="1" />
          <path d="M50 15 L50 85" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 50 Q20 20 50 20 Q80 20 80 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 50 Q20 80 50 80 Q80 80 80 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <img 
        src="logo.png" 
        alt="Shubham AptiMaster Logo" 
        className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export default BrandLogo;