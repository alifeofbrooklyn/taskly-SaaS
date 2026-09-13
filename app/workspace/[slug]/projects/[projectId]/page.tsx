import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import KanbanBoard from './kanban-board'
import Link from 'next/link'
import WorkspaceNavbar from '../../workspace-navbar'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>
}) {
  const { slug, projectId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

    const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: {
        include: {
          members: {
            where: { userId: session.user.id },
          },
        },
      },
    },
  })

  if (!project || project.workspace.members.length === 0) {
    notFound()
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // ดึงสมาชิกทั้งหมดใน workspace มาไว้ให้เลือกเป็น assignee
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId: project.workspaceId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

      return (
    <div className="min-h-screen bg-slate-950">
      <WorkspaceNavbar
        workspaceName={project.workspace.name}
        slug={slug}
        user={session.user}
      />

      <div className="p-6">
        <div className="mb-6">
          <Link
            href={`/workspace/${slug}`}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-3 transition-colors"
          >
            ← กลับไป {project.workspace.name}
          </Link>

          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-slate-400 text-sm">{project.description}</p>
          )}
        </div>

        <KanbanBoard
          projectId={projectId}
          initialTasks={JSON.parse(JSON.stringify(tasks))}
          members={workspaceMembers.map((m) => m.user)}
        />
      </div>
    </div>
  )
}