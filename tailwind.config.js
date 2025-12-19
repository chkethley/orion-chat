/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgba(255, 255, 255, 0.08)',
        input: 'rgba(255, 255, 255, 0.08)',
        ring: '#4aa3ff',
        background: '#05070f',
        foreground: '#e7edf6',
        primary: {
          DEFAULT: '#4aa3ff',
          foreground: '#061a2c',
        },
        secondary: {
          DEFAULT: '#0e1628',
          foreground: '#e4e9f4',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f6f6f6',
        },
        muted: {
          DEFAULT: '#0c1323',
          foreground: '#97a9c6',
        },
        accent: {
          DEFAULT: '#10243f',
          foreground: '#e4e9f4',
        },
        popover: {
          DEFAULT: '#0b101c',
          foreground: '#e7edf6',
        },
        card: {
          DEFAULT: '#0b101c',
          foreground: '#e7edf6',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
