import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug } from '@/lib/utils'

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
  }

  const { name } = await request.json()

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ message: 'กรุณาระบุชื่อ Workspace' }, { status: 400 })
  }

  const slug = generateUniqueSlug(name)

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      slug,
      members: {
        create: {
          userId: session.user.id,
          role: 'OWNER',
        },
      },
    },
  })

  return NextResponse.json({ workspace }, { status: 201 })
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId: session.user.id },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ workspaces })
}