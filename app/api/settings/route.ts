import { NextRequest, NextResponse } from 'next/server'
import { SettingsDB } from '@/lib/database'

// 获取设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keys = searchParams.get('keys')
    
    if (keys) {
      // 获取多个设置
      const keyArray = keys.split(',')
      const settings = await SettingsDB.getMultiple(keyArray)
      
      return NextResponse.json({
        success: true,
        data: settings
      })
    } else {
      // 获取所有 TDK 设置
      const settings = await SettingsDB.getMultiple([
        'site_title',
        'site_description', 
        'site_keywords'
      ])
      
      return NextResponse.json({
        success: true,
        data: settings
      })
    }
  } catch (error: any) {
    console.error('获取设置异常:', error)
    return NextResponse.json(
      { success: false, message: '获取设置失败' },
      { status: 500 }
    )
  }
}

// 更新设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: '设置数据格式错误' },
        { status: 400 }
      )
    }
    
    // 验证设置键名
    const allowedKeys = ['site_title', 'site_description', 'site_keywords']
    const invalidKeys = Object.keys(settings).filter(key => !allowedKeys.includes(key))
    
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { success: false, message: `不允许的设置键: ${invalidKeys.join(', ')}` },
        { status: 400 }
      )
    }
    
    // 保存设置
    await SettingsDB.setMultiple(settings)
    
    return NextResponse.json({
      success: true,
      message: '设置更新成功'
    })
  } catch (error: any) {
    console.error('更新设置异常:', error)
    return NextResponse.json(
      { success: false, message: '更新设置失败' },
      { status: 500 }
    )
  }
}
