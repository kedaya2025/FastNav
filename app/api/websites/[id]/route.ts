import { NextRequest, NextResponse } from 'next/server'
import { WebsiteDB } from '@/lib/database'

// 更新单个网站
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, url, description, category, icon, color } = await request.json()
    const { id } = params

    if (!name || !url || !description || !category) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    const data = await WebsiteDB.update(id, { name, url, description, category, icon, color })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('更新网站异常:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除单个网站
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await WebsiteDB.delete(id)

    return NextResponse.json({
      success: true,
      message: '网站删除成功'
    })
  } catch (error) {
    console.error('删除网站异常:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
