export type AppRole = 'employer' | 'agency' | 'master' | 'candidate'

export type AuthProfile = {
  userId: string
  role: AppRole
  companyId?: string
  candidateId?: string
  isActive: boolean
}

export type AuthContext = {
  userId: string
  profile: AuthProfile
}
