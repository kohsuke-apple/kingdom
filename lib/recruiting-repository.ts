import { supabase } from '@/lib/supabase'
import type {
  Agent,
  AgentInput,
  Candidate,
  CandidateInput,
  CandidateJobStatus,
  CandidateJobStatusInput,
  Company,
  CompanyCandidateSelection,
  CompanyCommunication,
  CompanyCommunicationInput,
  CompanyInput,
  Job,
  JobInput,
  MessageTemplate,
  MessageTemplateInput,
  SavedJob,
  SavedJobInput,
  SelectionInput,
  Task,
  TaskInput,
  WorkHistory,
} from '@/types/recruiting'

type CompanyRow = {
  id: string
  name: string
  industry: string | null
  location: string | null
  memo: string | null
  official_website: string | null
  business_description: string | null
  transfer_case: string | null
  employee_introduction: string | null
  is_my_company: boolean | null
  created_by: string | null
  created_at: string
  updated_at: string
  // RA管理フィールド
  company_number: string | null
  publish_status: string | null
  industries: string[] | null
  sub_industries: string[] | null
  recruiting_job_types: string | null
  hiring_type: string | null
  success_fee: string | null
  recruiting_status: string | null
  hiring_difficulty: string | null
  refund_policy: string | null
  document_storage_url: string | null
  work_location: string | null
  selection_flow: string | null
}

type AgentRow = {
  id: string
  company_id: string | null
  name: string
  email: string | null
  phone: string | null
  career: string | null
  main_area: string | null
  contact_tool: string | null
  royal_partner_company_id: string | null
  role_type: Agent['roleType']
  memo: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

type JobRow = {
  id: string
  company_id: string
  title: string
  job_type: string | null
  salary_min: number | null
  salary_max: number | null
  status: 'open' | 'closed'
  description: string | null
  source_mode: 'RA' | 'HIRING' | null
  created_by: string | null
  created_at: string
  updated_at: string
  // 新規フィールド
  employment_type: string | null
  recruit_type: string | null
  share_type: string | null
  no_reprint: boolean | null
  position: string | null
  job_location: string | null
  published_at: string | null
  source_company_name: string | null
  salary_text: string | null
  monthly_salary_min: number | null
  monthly_salary_max: number | null
  bonus_count: number | null
  company_founded_year: string | null
  company_phase: string | null
  company_employee_count: string | null
  company_address: string | null
  company_listing_type: string | null
  company_avg_age: string | null
  company_gender_ratio: string | null
  required_conditions: string | null
  rejection_reasons: string | null
  high_pass_conditions: string | null
  interview_rejection_reasons: string | null
  vision_text: string | null
  business_text: string | null
  business_content: string | null
  recruit_background: string | null
  planned_headcount: string | null
  pr_points: string | null
  job_detail: string | null
  org_structure: string | null
  salary_detail: string | null
  work_time_detail: string | null
  holiday_benefits: string | null
  smoking_policy: string | null
  has_casual_interview: string | null
  has_info_session: string | null
  has_aptitude_test: string | null
  selection_flow: string | null
  selection_note: string | null
  success_fee_amount: number | null
  success_fee_point: string | null
  payment_term: string | null
  refund_policy: string | null
  theoretical_salary_note: string | null
  source_agency_name: string | null
  source_agency_address: string | null
  source_agency_license_no: string | null
  thumbnail_url: string | null
}

type CandidateRow = {
  id: string
  name: string
  name_kana: string | null
  email: string | null
  phone: string | null
  gender: string | null
  birth_date: string | null
  location: string | null
  last_education: string | null
  graduated_school: string | null
  experience_count: number | null
  experience_job_types: string | null
  experience_industries: string | null
  current_salary: number | null
  work_histories: WorkHistory[] | null
  desired_location: string | null
  desired_salary: number | null
  desired_job_type: string | null
  recommendation_text: string | null
  resume_url: string | null
  cv_url: string | null
  main_agent_id: string | null
  sub_agent_id: string | null
  memo: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

type SelectionRow = {
  id: string
  company_id: string
  job_id: string
  candidate_id: string
  stage: CompanyCandidateSelection['stage']
  status: CompanyCandidateSelection['status']
  created_by: string | null
  updated_at: string
}

type CandidateJobStatusRow = {
  id: string
  candidate_id: string
  job_id: string
  stage: CandidateJobStatus['stage']
  memo: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string
}

type TaskRow = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  related_company_id: string | null
  related_candidate_id: string | null
  assigned_to: string | null
  status: Task['status']
  created_by: string | null
  created_at: string
  updated_at: string
}

type CompanyCommunicationRow = {
  id: string
  company_id: string
  contacted_at: string
  from_name: string | null
  content: string
  created_by: string | null
  created_at: string
  updated_at: string
}

type MessageTemplateRow = {
  id: string
  title: string
  content: string
  category: string | null
  created_by: string | null
  created_at: string
}

type SavedJobRow = {
  id: string
  user_id: string | null
  candidate_id: string | null
  job_id: string
  custom_category: string
  created_at: string
}

const toCompany = (row: CompanyRow): Company => ({
  id: row.id,
  name: row.name,
  industry: row.industry ?? undefined,
  location: row.location ?? undefined,
  memo: row.memo ?? undefined,
  officialWebsite: row.official_website ?? undefined,
  businessDescription: row.business_description ?? undefined,
  transferCase: row.transfer_case ?? undefined,
  employeeIntroduction: row.employee_introduction ?? undefined,
  isMyCompany: row.is_my_company ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  companyNumber: row.company_number ?? undefined,
  publishStatus: (row.publish_status as Company['publishStatus']) ?? undefined,
  industries: row.industries ?? undefined,
  subIndustries: row.sub_industries ?? undefined,
  recruitingJobTypes: row.recruiting_job_types ?? undefined,
  hiringType: (row.hiring_type as Company['hiringType']) ?? undefined,
  successFee: row.success_fee ?? undefined,
  recruitingStatus: (row.recruiting_status as Company['recruitingStatus']) ?? undefined,
  hiringDifficulty: (row.hiring_difficulty as Company['hiringDifficulty']) ?? undefined,
  refundPolicy: row.refund_policy ?? undefined,
  documentStorageUrl: row.document_storage_url ?? undefined,
  workLocation: row.work_location ?? undefined,
  selectionFlow: row.selection_flow ?? undefined,
})

const toAgent = (row: AgentRow): Agent => ({
  id: row.id,
  companyId: row.company_id ?? undefined,
  name: row.name,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  career: row.career ?? undefined,
  mainArea: (row.main_area as Agent['mainArea']) ?? undefined,
  contactTool: row.contact_tool ?? undefined,
  royalPartnerCompanyId: row.royal_partner_company_id ?? undefined,
  roleType: row.role_type,
  memo: row.memo ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toJob = (row: JobRow): Job => ({
  id: row.id,
  companyId: row.company_id,
  title: row.title,
  jobType: row.job_type ?? undefined,
  salaryMin: row.salary_min ?? undefined,
  salaryMax: row.salary_max ?? undefined,
  status: row.status,
  description: row.description ?? undefined,
  sourceMode: row.source_mode ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  employmentType: row.employment_type ?? undefined,
  recruitType: row.recruit_type ?? undefined,
  shareType: row.share_type ?? undefined,
  noReprint: row.no_reprint ?? undefined,
  position: row.position ?? undefined,
  jobLocation: row.job_location ?? undefined,
  publishedAt: row.published_at ?? undefined,
  sourceCompanyName: row.source_company_name ?? undefined,
  salaryText: row.salary_text ?? undefined,
  monthlySalaryMin: row.monthly_salary_min ?? undefined,
  monthlySalaryMax: row.monthly_salary_max ?? undefined,
  bonusCount: row.bonus_count ?? undefined,
  companyFoundedYear: row.company_founded_year ?? undefined,
  companyPhase: row.company_phase ?? undefined,
  companyEmployeeCount: row.company_employee_count ?? undefined,
  companyAddress: row.company_address ?? undefined,
  companyListingType: row.company_listing_type ?? undefined,
  companyAvgAge: row.company_avg_age ?? undefined,
  companyGenderRatio: row.company_gender_ratio ?? undefined,
  requiredConditions: row.required_conditions ?? undefined,
  rejectionReasons: row.rejection_reasons ?? undefined,
  highPassConditions: row.high_pass_conditions ?? undefined,
  interviewRejectionReasons: row.interview_rejection_reasons ?? undefined,
  visionText: row.vision_text ?? undefined,
  businessText: row.business_text ?? undefined,
  businessContent: row.business_content ?? undefined,
  recruitBackground: row.recruit_background ?? undefined,
  plannedHeadcount: row.planned_headcount ?? undefined,
  prPoints: row.pr_points ?? undefined,
  jobDetail: row.job_detail ?? undefined,
  orgStructure: row.org_structure ?? undefined,
  salaryDetail: row.salary_detail ?? undefined,
  workTimeDetail: row.work_time_detail ?? undefined,
  holidayBenefits: row.holiday_benefits ?? undefined,
  smokingPolicy: row.smoking_policy ?? undefined,
  hasCasualInterview: row.has_casual_interview ?? undefined,
  hasInfoSession: row.has_info_session ?? undefined,
  hasAptitudeTest: row.has_aptitude_test ?? undefined,
  selectionFlow: row.selection_flow ?? undefined,
  selectionNote: row.selection_note ?? undefined,
  successFeeAmount: row.success_fee_amount ?? undefined,
  successFeePoint: row.success_fee_point ?? undefined,
  paymentTerm: row.payment_term ?? undefined,
  refundPolicy: row.refund_policy ?? undefined,
  theoreticalSalaryNote: row.theoretical_salary_note ?? undefined,
  sourceAgencyName: row.source_agency_name ?? undefined,
  sourceAgencyAddress: row.source_agency_address ?? undefined,
  sourceAgencyLicenseNo: row.source_agency_license_no ?? undefined,
  thumbnailUrl: row.thumbnail_url ?? undefined,
})

const toCandidate = (row: CandidateRow): Candidate => ({
  id: row.id,
  name: row.name,
  nameKana: row.name_kana ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  gender: row.gender ?? undefined,
  birthDate: row.birth_date ?? undefined,
  location: row.location ?? undefined,
  lastEducation: row.last_education ?? undefined,
  graduatedSchool: row.graduated_school ?? undefined,
  experienceCount: row.experience_count ?? undefined,
  experienceJobTypes: row.experience_job_types ?? undefined,
  experienceIndustries: row.experience_industries ?? undefined,
  currentSalary: row.current_salary ?? undefined,
  workHistories: row.work_histories ?? undefined,
  desiredLocation: row.desired_location ?? undefined,
  desiredSalary: row.desired_salary ?? undefined,
  desiredJobType: row.desired_job_type ?? undefined,
  recommendationText: row.recommendation_text ?? undefined,
  resumeUrl: row.resume_url ?? undefined,
  cvUrl: row.cv_url ?? undefined,
  mainAgentId: row.main_agent_id ?? undefined,
  subAgentId: row.sub_agent_id ?? undefined,
  memo: row.memo ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toSelection = (row: SelectionRow): CompanyCandidateSelection => ({
  id: row.id,
  companyId: row.company_id,
  jobId: row.job_id,
  candidateId: row.candidate_id,
  stage: row.stage,
  status: row.status,
  createdBy: row.created_by ?? undefined,
  updatedAt: row.updated_at,
})

const toCandidateJobStatus = (row: CandidateJobStatusRow): CandidateJobStatus => ({
  id: row.id,
  candidateId: row.candidate_id,
  jobId: row.job_id,
  stage: row.stage,
  memo: row.memo ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at,
})

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  dueDate: row.due_date ?? undefined,
  relatedCompanyId: row.related_company_id ?? undefined,
  relatedCandidateId: row.related_candidate_id ?? undefined,
  assignedTo: row.assigned_to ?? undefined,
  status: row.status,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toTemplate = (row: MessageTemplateRow): MessageTemplate => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
})

const toSavedJob = (row: SavedJobRow): SavedJob => ({
  id: row.id,
  userId: row.user_id ?? undefined,
  candidateId: row.candidate_id ?? undefined,
  jobId: row.job_id,
  customCategory: row.custom_category,
  createdAt: row.created_at,
})

const toCommunication = (row: CompanyCommunicationRow): CompanyCommunication => ({
  id: row.id,
  companyId: row.company_id,
  contactedAt: row.contacted_at,
  fromName: row.from_name ?? undefined,
  content: row.content,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const recruitingRepository = {
  async listCompanies(): Promise<Company[]> {
    const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as CompanyRow[]).map(toCompany)
  },

  async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toCompany(data as CompanyRow) : null
  },

  async createCompany(input: CompanyInput): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: input.name,
        industry: input.industry ?? null,
        location: input.location ?? null,
        memo: input.memo ?? null,
        official_website: input.officialWebsite ?? null,
        business_description: input.businessDescription ?? null,
        transfer_case: input.transferCase ?? null,
        employee_introduction: input.employeeIntroduction ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toCompany(data as CompanyRow)
  },

  async updateCompany(id: string, input: Partial<CompanyInput>): Promise<Company | null> {
    const payload: Record<string, unknown> = {}
    if (input.name !== undefined) payload.name = input.name
    if (input.industry !== undefined) payload.industry = input.industry ?? null
    if (input.location !== undefined) payload.location = input.location ?? null
    if (input.memo !== undefined) payload.memo = input.memo ?? null
    if (input.officialWebsite !== undefined) payload.official_website = input.officialWebsite ?? null
    if (input.businessDescription !== undefined) payload.business_description = input.businessDescription ?? null
    if (input.transferCase !== undefined) payload.transfer_case = input.transferCase ?? null
    if (input.employeeIntroduction !== undefined) payload.employee_introduction = input.employeeIntroduction ?? null
    if (input.isMyCompany !== undefined) payload.is_my_company = input.isMyCompany
    if (input.companyNumber !== undefined) payload.company_number = input.companyNumber ?? null
    if (input.publishStatus !== undefined) payload.publish_status = input.publishStatus ?? null
    if (input.industries !== undefined) payload.industries = input.industries ?? null
    if (input.subIndustries !== undefined) payload.sub_industries = input.subIndustries ?? null
    if (input.recruitingJobTypes !== undefined) payload.recruiting_job_types = input.recruitingJobTypes ?? null
    if (input.hiringType !== undefined) payload.hiring_type = input.hiringType ?? null
    if (input.successFee !== undefined) payload.success_fee = input.successFee ?? null
    if (input.recruitingStatus !== undefined) payload.recruiting_status = input.recruitingStatus ?? null
    if (input.hiringDifficulty !== undefined) payload.hiring_difficulty = input.hiringDifficulty ?? null
    if (input.refundPolicy !== undefined) payload.refund_policy = input.refundPolicy ?? null
    if (input.documentStorageUrl !== undefined) payload.document_storage_url = input.documentStorageUrl ?? null
    if (input.workLocation !== undefined) payload.work_location = input.workLocation ?? null
    if (input.selectionFlow !== undefined) payload.selection_flow = input.selectionFlow ?? null

    const { data, error } = await supabase.from('companies').update(payload).eq('id', id).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toCompany(data as CompanyRow) : null
  },

  async deleteCompany(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('companies').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async listAgents(companyId?: string): Promise<Agent[]> {
    let query = supabase.from('agents').select('*').order('updated_at', { ascending: false })
    if (companyId) query = query.eq('company_id', companyId)
    const { data, error } = await query
    if (error) {
      if (error.message.includes('column agents.company_id does not exist')) {
        const fallback = await supabase.from('agents').select('*').order('updated_at', { ascending: false })
        if (fallback.error) throw new Error(fallback.error.message)
        return (fallback.data as AgentRow[]).map(toAgent)
      }
      throw new Error(error.message)
    }
    return (data as AgentRow[]).map(toAgent)
  },

  async getAgent(id: string): Promise<Agent | null> {
    const { data, error } = await supabase.from('agents').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toAgent(data as AgentRow) : null
  },

  async createAgent(input: AgentInput): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert({
        company_id: input.companyId ?? null,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        career: input.career ?? null,
        main_area: input.mainArea ?? null,
        contact_tool: input.contactTool ?? null,
        royal_partner_company_id: input.royalPartnerCompanyId ?? null,
        role_type: input.roleType,
        memo: input.memo ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes('column "company_id" of relation "agents" does not exist')) {
        const fallback = await supabase
          .from('agents')
          .insert({
            name: input.name,
            email: input.email ?? null,
            role_type: input.roleType,
            memo: input.memo ?? null,
            created_by: input.createdBy ?? null,
          })
          .select()
          .single()
        if (fallback.error) throw new Error(fallback.error.message)
        return toAgent(fallback.data as AgentRow)
      }
      throw new Error(error.message)
    }
    return toAgent(data as AgentRow)
  },

  async updateAgent(id: string, input: Partial<AgentInput>): Promise<Agent | null> {
    const payload: Record<string, unknown> = {}
    if (input.companyId !== undefined) payload.company_id = input.companyId ?? null
    if (input.name !== undefined) payload.name = input.name
    if (input.email !== undefined) payload.email = input.email ?? null
    if (input.phone !== undefined) payload.phone = input.phone ?? null
    if (input.career !== undefined) payload.career = input.career ?? null
    if (input.mainArea !== undefined) payload.main_area = input.mainArea ?? null
    if (input.contactTool !== undefined) payload.contact_tool = input.contactTool ?? null
    if (input.royalPartnerCompanyId !== undefined) payload.royal_partner_company_id = input.royalPartnerCompanyId ?? null
    if (input.roleType !== undefined) payload.role_type = input.roleType
    if (input.memo !== undefined) payload.memo = input.memo ?? null

    const { data, error } = await supabase.from('agents').update(payload).eq('id', id).select().maybeSingle()
    if (error) {
      if (error.message.includes('column "company_id" of relation "agents" does not exist')) {
        const fallbackPayload = { ...payload }
        delete fallbackPayload.company_id
        const fallback = await supabase.from('agents').update(fallbackPayload).eq('id', id).select().maybeSingle()
        if (fallback.error) throw new Error(fallback.error.message)
        return fallback.data ? toAgent(fallback.data as AgentRow) : null
      }
      throw new Error(error.message)
    }
    return data ? toAgent(data as AgentRow) : null
  },

  async deleteAgent(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('agents').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async listJobs(filters?: {
    companyId?: string
    jobType?: string
    salaryMin?: number
    salaryMax?: number
    status?: 'open' | 'closed'
  }): Promise<Job[]> {
    let query = supabase.from('jobs').select('*')

    if (filters?.companyId) query = query.eq('company_id', filters.companyId)
    if (filters?.jobType) query = query.eq('job_type', filters.jobType)
    if (filters?.salaryMin !== undefined) query = query.gte('salary_max', filters.salaryMin)
    if (filters?.salaryMax !== undefined) query = query.lte('salary_min', filters.salaryMax)
    if (filters?.status) query = query.eq('status', filters.status)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as JobRow[]).map(toJob)
  },

  async getJob(id: string): Promise<Job | null> {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toJob(data as JobRow) : null
  },

  async createJob(input: JobInput): Promise<Job> {
    const payload = {
      company_id: input.companyId,
      title: input.title,
      job_type: input.jobType ?? null,
      salary_min: input.salaryMin ?? null,
      salary_max: input.salaryMax ?? null,
      status: input.status,
      description: input.description ?? null,
      source_mode: input.sourceMode ?? null,
      created_by: input.createdBy ?? null,
      thumbnail_url: input.thumbnailUrl ?? null,
    }
    const { data, error } = await supabase.from('jobs').insert(payload).select().single()
    if (error) {
      if (error.message.includes('column "source_mode" of relation "jobs" does not exist')) {
        const fallbackPayload = { ...(payload as Record<string, unknown>) }
        delete (fallbackPayload as Record<string, unknown>)['source_mode']
        const fallback = await supabase.from('jobs').insert(fallbackPayload).select().single()
        if (fallback.error) throw new Error(fallback.error.message)
        return toJob({ ...(fallback.data as JobRow), source_mode: null })
      }
      throw new Error(error.message)
    }
    return toJob(data as JobRow)
  },

  async updateJob(id: string, input: Partial<JobInput>): Promise<Job | null> {
    const payload: Record<string, unknown> = {}
    if (input.companyId !== undefined) payload.company_id = input.companyId
    if (input.title !== undefined) payload.title = input.title
    if (input.jobType !== undefined) payload.job_type = input.jobType ?? null
    if (input.salaryMin !== undefined) payload.salary_min = input.salaryMin ?? null
    if (input.salaryMax !== undefined) payload.salary_max = input.salaryMax ?? null
    if (input.status !== undefined) payload.status = input.status
    if (input.description !== undefined) payload.description = input.description ?? null
    if (input.sourceMode !== undefined) payload.source_mode = input.sourceMode ?? null
    // 新規フィールド
    if (input.employmentType !== undefined) payload.employment_type = input.employmentType ?? null
    if (input.recruitType !== undefined) payload.recruit_type = input.recruitType ?? null
    if (input.shareType !== undefined) payload.share_type = input.shareType ?? null
    if (input.noReprint !== undefined) payload.no_reprint = input.noReprint ?? null
    if (input.position !== undefined) payload.position = input.position ?? null
    if (input.jobLocation !== undefined) payload.job_location = input.jobLocation ?? null
    if (input.publishedAt !== undefined) payload.published_at = input.publishedAt ?? null
    if (input.sourceCompanyName !== undefined) payload.source_company_name = input.sourceCompanyName ?? null
    if (input.salaryText !== undefined) payload.salary_text = input.salaryText ?? null
    if (input.monthlySalaryMin !== undefined) payload.monthly_salary_min = input.monthlySalaryMin ?? null
    if (input.monthlySalaryMax !== undefined) payload.monthly_salary_max = input.monthlySalaryMax ?? null
    if (input.bonusCount !== undefined) payload.bonus_count = input.bonusCount ?? null
    if (input.companyFoundedYear !== undefined) payload.company_founded_year = input.companyFoundedYear ?? null
    if (input.companyPhase !== undefined) payload.company_phase = input.companyPhase ?? null
    if (input.companyEmployeeCount !== undefined) payload.company_employee_count = input.companyEmployeeCount ?? null
    if (input.companyAddress !== undefined) payload.company_address = input.companyAddress ?? null
    if (input.companyListingType !== undefined) payload.company_listing_type = input.companyListingType ?? null
    if (input.companyAvgAge !== undefined) payload.company_avg_age = input.companyAvgAge ?? null
    if (input.companyGenderRatio !== undefined) payload.company_gender_ratio = input.companyGenderRatio ?? null
    if (input.requiredConditions !== undefined) payload.required_conditions = input.requiredConditions ?? null
    if (input.rejectionReasons !== undefined) payload.rejection_reasons = input.rejectionReasons ?? null
    if (input.highPassConditions !== undefined) payload.high_pass_conditions = input.highPassConditions ?? null
    if (input.interviewRejectionReasons !== undefined) payload.interview_rejection_reasons = input.interviewRejectionReasons ?? null
    if (input.visionText !== undefined) payload.vision_text = input.visionText ?? null
    if (input.businessText !== undefined) payload.business_text = input.businessText ?? null
    if (input.businessContent !== undefined) payload.business_content = input.businessContent ?? null
    if (input.recruitBackground !== undefined) payload.recruit_background = input.recruitBackground ?? null
    if (input.plannedHeadcount !== undefined) payload.planned_headcount = input.plannedHeadcount ?? null
    if (input.prPoints !== undefined) payload.pr_points = input.prPoints ?? null
    if (input.jobDetail !== undefined) payload.job_detail = input.jobDetail ?? null
    if (input.orgStructure !== undefined) payload.org_structure = input.orgStructure ?? null
    if (input.salaryDetail !== undefined) payload.salary_detail = input.salaryDetail ?? null
    if (input.workTimeDetail !== undefined) payload.work_time_detail = input.workTimeDetail ?? null
    if (input.holidayBenefits !== undefined) payload.holiday_benefits = input.holidayBenefits ?? null
    if (input.smokingPolicy !== undefined) payload.smoking_policy = input.smokingPolicy ?? null
    if (input.hasCasualInterview !== undefined) payload.has_casual_interview = input.hasCasualInterview ?? null
    if (input.hasInfoSession !== undefined) payload.has_info_session = input.hasInfoSession ?? null
    if (input.hasAptitudeTest !== undefined) payload.has_aptitude_test = input.hasAptitudeTest ?? null
    if (input.selectionFlow !== undefined) payload.selection_flow = input.selectionFlow ?? null
    if (input.selectionNote !== undefined) payload.selection_note = input.selectionNote ?? null
    if (input.successFeeAmount !== undefined) payload.success_fee_amount = input.successFeeAmount ?? null
    if (input.successFeePoint !== undefined) payload.success_fee_point = input.successFeePoint ?? null
    if (input.paymentTerm !== undefined) payload.payment_term = input.paymentTerm ?? null
    if (input.refundPolicy !== undefined) payload.refund_policy = input.refundPolicy ?? null
    if (input.theoreticalSalaryNote !== undefined) payload.theoretical_salary_note = input.theoreticalSalaryNote ?? null
    if (input.sourceAgencyName !== undefined) payload.source_agency_name = input.sourceAgencyName ?? null
    if (input.sourceAgencyAddress !== undefined) payload.source_agency_address = input.sourceAgencyAddress ?? null
    if (input.sourceAgencyLicenseNo !== undefined) payload.source_agency_license_no = input.sourceAgencyLicenseNo ?? null
    if (input.thumbnailUrl !== undefined) payload.thumbnail_url = input.thumbnailUrl ?? null

    const { data, error } = await supabase.from('jobs').update(payload).eq('id', id).select().maybeSingle()
    if (error) {
      if (error.message.includes('column "source_mode" of relation "jobs" does not exist')) {
        const fallbackPayload = { ...(payload as Record<string, unknown>) }
        delete (fallbackPayload as Record<string, unknown>)['source_mode']
        const fallback = await supabase.from('jobs').update(fallbackPayload).eq('id', id).select().maybeSingle()
        if (fallback.error) throw new Error(fallback.error.message)
        return fallback.data ? toJob({ ...(fallback.data as JobRow), source_mode: null }) : null
      }
      throw new Error(error.message)
    }
    return data ? toJob(data as JobRow) : null
  },

  async deleteJob(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('jobs').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async listCandidates(): Promise<Candidate[]> {
    const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as CandidateRow[]).map(toCandidate)
  },

  async getCandidate(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase.from('candidates').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toCandidate(data as CandidateRow) : null
  },

  async createCandidate(input: CandidateInput): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        name: input.name,
        name_kana: input.nameKana ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        gender: input.gender ?? null,
        birth_date: input.birthDate ?? null,
        location: input.location ?? null,
        last_education: input.lastEducation ?? null,
        graduated_school: input.graduatedSchool ?? null,
        experience_count: input.experienceCount ?? null,
        experience_job_types: input.experienceJobTypes ?? null,
        experience_industries: input.experienceIndustries ?? null,
        current_salary: input.currentSalary ?? null,
        work_histories: input.workHistories ?? null,
        desired_location: input.desiredLocation ?? null,
        desired_salary: input.desiredSalary ?? null,
        desired_job_type: input.desiredJobType ?? null,
        recommendation_text: input.recommendationText ?? null,
        resume_url: input.resumeUrl ?? null,
        cv_url: input.cvUrl ?? null,
        main_agent_id: input.mainAgentId ?? null,
        sub_agent_id: input.subAgentId ?? null,
        memo: input.memo ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toCandidate(data as CandidateRow)
  },

  async updateCandidate(id: string, input: Partial<CandidateInput>): Promise<Candidate | null> {
    const payload: Record<string, unknown> = {}
    if (input.name !== undefined) payload.name = input.name
    if (input.nameKana !== undefined) payload.name_kana = input.nameKana ?? null
    if (input.email !== undefined) payload.email = input.email ?? null
    if (input.phone !== undefined) payload.phone = input.phone ?? null
    if (input.gender !== undefined) payload.gender = input.gender ?? null
    if (input.birthDate !== undefined) payload.birth_date = input.birthDate ?? null
    if (input.location !== undefined) payload.location = input.location ?? null
    if (input.lastEducation !== undefined) payload.last_education = input.lastEducation ?? null
    if (input.graduatedSchool !== undefined) payload.graduated_school = input.graduatedSchool ?? null
    if (input.experienceCount !== undefined) payload.experience_count = input.experienceCount ?? null
    if (input.experienceJobTypes !== undefined) payload.experience_job_types = input.experienceJobTypes ?? null
    if (input.experienceIndustries !== undefined) payload.experience_industries = input.experienceIndustries ?? null
    if (input.currentSalary !== undefined) payload.current_salary = input.currentSalary ?? null
    if (input.workHistories !== undefined) payload.work_histories = input.workHistories ?? null
    if (input.desiredLocation !== undefined) payload.desired_location = input.desiredLocation ?? null
    if (input.desiredSalary !== undefined) payload.desired_salary = input.desiredSalary ?? null
    if (input.desiredJobType !== undefined) payload.desired_job_type = input.desiredJobType ?? null
    if (input.recommendationText !== undefined) payload.recommendation_text = input.recommendationText ?? null
    if (input.resumeUrl !== undefined) payload.resume_url = input.resumeUrl ?? null
    if (input.cvUrl !== undefined) payload.cv_url = input.cvUrl ?? null
    if (input.mainAgentId !== undefined) payload.main_agent_id = input.mainAgentId ?? null
    if (input.subAgentId !== undefined) payload.sub_agent_id = input.subAgentId ?? null
    if (input.memo !== undefined) payload.memo = input.memo ?? null

    const { data, error } = await supabase.from('candidates').update(payload).eq('id', id).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toCandidate(data as CandidateRow) : null
  },

  async deleteCandidate(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('candidates').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async listSelectionsForJob(jobId: string): Promise<CompanyCandidateSelection[]> {
    const { data, error } = await supabase
      .from('company_candidate_selections')
      .select('*')
      .eq('job_id', jobId)
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as SelectionRow[]).map(toSelection)
  },

  async listSelections(scope: 'ra' | 'ca' = 'ra'): Promise<(CompanyCandidateSelection | CandidateJobStatus)[]> {
    if (scope === 'ca') {
      const { data, error } = await supabase.from('candidate_job_status').select('*').order('updated_at', { ascending: false })
      if (error) throw new Error(error.message)
      return (data as CandidateJobStatusRow[]).map(toCandidateJobStatus)
    }

    const { data, error } = await supabase
      .from('company_candidate_selections')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as SelectionRow[]).map(toSelection)
  },

  async createSelection(input: SelectionInput): Promise<CompanyCandidateSelection> {
    const { data, error } = await supabase
      .from('company_candidate_selections')
      .insert({
        company_id: input.companyId,
        job_id: input.jobId,
        candidate_id: input.candidateId,
        stage: input.stage,
        status: input.status,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toSelection(data as SelectionRow)
  },

  async updateSelection(id: string, input: Partial<SelectionInput>): Promise<CompanyCandidateSelection | null> {
    const payload: Record<string, unknown> = {}
    if (input.companyId !== undefined) payload.company_id = input.companyId
    if (input.jobId !== undefined) payload.job_id = input.jobId
    if (input.candidateId !== undefined) payload.candidate_id = input.candidateId
    if (input.stage !== undefined) payload.stage = input.stage
    if (input.status !== undefined) payload.status = input.status

    const { data, error } = await supabase
      .from('company_candidate_selections')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toSelection(data as SelectionRow) : null
  },

  async deleteSelection(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('company_candidate_selections').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async createCandidateJobStatus(input: CandidateJobStatusInput): Promise<CandidateJobStatus> {
    const { data, error } = await supabase
      .from('candidate_job_status')
      .insert({
        candidate_id: input.candidateId,
        job_id: input.jobId,
        stage: input.stage,
        memo: input.memo ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toCandidateJobStatus(data as CandidateJobStatusRow)
  },

  async updateCandidateJobStatus(id: string, input: Partial<CandidateJobStatusInput>): Promise<CandidateJobStatus | null> {
    const payload: Record<string, unknown> = {}
    if (input.candidateId !== undefined) payload.candidate_id = input.candidateId
    if (input.jobId !== undefined) payload.job_id = input.jobId
    if (input.stage !== undefined) payload.stage = input.stage
    if (input.memo !== undefined) payload.memo = input.memo ?? null

    const { data, error } = await supabase
      .from('candidate_job_status')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toCandidateJobStatus(data as CandidateJobStatusRow) : null
  },

  async deleteCandidateJobStatus(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('candidate_job_status').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async listTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as TaskRow[]).map(toTask)
  },

  async createTask(input: TaskInput): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        description: input.description ?? null,
        due_date: input.dueDate ?? null,
        related_company_id: input.relatedCompanyId ?? null,
        related_candidate_id: input.relatedCandidateId ?? null,
        assigned_to: input.assignedTo ?? null,
        status: input.status,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toTask(data as TaskRow)
  },

  async updateTask(id: string, input: Partial<TaskInput>): Promise<Task | null> {
    const payload: Record<string, unknown> = {}
    if (input.title !== undefined) payload.title = input.title
    if (input.description !== undefined) payload.description = input.description ?? null
    if (input.dueDate !== undefined) payload.due_date = input.dueDate ?? null
    if (input.relatedCompanyId !== undefined) payload.related_company_id = input.relatedCompanyId ?? null
    if (input.relatedCandidateId !== undefined) payload.related_candidate_id = input.relatedCandidateId ?? null
    if (input.assignedTo !== undefined) payload.assigned_to = input.assignedTo ?? null
    if (input.status !== undefined) payload.status = input.status

    const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toTask(data as TaskRow) : null
  },

  async deleteTask(id: string): Promise<boolean> {
    const { error, count } = await supabase.from('tasks').delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  async listTemplates(mode: 'ra' | 'ca'): Promise<MessageTemplate[]> {
    const table = mode === 'ra' ? 'ra_message_templates' : 'ca_message_templates'
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as MessageTemplateRow[]).map(toTemplate)
  },

  async createTemplate(mode: 'ra' | 'ca', input: MessageTemplateInput): Promise<MessageTemplate> {
    const table = mode === 'ra' ? 'ra_message_templates' : 'ca_message_templates'
    const { data, error } = await supabase
      .from(table)
      .insert({
        title: input.title,
        content: input.content,
        category: input.category ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toTemplate(data as MessageTemplateRow)
  },

  async updateTemplate(mode: 'ra' | 'ca', id: string, input: Partial<MessageTemplateInput>): Promise<MessageTemplate | null> {
    const table = mode === 'ra' ? 'ra_message_templates' : 'ca_message_templates'
    const payload: Record<string, unknown> = {}
    if (input.title !== undefined) payload.title = input.title
    if (input.content !== undefined) payload.content = input.content
    if (input.category !== undefined) payload.category = input.category ?? null

    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toTemplate(data as MessageTemplateRow) : null
  },

  async deleteTemplate(mode: 'ra' | 'ca', id: string): Promise<boolean> {
    const table = mode === 'ra' ? 'ra_message_templates' : 'ca_message_templates'
    const { error, count } = await supabase.from(table).delete({ count: 'exact' }).eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  // ─── company_candidate_selections by company ───────────────────

  async listSelectionsForCompany(companyId: string): Promise<CompanyCandidateSelection[]> {
    const { data, error } = await supabase
      .from('company_candidate_selections')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as SelectionRow[]).map(toSelection)
  },

  // ─── company_communications ────────────────────────────────────

  async listCompanyCommunications(companyId: string): Promise<CompanyCommunication[]> {
    const { data, error } = await supabase
      .from('company_communications')
      .select('*')
      .eq('company_id', companyId)
      .order('contacted_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as CompanyCommunicationRow[]).map(toCommunication)
  },

  async createCompanyCommunication(input: CompanyCommunicationInput): Promise<CompanyCommunication> {
    const { data, error } = await supabase
      .from('company_communications')
      .insert({
        company_id: input.companyId,
        contacted_at: input.contactedAt,
        from_name: input.fromName ?? null,
        content: input.content,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toCommunication(data as CompanyCommunicationRow)
  },

  async updateCompanyCommunication(
    id: string,
    input: Partial<CompanyCommunicationInput>,
  ): Promise<CompanyCommunication | null> {
    const payload: Record<string, unknown> = {}
    if (input.contactedAt !== undefined) payload.contacted_at = input.contactedAt
    if (input.fromName !== undefined) payload.from_name = input.fromName ?? null
    if (input.content !== undefined) payload.content = input.content

    const { data, error } = await supabase
      .from('company_communications')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toCommunication(data as CompanyCommunicationRow) : null
  },

  async deleteCompanyCommunication(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('company_communications')
      .delete({ count: 'exact' })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },

  // ─── saved_jobs ────────────────────────────────────────────────

  async listSavedJobs(): Promise<SavedJob[]> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as SavedJobRow[]).map(toSavedJob)
  },

  async createSavedJob(input: SavedJobInput): Promise<SavedJob> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({
        job_id: input.jobId,
        custom_category: input.customCategory,
        candidate_id: input.candidateId ?? null,
        user_id: input.userId ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toSavedJob(data as SavedJobRow)
  },

  async updateSavedJobCategory(id: string, customCategory: string): Promise<SavedJob | null> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .update({ custom_category: customCategory })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toSavedJob(data as SavedJobRow) : null
  },

  async deleteSavedJob(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('saved_jobs')
      .delete({ count: 'exact' })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },
}
