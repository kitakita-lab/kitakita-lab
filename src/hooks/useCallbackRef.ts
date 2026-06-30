import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns a stable callback whose latest implementation is always invoked.
 * Lets event handlers depend on props without re-binding listeners.
 */
export function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined,
): (...args: Parameters<T>) => void {
  const ref = useRef(callback)

  useEffect(() => {
    ref.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>) => {
    ref.current?.(...args)
  }, [])
}
