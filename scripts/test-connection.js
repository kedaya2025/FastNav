const https = require('https')

console.log('🔄 测试连接到 fast-nav.vercel.app...')

const options = {
  hostname: 'fast-nav.vercel.app',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
}

const req = https.request(options, (res) => {
  console.log(`✅ 连接成功! 状态码: ${res.statusCode}`)
  
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    console.log(`📄 响应长度: ${data.length} 字符`)
    if (data.includes('FastNav')) {
      console.log('✅ 网站正常运行')
    }
  })
})

req.on('error', (error) => {
  console.error('❌ 连接失败:', error.message)
})

req.on('timeout', () => {
  console.error('❌ 连接超时')
  req.destroy()
})

req.end()
