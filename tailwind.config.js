/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark navy base (#0f1117 as specified)
        navy: {
          950: '#0a0c11',
          900: '#0f1117',
          800: '#13161f',
          700: '#16181f',
          600: '#1a1d28',
          500: '#1e2130',
          400: '#252840',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#16181f',
          raised:  '#1a1d28',
          border:  '#1e2130',
          muted:   '#2a2d3e',
        },
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',   // primary teal accent
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',   // primary amber accent
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4)',
        'card-lg':'0 10px 15px -3px rgba(0,0,0,0.7), 0 4px 6px -4px rgba(0,0,0,0.5)',
        glow:    '0 0 20px rgba(45,212,191,0.15)',
      },
    },
  },
  plugins: [],
}
