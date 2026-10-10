import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://mncbtgkhonhhjzbzzjkb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JONIEu1NKRpi1Ii5C9jlOA_3ckci3Hu';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

// Tự động chuẩn hóa nếu người dùng chỉ nhập Project Reference ID (ví dụ: mncbtgkhonhhjzbzzjkb)
export const supabaseUrl = rawUrl
  ? rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}.supabase.co`
  : DEFAULT_SUPABASE_URL;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 10
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [Supabase Config] Chưa cấu hình thông tin Supabase hoặc file .env chưa có khóa hợp lệ\n' +
    'Vui lòng điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env'
  );
}

// Khởi tạo Supabase client (nếu chưa có key sẽ dùng mock an toàn để không crash ứng dụng)
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-11a10.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key-11a10-cattien'
);

export default supabase;
