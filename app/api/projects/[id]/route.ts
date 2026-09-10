import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// เช็คว่า user มีสิทธิ์เข้าถึง project นี้ไหม (ผ่าน workspace membership)
async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: {
        include: {
          members: { where: { userId } },
        },
      },
    },
  })

  if (!project || project.workspace.members.length === 0) {
    return null
  }

  return project
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
  const project = await verifyProjectAccess(id, session.user.id)

  if (!project) {
    return NextResponse.json({ message: 'ไม่พบโปรเจกต์นี้' }, { status: 404 })
  }

  const { name, description, color } = await request.json()

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ message: 'กรุณาระบุชื่อโปรเจกต์' }, { status: 400 })
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description || null,
      color: color || project.color,
    },
  })

  return NextResponse.json({ project: updated })
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
  const project = await verifyProjectAccess(id, session.user.id)

  if (!project) {
    return NextResponse.json({ message: 'ไม่พบโปรเจกต์นี้' }, { status: 404 })
  }

  await prisma.project.delete({ where: { id } })

  return NextResponse.json({ message: 'ลบโปรเจกต์สำเร็จ' })
}