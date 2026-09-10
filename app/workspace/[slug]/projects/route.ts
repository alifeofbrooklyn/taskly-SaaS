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

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ projects })
}

export async function POST(
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

  const { name, description, color } = await request.json()

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ message: 'กรุณาระบุชื่อโปรเจกต์' }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description || null,
      color: color || '#3b82f6',
      workspaceId: workspace.id,
    },
  })

  return NextResponse.json({ project }, { status: 201 })
}