import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ssr: {
    // react-helmet-async は CJS のため、外部化すると Node の ESM ローダーが
    // named export を解決できない。SSR バンドル（プリレンダリング用）には
    // 取り込んでしまう。
    noExternal: ['react-helmet-async'],
  },
})
