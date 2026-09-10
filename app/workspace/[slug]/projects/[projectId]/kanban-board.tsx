'use client'

import { useState } from 'react'
import TaskModal from './task-modal'

type Member = { id: string; name: string | null; image: string | null }

type Task = {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  assignee: Member | null
}

const COLUMNS: { key: Task['status']; title: string; color: string }[] = [
  { key: 'TODO', title: 'To Do', color: 'bg-slate-600' },
  { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-600' },
  { key: 'IN_REVIEW', title: 'In Review', color: 'bg-yellow-600' },
  { key: 'DONE', title: 'Done', color: 'bg-green-600' },
]

const PRIORITY_STYLE: Record<Task['priority'], string> = {
  LOW: 'bg-slate-700 text-slate-300',
  MEDIUM: 'bg-blue-500/20 text-blue-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  LOW: 'ต่ำ',
  MEDIUM: 'ปานกลาง',
  HIGH: 'สูง',
  URGENT: 'ด่วนมาก',
}

export default function KanbanBoard({
  projectId,
  initialTasks,
  members,
}: {
  projectId: string
  initialTasks: Task[]
  members: Member[]
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // ฟอร์มสร้าง task ใหม่
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setTasks((prev) => [data.task, ...prev])
        setTitle('')
        setDescription('')
        setPriority('MEDIUM')
        setDueDate('')
        setAssigneeId('')
        setShowForm(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    const confirmed = window.confirm('ยืนยันที่จะลบงานนี้ใช่หรือไม่?')
    if (!confirmed) return

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDrop = async (newStatus: Task['status']) => {
    if (!draggedTaskId) return

    const task = tasks.find((t) => t.id === draggedTaskId)
    if (!task || task.status === newStatus) {
      setDraggedTaskId(null)
      return
    }

    // อัปเดต UI ทันที (Optimistic Update) ให้รู้สึกลื่นไหล
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTaskId ? { ...t, status: newStatus } : t))
    )
    setDraggedTaskId(null)

    // แล้วค่อยยิง API จริงตามหลัง
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error(error)
      // ถ้า error ให้ย้อนกลับสถานะเดิม
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer"
        >
          + งานใหม่
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">ชื่องาน</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">รายละเอียด (ไม่บังคับ)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

          <div>
            <label className="block text-sm text-slate-300 mb-1">Due Date (ไม่บังคับ)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">มอบหมายให้ (ไม่บังคับ)</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- ไม่ระบุ --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              {isSubmitting ? 'กำลังสร้าง...' : 'สร้างงาน'}
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

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
              className="bg-slate-900/50 rounded-xl p-3 min-h-[200px]"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-white text-sm font-medium">{col.title}</span>
                <span className="text-slate-500 text-xs ml-auto">{columnTasks.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {columnTasks.map((task) => (
                                    <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-slate-600 transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="text-white text-sm">{task.title}</p>
                                            <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_STYLE[task.priority]}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>

                      {task.dueDate && (
                        <span className="text-[10px] text-slate-500">
                          📅 {new Date(task.dueDate).toLocaleDateString('th-TH')}
                        </span>
                      )}
                    </div>

                    {task.assignee && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {task.assignee.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={task.assignee.image}
                            alt={task.assignee.name || ''}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">
                            {task.assignee.name?.charAt(0)}
                          </div>
                        )}
                        <span className="text-slate-400 text-xs">{task.assignee.name}</span>
                      </div>
                    )}
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center text-slate-600 text-xs py-6">
                    ลาก Task มาวางที่นี่
                  </div>
                )}
              </div>
            </div>
          )
        })}
            </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          }}
          onDelete={(id) => {
            setTasks((prev) => prev.filter((t) => t.id !== id))
          }}
        />
      )}
    </div>
  )
}