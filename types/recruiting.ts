export type UserRole = 'CA' | 'RA'
export type AgentRoleType = 'CA' | 'RA' | 'both'
export type JobStatus = 'open' | 'closed'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type PublishStatus = 'private' | 'ra_only' | 'ca_ra' | 'published'
export type HiringType = 'new_grad' | 'mid_career' | 'both'
export type RecruitingStatus = 'active' | 'fulfilled'
export type HiringDifficulty = 'A' | 'B' | 'C' | 'D'

export type SelectionStage =
  | 'applied'
  | 'document_pass'
  | 'interview_1'
  | 'interview_2'
  | 'final'
  | 'offer'
  | 'hired'
  | 'rejected'

export type SelectionStatus = 'active' | 'rejected' | 'hired'

export interface Company {
  id: string
  name: string
  industry?: string
  industries?: string[]
  subIndustries?: string[]
  location?: string
  memo?: string
  officialWebsite?: string
  businessDescription?: string
  transferCase?: string
  employeeIntroduction?: string
  isMyCompany?: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
  // RA管理フィールド
  companyNumber?: string
  publishStatus?: PublishStatus
  recruitingJobTypes?: string
  hiringType?: HiringType
  successFee?: string
  recruitingStatus?: RecruitingStatus
  hiringDifficulty?: HiringDifficulty
  refundPolicy?: string
  documentStorageUrl?: string
  workLocation?: string
  selectionFlow?: string
}

export type JobSourceMode = 'RA' | 'HIRING'

export interface Job {
  id: string
  companyId: string
  title: string
  // 既存フィールド
  jobType?: string
  salaryMin?: number
  salaryMax?: number
  status: JobStatus
  description?: string
  sourceMode?: JobSourceMode
  createdBy?: string
  createdAt: string
  updatedAt: string
  // ヘッダー・基本情報
  employmentType?: string
  recruitType?: string
  shareType?: string
  noReprint?: boolean
  position?: string
  jobLocation?: string
  publishedAt?: string
  sourceCompanyName?: string
  salaryText?: string
  monthlySalaryMin?: number
  monthlySalaryMax?: number
  bonusCount?: number
  // 企業情報（求人票内）
  companyFoundedYear?: string
  companyPhase?: string
  companyEmployeeCount?: string
  companyAddress?: string
  companyListingType?: string
  companyAvgAge?: string
  companyGenderRatio?: string
  // 採用要件
  requiredConditions?: string
  rejectionReasons?: string
  highPassConditions?: string
  interviewRejectionReasons?: string
  // この求人の魅力
  visionText?: string
  businessText?: string
  // 求人概要
  businessContent?: string
  recruitBackground?: string
  plannedHeadcount?: string
  prPoints?: string
  jobDetail?: string
  orgStructure?: string
  salaryDetail?: string
  workTimeDetail?: string
  holidayBenefits?: string
  smokingPolicy?: string
  // 選考情報
  hasCasualInterview?: string
  hasInfoSession?: string
  hasAptitudeTest?: string
  selectionFlow?: string
  selectionNote?: string
  // 成約手数料
  successFeeAmount?: number
  successFeePoint?: string
  paymentTerm?: string
  refundPolicy?: string
  theoreticalSalaryNote?: string
  // 求人提供元
  sourceAgencyName?: string
  sourceAgencyAddress?: string
  sourceAgencyLicenseNo?: string
  thumbnailUrl?: string
}

export interface WorkHistory {
  companyName: string
  employmentType?: string
  period?: string
  industry?: string
  jobType?: string
  salary?: number
}

export interface Candidate {
  id: string
  name: string
  nameKana?: string
  email?: string
  phone?: string
  gender?: string
  birthDate?: string
  location?: string
  lastEducation?: string
  graduatedSchool?: string
  experienceCount?: number
  experienceJobTypes?: string
  experienceIndustries?: string
  currentSalary?: number
  workHistories?: WorkHistory[]
  desiredLocation?: string
  desiredSalary?: number
  desiredJobType?: string
  recommendationText?: string
  resumeUrl?: string
  cvUrl?: string
  mainAgentId?: string
  subAgentId?: string
  memo?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyCandidateSelection {
  id: string
  companyId: string
  jobId: string
  candidateId: string
  stage: SelectionStage
  status: SelectionStatus
  createdBy?: string
  updatedAt: string
}

export interface CandidateJobStatus {
  id: string
  candidateId: string
  jobId: string
  stage: SelectionStage
  memo?: string
  createdBy?: string
  createdAt?: string
  updatedAt: string
}

export interface Agent {
  id: string
  companyId?: string
  name: string
  email?: string
  roleType: AgentRoleType
  memo?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  relatedCompanyId?: string
  relatedCandidateId?: string
  assignedTo?: string
  status: TaskStatus
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyCommunication {
  id: string
  companyId: string
  contactedAt: string  // 'YYYY-MM-DD'
  fromName?: string
  content: string      // HTML from Lexical
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface MessageTemplate {
  id: string
  title: string
  content: string
  category?: string
  createdBy?: string
  createdAt: string
}

export interface SavedJob {
  id: string
  userId?: string
  candidateId?: string
  jobId: string
  customCategory: string
  createdAt: string
}
export type SavedJobInput = Omit<SavedJob, 'id' | 'createdAt'>

export interface UserProfile {
  id: string
  email?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type CompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
export type CandidateInput = Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
export type JobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
export type SelectionInput = Omit<CompanyCandidateSelection, 'id' | 'updatedAt'>
export type CandidateJobStatusInput = Omit<CandidateJobStatus, 'id' | 'updatedAt'>
export type AgentInput = Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type MessageTemplateInput = Omit<MessageTemplate, 'id' | 'createdAt'>
export type CompanyCommunicationInput = Omit<CompanyCommunication, 'id' | 'createdAt' | 'updatedAt'>
