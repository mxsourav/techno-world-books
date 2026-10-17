/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Permanent Brand Theme: Signature Deep Forest Green Palette
        brand: {
          dark: 'var(--brand-dark, #06140F)',      // Darkest surface (Headers, footer, dark banners)
          DEFAULT: 'var(--brand-base, #081C15)',   // Primary Base (Interactive, CTAs, highlights)
          base: 'var(--brand-base, #081C15)',      // Semantic alias for Base
          light: 'var(--brand-light, #0E2E22)',    // Lighter interactive hover tint
          lighter: 'var(--brand-lighter, #164433)',// Secondary elevated hover
          muted: 'var(--brand-muted, #0B241A)',    // Muted tone
          subtle: 'var(--brand-subtle, #eef7f2)',  // Soft tint for badges and chips
          soft: 'var(--brand-soft, #f4faf6)',      // Soft card fill
          pitch: 'var(--brand-pitch, #030A07)',    // Deepest pitch dark green
          accent: 'var(--brand-accent, #D97706)',  // Crisp gold/amber hints for badges
          50: 'var(--brand-50, #f2f8f4)',
          100: 'var(--brand-100, #eaf5ef)',
          200: 'var(--brand-200, #c8e6c9)',
          300: 'var(--brand-300, #a5d6a7)',
          400: 'var(--brand-400, #81c784)',
          500: 'var(--brand-500, #4caf50)',
          600: 'var(--brand-600, #2e7d32)',
          700: 'var(--brand-700, #1b5e20)',
          800: 'var(--brand-base, #081C15)',
          900: 'var(--brand-dark, #06140F)',
          950: 'var(--brand-pitch, #030A07)',
        },
        primary: {
          DEFAULT: 'var(--brand-base, #081C15)',
          foreground: '#ffffff',
          dark: 'var(--brand-dark, #06140F)',
          base: 'var(--brand-base, #081C15)',
          light: 'var(--brand-light, #0E2E22)',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "var(--brand-base, #07101F)",
          "primary-foreground": "#ffffff",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "var(--brand-base, #07101F)",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}