import { useState, useEffect } from 'react';
import { Palette, Check, RotateCcw, X, SlidersHorizontal } from 'lucide-react';

export interface ThemePalette {
  id: string;
  name: string;
  dark: string;     // Major surfaces (Header, Footer, Hero)
  base: string;     // Primary interactive (CTAs, buttons, active highlights)
  light: string;    // Hover state / elevation
  pitch: string;    // Pitch accent (top announcement bar, footer bottom)
  subtle: string;   // Soft badge / chip background
  soft: string;     // Soft container fill
}

export const PRESET_PALETTES: ThemePalette[] = [
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian (#07101F)',
    dark: '#07101F',
    base: '#11223f',
    light: '#1b3766',
    pitch: '#030810',
    subtle: '#e8effa',
    soft: '#f0f5fb',
  },
  {
    id: 'crimson-red',
    name: 'Imperial Crimson (#25040A)',
    dark: '#25040a',
    base: '#780e1e',
    light: '#9c1429',
    pitch: '#140306',
    subtle: '#fbecee',
    soft: '#fdf4f5',
  },
  {
    id: 'heritage-forest',
    name: 'Heritage Forest (OG Green)',
    dark: '#071F15',
    base: '#0F3D24',
    light: '#185d38',
    pitch: '#0A261A',
    subtle: '#eaf5ef',
    soft: '#f2f8f4',
  },
  {
    id: 'royal-navy',
    name: 'Royal Navy (#00142C)',
    dark: '#00142c',
    base: '#002554',
    light: '#0a3d82',
    pitch: '#000b1a',
    subtle: '#eaf0f8',
    soft: '#f0f5fb',
  },
  {
    id: 'deep-sapphire',
    name: 'Deep Sapphire (#051329)',
    dark: '#051329',
    base: '#0e2e5c',
    light: '#18478a',
    pitch: '#020914',
    subtle: '#e9f0fa',
    soft: '#f1f6fd',
  },
  {
    id: 'imperial-burgundy',
    name: 'Imperial Burgundy (#1F050B)',
    dark: '#1f050b',
    base: '#4a0e1c',
    light: '#691427',
    pitch: '#0d0205',
    subtle: '#f8ebed',
    soft: '#fbf3f4',
  },
  {
    id: 'classic-noir',
    name: 'Classic Noir (#0F0F10)',
    dark: '#0f0f10',
    base: '#222226',
    light: '#333338',
    pitch: '#060606',
    subtle: '#f0f0f2',
    soft: '#f6f6f8',
  },
  {
    id: 'warm-espresso',
    name: 'Warm Espresso (#1C100B)',
    dark: '#1c100b',
    base: '#3a2016',
    light: '#542f20',
    pitch: '#0c0704',
    subtle: '#f6eeea',
    soft: '#faf5f2',
  },
];

const DEFAULT_PALETTE = PRESET_PALETTES[0]; // #07101F

/**
 * Calculates complementary shades from an arbitrary 6-digit hex string
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

function generatePaletteFromHex(hex: string): ThemePalette {
  let cleanHex = hex.trim();
  if (!cleanHex.startsWith('#')) cleanHex = '#' + cleanHex;
  if (!/^#[0-9a-fA-F]{6}$/.test(cleanHex)) {
    return DEFAULT_PALETTE;
  }

  const { r, g, b } = hexToRgb(cleanHex);

  // Derive pitch (darkest top strip: 40% luminance)
  const pitch = rgbToHex(r * 0.45, g * 0.45, b * 0.45);
  // Derive base (elevated vibrant middle header strip & CTAs: +24 brightness / saturation)
  const base = rgbToHex(Math.min(255, r + 24), Math.min(255, g + 30), Math.min(255, b + 45));
  // Derive dark (bottom category strip = selected hex surface)
  const dark = cleanHex;
  // Derive hover (elevated lighter interactive state)
  const light = rgbToHex(Math.min(255, r + 42), Math.min(255, g + 52), Math.min(255, b + 75));
  // Derive soft tint for chips and badges
  const subtle = rgbToHex(235 + (r * 0.08), 240 + (g * 0.08), 250 + (b * 0.08));
  const soft = rgbToHex(245 + (r * 0.04), 247 + (g * 0.04), 252 + (b * 0.04));

  return {
    id: `custom-${cleanHex.toLowerCase()}`,
    name: `Custom (${cleanHex.toUpperCase()})`,
    dark,
    base,
    light,
    pitch,
    subtle,
    soft,
  };
}

export function applyThemePalette(palette: ThemePalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--brand-dark', palette.dark);
  root.style.setProperty('--brand-base', palette.base);
  root.style.setProperty('--brand-light', palette.light);
  root.style.setProperty('--brand-pitch', palette.pitch);
  root.style.setProperty('--brand-subtle', palette.subtle);
  root.style.setProperty('--brand-soft', palette.soft);

  const darkRgb = hexToRgb(palette.dark);
  const baseRgb = hexToRgb(palette.base);
  const lightRgb = hexToRgb(palette.light);
  const pitchRgb = hexToRgb(palette.pitch);
  root.style.setProperty('--brand-dark-rgb', `${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}`);
  root.style.setProperty('--brand-base-rgb', `${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}`);
  root.style.setProperty('--brand-light-rgb', `${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b}`);
  root.style.setProperty('--brand-pitch-rgb', `${pitchRgb.r}, ${pitchRgb.g}, ${pitchRgb.b}`);

  // Convert to HSL for standard --primary CSS variable
  const { r, g, b } = hexToRgb(palette.base);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  root.style.setProperty(
    '--primary',
    `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  );

  // Dynamically sync mobile browser / installed PWA top status bar color with the active SPA theme
  // On mobile (<768px), the top-most header bar is --brand-base (palette.base).
  const topBarColor = palette.base || palette.dark;
  const themeMetaTags = document.querySelectorAll('meta[name="theme-color"]');
  if (themeMetaTags.length > 0) {
    themeMetaTags.forEach((meta) => meta.setAttribute('content', topBarColor));
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = topBarColor;
    document.head.appendChild(meta);
  }

  let msNavMeta = document.querySelector('meta[name="msapplication-navbutton-color"]') as HTMLMetaElement | null;
  if (!msNavMeta) {
    msNavMeta = document.createElement('meta');
    msNavMeta.name = 'msapplication-navbutton-color';
    document.head.appendChild(msNavMeta);
  }
  msNavMeta.content = topBarColor;

  try {
    localStorage.setItem('techno_world_theme_palette', JSON.stringify(palette));
  } catch {
    // Ignore storage quota errors
  }
}

export default function ThemePaletteCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePalette, setActivePalette] = useState<ThemePalette>(DEFAULT_PALETTE);
  const [customInputHex, setCustomInputHex] = useState('#07101F');

  // Initialize theme palette on mount
  useEffect(() => {
    let initial = DEFAULT_PALETTE;
    try {
      const saved = localStorage.getItem('techno_world_theme_palette');
      if (saved) {
        initial = JSON.parse(saved);
      }
    } catch {
      initial = DEFAULT_PALETTE;
    }
    setActivePalette(initial);
    setCustomInputHex(initial.dark);
    applyThemePalette(initial);
  }, []);

  const handleSelectPalette = (palette: ThemePalette) => {
    setActivePalette(palette);
    setCustomInputHex(palette.dark);
    applyThemePalette(palette);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomInputHex(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      const palette = generatePaletteFromHex(hex);
      setActivePalette(palette);
      applyThemePalette(palette);
    }
  };

  const handleResetDefault = () => {
    handleSelectPalette(DEFAULT_PALETTE);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-24 left-5 z-40 select-none">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle Theme Palette Customizer"
          className="group flex items-center gap-2.5 rounded-full border border-stone-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-md backdrop-blur-md transition-all duration-200 hover:border-stone-300 hover:shadow-lg active:scale-95 cursor-pointer"
        >
          {/* Active Color Preview Indicator */}
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white shadow-2xs transition-transform group-hover:scale-110"
            style={{ backgroundColor: activePalette.dark }}
          />
          <span className="font-mono text-[11px] font-medium tracking-tight text-stone-700">
            {activePalette.dark.toUpperCase()}
          </span>
          <Palette className="h-3.5 w-3.5 text-stone-500 transition-transform group-hover:rotate-12" />
        </button>
      </div>

      {/* Floating Palette Studio Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-start p-3 sm:p-6 bg-stone-900/40 backdrop-blur-2xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl transition-all duration-300 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-stone-700" />
                  <h3 className="font-serif text-sm font-bold tracking-tight text-stone-900">
                    Live Brand Color Studio
                  </h3>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Select a curated palette or enter a custom hex. Instant dynamic preview.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                aria-label="Close customizer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Curated Presets */}
            <div className="mt-4 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Curated Brand Palettes
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {PRESET_PALETTES.map((palette) => {
                  const isSelected = activePalette.id === palette.id;

                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => handleSelectPalette(palette)}
                      className={`w-full flex items-center justify-between gap-3 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-50 shadow-2xs ring-1 ring-stone-900/10'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 3 Header Strips Preview */}
                        <div className="flex items-center -space-x-1 shrink-0" title="Tier 1 (Top Bar), Tier 2 (Main Bar), Tier 3 (Category Bar)">
                          <span
                            className="h-4 w-4 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: palette.pitch }}
                            title={`Top Bar (Pitch): ${palette.pitch}`}
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-white shadow-2xs z-10"
                            style={{ backgroundColor: palette.base }}
                            title={`Main Header & CTAs (Base): ${palette.base}`}
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: palette.dark }}
                            title={`Category Strip & Surfaces (Dark): ${palette.dark}`}
                          />
                        </div>

                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {palette.name}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-stone-900 shrink-0 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Color Picker */}
            <div className="mt-4 border-t border-stone-100 pt-3.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                Custom Color Input
              </span>
              <div className="flex items-center gap-2.5">
                {/* HTML5 Native Color Picker Swatch */}
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-stone-300 shadow-2xs cursor-pointer">
                  <input
                    type="color"
                    value={
                      /^#[0-9a-fA-F]{6}$/.test(customInputHex)
                        ? customInputHex
                        : activePalette.dark
                    }
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="absolute -inset-2 h-14 w-14 cursor-pointer opacity-100"
                    title="Click to pick custom color"
                  />
                </div>

                {/* Hex Text Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInputHex}
                    maxLength={7}
                    placeholder="#07101F"
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCustomInputHex(val);
                      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                        handleCustomColorChange(val);
                      }
                    }}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50/70 px-3 py-1.5 font-mono text-xs font-semibold text-stone-800 placeholder-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Quick Apply Button */}
                <button
                  type="button"
                  onClick={() => {
                    let hex = customInputHex.trim();
                    if (!hex.startsWith('#')) hex = '#' + hex;
                    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
                      handleCustomColorChange(hex);
                    }
                  }}
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Active Theme Preview Strip & Reset Footer */}
            <div className="mt-4 border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: activePalette.dark }}
                />
                <span className="font-semibold text-stone-800">
                  {activePalette.dark.toUpperCase()}
                </span>
                <span className="text-stone-400">active</span>
              </div>

              <button
                type="button"
                onClick={handleResetDefault}
                className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset (#07101F)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
