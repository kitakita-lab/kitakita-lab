/**
 * KitaKita Lab 標準テストセットアップ
 *
 * jsdom に存在しないブラウザ API のモックをここに集約します。
 * すべてのテストの実行前に一度読み込まれます（vitest.config.ts の setupFiles）。
 * 他プロジェクトへ横展開する際は src/test/ ごとコピーしてください。
 */
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// globals: false 構成では Testing Library の自動クリーンアップが働かないため、
// 各テスト後に DOM を明示的にリセットする（テスト間の DOM 汚染防止）。
afterEach(() => {
  cleanup()
})

// --- IntersectionObserver -------------------------------------------------
// jsdom には未実装。監視対象を「即座に表示された」ことにして、
// スクロール連動表示（useReveal など）がテストでも成立するようにする。
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(private callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          intersectionRatio: 1,
          time: 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
        } as IntersectionObserverEntry,
      ],
      this,
    )
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// --- matchMedia -----------------------------------------------------------
// jsdom には未実装。CSS メディアクエリ判定を使うコードのための最小実装。
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
)

// --- スクロール関連 ---------------------------------------------------------
// jsdom では no-op にする（ScrollToTop / アンカースクロールで使用）。
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
Element.prototype.scrollIntoView = vi.fn()
