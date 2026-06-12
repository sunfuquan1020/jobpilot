export interface Job {
  id: number
  title: string
  company: string
  company_logo: string | null
  location: string
  job_type: string
  experience_level: string
  salary_min: number | null
  salary_max: number | null
  description: string
  requirements: string | null
  skills: string[]
  h1b_sponsor: boolean
  remote: boolean
  source: string
  apply_url: string | null
  posted_at: string
  match_score: number | null
}

export interface JobListResponse {
  jobs: Job[]
  total: number
  page: number
  page_size: number
}

export interface EducationItem {
  school: string
  degree: string | null
  field: string | null
  start_year: number | null
  start_month: number | null
  end_year: number | null
  end_month: number | null
}

export interface ExperienceItem {
  company: string
  title: string
  start_year: number | null
  start_month: number | null
  end_year: number | null
  end_month: number | null
  is_current: boolean
  description: string | null
  type: string
}

export interface Resume {
  id: number
  filename: string
  target_role: string | null
  status: string
  name: string | null
  email: string | null
  phone: string | null
  location: string | null
  summary: string | null
  skills: string[] | null
  education: EducationItem[] | null
  experience: ExperienceItem[] | null
  score_overall: number | null
  score_completeness: number | null
  score_quantification: number | null
  score_keywords: number | null
  score_format: number | null
  created_at: string
}

export interface TimelineItem {
  label: string
  sublabel: string
  category: string
  color: string
  start_year: number | null
  start_month: number
  end_year: number | null
  end_month: number
  is_current?: boolean
}

export interface SkillBubble {
  name: string
  value: number
  category: string
}

export interface SkillMatrixItem {
  skill: string
  level: string
  level_index: number
  category: string
}

export interface ExperienceTreeItem {
  name: string
  children?: ExperienceTreeLeaf[]
}

export interface ExperienceTreeLeaf {
  name: string
  value: number
  title: string
  description: string
}

export interface VisualizeData {
  timeline: TimelineItem[]
  skill_bubbles: SkillBubble[]
  skill_matrix: SkillMatrixItem[]
  experience_tree: ExperienceTreeItem[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentSuggestion {
  type: string
  title: string
  content: string
  priority: string
}

export interface AnalyzeResumeResponse {
  overall_assessment: string
  suggestions: AgentSuggestion[]
  match_summary: string | null
}

export interface Application {
  id: number
  status: string
  notes: string | null
  applied_at: string
  resume_id: number | null
  job: {
    id: number
    title: string
    company: string
    location: string
    job_type: string
    salary_min: number | null
    salary_max: number | null
  }
}

export interface UserProfile {
  id: number
  name: string
  email: string
  location: string | null
  phone: string | null
  linkedin_url: string | null
  target_role: string | null
  target_location: string | null
  bio: string | null
}
