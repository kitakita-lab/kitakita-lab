/**
 * KitaKita Lab 標準テストユーティリティ
 *
 * アプリが前提とする Provider（Router / Helmet）を含んだ共通 render。
 * テストからは Testing Library を直接 import せず、このファイルから
 * import することで、Provider 構成の変更に強いテストになります。
 *
 *   import { renderWithProviders, screen } from '@/test/test-utils'
 *
 * 他プロジェクトへ横展開する際は、Providers の中身を
 * そのプロジェクトの Provider 構成（テーマ / ストア等）に差し替えてください。
 */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

type ProvidersOptions = {
  /** 初期表示するルート（例: '/contact'）。既定はトップページ。 */
  route?: string
}

function createProviders({ route = '/' }: ProvidersOptions) {
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <HelmetProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </HelmetProvider>
    )
  }
}

/** アプリ標準の Provider でラップして render する。 */
export function renderWithProviders(
  ui: ReactElement,
  options: ProvidersOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { route, ...renderOptions } = options
  return render(ui, { wrapper: createProviders({ route }), ...renderOptions })
}

// Testing Library の API を一括再エクスポート（import 元をここに統一）
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

/**
 * 入れ子の span で分割された文章を、まとまりとして探すためのマッチャ。
 * 組版のために文節を <span class="whitespace-nowrap"> で包む箇所（lib/typo の
 * typeset）では、既定の getByText（直下のテキストノードだけを見る）が一致しないため、
 * 要素全体の textContent で比較する。同じ文字列を持つ祖先を除き、最も内側の要素だけに一致する。
 *
 *   screen.getByText(byTextContent('…ここまで来ました。'))
 */
export function byTextContent(expected: string) {
  const norm = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, '')
  const want = norm(expected)
  return (_content: string, element: Element | null) => {
    if (!element || norm(element.textContent) !== want) return false
    return !Array.from(element.children).some((c) => norm(c.textContent) === want)
  }
}
