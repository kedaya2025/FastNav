const { Pool } = require('pg')

// 数据库连接配置
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'c83a350cfb60',
})

async function checkDatabase() {
  try {
    console.log('🔄 检查数据库连接...')
    
    const client = await pool.connect()
    console.log('✅ 数据库连接成功')
    
    // 检查当前数据库
    const dbResult = await client.query('SELECT current_database()')
    console.log(`📊 当前数据库: ${dbResult.rows[0].current_database}`)
    
    // 检查所有表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log(`📋 找到 ${tablesResult.rows.length} 个表:`)
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    // 如果有 categories 表，检查数据
    if (tablesResult.rows.some(row => row.table_name === 'categories')) {
      const categoriesResult = await client.query('SELECT COUNT(*) FROM categories')
      console.log(`📊 分类数量: ${categoriesResult.rows[0].count}`)
    }
    
    // 如果有 websites 表，检查数据
    if (tablesResult.rows.some(row => row.table_name === 'websites')) {
      const websitesResult = await client.query('SELECT COUNT(*) FROM websites')
      console.log(`📊 网站数量: ${websitesResult.rows[0].count}`)
    }
    
    client.release()
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message)
  } finally {
    await pool.end()
  }
}

// 运行检查
checkDatabase()
