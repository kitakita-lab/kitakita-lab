# KitaKita Lab 公式サイト — 作業の前提

札幌を拠点とする屋号「KitaKita Lab」の公式サイト（https://www.kitakita-lab.com）。
Vite + React 18 の SPA を、ビルド時に全ページ静的 HTML へプリレンダリング（SSG）して配信している。
詳しい構成は `README.md`、言葉とトーンは `docs/BRAND.md`。

## コマンド

```
npm run typecheck && npm run lint && npm run test:coverage && npm run build   # CI と同じ
npm run check:visual -- --shots /events/<slug>   # 全ページ × 6 幅の表示確認（ローカルの dist/。要 playwright-core）
npm run check:production -- --only /events/<slug> # 公開 URL での表示確認（本番。結果はローカルと分けて記録）
npm run gate:codex-wait -- <PR>                   # Codex レビューの依頼と待機（停滞時は同じ commit に 1 回だけ再依頼）
npm run photos:audit                              # 公開中のヒーロー画像の明るさ（中央値 L*）の点検
```

playwright は devDependencies に含めていない。必要なときは `npm i --no-save playwright-core`
（Chromium は `CHROME_PATH`。Claude Code のクラウド環境では `/opt/pw-browsers/chromium` を自動で使う）。

## 公開とデプロイ

- `main` への push で Cloudflare Pages が本番へ自動デプロイする。PR ごとにプレビューも作られる。
- `vercel.json` は移行期間の互換用（Vercel のプレビューも動いているが、本番ではない）。
- PR では `@codex review` で Codex（chatgpt-codex-connector）のレビューを受けられる。

## 書くときの決まり

- KitaKita Lab は法人ではなく屋号。「当社」「弊社」と書かない。
- 実施報告書の提出先・取引先・主催企業の名称、契約や金額、担当者の連絡先は載せない。
- 開催会場を、取引先や提携先のように書かない（開催場所として書く）。
- 数字は一次資料（報告書・調査の集計）と一致させる。資料にない数字やエピソードを作らない。
- 調査結果は「意向」、実績は「当日の記録」として書き分ける。集客・売上への読み替えをしない。
- 参加者の発言は、公開の許可を確認できない限り直接引用しない（要旨にする）。

## 実績の追加（自動公開の対象）

実施報告書 PDF と写真からイベント実績を追加する作業は、`docs/EVENT-UPDATE.md` の手順と判定基準に従う。
そこに書いた範囲・条件を満たす場合に限り、個別の承認を待たずに PR 作成・Codex レビュー・マージ・本番確認まで進めてよい。
条件を満たさない場合、またはそれ以外の作業（デザイン変更・既存ページの改修など）は、PR を作って止め、ユーザーの判断を待つ。

## 自律実行（いつものハーネス）

「いつものハーネスで」「最終承認待ちまで」などと依頼された作業（実績の追加以外）は、`docs/AUTOPILOT.md` の手順・上限・止める条件に従う。
作業範囲を確定してから進め、Draft PR のまま人の最終承認を待って止まる。マージ・Draft の解除・本番公開はしない。
