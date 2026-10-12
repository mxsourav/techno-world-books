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
        // Dynamic Brand Theme (Controlled by CSS Custom Properties, defaults to #07101F)
        brand: {
          dark: 'var(--brand-dark, #07101F)',      // Darkest surface (Headers, footer, dark banners)
          DEFAULT: 'var(--brand-base, #07101F)',   // Primary Base (Interactive, CTAs, highlights)
          base: 'var(--brand-base, #07101F)',      // Semantic alias for Base
          light: 'var(--brand-light, #152e59)',    // Lighter interactive hover tint
          lighter: 'var(--brand-lighter, #1d3d75)',// Secondary elevated hover
          muted: 'var(--brand-muted, #1a2f52)',    // Muted slate tone
          subtle: 'var(--brand-subtle, #e8effa)',  // Soft tint for badges and chips
          soft: 'var(--brand-soft, #f0f5fb)',      // Soft card fill
          pitch: 'var(--brand-pitch, #030810)',    // Deepest pitch black-blue
          50: 'var(--brand-50, #f0f5fb)',
          100: 'var(--brand-100, #e2ebf7)',
          200: 'var(--brand-200, #c6d7f0)',
          300: 'var(--brand-300, #9fbfe3)',
          400: 'var(--brand-400, #6c9fd1)',
          500: 'var(--brand-500, #4682bf)',
          600: 'var(--brand-600, #3169a5)',
          700: 'var(--brand-700, #225185)',
          800: 'var(--brand-base, #07101F)',
          900: 'var(--brand-dark, #07101F)',
          950: 'var(--brand-pitch, #030810)',
        },
        primary: {
          DEFAULT: 'var(--brand-base, #07101F)',
          foreground: '#ffffff',
          dark: 'var(--brand-dark, #07101F)',
          base: 'var(--brand-base, #07101F)',
          light: 'var(--brand-light, #152e59)',
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