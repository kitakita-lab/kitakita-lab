import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/**
 * KitaKita Lab 標準テスト設定（Vitest）
 *
 * 他プロジェクトへ横展開する際は、このファイルと src/test/ ディレクトリを
 * コピーし、必要に応じて alias / coverage.thresholds を調整するだけで
 * 同じテスト環境が再現できます。
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // ブラウザ環境をエミュレート（React コンポーネントのテストに必要）
    environment: 'jsdom',
    // jsdom に無いブラウザ API のモックと jest-dom マッチャーを登録
    setupFiles: ['./src/test/setup.ts'],
    // Tailwind 等の CSS はテストでは解釈しない（高速化）
    css: false,
    // 各テスト後にモックを自動リストア（テスト間の汚染防止）
    restoreMocks: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx', // エントリポイント（DOM マウントのみ）
        'src/vite-env.d.ts',
        'src/test/**', // テスト基盤自身
        'src/**/*.test.{ts,tsx}',
      ],
      // KitaKita Lab 標準の品質ゲート
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 70,
        lines: 80,
      },
    },
  },
})
