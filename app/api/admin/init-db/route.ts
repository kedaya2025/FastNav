import { NextRequest, NextResponse } from 'next/server'
import { CategoryDB, WebsiteDB, SettingsDB } from '@/lib/database'

// 数据库初始化API端点
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const { adminPassword } = await request.json()
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: '权限验证失败' },
        { status: 401 }
      )
    }

    console.log('🔄 开始初始化数据库...')

    // 初始化默认分类数据
    const defaultCategories = [
      { id: 'all', name: '全部', icon: 'Grid3X3' },
      { id: 'search', name: '搜索引擎', icon: 'Search' },
      { id: 'social', name: '社交媒体', icon: 'Users' },
      { id: 'dev', name: '开发工具', icon: 'Code' },
      { id: 'design', name: '设计资源', icon: 'Palette' },
      { id: 'productivity', name: '效率工具', icon: 'Zap' },
      { id: 'entertainment', name: '娱乐休闲', icon: 'Play' },
      { id: 'news', name: '新闻资讯', icon: 'Newspaper' },
      { id: 'shopping', name: '购物网站', icon: 'ShoppingBag' },
      { id: 'education', name: '学习教育', icon: 'BookOpen' }
    ]

    // 初始化默认网站数据
    const defaultWebsites = [
      { id: 'google', name: 'Google', url: 'https://www.google.com', description: '全球最大的搜索引擎', category: 'search', color: '#4285f4' },
      { id: 'baidu', name: '百度', url: 'https://www.baidu.com', description: '中国最大的搜索引擎', category: 'search', color: '#2932e1' },
      { id: 'bing', name: 'Bing', url: 'https://www.bing.com', description: '微软搜索引擎', category: 'search', color: '#0078d4' },
      { id: 'twitter', name: 'Twitter', url: 'https://twitter.com', description: '全球社交媒体平台', category: 'social', color: '#1da1f2' },
      { id: 'weibo', name: '微博', url: 'https://weibo.com', description: '中国社交媒体平台', category: 'social', color: '#e6162d' },
      { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', description: '图片社交平台', category: 'social', color: '#e4405f' },
      { id: 'github', name: 'GitHub', url: 'https://github.com', description: '代码托管平台', category: 'dev', color: '#181717' },
      { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com', description: '程序员问答社区', category: 'dev', color: '#f48024' },
      { id: 'mdn', name: 'MDN', url: 'https://developer.mozilla.org', description: 'Web开发文档', category: 'dev', color: '#000000' },
      { id: 'dribbble', name: 'Dribbble', url: 'https://dribbble.com', description: '设计师作品展示平台', category: 'design', color: '#ea4c89' },
      { id: 'figma', name: 'Figma', url: 'https://www.figma.com', description: '在线设计协作工具', category: 'design', color: '#f24e1e' },
      { id: 'notion', name: 'Notion', url: 'https://www.notion.so', description: '全能工作空间', category: 'productivity', color: '#000000' },
      { id: 'trello', name: 'Trello', url: 'https://trello.com', description: '项目管理工具', category: 'productivity', color: '#0079bf' },
      { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', description: '全球最大视频平台', category: 'entertainment', color: '#ff0000' },
      { id: 'bilibili', name: 'Bilibili', url: 'https://www.bilibili.com', description: '中国知名视频弹幕网站', category: 'entertainment', color: '#00a1d6' },
      { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com', description: '中文互联网知识分享平台', category: 'news', color: '#0084ff' },
      { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com', description: '社交新闻聚合网站', category: 'news', color: '#ff4500' },
      { id: 'amazon', name: 'Amazon', url: 'https://www.amazon.com', description: '全球最大电商平台', category: 'shopping', color: '#ff9900' },
      { id: 'taobao', name: '淘宝', url: 'https://www.taobao.com', description: '中国最大的网络零售平台', category: 'shopping', color: '#ff4400' },
      { id: 'coursera', name: 'Coursera', url: 'https://www.coursera.org', description: '在线课程学习平台', category: 'education', color: '#0056d3' }
    ]

    // 初始化默认设置
    const defaultSettings = {
      'site_title': 'FastNav - 现代化网址导航',
      'site_description': '简约时尚的网址导航站点，快速访问您喜爱的网站',
      'site_keywords': '网址导航,书签,网站收藏,快速导航,团队导航'
    }

    try {
      // 批量插入分类数据
      console.log('📝 插入分类数据...')
      await CategoryDB.upsertMany(defaultCategories)
      
      // 批量插入网站数据
      console.log('🌐 插入网站数据...')
      await WebsiteDB.upsertMany(defaultWebsites)
      
      // 批量插入设置数据
      console.log('⚙️ 插入设置数据...')
      await SettingsDB.setMultiple(defaultSettings)

      console.log('✅ 数据库初始化完成!')

      return NextResponse.json({
        success: true,
        message: '数据库初始化成功',
        data: {
          categories: defaultCategories.length,
          websites: defaultWebsites.length,
          settings: Object.keys(defaultSettings).length
        }
      })

    } catch (dbError: any) {
      console.error('❌ 数据库操作失败:', dbError)
      
      // 如果是表不存在的错误，返回特殊提示
      if (dbError?.code === '42P01') {
        return NextResponse.json({
          success: false,
          message: '数据库表不存在，请先在 Supabase Dashboard 中创建表结构',
          error: 'TABLES_NOT_EXIST',
          sqlScript: `
-- 请在 Supabase Dashboard 的 SQL Editor 中执行以下脚本:

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为分类表添加更新时间触发器
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为网站表添加更新时间触发器
CREATE TRIGGER update_websites_updated_at
    BEFORE UPDATE ON websites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为设置表添加更新时间触发器
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
          `
        }, { status: 503 })
      }

      return NextResponse.json({
        success: false,
        message: '数据库初始化失败: ' + dbError.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ 初始化请求处理失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误: ' + error.message },
      { status: 500 }
    )
  }
}
