'use client'

import { useState, useEffect, useCallback } from 'react'

type Member = { id: string; name: string | null; image: string | null }

type Task = {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  assignee: Member | null
  assigneeId?: string | null
}

type Attachment = {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: { name: string | null }
  createdAt: string
}

export default function TaskModal({
  task,
  members,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task
  members: Member[]
  onClose: () => void
  onUpdate: (updated: Task) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split('T')[0] : ''
  )
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id || '')
  const [isSaving, setIsSaving] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(true)

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/attachments`)
      const data = await res.json()
      setAttachments(data.attachments || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingAttachments(false)
    }
  }, [task.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAttachments()
  }, [fetchAttachments])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setAttachments((prev) => [data.attachment, ...prev])
      } else {
        alert(data.message || 'อัปโหลดไม่สำเร็จ')
      }
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    const confirmed = window.confirm('ยืนยันที่จะลบไฟล์นี้ใช่หรือไม่?')
    if (!confirmed) return

    try {
      await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' })
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    } catch (error) {
      console.error(error)
    }
  }

  // ปิด modal ด้วยปุ่ม ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        onUpdate(data.task)
        onClose()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('ยืนยันที่จะลบงานนี้ใช่หรือไม่?')
    if (!confirmed) return

    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      onDelete(task.id)
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-white font-semibold">รายละเอียดงาน</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">ชื่องาน</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">รายละเอียด</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="เพิ่มรายละเอียดเกี่ยวกับงานนี้..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">ต่ำ</option>
                <option value="MEDIUM">ปานกลาง</option>
                <option value="HIGH">สูง</option>
                <option value="URGENT">ด่วนมาก</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">มอบหมายให้</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- ไม่ระบุ --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ไฟล์แนบ */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              ไฟล์แนบ {attachments.length > 0 && `(${attachments.length})`}
            </label>

            {/* รายการไฟล์แนบ - แสดงก่อนปุ่มอัปโหลด */}
            {isLoadingAttachments ? (
              <div className="flex items-center justify-center py-6">
                <svg className="animate-spin h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            ) : attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 min-w-0"
                  >
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 text-blue-400 hover:underline text-sm flex-1"
                    >
                      <span className="shrink-0">📄</span>
                      <span className="truncate">{att.fileName}</span>
                    </a>
                    <button
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="text-slate-600 hover:text-red-400 cursor-pointer text-xs shrink-0 ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {/* ปุ่มอัปโหลด - อยู่ล่างสุด */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 transition-colors text-sm text-slate-400">
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  กำลังอัปโหลด...
                </>
              ) : (
                '📎 คลิกเพื่อแนบไฟล์ (สูงสุด 10 MB)'
              )}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center p-5 border-t border-slate-800">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm cursor-pointer"
          >
            ลบงานนี้
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm cursor-pointer"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}