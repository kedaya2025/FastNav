import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { adminPassword } = await request.json()
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: '权限验证失败' },
        { status: 401 }
      )
    }

    console.log('🔄 开始创建数据库表...')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, message: 'Supabase 环境变量未配置' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 建表SQL脚本
    const createTablesSQL = `
      -- 创建分类表
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建网站表
      CREATE TABLE IF NOT EXISTS websites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建设置表
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建更新时间触发器函数
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- 为分类表添加更新时间触发器
      DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
      CREATE TRIGGER update_categories_updated_at 
          BEFORE UPDATE ON categories 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();

      -- 为网站表添加更新时间触发器
      DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
      CREATE TRIGGER update_websites_updated_at
          BEFORE UPDATE ON websites
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- 为设置表添加更新时间触发器
      DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
      CREATE TRIGGER update_settings_updated_at
          BEFORE UPDATE ON settings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- 添加外键约束（如果不存在）
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'websites_category_fkey'
          ) THEN
              ALTER TABLE websites 
              ADD CONSTRAINT websites_category_fkey 
              FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE;
          END IF;
      END $$;
    `

    try {
      // 使用 Supabase 的 rpc 功能执行 SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: createTablesSQL
      })

      if (error) {
        console.error('❌ 使用 rpc 创建表失败:', error)
        
        // 如果 rpc 不可用，尝试逐个创建表
        console.log('🔄 尝试逐个创建表...')
        
        // 创建分类表
        const { error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .limit(1)
        
        if (categoriesError && categoriesError.code === '42P01') {
          // 表不存在，需要手动创建
          return NextResponse.json({
            success: false,
            message: '无法自动创建表，需要手动执行SQL脚本',
            error: 'MANUAL_CREATION_REQUIRED',
            sqlScript: createTablesSQL,
            instructions: [
              '1. 登录 Supabase Dashboard',
              '2. 进入 SQL Editor',
              '3. 创建新查询',
              '4. 复制并执行上面的 sqlScript',
              '5. 然后调用 /api/admin/init-db 初始化数据'
            ]
          }, { status: 503 })
        }
      }

      console.log('✅ 数据库表创建成功')

      // 验证表是否创建成功
      const tableChecks = {}
      for (const table of ['categories', 'websites', 'settings']) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1)
          
          tableChecks[table] = !error
        } catch (err) {
          tableChecks[table] = false
        }
      }

      return NextResponse.json({
        success: true,
        message: '数据库表创建完成',
        tables: tableChecks,
        nextStep: '现在可以调用 /api/admin/init-db 来初始化数据'
      })

    } catch (dbError: any) {
      console.error('❌ 数据库操作失败:', dbError)
      
      return NextResponse.json({
        success: false,
        message: '数据库表创建失败',
        error: dbError.message,
        sqlScript: createTablesSQL,
        instructions: [
          '请手动在 Supabase Dashboard 中执行上面的 SQL 脚本'
        ]
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ 创建表请求处理失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误: ' + error.message },
      { status: 500 }
    )
  }
}
