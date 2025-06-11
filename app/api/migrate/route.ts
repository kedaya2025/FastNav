import { NextRequest, NextResponse } from 'next/server'
import { CategoryDB, WebsiteDB, testConnection } from '@/lib/database'

// 数据迁移 API - 将 localStorage 数据迁移到数据库
export async function POST(request: NextRequest) {
  try {
    // 测试数据库连接
    const connected = await testConnection()
    if (!connected) {
      return NextResponse.json(
        { success: false, message: '数据库连接失败' },
        { status: 503 }
      )
    }

    const { categories, websites } = await request.json()

    if (!Array.isArray(categories) || !Array.isArray(websites)) {
      return NextResponse.json(
        { success: false, message: '数据格式错误' },
        { status: 400 }
      )
    }

    // 迁移分类数据
    if (categories.length > 0) {
      await CategoryDB.upsertMany(categories)
    }

    // 迁移网站数据
    if (websites.length > 0) {
      await WebsiteDB.upsertMany(websites)
    }

    return NextResponse.json({
      success: true,
      message: `成功迁移 ${categories.length} 个分类和 ${websites.length} 个网站`
    })
  } catch (error) {
    console.error('数据迁移异常:', error)
    return NextResponse.json(
      { success: false, message: '数据迁移失败' },
      { status: 500 }
    )
  }
}
