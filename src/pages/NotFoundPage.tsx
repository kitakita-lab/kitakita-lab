import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export function NotFoundPage() {
  return (
    <>
      <Seo title="ページが見つかりません" path="/404" noindex />
      <section className="flex min-h-[60vh] items-center justify-center bg-paper">
        <div className="container-content text-center">
          <p className="font-serif text-7xl text-clay-200">404</p>
          <h1 className="mt-4 text-2xl text-ink sm:text-3xl">
            ページが見つかりませんでした
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            お探しのページは移動または削除された可能性があります。
            トップページからお探しください。
          </p>
          <div className="mt-8">
            <Button to="/" size="lg">
              トップへ戻る
              <Icon name="arrow" size={18} />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
