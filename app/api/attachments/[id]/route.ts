import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/supabase-storage'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { id } = await params

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: {
      task: {
        include: {
          project: {
            include: {
              workspace: {
                include: { members: { where: { userId: session.user.id } } },
              },
            },
          },
        },
      },
    },
  })

  if (!attachment || attachment.task.project.workspace.members.length === 0) {
    return NextResponse.json({ message: 'ไม่พบไฟล์นี้' }, { status: 404 })
  }

  // ดึง storage path จาก URL (ส่วนหลัง bucket name)
  const urlParts = attachment.fileUrl.split('/task-attachments/')
  const storagePath = urlParts[1]

  if (storagePath) {
    await deleteFile(storagePath)
  }

  await prisma.attachment.delete({ where: { id } })

  return NextResponse.json({ message: 'ลบไฟล์สำเร็จ' })
}