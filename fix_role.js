import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jpomsgynbjvoxotppxqy.supabase.co'
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb21zZ3luYmp2b3hvdHBweHF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI4MTI4NiwiZXhwIjoyMDk4ODU3Mjg2fQ.QbL0rDhWzlLQz85_aVJllUAObxXUa90WFCghr7a-gag'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fix() {
  const email = 'bgh@admin.com'
  console.log('Đang tìm user:', email)
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)
  
  if (user) {
    console.log('Đang upsert role cho user:', user.id)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: 'bgh' })
    if (error) {
      console.error('Lỗi upsert:', error.message)
    } else {
      console.log('Đã cập nhật role BGH thành công!')
    }
  } else {
    console.log('Không tìm thấy user')
  }
}

fix()
