'use client'

import { useEffect, useState } from 'react'
import type { UserProfile } from '@/lib/types'
import { profileApi } from '@/lib/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    profileApi.get().then(p => { setProfile(p); setForm(p) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await profileApi.update(form)
      setProfile(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return <div className="p-8 text-slate-400 animate-pulse">加载中...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">个人档案</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-colors">
            编辑
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-white/5 text-slate-400 rounded-xl text-sm">
              取消
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-6 space-y-4">
        <ProfileField label="姓名" value={form.name} editing={editing} onChange={v => setForm(f => ({ ...f, name: v }))} />
        <ProfileField label="邮箱" value={form.email} editing={editing} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <ProfileField label="电话" value={form.phone} editing={editing} onChange={v => setForm(f => ({ ...f, phone: v }))} />
        <ProfileField label="所在地" value={form.location} editing={editing} onChange={v => setForm(f => ({ ...f, location: v }))} />
        <ProfileField label="LinkedIn" value={form.linkedin_url} editing={editing} onChange={v => setForm(f => ({ ...f, linkedin_url: v }))} />
        <ProfileField label="目标岗位" value={form.target_role} editing={editing} onChange={v => setForm(f => ({ ...f, target_role: v }))} />
        <ProfileField label="目标城市" value={form.target_location} editing={editing} onChange={v => setForm(f => ({ ...f, target_location: v }))} />
        <ProfileField label="自我介绍" value={form.bio} editing={editing} onChange={v => setForm(f => ({ ...f, bio: v }))} multiline />
      </div>
    </div>
  )
}

function ProfileField({
  label, value, editing, onChange, multiline
}: {
  label: string; value?: string | null; editing: boolean; onChange: (v: string) => void; multiline?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500 uppercase tracking-wider">{label}</label>
      {editing ? (
        multiline ? (
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
          />
        )
      ) : (
        <p className="text-sm text-slate-200">{value || <span className="text-slate-600">未填写</span>}</p>
      )}
    </div>
  )
}
