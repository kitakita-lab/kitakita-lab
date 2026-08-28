# SEO Phase 1B TODO（プリレンダリング／構造課題の根治）

> **2026-08-28 実装済み**（TODO 1〜7）。残タスクは末尾参照。

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


---

## 実装結果（2026-08-28）

- 方式: `vite build --ssr src/entry-server.tsx` + `scripts/prerender.mjs`。
  App.tsx（lazyルート含む）をそのまま renderToPipeableStream(onAllReady) で
  描画するため、ルート定義の二重管理なし。URL一覧（prerenderPages）は
  events / news のデータから生成され、sitemap も同一ソース。
- 全18公開URL + 404.html を静的HTML化。title / description / canonical /
  OG / 本文 / JSON-LD が JS なしで取得可能なことをビルド内検証で強制
  （title重複・meta重複・本文欠落はビルド失敗になる）。
- meta重複解消: index.html の静的メタは ssg:head マーカー区間となり、
  プリレンダリング時にページ別メタへ置換される（重ねない）。
- Event詳細: og:image を各イベントの hero に個別化。Article +
  BreadcrumbList JSON-LD を追加（Event schema は不使用）。
- 404: vercel.json の SPA rewrite を撤去し、未知URLは Vercel が
  404.html（noindex付き）を HTTP 404 で配信する構成に変更。
- 正規ホスト: www.kitakita-lab.com に統一（site.url / OG / canonical /
  sitemap / robots / JSON-LD）。

## 残タスク・運用メモ

- 本番デプロイ後の実測確認: 4ホスト（http/https × www/apex）の
  リダイレクト先が www の https に集約されること（サンドボックスの
  プロキシ制約で未実測。Vercel Domains 設定で www が Primary であること
  を確認する）
- LINE / Slack 等で Harvest Court URL のプレビューが固有タイトル+写真に
  なること（外部キャッシュは即時更新されない場合がある）
- GSC: 数週間後に Collaboration / Events 詳細のインデックス状況を確認
- 画像の WebP 化・fetchpriority は見送り中（CWV実測を見てから別PR）
- vite preview は SPA フォールバックのため、プリレンダリング結果の
  確認には `npx serve dist` を使うこと（preview だと全URLがHOMEに見える）
