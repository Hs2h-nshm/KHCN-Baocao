import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jpomsgynbjvoxotppxqy.supabase.co'
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb21zZ3luYmp2b3hvdHBweHF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI4MTI4NiwiZXhwIjoyMDk4ODU3Mjg2fQ.QbL0rDhWzlLQz85_aVJllUAObxXUa90WFCghr7a-gag'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setup() {
  const email = 'bgh@admin.com'
  const password = 'adminkhcn' // Mật khẩu cần >= 6 ký tự

  console.log('Đang lấy ID user...')
  
  let userId = null

  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)
  if (user) {
    userId = user.id
    console.log('User đã tồn tại, ID:', userId)
  } else {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (authErr) {
      console.error('Lỗi tạo user:', authErr.message)
      return
    }
    userId = authData?.user?.id
    console.log('Đã tạo user mới, ID:', userId)
  }

  if (userId) {
    console.log('Đang gán quyền BGH...')
    const { error: profErr } = await supabase.from('profiles').update({ role: 'bgh' }).eq('id', userId)
    if (profErr) {
      console.error('Lỗi gán role:', profErr.message)
    } else {
      console.log('Hoàn tất! Đã tạo tài khoản và gán quyền thành công.')
    }
  }
}

setup()
