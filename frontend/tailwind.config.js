/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        emerald: {
          50: '#EAF6EE',
          100: '#D8F0E0',
          200: '#B7E1C6',
          300: '#86CC9F',
          400: '#4BAE72',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
          800: '#14532D',
          900: '#0F3F22',
          950: '#072714',
        },
        warm: {
          50: '#FAF9F6',
          100: '#F6F4EF',
          200: '#EFECE4',
          300: '#E6E1D6',
          400: '#D8D2C5',
          500: '#9AA5B1',
        },
        ink: {
          primary: '#1F2933',
          secondary: '#52606D',
          muted: '#616E7C',
        },
        action: {
          DEFAULT: '#15803D',
          hover: '#166534',
          soft: '#EAF6EE',
          border: '#B7E1C6',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(31, 41, 51, 0.04)',
        'card-hover': '0 6px 18px rgba(31, 41, 51, 0.07)',
        'popover': '0 12px 32px rgba(31, 41, 51, 0.12)',
      },
      keyframes: {
        'modal-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'drawer-in': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'modal-in': 'modal-in 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        'drawer-in': 'drawer-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
