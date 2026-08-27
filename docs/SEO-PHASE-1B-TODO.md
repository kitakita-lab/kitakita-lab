# SEO Phase 1B TODO（プリレンダリング／構造課題の根治）

> Phase 1A（計測基盤・安全なSEO改善）の完了時点で確定している、次フェーズの作業記録。
> 期限目標: **2026年9月末**（10月の調査プレスリリース配信前）。
> Phase 1A では着手しない。実装・検証は独立タスクとして行う。

## 背景（Phase 1A 時点の実測事実）

- 本サイトは完全CSR。深いURL（例: `/events/ario-sapporo-harvest-court-2026`）への
  HTTPレスポンスは、HOME用の title / OG と空の `<div id="root">` を返す
- ページ固有の title / description / canonical / OG は react-helmet-async が
  JS実行後に書き換えている（Googlebot は解釈できるが、OGP取得クローラーは不可）
- 存在しないURLは HTTP 200（ソフト404。JS実行後の noindex で緩和済み）

## TODO

1. **完全CSR → ビルド時プリレンダリング（SSG）**
   - 対象ルートは `scripts/generate-sitemap.mjs` と同じソース
     （固定ページ + `src/data/events.ts` + `src/data/news.ts` の slug）から列挙する
2. **各主要URLの生HTMLへ以下を出力**
   - 固有 title / meta description / canonical / OG（og:url 含む）/ 本文 / 必要なJSON-LD
   - 併せて **meta重複の解消**: 現状は index.html の静的 description / OG と
     Helmet のページ別 meta が全下層ページで二重に存在している（実測で
     description ×2・og:title ×2 を確認済み）。プリレンダリング時は
     静的メタを「重ねる」のではなくページ別の値で「置き換える」こと
3. **Event詳細のOG画像の個別化**（各イベントの hero 写真を og:image に）
4. **www / non-www の正規ホストを確定**（Vercelのドメイン設定を確認）
5. **redirect / canonical / sitemap / og:url を同一ホストへ統一**
6. **存在しないURLを真の404（HTTPステータス404）へ**
7. **Event詳細への Article / BreadcrumbList JSON-LD の検討・実装**
   - 開催済み実績は Article 系。Event schema は過去実績へ適用しない
8. **9月末までに完了**

## 完了条件

> ハーベストコートの実績URL（`/events/ario-sapporo-harvest-court-2026`）を
> LINE等で送ると、**ハーベストコート固有のタイトルと写真**が
> リンクプレビューに表示されること。

## Phase 1B 以降に持ち越しているその他の候補（未確定）

- FAQへの発注前質問の追加（文面はブランドトーンで起草してから）+ FAQPage schema の要否
- 運営者情報の公開粒度の決定 → Organization schema への address 追加判断
- 公式SNSアカウントURLの確認 → Organization `sameAs` 追加判断
- 画像の WebP/AVIF 化・hero への fetchpriority（CWV実測を見てから）
- 「出張ワークショップ」の title 昇格（GSCの検索クエリ実績を見てから）
- Collaboration 本文の構成変更（同上）
- 調査結果ページ `/research/:slug`（調査結果の確定後。events 方式のデータ駆動で拡張）
