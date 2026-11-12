import { useEffect, useRef, useState } from 'react'

/**
 * Reveals an element with a subtle fade-up once it scrolls into view.
 * Respects `prefers-reduced-motion` via the `.reveal` CSS rules.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number
  rootMargin?: string
  once?: boolean
}) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } =
    options ?? {}
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // 起動の印。3 秒の時点でこれがない要素だけが、index.html の保険の対象になる。
    node.setAttribute('data-reveal-bound', '')
    // 保険（data-reveal-fallback）ですでに表示されている要素は、隠し直さずに表示のままにする。
    // ページ遷移などで新しく表示された要素には付いていないので、通常どおり監視する。
    if (node.hasAttribute('data-reveal-fallback')) {
      setIsVisible(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}
