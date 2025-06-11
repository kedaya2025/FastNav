-- FastNav 数据库表结构
-- 兼容 PostgreSQL (Supabase)

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
INSERT INTO websites (id, name, url, description, category, color) VALUES
  -- 搜索引擎
  ('1', 'Google', 'https://www.google.com', '全球最大的搜索引擎', 'search', '#4285f4'),
  ('2', '百度', 'https://www.baidu.com', '中国最大的搜索引擎', 'search', '#2932e1'),
  ('3', 'Bing', 'https://www.bing.com', '微软搜索引擎', 'search', '#0078d4'),
  
  -- 社交媒体
  ('4', 'Twitter', 'https://twitter.com', '全球社交媒体平台', 'social', '#1da1f2'),
  ('5', '微博', 'https://weibo.com', '中国社交媒体平台', 'social', '#e6162d'),
  ('6', 'Instagram', 'https://www.instagram.com', '图片社交平台', 'social', '#e4405f'),
  
  -- 开发工具
  ('7', 'GitHub', 'https://github.com', '代码托管平台', 'dev', '#181717'),
  ('8', 'Stack Overflow', 'https://stackoverflow.com', '程序员问答社区', 'dev', '#f48024'),
  ('9', 'MDN', 'https://developer.mozilla.org', 'Web开发文档', 'dev', '#000000'),
  
  -- 设计资源
  ('10', 'Dribbble', 'https://dribbble.com', '设计师作品展示平台', 'design', '#ea4c89'),
  ('11', 'Behance', 'https://www.behance.net', 'Adobe创意作品平台', 'design', '#1769ff'),
  ('12', 'Figma', 'https://www.figma.com', '在线设计协作工具', 'design', '#f24e1e'),
  
  -- 效率工具
  ('13', 'Notion', 'https://www.notion.so', '全能笔记和协作工具', 'productivity', '#000000'),
  ('14', 'Trello', 'https://trello.com', '项目管理工具', 'productivity', '#0079bf'),
  ('15', 'Slack', 'https://slack.com', '团队沟通工具', 'productivity', '#4a154b'),
  
  -- 娱乐休闲
  ('16', 'YouTube', 'https://www.youtube.com', '全球最大视频平台', 'entertainment', '#ff0000'),
  ('17', '哔哩哔哩', 'https://www.bilibili.com', '中国弹幕视频网站', 'entertainment', '#00a1d6'),
  ('18', 'Netflix', 'https://www.netflix.com', '在线流媒体平台', 'entertainment', '#e50914'),
  
  -- 新闻资讯
  ('19', 'BBC News', 'https://www.bbc.com/news', '英国广播公司新闻', 'news', '#bb1919'),
  ('20', 'CNN', 'https://www.cnn.com', '美国有线电视新闻网', 'news', '#cc0000'),
  ('21', '新浪新闻', 'https://news.sina.com.cn', '新浪新闻门户', 'news', '#d52b1e'),
  
  -- 购物网站
  ('22', '淘宝', 'https://www.taobao.com', '中国最大购物网站', 'shopping', '#ff4400'),
  ('23', 'Amazon', 'https://www.amazon.com', '全球最大电商平台', 'shopping', '#ff9900'),
  
  -- 学习教育
  ('24', 'Coursera', 'https://www.coursera.org', '在线课程学习平台', 'education', '#0056d3'),
  ('25', 'Khan Academy', 'https://www.khanacademy.org', '免费在线教育平台', 'education', '#14bf96')
ON CONFLICT (id) DO NOTHING;

-- 插入默认设置数据
INSERT INTO settings (key, value) VALUES
  ('site_title', 'FastNav - 现代化网址导航'),
  ('site_description', '简约时尚的网址导航站点，快速访问您喜爱的网站'),
  ('site_keywords', '网址导航,书签,网站收藏,快速导航,团队导航')
ON CONFLICT (key) DO NOTHING;
