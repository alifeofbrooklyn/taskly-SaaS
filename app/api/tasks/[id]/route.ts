import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function verifyTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          workspace: {
            include: { members: { where: { userId } } },
          },
        },
      },
    },
  })

  if (!task || task.project.workspace.members.length === 0) {
    return null
  }

  return task
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { id } = await params
  const existing = await verifyTaskAccess(id, session.user.id)

  if (!existing) {
    return NextResponse.json({ message: 'ไม่พบงานนี้' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, status, priority, dueDate, assigneeId } = body

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json({ task: updated })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { id } = await params
  const existing = await verifyTaskAccess(id, session.user.id)

  if (!existing) {
    return NextResponse.json({ message: 'ไม่พบงานนี้' }, { status: 404 })
  }

  await prisma.task.delete({ where: { id } })

  return NextResponse.json({ message: 'ลบงานสำเร็จ' })
}