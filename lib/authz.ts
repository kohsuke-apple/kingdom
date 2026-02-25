import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { AppRole, AuthContext, AuthProfile } from '@/types/auth'

function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization) return null
  if (!authorization.startsWith('Bearer ')) return null
  const token = authorization.slice('Bearer '.length).trim()
  return token.length > 0 ? token : null
}

export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  const token = extractBearerToken(request)
  if (!token) return null

  const userRes = await supabase.auth.getUser(token)
  const user = userRes.data.user
  if (!user) return null

  const { data: profileRow, error } = await supabase
    .from('user_profiles')
    .select('user_id, role, company_id, candidate_id, is_active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !profileRow) return null

  const profile: AuthProfile = {
    userId: profileRow.user_id,
    role: profileRow.role as AppRole,
    companyId: profileRow.company_id ?? undefined,
    candidateId: profileRow.candidate_id ?? undefined,
    isActive: profileRow.is_active,
  }

  if (!profile.isActive) return null

  return { userId: user.id, profile }
}

export function hasRole(context: AuthContext | null, roles: AppRole[]): boolean {
  if (!context) return false
  return roles.includes(context.profile.role)
}

export function canManageJobs(context: AuthContext | null, companyId?: string): boolean {
  if (!context) return false
  if (context.profile.role === 'master') return true
  if (context.profile.role !== 'employer') return false
  if (!companyId) return true
  return context.profile.companyId === companyId
}

export function canViewCandidate(context: AuthContext | null, candidateId: string): boolean {
  if (!context) return false
  if (context.profile.role === 'master' || context.profile.role === 'agency') return true
  if (context.profile.role === 'candidate') return context.profile.candidateId === candidateId
  return false
}
