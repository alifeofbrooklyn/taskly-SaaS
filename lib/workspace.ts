import { prisma } from '@/lib/prisma'

export async function getWorkspaceForUser(slug: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId },
      },
    },
  })

  if (!workspace || workspace.members.length === 0) {
    return null
  }

  return workspace
}