'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, Resume } from '@/lib/types'
import { agentApi, resumesApi } from '@/lib/api'

const QUICK_PROMPTS = [
  '帮我分析一下我的简历有哪些不足',
  '根据我的技能，推荐适合我的岗位类型',
  '帮我生成这周的求职行动计划',
  '给我出几道常见面试题',
]

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '你好！我是 JobPilot AI 助手 🚀\n\n我可以帮你：\n• 分析简历优化方向\n• 解释职位匹配原因\n• 生成面试练习题\n• 制定求职行动计划\n\n有什么可以帮助你的？' }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState<number | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    resumesApi.list().then(rs => {
      setResumes(rs)
      if (rs.length > 0) setSelectedResume(rs[0].id)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setStreaming(true)

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await agentApi.streamChat(apiMessages as ChatMessage[], selectedResume)

      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.token) {
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + data.token }
                return next
              })
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: '抱歉，AI 服务暂时不可用，请稍后重试。' }
        return next
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">AI 求职助手</h1>
            <p className="text-slate-400 text-xs mt-0.5">基于你的简历提供个性化建议</p>
          </div>
          {resumes.length > 0 && (
            <select
              value={selectedResume || ''}
              onChange={e => setSelectedResume(Number(e.target.value) || undefined)}
              className="bg-[#1a1d2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
            >
              <option value="">不选择简历</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name || r.filename}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-0.5">
                AI
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-sm'
                : 'bg-[#1a1d2e] text-slate-200 rounded-tl-sm border border-white/5'
            }`}>
              {msg.content || (streaming && i === messages.length - 1 ? <BlinkCursor /> : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 my-3">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="px-3 py-1.5 bg-[#1a1d2e] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white text-xs rounded-full transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder="输入问题，或选择上方快捷提示..."
          disabled={streaming}
          className="flex-1 bg-[#1a1d2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
          className="px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function BlinkCursor() {
  return <span className="inline-block w-0.5 h-4 bg-white/60 animate-pulse ml-0.5 align-middle" />
}
