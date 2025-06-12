import { NextRequest, NextResponse } from 'next/server'
import { CategoryDB, testConnection } from '@/lib/database'

// 获取所有分类
export async function GET() {
  try {
    // 先测试数据库连接
    const connected = await testConnection()
    if (!connected) {
      console.error('❌ 数据库连接失败')
      return NextResponse.json(
        { success: false, message: '数据库连接失败，请检查数据库配置' },
        { status: 503 }
      )
    }

    const categories = await CategoryDB.getAll()

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error: any) {
    console.error('获取分类异常:', error)

    // 如果数据库表不存在
    if (error?.code === '42P01') {
      return NextResponse.json(
        {
          success: false,
          message: '数据库表不存在，请先初始化数据库',
          error: 'TABLES_NOT_EXIST',
          hint: '请访问 /api/admin/init-db 初始化数据库'
        },
        { status: 503 }
      )
    }

    // SSL证书错误
    if (error?.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      return NextResponse.json(
        { success: false, message: 'SSL证书验证失败，请检查数据库SSL配置' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: '数据库连接失败: ' + (error?.message || '未知错误'),
        error: error?.code || 'UNKNOWN_ERROR'
      },
      { status: 503 }
    )
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const { id, name, icon } = await request.json()

    if (!id || !name || !icon) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    const data = await CategoryDB.create({ id, name, icon })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('创建分类异常:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 批量更新分类
export async function PUT(request: NextRequest) {
  try {
    const { categories } = await request.json()

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, message: '参数格式错误' },
        { status: 400 }
      )
    }

    await CategoryDB.upsertMany(categories)

    return NextResponse.json({
      success: true,
      message: '分类更新成功'
    })
  } catch (error) {
    console.error('批量更新分类异常:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
