'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type TaskWithProject = {
  id: string
  title: string
  dueDate: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  project: { id: string; name: string; color: string }
  assignee: { id: string; name: string | null; image: string | null } | null
}

type Summary = {
  totalTasks: number
  doneTasks: number
  overdueCount: number
  myTasks: TaskWithProject[]
  upcomingTasks: TaskWithProject[]
}

const PRIORITY_STYLE: Record<string, string> = {
  LOW: 'bg-slate-700 text-slate-300',
  MEDIUM: 'bg-blue-500/20 text-blue-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

export default function DashboardSummary({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${slug}/summary`)
      const data = await res.json()
      setSummary(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary()
  }, [fetchSummary])

  if (isLoading) {
    return <p className="text-slate-500 text-sm mb-8">กำลังโหลดข้อมูลสรุป...</p>
  }

  if (!summary) return null

  const completionRate =
    summary.totalTasks > 0
      ? Math.round((summary.doneTasks / summary.totalTasks) * 100)
      : 0

  return (
    <div className="mb-10">
      {/* การ์ดสรุป */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">งานทั้งหมด</p>
          <p className="text-2xl font-bold text-white">{summary.totalTasks}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">เสร็จแล้ว</p>
          <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">งานของฉัน</p>
          <p className="text-2xl font-bold text-blue-400">{summary.myTasks.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-xs mb-1">เลยกำหนด</p>
          <p className={`text-2xl font-bold ${summary.overdueCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {summary.overdueCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* งานของฉัน */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium text-sm mb-4">📌 งานของฉัน</h3>
          {summary.myTasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">ไม่มีงานที่มอบหมายให้คุณ 🎉</p>
          ) : (
            <div className="space-y-2">
              {summary.myTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/workspace/${slug}/projects/${task.project.id}`}
                  className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <span className="text-white text-sm truncate">{task.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_STYLE[task.priority]}`}>
                    {task.priority}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

                {/* งานใกล้ deadline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium text-sm mb-4">⏰ ใกล้ถึงกำหนดส่ง</h3>
          {summary.upcomingTasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">ไม่มีงานที่ใกล้ครบกำหนด</p>
          ) : (
            <div className="space-y-2">
              {summary.upcomingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/workspace/${slug}/projects/${task.project.id}`}
                  className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <span className="text-white text-sm truncate">{task.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.assignee && (
                      task.assignee.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={task.assignee.image}
                          alt={task.assignee.name || ''}
                          className="w-5 h-5 rounded-full"
                          title={task.assignee.name || ''}
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]"
                          title={task.assignee.name || ''}
                        >
                          {task.assignee.name?.charAt(0)}
                        </div>
                      )
                    )}
                    <span className="text-slate-400 text-xs">
                      {task.dueDate && new Date(task.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}