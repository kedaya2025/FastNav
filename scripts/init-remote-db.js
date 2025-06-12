const https = require('https')

const data = JSON.stringify({
  adminPassword: 'c83a350cfb60c8cb9e91b536'
})

const options = {
  hostname: 'fast-nav.vercel.app',
  port: 443,
  path: '/api/admin/init-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

console.log('🔄 正在初始化远程数据库...')

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`)
  
  let responseData = ''
  
  res.on('data', (chunk) => {
    responseData += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(responseData)
      
      if (result.success) {
        console.log('✅ 数据库初始化成功!')
        console.log(`📊 创建了 ${result.data.categories} 个分类`)
        console.log(`🌐 创建了 ${result.data.websites} 个网站`)
        console.log(`⚙️ 创建了 ${result.data.settings} 个设置`)
      } else {
        console.log('❌ 初始化失败:', result.message)
        
        if (result.error === 'TABLES_NOT_EXIST') {
          console.log('\n📋 请在 Supabase Dashboard 中执行以下 SQL:')
          console.log('=' * 50)
          console.log(result.sqlScript)
          console.log('=' * 50)
        }
      }
    } catch (error) {
      console.log('❌ 响应解析失败:', error.message)
      console.log('原始响应:', responseData)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message)
})

req.write(data)
req.end()
