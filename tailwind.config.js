/**
 * KitaKita Lab デザイントークン
 *
 * 色数を絞る。ベースは温かみのある生成り〜オフホワイト、区切りにごく薄いサンド、
 * 文字は濃茶寄りの墨色、アクセントは真鍮（clay）だけ。
 * 自然や北海道らしさは Hero の写真が担うので、色面（緑・暗色の大面積）では表現しない。
 *
 * トークン名は歴史的経緯で paper / ink / clay のまま:
 *   paper = 生成り（DEFAULT/100）、オフホワイト（50）、薄いサンド（200）
 *   ink   = 墨色（濃茶寄り）。muted / soft は補助テキスト用（生成りの上で AA）
 *   clay  = 真鍮（アクセント。600 は本文サイズの文字にも使える AA 対応値）
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 生成り — base
        paper: {
          DEFAULT: '#F7F4EE',
          50: '#FBF9F5',
          100: '#F7F4EE',
          200: '#EFEAE0',
        },
        // 墨（濃茶寄り） — text
        ink: {
          DEFAULT: '#2B2622',
          muted: '#5E564E',
          // 小さな補助テキスト用。生成り（paper）の上で WCAG AA (≥4.5:1)
          soft: '#6E665D',
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
        line: '#E5DFD4',
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
