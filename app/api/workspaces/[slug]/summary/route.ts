import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { slug } = await params
  const workspace = await getWorkspaceForUser(slug, session.user.id)

  if (!workspace) {
    return NextResponse.json({ message: 'ไม่พบ Workspace นี้' }, { status: 404 })
  }

  // ดึงงานทั้งหมดในทุกโปรเจกต์ของ workspace นี้
  const allTasks = await prisma.task.findMany({
    where: {
      project: { workspaceId: workspace.id },
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true, image: true } },
    },
  })

  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter((t) => t.status === 'DONE').length

  // งานของฉัน (ที่ยังไม่เสร็จ)
  const myTasks = allTasks
    .filter((t) => t.assigneeId === session.user.id && t.status !== 'DONE')
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5)

  // งานใกล้ deadline ทั้งหมด (ยังไม่เสร็จ มี due date และยังไม่เลยกำหนด)
  const now = new Date()
  const upcomingTasks = allTasks
    .filter((t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  // งานที่เลยกำหนดแล้ว (overdue)
  const overdueCount = allTasks.filter(
    (t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < now
  ).length

  return NextResponse.json({
    totalTasks,
    doneTasks,
    overdueCount,
    myTasks,
    upcomingTasks,
  })
}