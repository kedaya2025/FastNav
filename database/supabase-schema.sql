-- FastNav Supabase 数据库表结构
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建网站表
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

-- 创建设置表
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
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为网站表添加更新时间触发器
DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
CREATE TRIGGER update_websites_updated_at
    BEFORE UPDATE ON websites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为设置表添加更新时间触发器
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入默认分类数据
INSERT INTO categories (id, name, icon) VALUES
  ('all', '全部', 'Grid3X3'),
  ('search', '搜索引擎', 'Search'),
  ('social', '社交媒体', 'Users'),
  ('dev', '开发工具', 'Code'),
  ('design', '设计资源', 'Palette'),
  ('productivity', '效率工具', 'Zap'),
  ('entertainment', '娱乐休闲', 'Play'),
  ('news', '新闻资讯', 'Newspaper'),
  ('shopping', '购物网站', 'ShoppingBag'),
  ('education', '学习教育', 'BookOpen')
ON CONFLICT (id) DO NOTHING;

-- 插入默认网站数据
INSERT INTO websites (id, name, url, description, category, icon, color) VALUES
  ('google', 'Google', 'https://www.google.com', '全球最大的搜索引擎', 'search', NULL, '#4285f4'),
  ('baidu', '百度', 'https://www.baidu.com', '中国最大的搜索引擎', 'search', NULL, '#2932e1'),
  ('bing', 'Bing', 'https://www.bing.com', '微软搜索引擎', 'search', NULL, '#0078d4'),
  ('twitter', 'Twitter', 'https://twitter.com', '全球社交媒体平台', 'social', NULL, '#1da1f2'),
  ('weibo', '微博', 'https://weibo.com', '中国社交媒体平台', 'social', NULL, '#e6162d'),
  ('instagram', 'Instagram', 'https://www.instagram.com', '图片社交平台', 'social', NULL, '#e4405f'),
  ('github', 'GitHub', 'https://github.com', '代码托管平台', 'dev', NULL, '#181717'),
  ('stackoverflow', 'Stack Overflow', 'https://stackoverflow.com', '程序员问答社区', 'dev', NULL, '#f48024'),
  ('mdn', 'MDN', 'https://developer.mozilla.org', 'Web开发文档', 'dev', NULL, '#000000'),
  ('dribbble', 'Dribbble', 'https://dribbble.com', '设计师作品展示平台', 'design', NULL, '#ea4c89'),
  ('figma', 'Figma', 'https://www.figma.com', '在线设计协作工具', 'design', NULL, '#f24e1e'),
  ('notion', 'Notion', 'https://www.notion.so', '全能工作空间', 'productivity', NULL, '#000000'),
  ('trello', 'Trello', 'https://trello.com', '项目管理工具', 'productivity', NULL, '#0079bf'),
  ('youtube', 'YouTube', 'https://www.youtube.com', '全球最大视频平台', 'entertainment', NULL, '#ff0000'),
  ('bilibili', 'Bilibili', 'https://www.bilibili.com', '中国知名视频弹幕网站', 'entertainment', NULL, '#00a1d6'),
  ('zhihu', '知乎', 'https://www.zhihu.com', '中文互联网知识分享平台', 'news', NULL, '#0084ff'),
  ('reddit', 'Reddit', 'https://www.reddit.com', '社交新闻聚合网站', 'news', NULL, '#ff4500'),
  ('amazon', 'Amazon', 'https://www.amazon.com', '全球最大电商平台', 'shopping', NULL, '#ff9900'),
  ('taobao', '淘宝', 'https://www.taobao.com', '中国最大的网络零售平台', 'shopping', NULL, '#ff4400'),
  ('coursera', 'Coursera', 'https://www.coursera.org', '在线课程学习平台', 'education', NULL, '#0056d3')
ON CONFLICT (id) DO NOTHING;

-- 插入默认设置数据
INSERT INTO settings (key, value) VALUES
  ('site_title', 'FastNav - 现代化网址导航'),
  ('site_description', '简约时尚的网址导航站点，快速访问您喜爱的网站'),
  ('site_keywords', '网址导航,书签,网站收藏,快速导航,团队导航')
ON CONFLICT (key) DO NOTHING;

-- 验证数据插入
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Websites' as table_name, COUNT(*) as count FROM websites
UNION ALL
SELECT 'Settings' as table_name, COUNT(*) as count FROM settings;
