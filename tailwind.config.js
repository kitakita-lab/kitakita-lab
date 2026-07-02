/**
 * KitaKita Lab デザイントークン — 「雪原の実験室」
 * 北海道の自然から採った配色（docs/BRAND.md 世界観の章を参照）。
 *
 * トークン名は歴史的経緯で paper / clay / sage のままだが、意味は:
 *   paper = 雪（青緑がかった冷たい白）
 *   ink   = 冬の森の影（緑を含む墨色）
 *   clay  = 真鍮（実験器具の金物。アクセントは控えめに）
 *   sage  = 針葉樹（エゾマツの深緑。主役色）
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 雪 — base
        paper: {
          DEFAULT: '#F7F8F6',
          50: '#FCFCFB',
          100: '#F7F8F6',
          200: '#EDF0EE',
        },
        // 冬の森の影 — text
        ink: {
          DEFAULT: '#1F2622',
          muted: '#57615B',
          // 小さな補助テキスト用。雪の上で WCAG AA (≥4.5:1)
          soft: '#66706A',
        },
        // 真鍮 — accent (600 は本文サイズの文字にも使える AA 対応値)
        clay: {
          50: '#F5F1E6',
          100: '#EBE3CF',
          200: '#D8C9A4',
          300: '#C4B080',
          400: '#A98D53',
          500: '#8F7433',
          600: '#7A5E28',
          700: '#634C20',
          800: '#4A3918',
          900: '#332711',
        },
        // 針葉樹 — primary deep green
        sage: {
          100: '#E2E9E5',
          300: '#A7BAB0',
          500: '#55705F',
          700: '#2F4A3E',
        },
        line: '#E2E6E3',
      },
      fontFamily: {
        sans: [
          '"Zen Kaku Gothic New"',
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
        soft: '0 1px 2px rgba(31,38,34,0.04), 0 8px 30px rgba(31,38,34,0.06)',
        lift: '0 2px 4px rgba(31,38,34,0.05), 0 18px 50px rgba(31,38,34,0.10)',
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
}
