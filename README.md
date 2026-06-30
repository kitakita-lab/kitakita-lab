# KitaKita Lab — 公式サイト

「ハンドメイド作家が、もっと挑戦できる世界をつくる」プロジェクト **KitaKita Lab** の公式サイトです。

会社紹介ではなく、**なぜ始めたのか・どんな未来を目指すのか・一緒に作る仲間を募集している**ことが自然と伝わる、ストーリー重視の構成にしています。

## 技術スタック

- **React + TypeScript + Vite**
- **Tailwind CSS**（デザイントークンは `tailwind.config.js` に集約）
- **React Router**（マルチページ構成・CMS導入を見据えたルーティング）
- **react-helmet-async**（ページ単位の SEO / OGP）
- **Vercel** デプロイ前提（`vercel.json` で SPA リライト・キャッシュ設定）

レスポンシブ（スマホ最優先）／ライトモードのみ／アクセシビリティ対応（スキップリンク・フォーカスリング・`prefers-reduced-motion` 尊重・セマンティックHTML）。

## セットアップ

```bash
npm install      # 依存関係のインストール
npm run dev      # 開発サーバー起動（http://localhost:5173）
npm run build    # 型チェック + 本番ビルド（dist/）
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint
```

## ディレクトリ構成

```
src/
├─ main.tsx              # エントリ（Router / Helmet プロバイダ）
├─ App.tsx               # ルーティング定義
├─ index.css             # Tailwind + ベーススタイル
├─ components/
│  ├─ layout/            # Header / Footer / Layout / PageHeader など
│  ├─ ui/                # Button / Card / Section / Icon などの再利用部品
│  ├─ home/              # トップページの各セクション
│  ├─ Seo.tsx            # ページ単位のメタタグ
│  ├─ CtaBand.tsx        # 共通CTAバンド
│  └─ ContactForm.tsx    # お問い合わせフォーム（仮実装）
├─ pages/                # 各ページ
├─ data/                 # ★ コンテンツ（CMS化を見据えたデータ層）
├─ hooks/                # カスタムフック
└─ lib/                  # 小さなユーティリティ
```

## コンテンツの追加・編集（CMS化前提の設計）

コンテンツはコンポーネントから分離し、`src/data/` の配列で管理しています。
**項目を追加するだけ**で各ページに反映され、将来は配列を API レスポンスへ
差し替えるだけで CMS へ移行できます。

| 内容 | 編集ファイル |
| --- | --- |
| サイト名・連絡先・ナビ | `src/data/site.ts` |
| 活動内容（Activities） | `src/data/activities.ts` |
| Workshop 実績カード | `src/data/workshops.ts` |
| Research 調査結果（現在ダミー） | `src/data/research.ts` |
| News（お知らせ／プレスリリース） | `src/data/news.ts` |
| FAQ | `src/data/faq.ts` |
| 作家募集（Creators） | `src/data/creators.ts` |

### Workshop に写真を追加する

1. 画像を `public/workshops/` に配置
2. `src/data/workshops.ts` の対象項目に `image: '/workshops/xxx.jpg'` を追加

`image` 未指定の場合はプレースホルダーが表示されます。

## ページ一覧

| パス | 内容 |
| --- | --- |
| `/` | Hero / KitaKita Labとは / Mission / Vision / Activities / 作家募集 / News |
| `/workshop` | ワークショップ・活動実績 |
| `/research` | 調査活動（ダミーデータ） |
| `/collaboration` | 企業・自治体・商業施設・教育機関連携 |
| `/creators` | 作家募集 |
| `/news`, `/news/:slug` | お知らせ一覧・詳細 |
| `/faq` | よくある質問 |
| `/contact` | お問い合わせ（フォーム仮実装） |

## お問い合わせフォームについて

`src/components/ContactForm.tsx` は **仮実装** です（送信はモック）。
本番では `handleSubmit` 内の TODO 箇所を、フォームサービス（Formspree 等）や
独自 API エンドポイントへの送信処理に置き換えてください。

## Vercel へのデプロイ

このリポジトリを Vercel にインポートするだけでデプロイできます
（フレームワークは Vite として自動検出されます）。
独自ドメイン設定後は、`index.html` / `src/data/site.ts` / `public/sitemap.xml` /
`public/robots.txt` の URL を実ドメインに更新してください。
