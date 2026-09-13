import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/supabase-storage'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
  }

  const { id } = await params
  const task = await verifyTaskAccess(id, session.user.id)

  if (!task) {
    return NextResponse.json({ message: 'ไม่พบงานนี้' }, { status: 404 })
  }

  const attachments = await prisma.attachment.findMany({
    where: { taskId: id },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ attachments })
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
  const task = await verifyTaskAccess(id, session.user.id)

  if (!task) {
    return NextResponse.json({ message: 'ไม่พบงานนี้' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ message: 'กรุณาเลือกไฟล์' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: 'ไฟล์ต้องมีขนาดไม่เกิน 10 MB' }, { status: 400 })
  }

  try {
    const { fileUrl, storagePath } = await uploadFile(file, id)

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        taskId: id,
        uploadedById: session.user.id,
      },
    })

    // เก็บ storagePath ไว้ใน fileUrl หรือคอลัมน์แยกก็ได้ ในที่นี้ใช้ path จาก fileUrl ตอนลบ
    return NextResponse.json({ attachment, storagePath }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'อัปโหลดไฟล์ไม่สำเร็จ' }, { status: 500 })
  }
}