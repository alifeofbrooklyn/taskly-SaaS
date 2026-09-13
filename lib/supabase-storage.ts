import { createClient } from '@supabase/supabase-js'

// ใช้ service_role key เพราะรันฝั่ง Server เท่านั้น (API Route)
// ห้าม import ไฟล์นี้ในฝั่ง Client เด็ดขาด เพราะ key นี้มีสิทธิ์เต็ม
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET_NAME = 'task-attachments'

export async function uploadFile(file: File, taskId: string) {
  const fileExt = file.name.split('.').pop()
  const uniqueName = `${taskId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(uniqueName, file)

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(uniqueName)

  return {
    fileUrl: data.publicUrl,
    storagePath: uniqueName,
  }
}

export async function deleteFile(storagePath: string) {
  await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath])
}