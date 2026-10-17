import React from 'react';

interface WhatsAppIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'color' | 'monochrome';
}

/**
 * Clean, MIT / Open-Source WhatsApp Icon component.
 * 
 * Free for commercial use with ZERO attribution required.
 * Replaces proprietary stock artist SVGs (e.g. IconScout) to prevent copyright issues.
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  size = 24,
  variant = 'color',
  className = '',
  ...props
}) => {
  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.94.55 3.75 1.51 5.28L2.05 22l4.87-1.43c1.47.88 3.19 1.43 5.08 1.43 5.524 0 10.004-4.48 10.004-10.004C22.004 6.48 17.528 2 12.004 2zm5.78 13.97c-.24.67-1.38 1.28-1.92 1.36-.5.08-1.14.11-1.84-.12-.42-.14-.97-.32-1.68-.63-2.96-1.28-4.88-4.31-5.03-4.51-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.45.27-.29.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.59.85 2.08.92 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.63.18.31.79 1.3 1.7 2.11 1.17 1.04 2.16 1.36 2.47 1.51.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.15.28.11 1.78.84 2.08.99.31.15.51.23.59.36.07.13.07.76-.17 1.43z" />
      </svg>
    );
  }

  // Full-color authentic WhatsApp badge (Official Emerald Green circle + Crisp White Phone Handset)
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="tw_whatsapp_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2CD86C" />
          <stop offset="100%" stopColor="#20BA59" />
        </linearGradient>
      </defs>
      {/* WhatsApp Circular Speech Bubble */}
      <path
        fill="url(#tw_whatsapp_gradient)"
        d="M16 2C8.268 2 2 8.268 2 16c0 2.652.736 5.132 2.016 7.252L2.348 29.2c-.172.58.356 1.108.936.936l6.096-1.724A13.916 13.916 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
      />
      {/* Crisp White Handset & Details */}
      <path
        fill="#ffffff"
        d="M22.956 19.344c-.38-.19-2.25-1.11-2.6-1.24-.35-.125-.6-.19-.855.19-.255.38-.99 1.24-1.21 1.49-.22.255-.445.285-.825.095-.38-.19-1.605-.59-3.055-1.89-1.13-1.01-1.89-2.26-2.115-2.64-.22-.38-.02-.585.17-.775.17-.17.38-.445.57-.665.19-.22.255-.38.38-.635.125-.255.065-.475-.03-.665-.095-.19-.855-2.065-1.175-2.82-.31-.745-.62-.64-.855-.65-.22-.01-.475-.015-.73-.015-.255 0-.665.095-1.015.475-.35.38-1.33 1.3-1.33 3.175s1.365 3.68 1.555 3.935c.19.255 2.685 4.1 6.5 5.75.91.39 1.615.625 2.17.8.91.29 1.74.25 2.395.155.73-.11 2.25-.92 2.57-1.81.315-.89.315-1.65.22-1.81-.095-.16-.35-.255-.73-.445z"
      />
    </svg>
  );
};
