const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10320'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `HTTP ${res.status}`)
  }
  return res.json()
}

// Jobs
export const jobsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<import('./types').JobListResponse>(`/jobs${qs}`)
  },
  get: (id: number) => request<import('./types').Job>(`/jobs/${id}`),
}

// Resumes
export const resumesApi = {
  list: () => request<import('./types').Resume[]>('/resumes'),
  get: (id: number) => request<import('./types').Resume>(`/resumes/${id}`),
  upload: (file: File, targetRole?: string) => {
    const form = new FormData()
    form.append('file', file)
    if (targetRole) form.append('target_role', targetRole)
    return request<import('./types').Resume>('/resumes', {
      method: 'POST',
      body: form,
      headers: {},
    })
  },
  visualize: (id: number) => request<import('./types').VisualizeData>(`/resumes/${id}/visualize`),
}

// Profile
export const profileApi = {
  get: () => request<import('./types').UserProfile>('/profile'),
  update: (data: Partial<import('./types').UserProfile>) =>
    request<import('./types').UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

// Applications
export const applicationsApi = {
  list: () => request<import('./types').Application[]>('/applications'),
  create: (jobId: number, resumeId?: number) =>
    request('/applications', { method: 'POST', body: JSON.stringify({ job_id: jobId, resume_id: resumeId }) }),
  updateStatus: (id: number, status: string) =>
    request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// Agent
export const agentApi = {
  streamChat: (messages: import('./types').ChatMessage[], resumeId?: number, jobId?: number) => {
    return fetch(`${BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, resume_id: resumeId, job_id: jobId }),
    })
  },
  analyzeResume: (resumeId: number, jobId?: number) =>
    request<import('./types').AnalyzeResumeResponse>('/agent/analyze-resume', {
      method: 'POST',
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
    }),
}
