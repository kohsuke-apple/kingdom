import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('環境変数 SUPABASE_URL が設定されていません')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('環境変数 SUPABASE_SERVICE_ROLE_KEY が設定されていません')
}

// サーバーサイド専用クライアント（Service Role Key でRLS をバイパス）
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
