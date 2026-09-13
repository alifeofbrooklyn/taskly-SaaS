'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type WorkspaceOption = {
  id: string
  name: string
  slug: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
}
const ROLE_LABEL: Record<string, string> = {
  OWNER: 'เจ้าของ',
  ADMIN: 'ผู้ดูแล',
  MEMBER: 'สมาชิก',
}

const ROLE_STYLE: Record<string, string> = {
  OWNER: 'bg-yellow-500/15 text-yellow-400',
  ADMIN: 'bg-blue-500/15 text-blue-400',
  MEMBER: 'bg-slate-700 text-slate-400',
}

export default function WorkspaceSwitcher({
  currentSlug,
  currentName,
}: {
  currentSlug: string
  currentName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/workspaces')
      const data = await res.json()
      setWorkspaces(data.workspaces || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleToggle = () => {
    if (!isOpen) {
      fetchWorkspaces()
    }
    setIsOpen(!isOpen)
  }

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-white font-medium text-sm hover:text-slate-300 transition-colors cursor-pointer"
      >
        {currentName}
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50">
          <p className="px-3 pb-2 text-slate-500 text-xs uppercase tracking-wide">
            Workspace ของฉัน
          </p>

          {isLoading ? (
            <div className="px-3 py-4 text-center">
              <svg className="animate-spin h-4 w-4 text-slate-500 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
                            {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspace/${ws.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 mx-1 rounded-lg text-sm transition-colors ${
                    ws.slug === currentSlug
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate flex-1">{ws.name}</span>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${ROLE_STYLE[ws.role]}`}>
                    {ROLE_LABEL[ws.role]}
                  </span>

                  {ws.slug === currentSlug && (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800 mt-2 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/onboarding')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 mx-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
              style={{ width: 'calc(100% - 8px)' }}
            >
              <span className="text-base leading-none">+</span> สร้าง Workspace ใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  )
}