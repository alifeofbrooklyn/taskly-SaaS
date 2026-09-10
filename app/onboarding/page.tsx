'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      router.push(`/workspace/${data.workspace.slug}`)
    } catch (error) {
      console.error(error)
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">สร้าง Workspace แรกของคุณ</h1>
          <p className="text-slate-400 text-sm mt-2">
            Workspace คือพื้นที่ทำงานของทีมคุณ สามารถสร้างได้หลายอันในอนาคต
          </p>
        </div>

        {errorMessage && (
          <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
            ⚠️ {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300 mb-2">
            ชื่อ Workspace
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น ทีมการตลาด, บริษัทของฉัน"
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            autoFocus
          />

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
          >
            {isSubmitting ? 'กำลังสร้าง...' : 'สร้าง Workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}