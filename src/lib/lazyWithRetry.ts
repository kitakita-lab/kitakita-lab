import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

const RELOAD_FLAG = 'kkl:chunk-reloaded'

/**
 * `React.lazy` wrapper that recovers from stale-chunk errors after a redeploy.
 *
 * When the site is redeployed, an already-open tab still references the old
 * hashed chunk filenames. Navigating to a code-split route then fails the
 * dynamic import (the old chunk 404s). This wrapper reloads the page once to
 * pick up the fresh `index.html` + chunk graph. A session flag prevents a
 * reload loop when the failure is not deploy-related (e.g. offline).
 */
export function lazyWithRetry<T extends ComponentType<Record<string, never>>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory()
      window.sessionStorage.removeItem(RELOAD_FLAG)
      return mod
    } catch (err) {
      if (!window.sessionStorage.getItem(RELOAD_FLAG)) {
        window.sessionStorage.setItem(RELOAD_FLAG, '1')
        window.location.reload()
        // Keep Suspense pending while the page reloads.
        return new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}
