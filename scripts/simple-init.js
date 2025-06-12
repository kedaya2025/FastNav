// 简单的初始化脚本
const https = require('https')

const initData = {
  adminPassword: 'c83a350cfb60c8cb9e91b536'
}

const postData = JSON.stringify(initData)

const options = {
  hostname: 'fast-nav.vercel.app',
  port: 443,
  path: '/api/admin/init-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 30000
}

console.log('🚀 开始初始化远程数据库...')
console.log('📡 请求地址:', `https://${options.hostname}${options.path}`)

const req = https.request(options, (res) => {
  console.log('📊 状态码:', res.statusCode)
  console.log('📋 响应头:', res.headers)
  
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    console.log('📄 原始响应:', data)
    
    try {
      const result = JSON.parse(data)
      console.log('✅ 解析后的响应:', JSON.stringify(result, null, 2))
      
      if (result.success) {
        console.log('🎉 数据库初始化成功!')
        if (result.data) {
          console.log(`📊 分类: ${result.data.categories}`)
          console.log(`🌐 网站: ${result.data.websites}`)
          console.log(`⚙️ 设置: ${result.data.settings}`)
        }
      } else {
        console.log('❌ 初始化失败:', result.message)
        if (result.sqlScript) {
          console.log('📝 需要执行的SQL脚本:')
          console.log(result.sqlScript)
        }
      }
    } catch (error) {
      console.log('❌ JSON解析失败:', error.message)
      console.log('📄 原始数据:', data)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ 请求错误:', error.message)
})

req.on('timeout', () => {
  console.error('❌ 请求超时')
  req.destroy()
})

req.write(postData)
req.end()

console.log('⏳ 等待响应...')
