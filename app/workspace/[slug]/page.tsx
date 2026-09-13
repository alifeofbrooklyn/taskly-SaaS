import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getWorkspaceForUser } from '@/lib/workspace'
import { prisma } from '@/lib/prisma'
import ProjectsGrid from './projects-grid'
import DashboardSummary from './dashboard-summary'
import WorkspaceNavbar from './workspace-navbar'

export default async function WorkspacePage({
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

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

    return (
    <div className="min-h-screen bg-slate-950">
      <WorkspaceNavbar
        workspaceName={workspace.name}
        slug={slug}
        user={session.user}
      />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
            <p className="text-slate-400 text-sm mt-1">ภาพรวมงานทั้งหมดในทีมของคุณ</p>
          </div>

          <DashboardSummary slug={slug} />

          <ProjectsGrid
            slug={slug}
            initialProjects={JSON.parse(JSON.stringify(projects))}
          />
        </div>
      </div>
    </div>
  )
}