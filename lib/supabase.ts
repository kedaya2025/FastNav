import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查是否配置了有效的 Supabase 环境变量
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'placeholder_url' &&
  supabaseAnonKey !== 'placeholder_key' &&
  supabaseUrl.startsWith('http')
)

// 创建 Supabase 客户端（仅在配置了有效环境变量时）
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// 服务端使用的 Supabase 客户端（具有更高权限）
export const createServerSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 环境变量未配置')
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey || supabaseServiceKey === 'placeholder_service_key') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 环境变量未配置')
  }

  return createClient(supabaseUrl!, supabaseServiceKey)
}

// 数据库表类型定义
export interface DatabaseCategory {
  id: string
  name: string
  icon: string
  created_at: string
  updated_at: string
}

export interface DatabaseWebsite {
  id: string
  name: string
  url: string
  description: string
  category: string
  icon?: string
  color?: string
  created_at: string
  updated_at: string
}

// 数据库操作类型
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: DatabaseCategory
        Insert: Omit<DatabaseCategory, 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseCategory, 'id' | 'created_at' | 'updated_at'>>
      }
      websites: {
        Row: DatabaseWebsite
        Insert: Omit<DatabaseWebsite, 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseWebsite, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
