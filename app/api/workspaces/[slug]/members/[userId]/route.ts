import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { slug, userId } = await params
  const workspace = await getWorkspaceForUser(slug, session.user.id)

  if (!workspace) {
    return NextResponse.json({ message: 'ไม่พบ Workspace นี้' }, { status: 404 })
  }

  const currentUserRole = workspace.members[0]?.role

  // เฉพาะ OWNER และ ADMIN เท่านั้นที่ลบสมาชิกได้
  if (currentUserRole !== 'OWNER' && currentUserRole !== 'ADMIN') {
    return NextResponse.json(
      { message: 'คุณไม่มีสิทธิ์ลบสมาชิกออกจาก Workspace นี้' },
      { status: 403 }
    )
  }

  // ป้องกันไม่ให้ลบตัวเอง
  if (userId === session.user.id) {
    return NextResponse.json({ message: 'ไม่สามารถลบตัวเองออกจาก Workspace ได้' }, { status: 400 })
  }

  // เช็คว่าคนที่จะถูกลบเป็น OWNER ไหม
  const targetMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId,
      },
    },
  })

  if (targetMember?.role === 'OWNER') {
    return NextResponse.json({ message: 'ไม่สามารถลบเจ้าของ Workspace ได้' }, { status: 403 })
  }

  // ป้องกัน ADMIN ลบ ADMIN คนอื่น (เฉพาะ OWNER เท่านั้นที่ลบ ADMIN ได้)
  if (targetMember?.role === 'ADMIN' && currentUserRole !== 'OWNER') {
    return NextResponse.json({ message: 'เฉพาะเจ้าของ Workspace เท่านั้นที่ลบผู้ดูแลคนอื่นได้' }, { status: 403 })
  }

  await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId,
      },
    },
  })

  return NextResponse.json({ message: 'ลบสมาชิกสำเร็จ' })
}