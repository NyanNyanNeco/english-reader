# English Reader — GitHub Pagesデプロイ手順

## フォルダ構成

```
english-reader/
├── index.html          ← アプリ本体（React CDN版）
├── manifest.json       ← PWA設定
├── sw.js               ← Service Worker（オフライン対応）
├── icons/
│   ├── icon-192.png    ← アプリアイコン（192x192）
│   └── icon-512.png    ← アプリアイコン（512x512）
└── README.md           ← この文書
```

---

## GitHub Pagesへのデプロイ手順

### ステップ1：GitHubにリポジトリを作成
1. https://github.com にログイン
2. 右上「＋」→「New repository」
3. リポジトリ名（例：`english-reader`）を入力
4. 「Public」を選択 → 「Create repository」

### ステップ2：ファイルをアップロード
1. 作成したリポジトリのページで「uploading an existing file」をクリック
2. このフォルダ内のファイルをすべてドラッグ＆ドロップ
   （`icons/` フォルダも忘れずに）
3. 「Commit changes」をクリック

### ステップ3：GitHub Pagesを有効化
1. リポジトリの「Settings」タブをクリック
2. 左メニュー「Pages」をクリック
3. 「Branch」を `main` に変更 → 「Save」
4. 数分後に `https://ユーザー名.github.io/english-reader/` でアクセス可能

### ステップ4：スマホのホーム画面に追加

**iPhoneの場合（Safari）**
1. Safariで上記URLを開く
2. 下部の「共有」ボタン（□↑）をタップ
3. 「ホーム画面に追加」→「追加」

**Androidの場合（Chrome）**
1. Chromeで上記URLを開く
2. 右上「⋮」→「アプリをインストール」または「ホーム画面に追加」

---

## 更新方法

ファイルを変更したい場合：
1. GitHubのリポジトリページを開く
2. 更新したいファイルをクリック → 鉛筆アイコンで編集 または 再アップロード
3. 「Commit changes」をクリック → 自動で反映される

---

## データについて

- すべてのデータ（英文・単語帳）はブラウザのlocalStorageに保存されます
- 同じデバイス・同じブラウザであればデータは保持されます
- 別デバイスへの移行はCSV/JSONエクスポート機能を使用してください
