'use client'

import React from 'react'
import Link from 'next/link'

// Inline Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'gradient'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-white text-black hover:bg-gray-100',
      secondary: 'bg-gray-800 text-white hover:bg-gray-700',
      ghost: 'hover:bg-gray-800/50 text-white',
      gradient:
        'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25',
    }

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-10 px-5 text-sm',
      lg: 'h-12 px-8 text-base',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Icons
const ArrowRight = ({ className = '', size = 16 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const CheckCircle = ({ className = '' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const Menu = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const X = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

// Navigation Component
const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold text-lg">Taskly</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button type="button" variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button type="button" variant="default" size="sm">
                Get started free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              How it works
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-800/50">
              <Link href="/login">
                <Button type="button" variant="ghost" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/login">
                <Button type="button" variant="default" size="sm" className="w-full">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
})

Navigation.displayName = 'Navigation'

// Features data
const features = [
  {
    icon: '📋',
    title: 'Kanban Board',
    description: 'จัดการงานด้วย Kanban Board แบบ Drag & Drop ใช้งานง่าย มองเห็นภาพรวมงานทั้งหมด',
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    description: 'เชิญสมาชิกเข้าทีม กำหนดสิทธิ์ และทำงานร่วมกันได้แบบ Real-time',
  },
  {
    icon: '📊',
    title: 'Dashboard & Reports',
    description: 'ติดตามความคืบหน้าของโปรเจกต์ด้วย Dashboard และรายงานที่เข้าใจง่าย',
  },
  {
    icon: '🔔',
    title: 'Deadline Tracking',
    description: 'กำหนด Due Date และ Priority ให้แต่ละ Task ไม่พลาด Deadline อีกต่อไป',
  },
  {
    icon: '🗂️',
    title: 'Multiple Workspaces',
    description: 'สร้างหลาย Workspace แยกตามทีมหรือโปรเจกต์ จัดการได้อย่างเป็นระเบียบ',
  },
  {
    icon: '🔐',
    title: 'Secure & Private',
    description: 'ข้อมูลของคุณปลอดภัย Login ด้วย Google เข้าถึงได้เฉพาะสมาชิกในทีม',
  },
]

// Hero Component
const Hero = React.memo(() => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-32 pb-20">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
      `}</style>

      {/* Badge */}
      <aside className="animate-fadeIn mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
        <span className="text-xs text-blue-400">✨ Task Management สำหรับทีม</span>
        <Link href="/login" className="flex items-center gap-1 text-xs text-blue-400 hover:text-white transition-all">
          เริ่มใช้งานฟรี
          <ArrowRight size={12} />
        </Link>
      </aside>

      {/* Heading */}
      <h1
        className="animate-fadeIn text-4xl md:text-5xl lg:text-6xl font-semibold text-center max-w-3xl leading-tight mb-6"
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #ffffff, rgba(255,255,255,0.6))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.05em',
        }}
      >
        จัดการงานทีมของคุณ
        <br />
        ให้ง่ายกว่าที่เคย
      </h1>

      {/* Subtitle */}
      <p className="animate-fadeIn text-sm md:text-base text-center max-w-xl text-gray-400 mb-10">
        Taskly ช่วยให้ทีมของคุณจัดการงาน ติดตามความคืบหน้า
        <br />
        และส่งมอบโปรเจกต์ได้ตรงเวลาทุกครั้ง
      </p>

      {/* CTA Buttons */}
      <div className="animate-fadeIn flex items-center gap-4 mb-6">
        <Link href="/login">
          <Button type="button" variant="gradient" size="lg" className="rounded-xl">
            เริ่มใช้งานฟรี
            <ArrowRight size={16} />
          </Button>
        </Link>
        <Link href="#features">
          <Button type="button" variant="ghost" size="lg" className="rounded-xl border border-gray-700">
            ดูฟีเจอร์ทั้งหมด
          </Button>
        </Link>
      </div>

      {/* Social Proof */}
      <p className="text-xs text-gray-500 mb-16">
        ไม่ต้องใช้บัตรเครดิต • เริ่มใช้งานได้ทันที • ฟรีตลอดไป
      </p>

      {/* Dashboard Preview */}
      <div className="w-full max-w-5xl relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none rounded-xl" />
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/10">
          {/* Mock Dashboard Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="text-slate-500 text-xs ml-2">taskly.app/workspace/my-team</span>
          </div>

          {/* Mock Kanban Board */}
          <div className="p-6 flex gap-4 overflow-x-auto">
            {[
  { title: 'To Do', color: 'bg-slate-700', count: 3, tasks: [
    { title: 'ออกแบบ UI หน้า Login', progress: 20 },
    { title: 'เขียน API สำหรับ Task', progress: 0 },
    { title: 'ตั้งค่า Database', progress: 10 },
  ]},
  { title: 'In Progress', color: 'bg-blue-600', count: 2, tasks: [
    { title: 'พัฒนา Kanban Board', progress: 65 },
    { title: 'ทดสอบระบบ Auth', progress: 80 },
  ]},
  { title: 'In Review', color: 'bg-yellow-600', count: 1, tasks: [
    { title: 'Code Review PR #12', progress: 90 },
  ]},
  { title: 'Done', color: 'bg-green-600', count: 2, tasks: [
    { title: 'ตั้งค่า Next.js', progress: 100 },
    { title: 'เชื่อมต่อ Supabase', progress: 100 },
  ]},
].map((col) => (
  <div key={col.title} className="flex-shrink-0 w-56">
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-2 h-2 rounded-full ${col.color}`} />
      <span className="text-white text-xs font-medium">{col.title}</span>
      <span className="text-slate-500 text-xs ml-auto">{col.count}</span>
    </div>
    <div className="flex flex-col gap-2">
      {col.tasks.map((task) => (
        <div key={task.title} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
          <p className="text-slate-300 text-xs">{task.title}</p>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/50" />
            <div className="h-1 flex-1 bg-slate-700 rounded-full">
              <div
                className={`h-1 rounded-full ${col.color}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))}
          </div>
        </div>
      </div>
    </section>
  )
})

Hero.displayName = 'Hero'

// Features Section
const Features = React.memo(() => {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-semibold mb-4"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ทุกอย่างที่ทีมคุณต้องการ
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            ฟีเจอร์ครบครัน ออกแบบมาเพื่อให้ทีมทำงานได้อย่างมีประสิทธิภาพสูงสุด
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-white font-medium mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

Features.displayName = 'Features'

// CTA Section
const CTA = React.memo(() => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-semibold mb-4"
          style={{
            background: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          พร้อมเริ่มต้นแล้วหรือยัง?
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          เริ่มใช้งาน Taskly ฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link href="/login">
            <Button type="button" variant="gradient" size="lg" className="rounded-xl w-full sm:w-auto">
              เริ่มใช้งานฟรี
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          {['ฟรีตลอดไป', 'ไม่ต้องใช้บัตรเครดิต', 'ตั้งค่าใน 2 นาที'].map((item) => (
            <div key={item} className="flex items-center gap-1">
              <CheckCircle className="text-green-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

CTA.displayName = 'CTA'

// Footer
const Footer = React.memo(() => {
  return (
    <footer className="border-t border-gray-800/50 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">T</span>
          </div>
          <span className="text-white font-medium text-sm">Taskly</span>
        </div>
        <p className="text-gray-500 text-xs">
          © 2026 Taskly. All rights reserved.
        </p>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

// Main Component
export default function Component() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  )
}