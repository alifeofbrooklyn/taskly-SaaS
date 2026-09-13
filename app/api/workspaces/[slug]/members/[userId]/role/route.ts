import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { slug, userId } = await params

  // เช็คว่าคนที่กดเป็น OWNER ของ workspace นี้จริงไหม (เฉพาะ OWNER เท่านั้นที่เปลี่ยน role คนอื่นได้)
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: { where: { userId: session.user.id } },
    },
  })

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ message: 'ไม่พบ Workspace นี้' }, { status: 404 })
  }

  if (workspace.members[0].role !== 'OWNER') {
    return NextResponse.json(
      { message: 'เฉพาะเจ้าของ Workspace เท่านั้นที่เปลี่ยนสิทธิ์สมาชิกได้' },
      { status: 403 }
    )
  }

  // ป้องกันไม่ให้เจ้าของลดสิทธิ์ตัวเอง
  if (userId === session.user.id) {
    return NextResponse.json({ message: 'ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้' }, { status: 400 })
  }

  const { role } = await request.json()

  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return NextResponse.json({ message: 'สิทธิ์ไม่ถูกต้อง' }, { status: 400 })
  }

  const updated = await prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId,
      },
    },
    data: { role },
  })

  return NextResponse.json({ member: updated })
}