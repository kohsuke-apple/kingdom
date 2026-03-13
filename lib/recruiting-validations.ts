import { z } from 'zod'

const optionalString = (max: number) => z.string().max(max).optional().or(z.literal(''))

export const companySchema = z.object({
  name: z.string().min(1).max(150),
  industry: optionalString(100),
  location: optionalString(120),
  memo: optionalString(4000),
  officialWebsite: z.string().url().optional().or(z.literal('')),
  businessDescription: optionalString(10000),
  transferCase: optionalString(10000),
  employeeIntroduction: optionalString(10000),
  isMyCompany: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  // RA管理フィールド
  companyNumber: optionalString(50),
  publishStatus: z.enum(['private', 'ra_only', 'ca_ra', 'published']).optional(),
  industries: z.array(z.string()).optional(),
  subIndustries: z.array(z.string()).optional(),
  recruitingJobTypes: optionalString(500),
  hiringType: z.enum(['new_grad', 'mid_career', 'both']).optional(),
  successFee: optionalString(200),
  recruitingStatus: z.enum(['active', 'fulfilled']).optional(),
  hiringDifficulty: z.enum(['A', 'B', 'C', 'D']).optional(),
  refundPolicy: optionalString(10000),
  documentStorageUrl: optionalString(1000),
  workLocation: optionalString(500),
  selectionFlow: optionalString(10000),
})

export const agentSchema = z.object({
  companyId: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: optionalString(30),
  career: optionalString(2000),
  mainArea: z.enum(['sales', 'engineer', 'other']).optional(),
  contactTool: optionalString(200),
  roleType: z.enum(['CA', 'RA', 'both']).default('both'),
  memo: optionalString(3000),
  royalPartnerCompanyId: z.string().uuid().optional().or(z.literal('')),
  createdBy: z.string().uuid().optional(),
})

export const jobSchema = z
  .object({
    companyId: z.string().uuid(),
    title: z.string().min(1).max(200),
    jobType: optionalString(100),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    status: z.enum(['open', 'closed']).default('open'),
    description: optionalString(10000),
    sourceMode: z.enum(['RA', 'HIRING']).optional(),
    createdBy: z.string().uuid().optional(),
    // ヘッダー・基本情報
    employmentType: optionalString(50),
    recruitType: optionalString(50),
    shareType: optionalString(50),
    noReprint: z.boolean().optional(),
    position: optionalString(100),
    jobLocation: optionalString(200),
    publishedAt: optionalString(20),
    sourceCompanyName: optionalString(200),
    salaryText: optionalString(200),
    monthlySalaryMin: z.number().int().nonnegative().optional(),
    monthlySalaryMax: z.number().int().nonnegative().optional(),
    bonusCount: z.number().int().nonnegative().optional(),
    // 企業情報
    companyFoundedYear: optionalString(20),
    companyPhase: optionalString(100),
    companyEmployeeCount: optionalString(100),
    companyAddress: optionalString(300),
    companyListingType: optionalString(50),
    companyAvgAge: optionalString(50),
    companyGenderRatio: optionalString(100),
    // 採用要件
    requiredConditions: optionalString(10000),
    rejectionReasons: optionalString(10000),
    highPassConditions: optionalString(10000),
    interviewRejectionReasons: optionalString(10000),
    // この求人の魅力
    visionText: optionalString(10000),
    businessText: optionalString(10000),
    // 求人概要
    businessContent: optionalString(10000),
    recruitBackground: optionalString(2000),
    plannedHeadcount: optionalString(200),
    prPoints: optionalString(10000),
    jobDetail: optionalString(10000),
    orgStructure: optionalString(2000),
    salaryDetail: optionalString(5000),
    workTimeDetail: optionalString(5000),
    holidayBenefits: optionalString(5000),
    smokingPolicy: optionalString(500),
    // 選考情報
    hasCasualInterview: optionalString(50),
    hasInfoSession: optionalString(50),
    hasAptitudeTest: optionalString(50),
    selectionFlow: optionalString(500),
    selectionNote: optionalString(2000),
    // 成約手数料
    successFeeAmount: z.number().int().nonnegative().optional(),
    successFeePoint: optionalString(100),
    paymentTerm: optionalString(200),
    refundPolicy: optionalString(5000),
    theoreticalSalaryNote: optionalString(5000),
    // 求人提供元
    sourceAgencyName: optionalString(200),
    sourceAgencyAddress: optionalString(300),
    sourceAgencyLicenseNo: optionalString(100),
  })
  .refine(
    v => v.salaryMin === undefined || v.salaryMax === undefined || v.salaryMin <= v.salaryMax,
    { message: 'salaryMin は salaryMax 以下である必要があります', path: ['salaryMin'] }
  )

export const workHistorySchema = z.object({
  companyName: z.string().max(200).default(''),
  employmentType: optionalString(50),
  period: optionalString(100),
  industry: optionalString(100),
  jobType: optionalString(100),
  salary: z.number().int().nonnegative().optional(),
})

export const candidateSchema = z.object({
  name: z.string().min(1).max(120),
  nameKana: optionalString(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: optionalString(30),
  gender: optionalString(20),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  location: optionalString(200),
  lastEducation: optionalString(100),
  graduatedSchool: optionalString(200),
  experienceCount: z.number().int().nonnegative().optional(),
  experienceJobTypes: optionalString(500),
  experienceIndustries: optionalString(500),
  currentSalary: z.number().int().nonnegative().optional(),
  workHistories: z.array(workHistorySchema).optional(),
  desiredLocation: optionalString(200),
  desiredSalary: z.number().int().nonnegative().optional(),
  desiredJobType: optionalString(100),
  recommendationText: optionalString(10000),
  resumeUrl: optionalString(1000),
  cvUrl: optionalString(1000),
  mainAgentId: optionalString(200),
  subAgentId: optionalString(200),
  memo: optionalString(4000),
  createdBy: z.string().uuid().optional(),
})

export const selectionSchema = z.object({
  companyId: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  stage: z.enum([
    'applied',
    'document_pass',
    'interview_1',
    'interview_2',
    'final',
    'offer',
    'hired',
    'rejected',
  ]),
  status: z.enum(['active', 'rejected', 'hired']).default('active'),
  createdBy: z.string().uuid().optional(),
})

export const candidateJobStatusSchema = z.object({
  candidateId: z.string().uuid(),
  jobId: z.string().uuid(),
  stage: z.enum([
    'applied',
    'document_pass',
    'interview_1',
    'interview_2',
    'final',
    'offer',
    'hired',
    'rejected',
  ]),
  memo: optionalString(3000),
  createdBy: z.string().uuid().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: optionalString(4000),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  relatedCompanyId: z.string().uuid().optional().or(z.literal('')),
  relatedCandidateId: z.string().uuid().optional().or(z.literal('')),
  assignedTo: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
  createdBy: z.string().uuid().optional(),
})

export const raTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  category: optionalString(100),
  createdBy: z.string().uuid().optional(),
})

export const caTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  category: optionalString(100),
  createdBy: z.string().uuid().optional(),
})

export const savedJobSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid().optional().or(z.literal('')),
  customCategory: z.string().min(1).max(100).default('未分類'),
})

export const companyCommunicationSchema = z.object({
  companyId: z.string().uuid(),
  contactedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fromName: optionalString(120),
  content: z.string().min(1).max(10000),
  createdBy: z.string().uuid().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>
export type JobFormData = z.infer<typeof jobSchema>
export type AgentFormData = z.infer<typeof agentSchema>
export type CandidateFormData = z.infer<typeof candidateSchema>
export type SelectionFormData = z.infer<typeof selectionSchema>
export type CandidateJobStatusFormData = z.infer<typeof candidateJobStatusSchema>
export type TaskFormData = z.infer<typeof taskSchema>
export type RaTemplateFormData = z.infer<typeof raTemplateSchema>
export type CaTemplateFormData = z.infer<typeof caTemplateSchema>
