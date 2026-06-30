import type { SVGProps } from 'react'

export type IconName =
  | 'workshop'
  | 'research'
  | 'collab'
  | 'event'
  | 'creators'
  | 'market'
  | 'arrow'
  | 'arrowUpRight'
  | 'check'
  | 'mail'
  | 'menu'
  | 'close'
  | 'plus'
  | 'minus'

const paths: Record<IconName, JSX.Element> = {
  workshop: (
    <>
      <path d="M3 21h18" />
      <path d="M12 3l7 6v12H5V9l7-6z" />
      <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
    </>
  ),
  research: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
      <path d="M8 11h6M11 8v6" />
    </>
  ),
  collab: (
    <>
      <path d="M16 11a4 4 0 1 0-4-4" />
      <path d="M8 13a4 4 0 1 0 4 4" />
      <path d="M11.5 11.5l1 1" />
    </>
  ),
  event: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01" />
    </>
  ),
  creators: (
    <>
      <path d="M12 2l2.4 5.8L20 9l-4.4 3.8L17 19l-5-3.2L7 19l1.4-6.2L4 9l5.6-1.2L12 2z" />
    </>
  ),
  market: (
    <>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M3 9h18" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17L17 7M9 7h8v8" />
    </>
  ),
  check: (
    <>
      <path d="M20 6L9 17l-5-5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  minus: (
    <>
      <path d="M5 12h14" />
    </>
  ),
}

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

/** Lightweight inline icon set (stroke-based, currentColor). */
export function Icon({ name, size = 24, strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
