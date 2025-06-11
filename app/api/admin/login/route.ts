import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 从环境变量获取管理员账号密码
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    // 验证环境变量是否设置
    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { success: false, message: '服务器配置错误，请联系管理员' },
        { status: 500 }
      )
    }

    // 验证账号密码
    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '登录请求处理失败' },
      { status: 500 }
    )
  }
}
