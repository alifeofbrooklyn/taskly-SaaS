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

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ members })
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

  const { email } = await request.json()

  if (!email || email.trim().length === 0) {
    return NextResponse.json({ message: 'กรุณาระบุอีเมล' }, { status: 400 })
  }

  // หา user จากอีเมล — ต้องเคย login เข้าระบบมาก่อนอย่างน้อย 1 ครั้ง
  const targetUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })

  if (!targetUser) {
    return NextResponse.json(
      { message: 'ไม่พบผู้ใช้นี้ในระบบ ผู้ที่จะถูกเชิญต้องเคยเข้าสู่ระบบ Taskly มาก่อนอย่างน้อย 1 ครั้ง' },
      { status: 404 }
    )
  }

  // เช็คว่าเป็นสมาชิกอยู่แล้วหรือยัง
  const existing = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: targetUser.id,
      },
    },
  })

  if (existing) {
    return NextResponse.json({ message: 'ผู้ใช้นี้เป็นสมาชิกอยู่แล้ว' }, { status: 400 })
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: targetUser.id,
      role: 'MEMBER',
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  return NextResponse.json({ member }, { status: 201 })
}