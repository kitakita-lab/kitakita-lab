/**
 * Tiny className combiner — joins truthy class names with a space.
 * Avoids pulling in a dependency for a one-liner used across UI components.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
