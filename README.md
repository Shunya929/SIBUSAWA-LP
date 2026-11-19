# SIBUSAWA LP

SIBUSAWA STYLE RC 収益不動産LP（静的コーディング版）。

- デザイン：Figma「デザイン案｜PC版」（1440px）／「デザイン案｜SP版」（390px）
- ブレークポイント：〜959px がSPレイアウト、960px〜 がPCレイアウト

## 構成

```
public/index.html          LP本体
public/thanks.html         フォーム送信後の完了画面
public/assets/css/style.css
public/assets/js/main.js   スライダー・フォームの最小限の制御
public/assets/img/         Figmaから書き出した画像
src/index.js               Basic認証（Cloudflare Workers）
wrangler.jsonc             Cloudflare Workersの設定
```

## 確認方法

`public/index.html` をブラウザで開くだけで表示できます。

## 公開（Cloudflare Workers）

`main` にpushすると自動でデプロイされます。Basic認証のID・パスワードは、
Cloudflareの Settings → Variables and Secrets に Secret として登録します。

- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASS`

## 未対応・要確認

- フォームの送信先（現状は送信せず thanks.html に遷移）
- 原稿内の [要確認] 箇所、FAQのQ2〜Q7の回答
- 入居者セクションのスライダー2〜5枚目の写真（現状は1枚目を仮置き）
- 「施工事例をもっと見る」のリンク先
