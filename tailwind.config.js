/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm neutral base — 生成り / paper
        paper: {
          DEFAULT: '#FBF9F5',
          50: '#FDFCFA',
          100: '#FBF9F5',
          200: '#F4F0E8',
        },
        // Ink — text
        ink: {
          DEFAULT: '#1F1B16',
          muted: '#6B645B',
          soft: '#928A7E',
        },
        // Clay — warm terracotta accent (handmade warmth)
        clay: {
          50: '#FBF1EC',
          100: '#F6E1D6',
          200: '#EBC2AD',
          300: '#DD9C7C',
          400: '#CE7651',
          500: '#BC5A35',
          600: '#A14A2B',
          700: '#7F3A23',
          800: '#5E2C1C',
          900: '#3F1F15',
        },
        // Sage — secondary calm accent
        sage: {
          100: '#EAEDE6',
          300: '#B9C2AC',
          500: '#7C8A6B',
          700: '#566049',
        },
        line: '#E8E2D8',
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        serif: [
          '"Shippori Mincho"',
          '"Noto Serif JP"',
          'Georgia',
          'serif',
        ],
      },
      maxWidth: {
        content: '72rem',
        prose: '46rem',
      },
      letterSpacing: {
        wider2: '0.12em',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31,27,22,0.04), 0 8px 30px rgba(31,27,22,0.06)',
        lift: '0 2px 4px rgba(31,27,22,0.05), 0 18px 50px rgba(31,27,22,0.10)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.9s ease both',
      },
    },
  },
  plugins: [],
}
