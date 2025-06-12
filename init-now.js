const https = require('https');

const data = JSON.stringify({
  adminPassword: 'c83a350cfb60c8cb9e91b536'
});

const options = {
  hostname: 'fast-nav.vercel.app',
  port: 443,
  path: '/api/admin/init-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 15000
};

console.log('🚀 正在初始化数据库...');

const req = https.request(options, (res) => {
  console.log('📊 状态码:', res.statusCode);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      console.log('✅ 响应结果:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('🎉 数据库初始化成功!');
        if (result.data) {
          console.log(`📊 分类: ${result.data.categories}`);
          console.log(`🌐 网站: ${result.data.websites}`);
          console.log(`⚙️ 设置: ${result.data.settings}`);
        }
      } else {
        console.log('❌ 初始化失败:', result.message);
      }
    } catch (error) {
      console.log('❌ JSON解析失败:', error.message);
      console.log('📄 原始响应:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求错误:', error.message);
});

req.on('timeout', () => {
  console.error('❌ 请求超时');
  req.destroy();
});

req.write(data);
req.end();
