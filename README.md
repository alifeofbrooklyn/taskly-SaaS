# 📋 Taskly — Task Management SaaS

ระบบจัดการงานสำหรับทีมแบบ SaaS (Software as a Service) รองรับหลาย Workspace แยกข้อมูลกันตามทีม (Multi-tenant Architecture) พัฒนาด้วย Next.js App Router เต็มรูปแบบ ตั้งแต่ระบบ Authentication, การจัดการสิทธิ์แบบ Role-Based Access Control, Kanban Board แบบ Drag & Drop, ไฟล์แนบ, ไปจนถึง Deploy ขึ้นใช้งานจริงบน Vercel

🔗 **Live Demo:** [taskly-saa-s.vercel.app](https://taskly-saa-s.vercel.app)

## ✨ ฟีเจอร์หลัก

### 🔐 Authentication
- เข้าสู่ระบบด้วย Google OAuth ผ่าน Auth.js (NextAuth v5)
- Session จัดการผ่าน Prisma Adapter เชื่อมกับฐานข้อมูลโดยตรง
- Navbar แสดงข้อมูลผู้ใช้และปุ่มออกจากระบบในทุกหน้า

### 🏢 Multi-tenant Workspace
- ผู้ใช้สร้างและเข้าร่วมได้หลาย Workspace พร้อมกัน
- แยกข้อมูลของแต่ละทีมออกจากกันอย่างสมบูรณ์ ตรวจสอบสิทธิ์การเข้าถึงทุก request
- **Workspace Switcher** — สลับไปมาระหว่าง Workspace ที่เป็นสมาชิกอยู่ได้จาก Dropdown ใน Navbar
- ระบบ Onboarding พาผู้ใช้ใหม่สร้าง Workspace แรกอัตโนมัติ

### 👥 การจัดการสมาชิกและสิทธิ์ (Role-Based Access Control)
ระบบสิทธิ์ 3 ระดับ ตรวจสอบทุก API endpoint:

| การกระทำ | Owner | Admin | Member |
|---|:---:|:---:|:---:|
| เชิญสมาชิกใหม่ | ✅ | ✅ | ✅ |
| ลบสมาชิกทั่วไป | ✅ | ✅ | ❌ |
| ลบผู้ดูแล (Admin) คนอื่น | ✅ | ❌ | ❌ |
| เลื่อน/ลดตำแหน่งเป็น Admin | ✅ | ❌ | ❌ |
| ลบเจ้าของ Workspace | ❌ | ❌ | ❌ |

- เจ้าของ Workspace เลื่อนสมาชิกขึ้นเป็นผู้ดูแล (Admin) หรือลดกลับเป็นสมาชิกได้
- ป้องกันตัวเองไม่ให้ลบ/ลดสิทธิ์ตัวเองโดยไม่ตั้งใจ

### 📁 Projects
- สร้าง/แก้ไข/ลบโปรเจกต์ในแต่ละ Workspace พร้อมเลือกสีประจำโปรเจกต์
- แสดงจำนวนงานในแต่ละโปรเจกต์แบบ Real-time

### 📌 Kanban Board
- จัดการ Task ด้วย Kanban Board 4 สถานะ (To Do, In Progress, In Review, Done)
- ลากวาง (Drag & Drop) ย้ายสถานะงานได้ทันที พร้อม Optimistic UI Update
- กำหนด Priority, Due Date, และมอบหมายงานให้สมาชิกในทีม (Assignee)
- Task Detail Modal แก้ไขรายละเอียดงานแบบเต็มรูปแบบ

### 📎 ไฟล์แนบ (File Attachments)
- แนบไฟล์เข้ากับ Task ได้โดยตรง (จำกัดขนาดไม่เกิน 10 MB ต่อไฟล์)
- จัดเก็บไฟล์จริงบน Supabase Storage แยกจาก Database
- แสดงผลแบบ Grid 2 คอลัมน์ พร้อม Loading Spinner ระหว่างโหลด/อัปโหลด
- เปิดดู/ดาวน์โหลดไฟล์ในแท็บใหม่ และลบไฟล์ได้ทันที

### 📊 Dashboard สรุปข้อมูล
- ภาพรวมงานทั้งหมด, เปอร์เซ็นต์งานที่เสร็จแล้ว, งานที่เลยกำหนดส่ง
- รายการ "งานของฉัน" เรียงตามความเร่งด่วน
- รายการ "งานใกล้ถึงกำหนดส่ง" (ภายใน 7 วัน) ของทั้งทีม พร้อมแสดงรูป/ชื่อผู้รับผิดชอบ

### 🎨 UI/UX
- ออกแบบด้วย Tailwind CSS ธีมสีเข้ม (Dark Theme)
- Landing Page พร้อม Hero, Features, How it works, Pricing (แสดงสถานะ Beta ชัดเจน), CTA
- Responsive รองรับทุกขนาดหน้าจอ

## 🛠️ เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, React Server Components |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| File Storage | Supabase Storage |
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
│   │   │       ├── summary/route.ts         # Dashboard summary
│   │   │       └── members/
│   │   │           ├── route.ts             # List/Invite members
│   │   │           └── [userId]/
│   │   │               ├── route.ts         # Remove member
│   │   │               └── role/route.ts    # Change role (Admin/Member)
│   │   ├── projects/[id]/
│   │   │   ├── route.ts                     # Update/Delete project
│   │   │   └── tasks/route.ts               # List/Create tasks
│   │   ├── tasks/[id]/
│   │   │   ├── route.ts                     # Update/Delete task
│   │   │   └── attachments/route.ts         # Upload/List attachments
│   │   └── attachments/[id]/route.ts        # Delete attachment
│   ├── workspace/[slug]/
│   │   ├── page.tsx                         # Workspace dashboard
│   │   ├── workspace-navbar.tsx             # Navbar + Logout
│   │   ├── workspace-switcher.tsx           # สลับ Workspace
│   │   ├── dashboard-summary.tsx
│   │   ├── projects-grid.tsx
│   │   ├── members/
│   │   │   ├── page.tsx
│   │   │   └── members-list.tsx             # เชิญ/ลบ/เลื่อนสิทธิ์สมาชิก
│   │   └── projects/[projectId]/
│   │       ├── page.tsx                     # Kanban Board page
│   │       ├── kanban-board.tsx
│   │       └── task-modal.tsx               # รายละเอียด + ไฟล์แนบ
│   ├── dashboard/page.tsx                   # Redirect logic
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   └── layout.tsx
├── components/ui/
│   └── saas-template.tsx                    # Landing Page
├── lib/
│   ├── prisma.ts                            # Prisma Client singleton
│   ├── supabase-storage.ts                  # จัดการไฟล์แนบ
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
| `Attachment` | ไฟล์แนบของแต่ละ Task (metadata — ไฟล์จริงอยู่ Supabase Storage) |

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

### 3. ตั้งค่า Supabase Storage

1. ไปที่ Storage → New bucket → ตั้งชื่อ `task-attachments` → เปิด Public bucket
2. ไปที่ Settings → API → คัดลอก Project URL และ `service_role` key (Legacy API keys)

### 4. ตั้งค่า Google OAuth

1. เข้า Google Cloud Console → สร้าง OAuth 2.0 Client ID
2. เพิ่ม Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 5. สร้างไฟล์ `.env`

```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

AUTH_SECRET="สร้างด้วยคำสั่ง npx auth secret"
AUTH_GOOGLE_ID="Client ID จาก Google Cloud Console"
AUTH_GOOGLE_SECRET="Client Secret จาก Google Cloud Console"

SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service_role key จาก Supabase"
```

### 6. Push Database Schema และรันโปรเจกต์

```bash
npx prisma db push
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## 🌐 Deploy

โปรเจกต์นี้ deploy บน [Vercel](https://vercel.com)

1. เชื่อม GitHub repository กับ Vercel
2. เพิ่ม Environment Variables ทั้งหมดใน Vercel Project Settings (ครบทุก Environment: Production, Preview, Development)
3. เพิ่ม `prisma generate && next build` ใน build script เพื่อป้องกัน Prisma Client cache ล้าสมัย
4. เพิ่ม Production URL ใน Google OAuth Authorized redirect URIs

## 📸 ตัวอย่างหน้าจอ

> เพิ่ม screenshot ของแอปพลิเคชันตรงนี้ (Landing Page, Kanban Board, Dashboard, หน้าจัดการสมาชิก, ไฟล์แนบ)

## 🔮 แนวทางพัฒนาต่อ

- ระบบเชิญสมาชิกผ่านอีเมลจริง (สำหรับคนที่ยังไม่เคยใช้แอปมาก่อน) ด้วย Email Service เช่น Resend
- ระบบแจ้งเตือนผ่าน Email เมื่อใกล้ถึง Due Date
- Real-time collaboration ด้วย WebSocket
- Custom Role และ Permission ที่ปรับแต่งได้ละเอียดขึ้น
- เชื่อมระบบชำระเงินจริง (Stripe) สำหรับแพ็กเกจ Pro/Enterprise

## 👤 ผู้พัฒนา

> ใส่ชื่อและช่องทางติดต่อของคุณตรงนี้ เช่น GitHub, LinkedIn, Email
