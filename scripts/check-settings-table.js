const { Pool } = require('pg')

// 数据库连接配置
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'c83a350cfb60',
})

async function checkSettingsTable() {
  try {
    console.log('🔄 检查设置表...')
    
    const client = await pool.connect()
    console.log('✅ 数据库连接成功')
    
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
    
    // 检查设置表是否存在
    const hasSettings = tablesResult.rows.some(row => row.table_name === 'settings')
    
    if (hasSettings) {
      console.log('✅ 设置表存在')
      
      // 检查设置数据
      const settingsResult = await client.query('SELECT * FROM settings')
      console.log(`📊 设置数量: ${settingsResult.rows.length}`)
      
      settingsResult.rows.forEach(setting => {
        console.log(`  - ${setting.key}: ${setting.value}`)
      })
    } else {
      console.log('❌ 设置表不存在')
    }
    
    client.release()
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  } finally {
    await pool.end()
  }
}

// 运行检查
checkSettingsTable()
