import React from 'react';

export function ClinicLogo({
  size = 38,
  variant = 'forest',
  className = '',
}: {
  size?: number;
  variant?: 'forest' | 'ivory' | 'stone' | 'gold';
  className?: string;
}) {
  const bgClass =
    variant === 'ivory'
      ? 'bg-[#f0eae1] text-[#16382b] border-[#ded8cb]'
      : variant === 'stone'
      ? 'bg-[#697067] text-[#ffffff] border-[#4f7358]'
      : variant === 'gold'
      ? 'bg-[#b88628] text-[#ffffff] border-[#94681f]'
      : 'bg-[#16382b] text-[#d6a84f] border-[#2b5542]';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-lg border shadow-xs ${bgClass} ${className}`}
      style={{ width: size, height: size }}
      aria-label="Sri Korakkar Siddha and Ayurvedha Clinic Emblem"
    >
      <svg
        width={Math.round(size * 0.64)}
        height={Math.round(size * 0.64)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Traditional Siddha Mortar & Pestle */}
        <path d="M3.5 11.5h17a1 1 0 0 1 1 1c0 5.2-3.8 8.5-9.5 8.5s-9.5-3.3-9.5-8.5a1 1 0 0 1 1-1Z" />
        <path d="m15 3-4 8.5" />
        {/* Sacred Medicinal Herb Sprig (Tulsi / Neem) */}
        <path d="M12 4.5c2.8-1.8 5.5-.2 5.5 2.5s-2.2 3.8-5.5 2" />
        <path d="M16 6.5c1.8-.8 3.2.2 3.2 1.8s-1.4 2.2-3.2 1" />
        <path d="M8 21v1.5" />
        <path d="M16 21v1.5" />
        {/* Golden Herb Essence Drop */}
        <circle cx="16.5" cy="6" r="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}

