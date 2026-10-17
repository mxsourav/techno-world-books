import React from 'react';
import { Check } from 'lucide-react';

export interface AvatarPreset {
  id: string;
  name: string;
  svg: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

/**
 * 8 Curated Faceless Silhouette Clip-Art Avatars
 * DPDP Act 2023 Compliant: 100% vector-based, faceless silhouettes, zero PII, zero image upload liability.
 */
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'reader_open_book',
    name: 'Classic Reader',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        {/* Head */}
        <circle cx="24" cy="14" r="7" />
        {/* Shoulders & Body */}
        <path d="M12 36c0-6.627 5.373-12 12-12s12 5.373 12 12v2H12v-2z" />
        {/* Open Book in hands */}
        <path d="M16 33l8 3 8-3v7l-8 2-8-2v-7z" fillOpacity="0.9" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
        <line x1="24" y1="36" x2="24" y2="42" stroke="white" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'reader_scholar',
    name: 'Scholar',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        {/* Head */}
        <circle cx="24" cy="13" r="6.5" />
        {/* Glasses */}
        <circle cx="21.5" cy="13.5" r="2.2" fill="none" stroke="white" strokeWidth="1.2" />
        <circle cx="26.5" cy="13.5" r="2.2" fill="none" stroke="white" strokeWidth="1.2" />
        <line x1="23.7" y1="13.5" x2="24.3" y2="13.5" stroke="white" strokeWidth="1.2" />
        {/* Mortarboard Academic Cap */}
        <path d="M15 8l9-4 9 4-9 4-9-4z" fill="white" fillOpacity="0.9" />
        <path d="M30 10v4" stroke="white" strokeWidth="1" />
        {/* Body */}
        <path d="M13 38c0-6 4.9-11 11-11s11 5 11 11v2H13v-2z" />
      </svg>
    ),
  },
  {
    id: 'reader_coffee',
    name: 'Coffee & Novel',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        <circle cx="21" cy="13" r="6" />
        <path d="M10 38c0-6.5 4.9-12 11-12s11 5.5 11 12v2H10v-2z" />
        {/* Book */}
        <path d="M13 32l7 2.5v7l-7-2v-7.5z" fill="white" fillOpacity="0.85" />
        {/* Coffee Mug with steam */}
        <rect x="29" y="32" width="6" height="7" rx="1.5" fill="white" fillOpacity="0.9" />
        <path d="M35 34h2a1.5 1.5 0 0 1 0 3h-2" fill="none" stroke="white" strokeWidth="1" />
        <path d="M30.5 29c0-1.5 1-1.5 1-2.5M33 29c0-1.5 1-1.5 1-2.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'reader_stack',
    name: 'Bookworm',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        <circle cx="19" cy="14" r="6" />
        <path d="M9 38c0-6 4.5-11 10-11s10 5 10 11v2H9v-2z" />
        {/* Tall Stack of 4 Books */}
        <rect x="31" y="35" width="12" height="3.5" rx="0.8" fill="white" fillOpacity="0.95" />
        <rect x="30" y="30.5" width="13" height="3.5" rx="0.8" fill="white" fillOpacity="0.85" />
        <rect x="32" y="26" width="11" height="3.5" rx="0.8" fill="white" fillOpacity="0.95" />
        <rect x="31" y="21.5" width="12" height="3.5" rx="0.8" fill="white" fillOpacity="0.85" />
      </svg>
    ),
  },
  {
    id: 'reader_tree',
    name: 'Garden Reader',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        {/* Tree Trunk & Canopy */}
        <path d="M38 40V24c0-7-5.5-12-12-12-2 0-3.8.4-5.5 1.2C19.5 8.5 14 8 10 12c-4 4-3 11 1 15v13h27z" fillOpacity="0.35" />
        {/* Sitting Reader Profile */}
        <circle cx="21" cy="23" r="4.5" />
        <path d="M16 40c0-4.5 3.5-8 8-8h3l4 8h-15z" />
        {/* Book on lap */}
        <path d="M22 33l5 1 4-3v4l-4 2-5-1v-3z" fill="white" fillOpacity="0.95" />
      </svg>
    ),
  },
  {
    id: 'reader_quill',
    name: 'Author & Quill',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        <circle cx="22" cy="14" r="6" />
        <path d="M11 38c0-6 4.9-11 11-11s11 5 11 11v2H11v-2z" />
        {/* Manuscript Scroll */}
        <path d="M15 32h14v7H15z" fill="white" fillOpacity="0.85" />
        {/* Quill Pen */}
        <path d="M32 20c-1 3-4 8-6 13l2 1c3-5 5-10 6-14-1 0-2 0-2 0z" fill="white" fillOpacity="0.95" />
      </svg>
    ),
  },
  {
    id: 'reader_lamp',
    name: 'Library Lamp',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        {/* Banker's Desk Lamp */}
        <path d="M10 38h8M14 38v-14l6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 17c0-2.5 3-4 6-4s6 1.5 6 4H18z" fill="white" fillOpacity="0.9" />
        {/* Glow Cone */}
        <path d="M19 19l-7 19h20l-7-19z" fill="white" fillOpacity="0.15" />
        {/* Reader Silhouette under lamp */}
        <circle cx="31" cy="22" r="5" />
        <path d="M23 40c0-5 3.6-9 8-9s8 4 8 9v1H23v-1z" />
        <path d="M26 36l5 1.5 5-1.5v3l-5 1.5-5-1.5v-3z" fill="white" fillOpacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'reader_science',
    name: 'Science Explorer',
    svg: (props) => (
      <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
        {/* Atom Orbit ring */}
        <ellipse cx="24" cy="14" rx="14" ry="5" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 2" transform="rotate(-25 24 14)" opacity="0.6" />
        {/* Reader Head & Body */}
        <circle cx="24" cy="14" r="6" />
        <path d="M12 38c0-6.5 5.4-12 12-12s12 5.5 12 12v2H12v-2z" />
        {/* Telescope angled upwards */}
        <path d="M21 34l12-14 3 2.5-12 14-3-2.5z" fill="white" fillOpacity="0.95" />
        <line x1="24" y1="34" x2="20" y2="41" stroke="white" strokeWidth="1.5" />
        <line x1="26" y1="34" x2="28" y2="41" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
  },
];

/**
 * Validates a user's full name against gibberish, spam, and single-letter junk.
 */
export function validateFullName(name: string): { valid: boolean; error?: string } {
  const trimmed = (name || '').trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (trimmed.length > 80) {
    return { valid: false, error: 'Full name must not exceed 80 characters.' };
  }
  // Reject identical repeating characters (e.g. "aaaaaa", "xxxx")
  if (/^(.)\1{3,}$/i.test(trimmed)) {
    return { valid: false, error: 'Please enter your genuine full name.' };
  }
  // Reject common keyboard smashes
  const lower = trimmed.toLowerCase();
  const smashes = ['asdf', 'qwerty', 'zxcv', 'hjkl', '1234', 'test', 'admin'];
  if (smashes.some((sm) => lower.includes(sm))) {
    return { valid: false, error: 'Please enter a valid, recognizable name.' };
  }
  // Must contain letters
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'Name must contain alphabetic characters.' };
  }
  return { valid: true };
}

/**
 * Validates user age between 10 and 90 years.
 */
export function validateAge(age: number | string | undefined | null): { valid: boolean; error?: string } {
  if (age === undefined || age === null || age === '') {
    return { valid: true }; // optional if not provided yet
  }
  const num = typeof age === 'number' ? age : parseInt(String(age), 10);
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid numeric age.' };
  }
  if (num < 10) {
    return { valid: false, error: 'Age must be at least 10 years.' };
  }
  if (num > 90) {
    return { valid: false, error: 'Age must not exceed 90 years.' };
  }
  return { valid: true };
}

export interface AvatarPickerProps {
  value?: string | null;
  onChange: (avatarKey: string) => void;
  className?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const selectedId = value || AVATAR_PRESETS[0].id;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
          Choose Your Silhouette Avatar
        </label>
        <span className="text-[10px] text-stone-400 font-mono">DPDP Safe</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 py-1">
        {AVATAR_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          const SvgIcon = preset.svg;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-base bg-emerald-50/70 ring-2 ring-brand-base/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
              }`}
              title={preset.name}
            >
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${
                  isSelected ? 'bg-brand-dark text-white' : 'bg-stone-800 text-white'
                }`}
              >
                <SvgIcon className="h-7 w-7" />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-base text-white ring-1 ring-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="mt-1.5 text-[9px] font-medium text-stone-700 truncate w-full text-center">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarPicker;
