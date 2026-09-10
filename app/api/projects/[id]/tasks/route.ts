import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: {
        include: { members: { where: { userId } } },
      },
    },
  })

  if (!project || project.workspace.members.length === 0) {
    return null
  }

  return project
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { id } = await params
  const project = await verifyProjectAccess(id, session.user.id)

  if (!project) {
    return NextResponse.json({ message: 'ไม่พบโปรเจกต์นี้' }, { status: 404 })
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tasks })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { id } = await params
  const project = await verifyProjectAccess(id, session.user.id)

  if (!project) {
    return NextResponse.json({ message: 'ไม่พบโปรเจกต์นี้' }, { status: 404 })
  }

  const { title, description, priority, dueDate, assigneeId } = await request.json()

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ message: 'กรุณาระบุชื่องาน' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description || null,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      projectId: id,
      createdById: session.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json({ task }, { status: 201 })
}