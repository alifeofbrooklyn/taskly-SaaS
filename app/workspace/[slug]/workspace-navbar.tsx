'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import WorkspaceSwitcher from './workspace-switcher'

type User = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export default function WorkspaceNavbar({
  workspaceName,
  slug,
  user,
}: {
  workspaceName: string
  slug: string
  user: User
}) {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/workspace/${slug}`} className="flex items-center">
            <Image
              src="/taskly-logo.png"
              alt="Taskly"
              width={36}
              height={36}
              className="rounded-lg"
              style={{ width: '36px', height: '36px' }}
            />
          </Link>
          <WorkspaceSwitcher currentSlug={slug} currentName={workspaceName} />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/workspace/${slug}/members`}
            className="text-slate-400 hover:text-white text-sm hidden sm:inline"
          >
            สมาชิก
          </Link>

          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || ''}
              className="w-8 h-8 rounded-full border border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              {user.name?.charAt(0) || '?'}
            </div>
          )}

          <span className="text-slate-400 text-sm hidden sm:inline">
            {user.name}
          </span>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  )
}