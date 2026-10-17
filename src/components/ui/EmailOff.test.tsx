import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { EmailOff } from './EmailOff'

describe('EmailOff', () => {
  it('子要素を Cloudflare の email_off コメントで囲んで出力する', () => {
    const html = renderToString(
      <EmailOff>
        <a href="mailto:hello@example.com">hello@example.com</a>
      </EmailOff>,
    )
    const start = html.indexOf('<!--email_off-->')
    const address = html.indexOf('mailto:hello@example.com')
    const end = html.indexOf('<!--/email_off-->')
    expect(start).toBeGreaterThanOrEqual(0)
    expect(address).toBeGreaterThan(start)
    expect(end).toBeGreaterThan(address)
  })
})
