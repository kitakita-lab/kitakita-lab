/**
 * KitaKita Lab デザイントークン
 *
 * 基準は Hero の写真が持つ「空・光・透明感・余白」。色でブランド感を足すのではなく、
 * 写真の空気をページ最下部まで邪魔しないことを優先する。
 *   - 地はニュートラル〜ごく僅かにクールなオフホワイト（遠目にはほぼ白）
 *   - 面の差が必要なところだけ、ごく薄いブルーグレー
 *   - 文字は青みを含む墨色（黒・濃緑・濃茶にしない）
 *   - アクセントは遠景の山の青から採った低彩度のスレート。面積は小さく
 * 大面積の緑・黒・濃緑・ベージュ・サンドは使わない（生成り／手仕事系の見え方と区別する）。
 *
 * トークン名は歴史的経緯で paper / ink / clay のまま:
 *   paper = オフホワイト（DEFAULT/100）、白に近い地（50）、薄いブルーグレー（200）
 *   ink   = 墨色。muted / soft は補助テキスト用（paper / paper-200 の上で AA）
 *   clay  = アクセント（旧: 真鍮。現在は低彩度のスレート。600 は本文サイズの文字で AA）
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // オフホワイト — base（ごく僅かにクール）
        paper: {
          DEFAULT: '#F7F8F8',
          50: '#FBFCFC',
          100: '#F7F8F8',
          200: '#EFF2F4',
        },
        // 墨（青みを含む） — text
        ink: {
          DEFAULT: '#22272B',
          muted: '#545D65',
          // 小さな補助テキスト用。paper / paper-200 の上で WCAG AA (≥4.5:1)
          soft: '#646D76',
        },
        // スレート — accent（遠景の山の青。600 は本文サイズの文字にも使える AA 対応値）
        clay: {
          50: '#F0F4F7',
          100: '#E2E9EE',
          200: '#C7D3DC',
          300: '#A6B8C6',
          400: '#7D95A8',
          500: '#5F798E',
          600: '#4B6479',
          700: '#3C5062',
          800: '#2D3C4A',
          900: '#1F2A34',
        },
        line: '#E3E7EA',
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
