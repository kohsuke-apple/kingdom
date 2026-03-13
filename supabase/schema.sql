-- ================================================================
-- dealerAGENT - データベーススキーマ
-- 実行場所: Supabase ダッシュボード > SQL Editor
-- 冪等性: 何度実行しても安全（IF NOT EXISTS / CREATE OR REPLACE）
-- ================================================================


-- ----------------------------------------------------------------
-- 1. テーブル
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS people (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  kana         TEXT        CHECK (kana IS NULL OR char_length(kana) <= 100),
  birth_date   TEXT        CHECK (birth_date IS NULL OR birth_date ~ '^\d{4}-\d{2}-\d{2}$'),
  relationship TEXT        CHECK (relationship IS NULL OR char_length(relationship) <= 100),
  phone        TEXT        CHECK (phone IS NULL OR char_length(phone) <= 20),
  email        TEXT        CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  address      TEXT        CHECK (address IS NULL OR char_length(address) <= 500),
  workplace    TEXT        CHECK (workplace IS NULL OR char_length(workplace) <= 200),
  sns          TEXT[],
  notes        TEXT        CHECK (notes IS NULL OR char_length(notes) <= 2000),
  tags         TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  people               IS '人物データベース';
COMMENT ON COLUMN people.id            IS 'UUID（自動生成）';
COMMENT ON COLUMN people.name          IS '氏名（必須）';
COMMENT ON COLUMN people.kana          IS 'ふりがな';
COMMENT ON COLUMN people.birth_date    IS '誕生日 YYYY-MM-DD';
COMMENT ON COLUMN people.relationship  IS '関係・続柄';
COMMENT ON COLUMN people.phone         IS '電話番号';
COMMENT ON COLUMN people.email         IS 'メールアドレス';
COMMENT ON COLUMN people.address       IS '住所';
COMMENT ON COLUMN people.workplace     IS '職場・所属';
COMMENT ON COLUMN people.sns           IS 'SNS アカウント（配列）';
COMMENT ON COLUMN people.notes         IS 'メモ（自由記入）';
COMMENT ON COLUMN people.tags          IS 'タグ（配列）';
COMMENT ON COLUMN people.created_at    IS '登録日時';
COMMENT ON COLUMN people.updated_at    IS '最終更新日時';


-- ----------------------------------------------------------------
-- 2. updated_at 自動更新トリガー
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_people_updated_at ON people;

CREATE TRIGGER trg_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ----------------------------------------------------------------
-- 3. インデックス
-- ----------------------------------------------------------------

-- 名前検索（完全一致・前方一致）
CREATE INDEX IF NOT EXISTS idx_people_name
  ON people (name);

-- かな検索
CREATE INDEX IF NOT EXISTS idx_people_kana
  ON people (kana)
  WHERE kana IS NOT NULL;

-- 誕生日（月別フィルター）
CREATE INDEX IF NOT EXISTS idx_people_birth_date
  ON people (birth_date)
  WHERE birth_date IS NOT NULL;

-- タグ（GIN インデックスで配列の包含検索を高速化）
CREATE INDEX IF NOT EXISTS idx_people_tags
  ON people USING GIN (tags)
  WHERE tags IS NOT NULL;

-- 登録日降順（最近追加した人）
CREATE INDEX IF NOT EXISTS idx_people_created_at
  ON people (created_at DESC);


-- ----------------------------------------------------------------
-- 4. セキュリティ設定
-- ----------------------------------------------------------------

-- RLS は Service Role Key でサーバー側のみアクセスするため無効
-- アプリケーション層の Basic 認証で保護する
ALTER TABLE people DISABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------
-- 5. 確認クエリ（実行後に結果を目視確認）
-- ----------------------------------------------------------------

-- テーブル一覧
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- カラム一覧
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'people'
ORDER BY ordinal_position;

-- インデックス一覧
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename  = 'people'
ORDER BY indexname;
