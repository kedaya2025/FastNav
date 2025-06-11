import { NextRequest, NextResponse } from 'next/server'
import { WebsiteDB } from '@/lib/database'

// 获取所有网站
export async function GET() {
  try {
    const websites = await WebsiteDB.getAll()

    return NextResponse.json({
      success: true,
      data: websites
    })
  } catch (error: any) {
    console.error('获取网站异常:', error)

    // 如果数据库连接失败，返回适当的错误信息
    if (error?.code === '42P01') {
      return NextResponse.json(
        { success: false, message: '数据库表不存在，请先初始化数据库' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, message: '数据库连接失败，请检查数据库配置' },
      { status: 503 }
    )
  }
}

// 创建新网站
export async function POST(request: NextRequest) {
  try {
    const { id, name, url, description, category, icon, color } = await request.json()

    if (!id || !name || !url || !description || !category) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    const data = await WebsiteDB.create({ id, name, url, description, category, icon, color })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('创建网站异常:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 批量更新网站
export async function PUT(request: NextRequest) {
  try {
    const { websites } = await request.json()

    if (!Array.isArray(websites)) {
      return NextResponse.json(
        { success: false, message: '参数格式错误' },
        { status: 400 }
      )
    }

    await WebsiteDB.upsertMany(websites)

    return NextResponse.json({
      success: true,
      message: '网站更新成功'
    })
  } catch (error) {
    console.error('批量更新网站异常:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
