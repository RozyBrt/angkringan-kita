import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm earthy palette
        cream: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f5dcb0',
          300: '#eec47f',
          400: '#e6a84d',
          500: '#e0912a',
          600: '#d17620',
          700: '#ae5c1c',
          800: '#8c491d',
          900: '#723d1a',
        },
        coffee: {
          50: '#f7f1eb',
          100: '#edddd0',
          200: '#ddbfa4',
          300: '#c89872',
          400: '#b87448',
          500: '#a85f33',
          600: '#91492a',
          700: '#783a25',
          800: '#633124',
          900: '#3c1a0e',
          950: '#2a0f06',
        },
        warm: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba8c',
          400: '#ff8a4c',
          500: '#ff5a1f',
          600: '#d03801',
          700: '#b43403',
          800: '#8a2c0d',
          900: '#73230d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-once': 'bounceOnce 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'coffee-fill': 'coffeeFill 1.5s ease-in-out infinite alternate',
        'bounce-slow': 'bounceSlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        coffeeFill: {
          '0%': { height: '0%' },
          '100%': { height: '100%' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(5%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
