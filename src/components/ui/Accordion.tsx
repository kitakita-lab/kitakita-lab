import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { Icon } from './Icon'

type AccordionItemProps = {
  question: ReactNode
  answer: string
  defaultOpen?: boolean
}

/** Single expandable FAQ row, accessible via button + aria-expanded. */
export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="font-sans text-base font-medium text-ink sm:text-lg">
            {question}
          </span>
          <span className="mt-0.5 shrink-0 text-clay-600">
            <Icon name={open ? 'minus' : 'plus'} size={20} />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        hidden={!open}
        className="pb-6 pr-8 text-[15px] leading-relaxed text-ink-muted"
      >
        {answer}
      </div>
    </div>
  )
}
