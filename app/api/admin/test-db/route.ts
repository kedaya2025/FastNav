import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/database'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 开始数据库连接测试...')
    
    // 检查环境变量
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('📋 环境变量检查:', envCheck)
    
    // 测试 Supabase 连接
    let supabaseTest = null
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        
        // 尝试简单查询
        const { data, error } = await supabase
          .from('categories')
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          supabaseTest = {
            success: false,
            error: error.message,
            code: error.code
          }
        } else {
          supabaseTest = {
            success: true,
            message: 'Supabase 连接成功'
          }
        }
      } catch (error: any) {
        supabaseTest = {
          success: false,
          error: error.message,
          type: 'connection_error'
        }
      }
    } else {
      supabaseTest = {
        success: false,
        error: '缺少 Supabase 环境变量'
      }
    }
    
    // 测试通用数据库连接
    const generalTest = await testConnection()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabase: supabaseTest,
      generalConnection: generalTest,
      message: '数据库连接测试完成'
    })
    
  } catch (error: any) {
    console.error('❌ 数据库测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 支持 POST 请求（带密码验证）
export async function POST(request: NextRequest) {
  try {
    const { adminPassword } = await request.json()
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: '权限验证失败' },
        { status: 401 }
      )
    }
    
    // 执行更详细的测试
    const result = await GET()
    const data = await result.json()
    
    // 如果 Supabase 连接成功，尝试列出所有表
    if (data.supabase?.success && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        
        // 尝试查询每个表
        const tableTests = {}
        
        for (const table of ['categories', 'websites', 'settings']) {
          try {
            const { data: tableData, error } = await supabase
              .from(table)
              .select('*')
              .limit(1)
            
            if (error) {
              tableTests[table] = {
                exists: false,
                error: error.message,
                code: error.code
              }
            } else {
              tableTests[table] = {
                exists: true,
                hasData: (tableData && tableData.length > 0)
              }
            }
          } catch (err: any) {
            tableTests[table] = {
              exists: false,
              error: err.message
            }
          }
        }
        
        data.tables = tableTests
      } catch (error: any) {
        data.tablesError = error.message
      }
    }
    
    return NextResponse.json(data)
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
