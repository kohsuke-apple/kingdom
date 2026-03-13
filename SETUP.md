# dealerAGENT - セットアップ・デプロイ手順

## ローカル開発

### 0. Supabase 認証認可基盤を適用（初回のみ）

Supabase SQL Editor で以下を順に実行：

1. `supabase/ca_ra_dual_mode.sql`
2. `supabase/company_settings.sql`
3. `supabase/auth_foundation.sql`

`auth_foundation.sql` 適用後、`auth.users` の UUID と対応する `public.user_profiles` を作成してください。

例:

```sql
insert into public.user_profiles (user_id, role, company_id)
values ('<auth-user-uuid>', 'employer', '<company-id>');

insert into public.user_profiles (user_id, role)
values ('<auth-user-uuid>', 'master');
```

### 1. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して認証情報を設定：

```
BASIC_AUTH_USER=your_username
BASIC_AUTH_PASSWORD=your_secure_password
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。Basic認証のダイアログが表示されます。

---

## Vercelデプロイ手順

### 1. GitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/dealerAGENT.git
git push -u origin main
```

### 2. Vercelにインポート

1. https://vercel.com/new を開く
2. GitHubリポジトリを選択
3. **「Environment Variables」** に以下を追加：

| Name | Value |
|------|-------|
| `BASIC_AUTH_USER` | 任意のユーザー名 |
| `BASIC_AUTH_PASSWORD` | 強力なパスワード |

4. 「Deploy」をクリック

> **⚠️ 重要**: SQLiteのデータファイル (`/data/dealeragent.db`) はVercelの一時ファイルシステム上に保存されます。
> デプロイのたびにデータがリセットされます。
> **本番運用では Supabase (PostgreSQL) への移行を推奨します。**

### 3. 永続化の選択肢（本番運用向け）

- **Vercel Postgres / Supabase**: `lib/repository.ts` の実装を差し替えるだけで移行可能
- **Vercel KV**: シンプルなKey-Value ストレージ

---

## プロジェクト構成

```
/app
  layout.tsx          - ルートレイアウト（サイドバー含む）
  page.tsx            - ダッシュボード
  /people
    page.tsx          - 人物一覧
    /new/page.tsx     - 新規作成
    /[id]/page.tsx    - 詳細
    /[id]/edit/page.tsx - 編集
  /api
    /people/route.ts        - 一覧取得・作成API
    /people/[id]/route.ts   - 取得・更新・削除API
    /stats/route.ts         - 統計API
/proxy.ts             - Basic認証 (Edge Runtime)
/lib
  db.ts               - SQLite接続
  repository.ts       - データアクセス層
  validations.ts      - Zodバリデーション
/components
  sidebar.tsx         - サイドバーナビゲーション
  people-list.tsx     - 人物一覧コンポーネント
  person-detail.tsx   - 人物詳細コンポーネント
  person-form.tsx     - 作成・編集フォーム
/types
  person.ts           - 型定義
/data/                - SQLiteデータベース（gitignore済み）
```

---

## セキュリティ

- ✅ Basic認証（Edge Runtime / proxy.ts）
- ✅ robots.txt で全クローラー拒否
- ✅ `noindex, nofollow` メタタグ
- ✅ `X-Robots-Tag` レスポンスヘッダー
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ 外部API・外部ログ・外部クラウド一切不使用
