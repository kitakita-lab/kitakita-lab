import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useEffect, useState } from 'react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScrollToTop } from './ScrollToTop'
import { NavLink } from './NavLink'

/** 遅延読み込みのページを模す: 少し遅れて移動先の要素を描画する */
function LazyTarget({ id }: { id: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])
  return ready ? <div id={id}>target</div> : <p>loading</p>
}

function Back() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      back
    </button>
  )
}

function setup(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div id="about">about</div>
              <NavLink href="/workshop#consultation">to consultation</NavLink>
              <NavLink href="/#about">to about</NavLink>
            </>
          }
        />
        <Route
          path="/workshop"
          element={
            <>
              <LazyTarget id="consultation" />
              <Back />
            </>
          }
        />
        <Route path="/missing" element={<p>no target</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ScrollToTop', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>
  let scrollTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollIntoView = vi.fn()
    scrollTo = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView as unknown as Element['scrollIntoView']
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ハッシュなしの遷移はページ先頭へ', () => {
    setup('/missing')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('移動先がすでにあれば、その要素へ移動する', () => {
    setup('/#about')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('about'))
  })

  it('遅延読み込みで後から描画される要素へも、描画された時点で移動する', async () => {
    vi.useFakeTimers()
    setup('/workshop#consultation')
    expect(scrollIntoView).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('consultation'))
  })

  it('別ページへのハッシュ付きリンクは、ハッシュを保ったまま遷移して移動する', async () => {
    const user = userEvent.setup()
    setup('/')
    scrollIntoView.mockClear()
    await user.click(screen.getByText('to consultation'))
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('target', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalled()
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('consultation'))

    // 戻るでトップ（ハッシュなし）へ戻ると、先頭へ
    scrollTo.mockClear()
    await user.click(screen.getByText('back'))
    expect(screen.getByText('about')).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('存在しない ID でもエラーにならず、待機は上限で終わる', async () => {
    vi.useFakeTimers()
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    setup('/missing#nowhere')
    expect(scrollIntoView).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(6000)
    })
    expect(disconnect).toHaveBeenCalled()
    expect(scrollIntoView).not.toHaveBeenCalled()
    disconnect.mockRestore()
  })

  it('同じページ内のハッシュリンクは、遷移せずに要素へ移動する', async () => {
    const user = userEvent.setup()
    setup('/')
    scrollIntoView.mockClear()
    await user.click(screen.getByText('to about'))
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('about'))
  })
})
