import { describe, it, expect, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { Reveal } from '@/components/ui/Reveal'

/**
 * スクロールで表示する演出（.reveal）のテスト。
 * - JavaScript が無効でも本文が読めること（隠すのは <html> に reveal-js があるときだけ）
 * - useReveal が起動した要素に印（data-reveal-bound）が付き、スクロール演出が保たれること
 * - 起動しなかった要素は、保険（reveal-timeout）で表示に戻ること
 */
const root = path.resolve(__dirname, '../..')
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8')

/** 交差しない IntersectionObserver（画面外にある要素の代わり） */
class NeverIntersecting {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const original = globalThis.IntersectionObserver
afterEach(() => {
  vi.stubGlobal('IntersectionObserver', original)
  document.documentElement.classList.remove('reveal-js', 'reveal-timeout')
})

describe('useReveal（Reveal）', () => {
  it('起動した要素に印を付け、画面に入ったら表示する', () => {
    render(<Reveal>本文</Reveal>)
    const node = screen.getByText('本文')
    expect(node.hasAttribute('data-reveal-bound')).toBe(true)
    expect(node.classList.contains('is-visible')).toBe(true)
  })

  it('画面に入るまでは表示しない（スクロール演出を保つ）', () => {
    vi.stubGlobal('IntersectionObserver', NeverIntersecting)
    render(<Reveal>画面外</Reveal>)
    const node = screen.getByText('画面外')
    expect(node.hasAttribute('data-reveal-bound')).toBe(true)
    expect(node.classList.contains('is-visible')).toBe(false)
  })

  it('保険（reveal-timeout）が働いた後に起動した要素は、隠し直さずに表示する', () => {
    vi.stubGlobal('IntersectionObserver', NeverIntersecting)
    document.documentElement.classList.add('reveal-js', 'reveal-timeout')
    render(<Reveal>遅れて起動</Reveal>)
    const node = screen.getByText('遅れて起動')
    expect(node.hasAttribute('data-reveal-bound')).toBe(true)
    expect(node.classList.contains('is-visible')).toBe(true)
  })
})

describe('JavaScript が無効でも本文が読める（index.html・src/index.css）', () => {
  const html = read('index.html')
  const css = read('src/index.css')
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`)
    return start < 0 ? '' : css.slice(start, css.indexOf('}', start))
  }

  it('reveal-js と reveal-timeout は、<head> の通常の script で付ける（body より前に実行される）', () => {
    const head = html.slice(0, html.indexOf('</head>'))
    const script = head.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''
    expect(script).toContain("classList.add('reveal-js')")
    expect(script).toContain("classList.add('reveal-timeout')")
    expect(script).toMatch(/setTimeout\(/)
  })

  it('.reveal の基本の状態では隠さない（隠すのは reveal-js があるときだけ）', () => {
    expect(block('.reveal')).not.toMatch(/opacity:\s*0/)
    expect(block('.reveal-js .reveal:not(.is-visible)')).toMatch(/opacity:\s*0/)
    expect(block('.reveal-js.reveal-timeout .reveal:not([data-reveal-bound])')).toMatch(/opacity:\s*1/)
  })

  it('prefers-reduced-motion では、隠す規則と同じ強さで打ち消す', () => {
    const media = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(media).toMatch(/\.reveal-js \.reveal:not\(\.is-visible\)/)
    expect(media).toMatch(/opacity:\s*1/)
  })
})
