'use client'

import { useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  description: string | null
  color: string
  _count: { tasks: number }
}

export default function ProjectsGrid({
  slug,
  initialProjects,
}: {
  slug: string
  initialProjects: Project[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const colorOptions = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/workspaces/${slug}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      setProjects((prev) => [{ ...data.project, _count: { tasks: 0 } }, ...prev])
      setName('')
      setDescription('')
      setColor('#3b82f6')
      setShowForm(false)
    } catch (error) {
      console.error(error)
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('ยืนยันที่จะลบโปรเจกต์นี้ใช่หรือไม่? (Task ทั้งหมดจะถูกลบด้วย)')
    if (!confirmed) return

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-semibold">โปรเจกต์ ({projects.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer"
        >
          + โปรเจกต์ใหม่
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6"
        >
          {errorMessage && (
            <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
              ⚠️ {errorMessage}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">ชื่อโปรเจกต์</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">คำอธิบาย (ไม่บังคับ)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-slate-300 mb-2">สี</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${color === c ? 'scale-110 ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              {isSubmitting ? 'กำลังสร้าง...' : 'สร้างโปรเจกต์'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          ยังไม่มีโปรเจกต์ในทีมนี้ กดปุ่ม &quot;+ โปรเจกต์ใหม่&quot; เพื่อเริ่มต้น
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors relative group"
            >
              <Link href={`/workspace/${slug}/projects/${project.id}`}>
                <div
                  className="w-3 h-3 rounded-full mb-3"
                  style={{ backgroundColor: project.color }}
                />
                <h3 className="text-white font-medium mb-1">{project.name}</h3>
                {project.description && (
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                )}
                <p className="text-slate-500 text-xs">{project._count.tasks} tasks</p>
              </Link>

              <button
                onClick={() => handleDelete(project.id)}
                className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}