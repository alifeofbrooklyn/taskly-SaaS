'use client'

import { useState } from 'react'

type Member = {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'เจ้าของ',
  ADMIN: 'ผู้ดูแล',
  MEMBER: 'สมาชิก',
}

const ROLE_STYLE: Record<string, string> = {
  OWNER: 'bg-yellow-500/15 text-yellow-400',
  ADMIN: 'bg-blue-500/15 text-blue-400',
  MEMBER: 'bg-slate-700 text-slate-400',
}

export default function MembersList({
  slug,
  currentUserId,
  currentUserRole,
  initialMembers,
}: {
  slug: string
  currentUserId: string
  currentUserRole: string
  initialMembers: Member[]
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/workspaces/${slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      setMembers((prev) => [...prev, data.member])
      setEmail('')
      setSuccessMessage('เพิ่มสมาชิกสำเร็จ!')
    } catch (error) {
      console.error(error)
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    const confirmed = window.confirm('ยืนยันที่จะลบสมาชิกคนนี้ออกจากทีมใช่หรือไม่?')
    if (!confirmed) return

    try {
      await fetch(`/api/workspaces/${slug}/members/${userId}`, { method: 'DELETE' })
      setMembers((prev) => prev.filter((m) => m.user.id !== userId))
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const handleChangeRole = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      const res = await fetch(`/api/workspaces/${slug}/members/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role: newRole } : m))
      )
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์')
    }
  }

  return (
    <div>
      {/* ฟอร์มเชิญสมาชิก */}
      <form
        onSubmit={handleInvite}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6"
      >
        <h3 className="text-white font-medium text-sm mb-3">เชิญสมาชิกใหม่</h3>

        {errorMessage && (
          <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-3">
            ⚠️ {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-2 mb-3">
            ✅ {successMessage}
          </p>
        )}

        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมลของสมาชิกที่ต้องการเชิญ"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? 'กำลังเชิญ...' : 'เชิญ'}
          </button>
        </div>

        <p className="text-slate-500 text-xs mt-2">
          ⓘ ผู้ที่จะถูกเชิญต้องเคยเข้าสู่ระบบ Taskly มาก่อนอย่างน้อย 1 ครั้ง
        </p>
      </form>

      {/* รายการสมาชิก */}
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              {member.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.user.image}
                  alt={member.user.name || ''}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {member.user.name?.charAt(0) || '?'}
                </div>
              )}

              <div>
                <p className="text-white text-sm font-medium">{member.user.name}</p>
                <p className="text-slate-500 text-xs">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full ${ROLE_STYLE[member.role]}`}>
                {ROLE_LABEL[member.role]}
              </span>

              {currentUserRole === 'OWNER' && member.role !== 'OWNER' && member.user.id !== currentUserId && (
                <>
                  {member.role === 'MEMBER' ? (
                    <button
                      onClick={() => handleChangeRole(member.user.id, 'ADMIN')}
                      className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer whitespace-nowrap"
                    >
                      เลื่อนเป็น Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChangeRole(member.user.id, 'MEMBER')}
                      className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer whitespace-nowrap"
                    >
                      ลดเป็น Member
                    </button>
                  )}

                  <button
                    onClick={() => handleRemove(member.user.id)}
                    className="text-slate-600 hover:text-red-400 text-xs cursor-pointer"
                  >
                    ลบ
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}