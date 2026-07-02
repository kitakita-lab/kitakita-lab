import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

type Inquiry = '作家として参加したい' | '企業・自治体・施設の連携' | '取材・メディア' | 'その他'

const inquiryTypes: Inquiry[] = [
  '作家として参加したい',
  '企業・自治体・施設の連携',
  '取材・メディア',
  'その他',
]

type FormState = {
  name: string
  email: string
  inquiry: Inquiry
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  inquiry: '作家として参加したい',
  message: '',
}

const fieldClass =
  'w-full rounded-xl border border-line bg-paper-50 px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft transition-colors focus:border-clay-400 focus:bg-paper'

/**
 * Contact form — 仮実装。
 * 送信はモックで、実際の送信先はありません。本番では onSubmit を
 * フォームサービス（Formspree 等）や API エンドポイントに接続してください。
 */
export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'お名前を入力してください。'
    if (!form.email.trim()) {
      next.email = 'メールアドレスを入力してください。'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'メールアドレスの形式が正しくありません。'
    }
    if (!form.message.trim()) next.message = 'お問い合わせ内容を入力してください。'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    // NOTE: 現在はモック送信（仕様）。本運用開始時にフォームサービスまたは
    // API エンドポイントへの送信処理に置き換える（README「お問い合わせフォームについて」参照）。
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl2 border border-clay-100 bg-clay-50/60 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay-100 text-clay-600">
          <Icon name="check" size={28} />
        </span>
        <h3 className="mt-5 text-xl text-ink">送信ありがとうございます</h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
          内容を確認のうえ、担当者よりご連絡します。
          <br />
          ※ こちらはデモ実装です。実際の送信は行われていません。
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState)
            setSubmitted(false)
          }}
          className="mt-6 text-sm font-medium text-clay-600 underline underline-offset-4 hover:text-clay-700"
        >
          別の内容を送る
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
          お名前 <span className="text-clay-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={cn(fieldClass, errors.name && 'border-red-400')}
          placeholder="例）北方 ひかり"
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
          メールアドレス <span className="text-clay-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={cn(fieldClass, errors.email && 'border-red-400')}
          placeholder="例）hello@example.com"
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="inquiry" className="mb-2 block text-sm font-medium text-ink">
          お問い合わせ種別
        </label>
        <select
          id="inquiry"
          value={form.inquiry}
          onChange={(e) => update('inquiry', e.target.value as Inquiry)}
          className={cn(fieldClass, 'appearance-none bg-[length:1.25rem] pr-10')}
        >
          {inquiryTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink">
          お問い合わせ内容 <span className="text-clay-600">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={cn(fieldClass, 'resize-y', errors.message && 'border-red-400')}
          placeholder="ご相談内容や、進めてみたいことをお聞かせください。"
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" size="lg">
          送信する
          <Icon name="arrow" size={18} />
        </Button>
        <p className="text-xs text-ink-soft">※ 現在はデモ実装です</p>
      </div>
    </form>
  )
}
