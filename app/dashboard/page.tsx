import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardRedirect() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!membership) {
    redirect('/onboarding')
  }

  redirect(`/workspace/${membership.workspace.slug}`)
}