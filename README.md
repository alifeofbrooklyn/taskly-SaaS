# 📋 Taskly — Task Management SaaS

ระบบจัดการงานสำหรับทีมแบบ SaaS (Software as a Service) รองรับหลาย Workspace แยกข้อมูลกันตามทีม (Multi-tenant Architecture) พัฒนาด้วย Next.js App Router เต็มรูปแบบ ตั้งแต่ระบบ Authentication, Kanban Board แบบ Drag & Drop, ไปจนถึง Deploy ขึ้นใช้งานจริงบน Vercel

🔗 **Live Demo:** [taskly-saa-s.vercel.app](https://taskly-saa-s.vercel.app)

## ✨ ฟีเจอร์หลัก

### 🔐 Authentication
- เข้าสู่ระบบด้วย Google OAuth ผ่าน Auth.js (NextAuth v5)
- Session จัดการผ่าน Prisma Adapter เชื่อมกับฐานข้อมูลโดยตรง

### 🏢 Multi-tenant Workspace
- ผู้ใช้สร้างและเข้าร่วมได้หลาย Workspace
- แยกข้อมูลของแต่ละทีมออกจากกันอย่างสมบูรณ์ ตรวจสอบสิทธิ์การเข้าถึงทุก request
- ระบบ Onboarding พาผู้ใช้ใหม่สร้าง Workspace แรกอัตโนมัติ

### 📁 Projects
- สร้าง/แก้ไข/ลบโปรเจกต์ในแต่ละ Workspace พร้อมเลือกสีประจำโปรเจกต์
- แสดงจำนวนงานในแต่ละโปรเจกต์แบบ Real-time

### 📌 Kanban Board
- จัดการ Task ด้วย Kanban Board 4 สถานะ (To Do, In Progress, In Review, Done)
- ลากวาง (Drag & Drop) ย้ายสถานะงานได้ทันที พร้อม Optimistic UI Update
- กำหนด Priority, Due Date, และมอบหมายงานให้สมาชิกในทีม (Assignee)
- Task Detail Modal แก้ไขรายละเอียดงานแบบเต็มรูปแบบ

### 📊 Dashboard สรุปข้อมูล
- ภาพรวมงานทั้งหมด, เปอร์เซ็นต์งานที่เสร็จแล้ว, งานที่เลยกำหนดส่ง
- รายการ "งานของฉัน" และ "งานใกล้ถึงกำหนดส่ง" เรียงตามความเร่งด่วน

### 🎨 UI/UX
- ออกแบบด้วย Tailwind CSS ธีมสีเข้ม (Dark Theme)
- Landing Page พร้อม Hero Section, Features, และ CTA
- Responsive รองรับทุกขนาดหน้าจอ

## 🛠️ เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, React Server Components |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Authentication | Auth.js (NextAuth v5), Google OAuth 2.0 |
| Deploy | Vercel |

## 📁 โครงสร้างโปรเจกต์

```
taskly/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts      # Auth.js handler
│   │   ├── workspaces/
│   │   │   ├── route.ts                     # List/Create workspace
│   │   │   └── [slug]/
│   │   │       ├── projects/route.ts        # List/Create projects
│   │   │       └── summary/route.ts         # Dashboard summary
│   │   ├── projects/[id]/
│   │   │   ├── route.ts                     # Update/Delete project
│   │   │   └── tasks/route.ts               # List/Create tasks
│   │   └── tasks/[id]/route.ts              # Update/Delete task
│   ├── workspace/[slug]/
│   │   ├── page.tsx                         # Workspace dashboard
│   │   ├── dashboard-summary.tsx
│   │   ├── projects-grid.tsx
│   │   └── projects/[projectId]/
│   │       ├── page.tsx                     # Kanban Board page
│   │       ├── kanban-board.tsx
│   │       └── task-modal.tsx
│   ├── dashboard/page.tsx                   # Redirect logic
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   └── layout.tsx
├── components/ui/
│   └── saas-template.tsx                    # Landing Page
├── lib/
│   ├── prisma.ts                            # Prisma Client singleton
│   ├── utils.ts                             # Slug generator
│   └── workspace.ts                         # Access control helper
├── auth.ts                                  # Auth.js config
├── prisma/
│   └── schema.prisma
└── types/
    └── next-auth.d.ts
```

## 🗄️ โครงสร้างฐานข้อมูล

| Model | รายละเอียด |
|---|---|
| `User` | ผู้ใช้งาน (จาก Google OAuth) |
| `Account` / `Session` | จัดการโดย Auth.js Prisma Adapter |
| `Workspace` | พื้นที่ทำงานของแต่ละทีม |
| `WorkspaceMember` | ความสัมพันธ์ User-Workspace พร้อม Role (Owner/Admin/Member) |
| `Project` | โปรเจกต์ภายใน Workspace |
| `Task` | งานแต่ละชิ้น พร้อม Status, Priority, Due Date, Assignee |

## 🚀 วิธีติดตั้งและรันโปรเจกต์

### สิ่งที่ต้องมีก่อน

- [Node.js](https://nodejs.org/) เวอร์ชัน 18 ขึ้นไป
- บัญชี [Supabase](https://supabase.com) (ฟรี)
- บัญชี [Google Cloud Console](https://console.cloud.google.com) สำหรับ OAuth

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/alifeofbrooklyn/taskly-SaaS.git
cd taskly-SaaS
npm install
```

### 2. ตั้งค่าฐานข้อมูล (Supabase)

1. สร้าง Project ใหม่บน Supabase
2. ไปที่ Settings → Database → Connection string
3. คัดลอก **Transaction pooler** (port 6543) และ **Direct connection** (port 5432)

### 3. ตั้งค่า Google OAuth

1. เข้า Google Cloud Console → สร้าง OAuth 2.0 Client ID
2. เพิ่ม Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 4. สร้างไฟล์ `.env`

```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

AUTH_SECRET="สร้างด้วยคำสั่ง npx auth secret"
AUTH_GOOGLE_ID="Client ID จาก Google Cloud Console"
AUTH_GOOGLE_SECRET="Client Secret จาก Google Cloud Console"
```

### 5. Push Database Schema และรันโปรเจกต์

```bash
npx prisma db push
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## 🌐 Deploy

โปรเจกต์นี้ deploy บน [Vercel](https://vercel.com) โดย:

1. เชื่อม GitHub repository กับ Vercel
2. เพิ่ม Environment Variables ทั้งหมดใน Vercel Project Settings
3. เพิ่ม `prisma generate && next build` ใน build script เพื่อป้องกัน Prisma Client cache ล้าสมัย
4. เพิ่ม Production URL ใน Google OAuth Authorized redirect URIs

## 📸 ตัวอย่างหน้าจอ
![alt text](image-4.png)
![alt text](image-5.png)
![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)

## 🔮 แนวทางพัฒนาต่อ

- เชิญสมาชิกเข้า Workspace ผ่านอีเมล
- ระบบแจ้งเตือนผ่าน Email เมื่อใกล้ถึง Due Date
- Real-time collaboration ด้วย WebSocket
- เพิ่ม Role-based Permission ให้ละเอียดขึ้น (Admin จัดการได้มากกว่า Member)
- รองรับ File Attachment ในแต่ละ Task

## 👤 ผู้พัฒนา

> ใส่ชื่อและช่องทางติดต่อของคุณตรงนี้ เช่น GitHub, LinkedIn, Email
yuenyong.work@gmail.com
https://github.com/alifeofbrooklyn