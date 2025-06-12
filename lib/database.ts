import { Pool, PoolClient } from 'pg'
import { createClient } from '@supabase/supabase-js'

// 检查是否为生产环境
const isProduction = process.env.NODE_ENV === 'production'

// Supabase 客户端
let supabase: any = null
if (process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key') {
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  } catch (error) {
    console.warn('Supabase 客户端初始化失败:', error)
    supabase = null
  }
}

// PostgreSQL 连接池
let pool: Pool | null = null

// 数据库连接配置
function createDatabasePool() {
  try {
    // 优先使用 POSTGRES_URL (Vercel 自动注入)
    if (process.env.POSTGRES_URL) {
      console.log('🔗 使用 POSTGRES_URL 连接数据库')
      return new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: isProduction ? {
          rejectUnauthorized: false
        } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      })
    }

    // 使用 Supabase 环境变量
    if (process.env.SUPABASE_URL && process.env.POSTGRES_HOST) {
      console.log('🔗 使用 Supabase Postgres 连接')
      return new Pool({
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DATABASE,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        ssl: isProduction ? {
          rejectUnauthorized: false
        } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      })
    }

    // 本地开发配置
    if (!isProduction) {
      console.log('🔗 使用本地数据库连接')
      return new Pool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'c83a350cfb60',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: false,
      })
    }

    return null
  } catch (error) {
    console.error('❌ 数据库连接池创建失败:', error)
    return null
  }
}

pool = createDatabasePool()

// 数据库连接测试
export async function testConnection(): Promise<boolean> {
  try {
    if (pool) {
      // 优先使用 PostgreSQL 连接
      const client = await pool.connect()
      await client.query('SELECT NOW()')
      client.release()
      console.log('✅ PostgreSQL 数据库连接成功')
      return true
    } else if (supabase) {
      // 备用 Supabase 连接
      const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true })
      if (!error) {
        console.log('✅ Supabase 数据库连接成功')
        return true
      }
    }
    return false
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 执行查询
export async function query(text: string, params?: any[]): Promise<any> {
  if (pool) {
    // 使用 PostgreSQL 连接
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  } else {
    throw new Error('数据库连接未初始化')
  }
}

// 执行事务
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  if (pool) {
    // 使用 PostgreSQL 事务
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } else {
    throw new Error('数据库连接未初始化')
  }
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

export interface DatabaseSettings {
  id: number
  key: string
  value: string
  created_at: string
  updated_at: string
}

// 分类相关数据库操作
export class CategoryDB {
  // 获取所有分类
  static async getAll(): Promise<DatabaseCategory[]> {
    if (pool) {
      // 使用 PostgreSQL
      const result = await query('SELECT * FROM categories ORDER BY name')
      return result.rows
    } else if (supabase) {
      // 备用 Supabase
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } else {
      throw new Error('数据库连接未初始化')
    }
  }

  // 创建分类
  static async create(category: Omit<DatabaseCategory, 'created_at' | 'updated_at'>): Promise<DatabaseCategory> {
    const result = await query(
      'INSERT INTO categories (id, name, icon) VALUES ($1, $2, $3) RETURNING *',
      [category.id, category.name, category.icon]
    )
    return result.rows[0]
  }

  // 批量更新分类
  static async upsertMany(categories: Omit<DatabaseCategory, 'created_at' | 'updated_at'>[]): Promise<void> {
    if (pool) {
      // 使用 PostgreSQL 事务
      await transaction(async (client) => {
        for (const category of categories) {
          await client.query(
            `INSERT INTO categories (id, name, icon)
             VALUES ($1, $2, $3)
             ON CONFLICT (id)
             DO UPDATE SET name = $2, icon = $3, updated_at = NOW()`,
            [category.id, category.name, category.icon]
          )
        }
      })
    } else if (supabase) {
      // 备用 Supabase 批量操作
      const { error } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'id' })

      if (error) throw error
    } else {
      throw new Error('数据库连接未初始化')
    }
  }
}

// 网站相关数据库操作
export class WebsiteDB {
  // 获取所有网站
  static async getAll(): Promise<DatabaseWebsite[]> {
    if (pool) {
      // 使用 PostgreSQL
      const result = await query('SELECT * FROM websites ORDER BY name')
      return result.rows
    } else if (supabase) {
      // 备用 Supabase
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } else {
      throw new Error('数据库连接未初始化')
    }
  }

  // 创建网站
  static async create(website: Omit<DatabaseWebsite, 'created_at' | 'updated_at'>): Promise<DatabaseWebsite> {
    const result = await query(
      'INSERT INTO websites (id, name, url, description, category, icon, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [website.id, website.name, website.url, website.description, website.category, website.icon, website.color]
    )
    return result.rows[0]
  }

  // 更新网站
  static async update(id: string, website: Partial<Omit<DatabaseWebsite, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseWebsite> {
    const fields = []
    const values = []
    let paramIndex = 1

    if (website.name !== undefined) {
      fields.push(`name = $${paramIndex++}`)
      values.push(website.name)
    }
    if (website.url !== undefined) {
      fields.push(`url = $${paramIndex++}`)
      values.push(website.url)
    }
    if (website.description !== undefined) {
      fields.push(`description = $${paramIndex++}`)
      values.push(website.description)
    }
    if (website.category !== undefined) {
      fields.push(`category = $${paramIndex++}`)
      values.push(website.category)
    }
    if (website.icon !== undefined) {
      fields.push(`icon = $${paramIndex++}`)
      values.push(website.icon)
    }
    if (website.color !== undefined) {
      fields.push(`color = $${paramIndex++}`)
      values.push(website.color)
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query(
      `UPDATE websites SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0]
  }

  // 删除网站
  static async delete(id: string): Promise<void> {
    await query('DELETE FROM websites WHERE id = $1', [id])
  }

  // 批量更新网站
  static async upsertMany(websites: Omit<DatabaseWebsite, 'created_at' | 'updated_at'>[]): Promise<void> {
    if (pool) {
      // 使用 PostgreSQL 事务
      await transaction(async (client) => {
        for (const website of websites) {
          await client.query(
            `INSERT INTO websites (id, name, url, description, category, icon, color)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id)
             DO UPDATE SET
               name = $2,
               url = $3,
               description = $4,
               category = $5,
               icon = $6,
               color = $7,
               updated_at = NOW()`,
            [website.id, website.name, website.url, website.description, website.category, website.icon, website.color]
          )
        }
      })
    } else if (supabase) {
      // 备用 Supabase 批量操作
      const { error } = await supabase
        .from('websites')
        .upsert(websites, { onConflict: 'id' })

      if (error) throw error
    } else {
      throw new Error('数据库连接未初始化')
    }
  }
}

// 设置相关数据库操作
export class SettingsDB {
  // 获取设置值
  static async get(key: string): Promise<string | null> {
    if (pool) {
      // 使用 PostgreSQL
      const result = await query('SELECT value FROM settings WHERE key = $1', [key])
      return result.rows.length > 0 ? result.rows[0].value : null
    } else if (supabase) {
      // 备用 Supabase
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // 记录不存在
        throw error
      }
      return data?.value || null
    } else {
      throw new Error('数据库连接未初始化')
    }
  }

  // 设置值
  static async set(key: string, value: string): Promise<void> {
    if (pool) {
      // 使用 PostgreSQL
      await query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key)
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      )
    } else if (supabase) {
      // 备用 Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })

      if (error) throw error
    } else {
      throw new Error('数据库连接未初始化')
    }
  }

  // 获取多个设置
  static async getMultiple(keys: string[]): Promise<Record<string, string>> {
    if (pool) {
      // 使用 PostgreSQL
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(',')
      const result = await query(
        `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
        keys
      )

      const settings: Record<string, string> = {}
      result.rows.forEach((row: any) => {
        settings[row.key] = row.value
      })
      return settings
    } else if (supabase) {
      // 备用 Supabase
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', keys)

      if (error) throw error

      const result: Record<string, string> = {}
      data?.forEach((item: { key: string; value: string }) => {
        result[item.key] = item.value
      })
      return result
    } else {
      throw new Error('数据库连接未初始化')
    }
  }

  // 批量设置
  static async setMultiple(settings: Record<string, string>): Promise<void> {
    if (pool) {
      // 使用 PostgreSQL
      await transaction(async (client) => {
        for (const [key, value] of Object.entries(settings)) {
          await client.query(
            `INSERT INTO settings (key, value)
             VALUES ($1, $2)
             ON CONFLICT (key)
             DO UPDATE SET value = $2, updated_at = NOW()`,
            [key, value]
          )
        }
      })
    } else if (supabase) {
      // 备用 Supabase
      const data = Object.entries(settings).map(([key, value]) => ({ key, value }))
      const { error } = await supabase
        .from('settings')
        .upsert(data, { onConflict: 'key' })

      if (error) throw error
    } else {
      throw new Error('数据库连接未初始化')
    }
  }
}

// 初始化数据库
export async function initializeDatabase(): Promise<void> {
  try {
    // 测试连接
    const connected = await testConnection()
    if (!connected) {
      throw new Error('无法连接到数据库')
    }

    // 检查表是否存在
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'websites')
    `)

    if (tablesResult.rows.length < 2) {
      console.log('⚠️  数据库表不存在，请执行 database/schema.sql 脚本创建表')
    } else {
      console.log('✅ 数据库表已存在')
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  }
}
