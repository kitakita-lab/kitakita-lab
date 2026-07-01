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
npm run test           # テスト実行（1回）
npm run test:watch     # テスト実行（ウォッチモード）
npm run test:coverage  # テスト + カバレッジレポート生成
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
├─ lib/                  # 小さなユーティリティ
└─ test/                 # ★ テスト基盤（setup / 共通ユーティリティ）
```

## テスト（KitaKita Lab 標準テスト基盤）

**Vitest + Testing Library + jsdom** によるテスト環境です。
この構成は「KitaKita Lab 標準テンプレート」として、他プロジェクト
（シフト作成サポートアプリ、ikyu公式サイト等）へそのまま横展開できます。

### 構成

| ファイル | 役割 |
| --- | --- |
| `vitest.config.ts` | テスト設定（jsdom / setup / カバレッジ閾値） |
| `src/test/setup.ts` | jsdom に無いブラウザ API のモック集約（IntersectionObserver 等）+ jest-dom |
| `src/test/test-utils.tsx` | Provider（Router / Helmet）込みの共通 `renderWithProviders` |
| `src/**/*.test.ts(x)` | テスト本体（**テスト対象の隣**に配置する） |

### 実行方法

```bash
npm run test           # 全テスト実行（CI と同じ）
npm run test:watch     # 開発中のウォッチ実行
npm run test:coverage  # カバレッジ計測（coverage/ に HTML レポート生成）
```

カバレッジレポートは `coverage/index.html` をブラウザで開いて確認できます。

### カバレッジ基準（品質ゲート）

`vitest.config.ts` の `coverage.thresholds` で強制されます（下回ると失敗）。

| 指標 | 基準 |
| --- | --- |
| Statements | 80% 以上 |
| Functions | 80% 以上 |
| Branches | 70% 以上 |
| Lines | 80% 以上 |

### 新規コンポーネント追加時のテストルール

1. **テストファイルはテスト対象の隣に置く**（`Button.tsx` → `Button.test.tsx`）
2. **render は必ず `@/test/test-utils` の `renderWithProviders` を使う**（Testing Library を直接 import しない）
3. **ユーザー視点で書く**：`getByRole` / `getByLabelText` を優先し、クラス名や DOM 構造に依存しない
4. **ページを追加したら** `src/App.test.tsx` のルートテーブルに 1 行追加する
5. **データファイル（`src/data/`）を追加したら**、整合性テスト（一意性・形式）を追加する（例: `news.test.ts`）
6. ブラウザ API のモックが必要になったら **`src/test/setup.ts` に集約**する（テスト内で個別にモックしない）

### 他プロジェクトへの横展開手順

1. `vitest.config.ts` と `src/test/` をコピー
2. `package.json` に devDependencies（vitest / @testing-library/* / jsdom / @vitest/coverage-v8）と `test` 系 scripts を追加
3. `src/test/test-utils.tsx` の Provider をそのプロジェクトの構成（テーマ / ストア等）に合わせて調整

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
