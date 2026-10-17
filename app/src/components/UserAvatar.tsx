import React from 'react';
import { AVATAR_PRESETS } from './AvatarPicker';

export interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarKey?: string | null;
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

const SVG_SIZES = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

/**
 * Legally Compliant Deterministic User Avatar (DPDP Act 2023)
 * Completely eliminates user photo upload liabilities (PII, copyright, NSFW hosting)
 * by rendering curated SVG silhouettes or initials inside an authoritative Forest Green circle.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  avatarKey,
  size = 'md',
  className = '',
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const svgSize = SVG_SIZES[size] || SVG_SIZES.md;

  const matchedPreset = avatarKey ? AVATAR_PRESETS.find((p) => p.id === avatarKey) : null;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-[#0B2B19] text-white font-bold tracking-tight select-none border border-white/10 ring-1 ring-[#0B2B19]/25 shadow-2xs overflow-hidden ${sizeClass} ${className}`}
      aria-label={name || email || 'User Avatar'}
      title={name || email || 'Techno World Reader'}
    >
      {matchedPreset ? (
        <matchedPreset.svg className={`${svgSize} text-white`} />
      ) : (
        <span>{getInitials(name, email)}</span>
      )}
    </div>
  );
};

export default UserAvatar;
