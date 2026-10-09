import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 移動先の要素が描画されるのを待つ上限。超えたら何もしない（ページの先頭のまま） */
const HASH_WAIT_LIMIT_MS = 5000

function findTarget(hash: string): HTMLElement | null {
  let id = hash.slice(1)
  try {
    id = decodeURIComponent(id)
  } catch {
    // 不正なエンコードはそのままの文字列で探す
  }
  return id ? document.getElementById(id) : null
}

/**
 * ページ遷移時のスクロール位置を決める。
 *
 * - ハッシュなし: ページの先頭へ
 * - ハッシュあり（/workshop#consultation など）: その ID の要素へ移動する。
 *   ページは遅延読み込み（lazy）なので、遷移直後には要素がまだないことがある。
 *   固定時間待つのではなく、DOM の変化を監視して要素が現れた時点で移動する。
 *   要素が見つからないまま上限を過ぎた場合や、ID が存在しない場合は何もしない。
 *   固定ヘッダーに隠れないよう、移動先には scroll-mt-*（scroll-margin-top）を付けておく。
 *
 * location.key を依存に含めるので、同じハッシュへのリンクを再度押しても移動する。
 * 戻る・進むでも同じ規則で位置を決める（ハッシュ付きの履歴ならその要素へ）。
 */
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    // index.css の html { scroll-behavior: smooth } に従うと、別ページから着いたときに
    // 長いページを 1 秒近くかけて流れてしまうため、ハッシュへの移動は瞬時に行う
    // （同じページ内のアンカー移動は NavLink がスムーズスクロールする）。
    const scrollToTarget = (el: HTMLElement) => el.scrollIntoView({ behavior: 'instant', block: 'start' })

    const el = findTarget(hash)
    if (el) {
      scrollToTarget(el)
      return
    }

    // 遷移直後はページ先頭から始める（前のページのスクロール位置を引き継がない）
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const observer = new MutationObserver(() => {
      const found = findTarget(hash)
      if (found) {
        cleanup()
        scrollToTarget(found)
      }
    })
    const timer = window.setTimeout(() => cleanup(), HASH_WAIT_LIMIT_MS)
    function cleanup() {
      observer.disconnect()
      window.clearTimeout(timer)
    }
    observer.observe(document.body, { childList: true, subtree: true })
    return cleanup
  }, [pathname, hash, key])

  return null
}
