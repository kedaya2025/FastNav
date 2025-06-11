const { createClient } = require('@supabase/supabase-js')

// 生产环境数据库迁移脚本
// 用于在 Supabase 中创建表结构和初始数据

async function migrateProduction() {
  console.log('🚀 开始生产环境数据库迁移...')

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少必要的环境变量:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('📊 创建分类表...')
    
    // 创建分类表
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (categoriesError) {
      console.error('❌ 创建分类表失败:', categoriesError)
      throw categoriesError
    }

    console.log('🌐 创建网站表...')
    
    // 创建网站表
    const { error: websitesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS websites (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (category) REFERENCES categories(id)
        );
      `
    })

    if (websitesError) {
      console.error('❌ 创建网站表失败:', websitesError)
      throw websitesError
    }

    console.log('📝 插入初始分类数据...')
    
    // 插入初始分类数据
    const categories = [
      { id: 'all', name: '全部', icon: 'Grid3X3' },
      { id: 'search', name: '搜索引擎', icon: 'Search' },
      { id: 'social', name: '社交媒体', icon: 'Users' },
      { id: 'dev', name: '开发工具', icon: 'Code' },
      { id: 'design', name: '设计资源', icon: 'Palette' },
      { id: 'productivity', name: '效率工具', icon: 'Zap' },
      { id: 'entertainment', name: '娱乐影音', icon: 'Play' },
      { id: 'news', name: '新闻资讯', icon: 'Newspaper' },
      { id: 'shopping', name: '购物网站', icon: 'ShoppingBag' },
      { id: 'education', name: '学习教育', icon: 'BookOpen' }
    ]

    const { error: insertCategoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' })

    if (insertCategoriesError) {
      console.error('❌ 插入分类数据失败:', insertCategoriesError)
      throw insertCategoriesError
    }

    console.log('🌐 插入初始网站数据...')
    
    // 插入初始网站数据
    const websites = [
      { name: 'Google', url: 'https://www.google.com', description: '全球最大的搜索引擎', category: 'search', color: '#4285f4' },
      { name: '百度', url: 'https://www.baidu.com', description: '中国最大的搜索引擎', category: 'search', color: '#2932e1' },
      { name: 'Bing', url: 'https://www.bing.com', description: '微软搜索引擎', category: 'search', color: '#0078d4' },
      { name: 'Twitter', url: 'https://twitter.com', description: '全球社交媒体平台', category: 'social', color: '#1da1f2' },
      { name: '微博', url: 'https://weibo.com', description: '中国社交媒体平台', category: 'social', color: '#e6162d' },
      { name: 'Instagram', url: 'https://www.instagram.com', description: '图片社交平台', category: 'social', color: '#e4405f' },
      { name: 'GitHub', url: 'https://github.com', description: '代码托管平台', category: 'dev', color: '#181717' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', description: '程序员问答社区', category: 'dev', color: '#f48024' },
      { name: 'MDN', url: 'https://developer.mozilla.org', description: 'Web开发文档', category: 'dev', color: '#000000' },
      { name: 'Dribbble', url: 'https://dribbble.com', description: '设计师作品展示平台', category: 'design', color: '#ea4c89' }
    ]

    const { error: insertWebsitesError } = await supabase
      .from('websites')
      .insert(websites)

    if (insertWebsitesError) {
      console.error('❌ 插入网站数据失败:', insertWebsitesError)
      throw insertWebsitesError
    }

    console.log('✅ 生产环境数据库迁移完成！')
    console.log(`📊 已创建 ${categories.length} 个分类`)
    console.log(`🌐 已创建 ${websites.length} 个网站`)

  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  }
}

// 运行迁移
if (require.main === module) {
  migrateProduction()
}

module.exports = { migrateProduction }
