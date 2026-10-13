import React from 'react';

export interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Deterministic Initial Generator for DPDP Data Minimization Compliance.
 * Derives uppercase initials from user name or email.
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const cleanName = (name || '').trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, Math.min(2, parts[0].length)).toUpperCase();
  }

  const cleanEmail = (email || '').trim();
  if (cleanEmail) {
    const userPart = cleanEmail.split('@')[0].trim();
    if (userPart) {
      return userPart.slice(0, Math.min(2, userPart.length)).toUpperCase();
    }
  }

  return 'TW';
}

const SIZE_CLASSES = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-12 w-12 text-base',
  xl: 'h-14 w-14 text-lg',
};

/**
 * Legally Compliant Deterministic User Avatar (DPDP Act 2023)
 * Completely eliminates user photo upload liabilities (PII, copyright, NSFW hosting)
 * by rendering initials inside a circle with brand Navy #00142c background.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  size = 'md',
  className = '',
}) => {
  const initials = getInitials(name, email);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-[#00142c] text-white font-bold tracking-tight select-none border border-white/10 ring-1 ring-stone-900/10 shadow-2xs ${sizeClass} ${className}`}
      aria-label={name || email || 'User Avatar'}
      title={name || email || 'Techno World Reader'}
    >
      <span>{initials}</span>
    </div>
  );
};

export default UserAvatar;
