# サイトマップ

> ベースURL（開発環境想定）: http://localhost:3000

注意: 実運用ドメインをお使いの場合はベースURLを置き換えてください。

## Pages

- ホーム: http://localhost:3000/
- ダッシュボード: http://localhost:3000/dashboard
- ダッシュボード（全体管理）: http://localhost:3000/dashboard/all/management
- ダッシュボード（全体 CA）: http://localhost:3000/dashboard/all/ca

- CA 関連
  - CA ホーム: http://localhost:3000/dashboard/ca/home
  - CA 候補者一覧: http://localhost:3000/dashboard/ca/candidates
  - CA 候補者 新規: http://localhost:3000/dashboard/ca/candidates/new
  - CA 候補者 詳細: http://localhost:3000/dashboard/ca/candidates/{id}
  - CA 保存リスト: http://localhost:3000/dashboard/ca/saved
  - CA 保存リスト カテゴリ: http://localhost:3000/dashboard/ca/saved/{category}
  - CA テンプレート: http://localhost:3000/dashboard/ca/templates
  - CA エージェント 詳細: http://localhost:3000/dashboard/ca/agents/{id}
  - CA 選考一覧: http://localhost:3000/dashboard/ca/selections
  - CA 求人検索: http://localhost:3000/dashboard/ca/jobs-search

- RA 関連
  - RA ホーム: http://localhost:3000/dashboard/ra/home
  - RA 管理ページ: http://localhost:3000/dashboard/ra/management
  - RA エージェント一覧: http://localhost:3000/dashboard/ra/agents
  - RA テンプレート: http://localhost:3000/dashboard/ra/templates
  - RA 求人一覧: http://localhost:3000/dashboard/ra/jobs
  - RA 求人 詳細: http://localhost:3000/dashboard/ra/jobs/{id}
  - RA 企業一覧: http://localhost:3000/dashboard/ra/companies
  - RA 企業 詳細: http://localhost:3000/dashboard/ra/companies/{id}
  - RA タスク: http://localhost:3000/dashboard/ra/tasks

- Hiring 関連
  - Hiring ホーム: http://localhost:3000/dashboard/hiring/home
  - Hiring 求人: http://localhost:3000/dashboard/hiring/jobs
  - Hiring 企業プロフィール: http://localhost:3000/dashboard/hiring/company-profile

- Ext-CA（外部 CA）
  - ext-ca ホーム: http://localhost:3000/dashboard/ext-ca/home
  - ext-ca 求人: http://localhost:3000/dashboard/ext-ca/jobs
  - ext-ca 候補者: http://localhost:3000/dashboard/ext-ca/candidates

- 企業（パブリック／管理）
  - 企業詳細: http://localhost:3000/dashboard/companies/{id}
  - 会社設定: http://localhost:3000/dashboard/company-settings

- その他
  - ダッシュボードの選考: http://localhost:3000/dashboard/selections


## API Endpoints

- /api/agents: http://localhost:3000/api/agents
- /api/people: http://localhost:3000/api/people
- /api/people/{id}: http://localhost:3000/api/people/{id}
- /api/candidates: http://localhost:3000/api/candidates
- /api/companies: http://localhost:3000/api/companies
- /api/company-communications: http://localhost:3000/api/company-communications
- /api/jobs: http://localhost:3000/api/jobs
- /api/jobs/thumbnail: http://localhost:3000/api/jobs/thumbnail
- /api/templates: http://localhost:3000/api/templates
- /api/saved-jobs: http://localhost:3000/api/saved-jobs
- /api/selections: http://localhost:3000/api/selections
- /api/tasks: http://localhost:3000/api/tasks
- /api/stats: http://localhost:3000/api/stats


## 静的 / 公開資産（例）
- ロゴ等: http://localhost:3000/logo.svg  (存在する場合)


---

このファイルはリポジトリの `SITEMAP.md` に保存しました。実運用のベースURLがある場合は先頭のベースURLを置き換えると全URLが正しくなります。