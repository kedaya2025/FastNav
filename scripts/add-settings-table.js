const { Pool } = require('pg')

// 数据库连接配置
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'c83a350cfb60',
})

async function addSettingsTable() {
  try {
    console.log('🔄 添加设置表...')
    
    const client = await pool.connect()
    console.log('✅ 数据库连接成功')
    
    // 创建设置表
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✅ 设置表创建成功')
    
    // 添加触发器
    await client.query(`
      CREATE TRIGGER update_settings_updated_at 
        BEFORE UPDATE ON settings 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `)
    console.log('✅ 设置表触发器创建成功')
    
    // 插入默认设置
    await client.query(`
      INSERT INTO settings (key, value) VALUES
        ('site_title', 'FastNav - 现代化网址导航'),
        ('site_description', '简约时尚的网址导航站点，快速访问您喜爱的网站'),
        ('site_keywords', '网址导航,书签,网站收藏,快速导航,团队导航')
      ON CONFLICT (key) DO NOTHING
    `)
    console.log('✅ 默认设置插入成功')
    
    // 检查设置表
    const settingsResult = await client.query('SELECT COUNT(*) FROM settings')
    console.log(`📊 设置数量: ${settingsResult.rows[0].count}`)
    
    client.release()
    console.log('🎉 设置表添加完成!')
    
  } catch (error) {
    console.error('❌ 添加设置表失败:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// 运行添加
addSettingsTable()
