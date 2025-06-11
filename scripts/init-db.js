const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// 数据库连接配置
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'c83a350cfb60',
})

async function initializeDatabase() {
  try {
    console.log('🔄 开始初始化数据库...')
    
    // 测试连接
    const client = await pool.connect()
    console.log('✅ 数据库连接成功')
    
    // 读取 SQL 脚本
    const sqlPath = path.join(__dirname, '../database/schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // 执行 SQL 脚本
    await client.query(sql)
    console.log('✅ 数据库表创建成功')
    
    // 检查表是否创建成功
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'websites')
    `)
    
    console.log(`✅ 找到 ${tablesResult.rows.length} 个表:`, tablesResult.rows.map(row => row.table_name))
    
    // 检查数据
    const categoriesResult = await client.query('SELECT COUNT(*) FROM categories')
    const websitesResult = await client.query('SELECT COUNT(*) FROM websites')
    
    console.log(`📊 分类数量: ${categoriesResult.rows[0].count}`)
    console.log(`📊 网站数量: ${websitesResult.rows[0].count}`)
    
    client.release()
    console.log('🎉 数据库初始化完成!')
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// 运行初始化
initializeDatabase()
