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

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
  }))

  return NextResponse.json({ workspaces })
}