import type { ReactNode } from 'react'

/**
 * 囲んだ範囲を Cloudflare の Email Address Obfuscation の対象から外す。
 * 本番は Cloudflare 経由で配信され、HTML 内のメールアドレスと mailto リンクが
 * `[email protected]` と /cdn-cgi/l/email-protection に書き換えられる。そのままでは
 * JS を実行しない環境（一部のクローラーなど）からアドレスが読めないため、
 * Cloudflare 公式の除外方法である `<!--email_off-->` 〜 `<!--/email_off-->` で囲む。
 *
 * React は HTML コメントを直接出力できないので、コメントだけを持つ非表示の
 * span を前後に置く。コメントは表示にも読み上げにも影響しない。
 */
export function EmailOff({ children }: { children: ReactNode }) {
  return (
    <>
      <span hidden dangerouslySetInnerHTML={{ __html: '<!--email_off-->' }} />
      {children}
      <span hidden dangerouslySetInnerHTML={{ __html: '<!--/email_off-->' }} />
    </>
  )
}
