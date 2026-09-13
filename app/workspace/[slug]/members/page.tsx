import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import WorkspaceNavbar from '../workspace-navbar'
import MembersList from './members-list'

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const workspace = await getWorkspaceForUser(slug, session.user.id)

  if (!workspace) {
    notFound()
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="min-h-screen bg-slate-950">
      <WorkspaceNavbar
        workspaceName={workspace.name}
        slug={slug}
        user={session.user}
      />

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">สมาชิกในทีม</h1>
          <p className="text-slate-400 text-sm mb-6">
            จัดการสมาชิกใน {workspace.name}
          </p>

                       <MembersList
     slug={slug}
     currentUserId={session.user.id}
     currentUserRole={workspace.members[0]?.role || 'MEMBER'}
     initialMembers={JSON.parse(JSON.stringify(members))}
   />
        </div>
        
      </div>
    </div>
  )
}