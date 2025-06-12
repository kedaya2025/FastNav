# Supabase 数据库设置指南

## 问题描述
云端部署后出现数据库连接问题，错误信息：
```
获取分类异常: {
  code: '42P01',
  details: null,
  hint: null,
  message: 'relation "public.categories" does not exist'
}
```

这表明 Supabase 数据库中缺少必要的表结构。

## 解决方案

### 方法一：使用 Supabase Dashboard（推荐）

1. **登录 Supabase Dashboard**
   - 访问 [https://supabase.com](https://supabase.com)
   - 登录您的账户
   - 选择您的项目

2. **执行 SQL 脚本**
   - 在左侧菜单中点击 "SQL Editor"
   - 点击 "New query" 创建新查询
   - 复制 `database/supabase-schema.sql` 文件的内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 执行脚本

3. **验证表创建**
   - 在左侧菜单中点击 "Table Editor"
   - 确认看到以下表：
     - `categories` (分类表)
     - `websites` (网站表)
     - `settings` (设置表)

### 方法二：使用 API 端点初始化（推荐用于生产环境）

使用 curl 命令调用初始化 API：

```bash
curl -X POST https://fast-nav.vercel.app/api/admin/init-db \
  -H "Content-Type: application/json" \
  -d '{"adminPassword":"your_admin_password"}'
```

**响应示例：**

成功响应：
```json
{
  "success": true,
  "message": "数据库初始化成功",
  "data": {
    "categories": 10,
    "websites": 20,
    "settings": 3
  }
}
```

表不存在时的响应：
```json
{
  "success": false,
  "message": "数据库表不存在，请先在 Supabase Dashboard 中创建表结构",
  "error": "TABLES_NOT_EXIST",
  "sqlScript": "-- SQL 脚本内容..."
}
```

## 环境变量检查

确保在 Vercel 部署中设置了以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

## 数据库表结构

### categories 表
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### websites 表
```sql
CREATE TABLE websites (
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
```

### settings 表
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 故障排除

### 1. 权限问题
如果遇到权限错误，确保使用的是 `SUPABASE_SERVICE_ROLE_KEY` 而不是 `SUPABASE_ANON_KEY`。

### 2. 连接超时
检查 Supabase 项目是否处于活跃状态，免费计划的项目在不活跃时会暂停。

### 3. 环境变量未设置
在 Vercel Dashboard 中检查环境变量是否正确设置并已部署。

### 4. 表已存在但数据为空
如果表已存在但没有数据，可以只运行 INSERT 语句部分：

```sql
-- 只插入默认数据，不创建表
INSERT INTO categories (id, name, icon) VALUES
  ('all', '全部', 'Grid3X3'),
  ('search', '搜索引擎', 'Search'),
  -- ... 其他分类
ON CONFLICT (id) DO NOTHING;
```

## 验证设置

执行以下查询验证设置是否成功：

```sql
-- 检查表和数据
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Websites' as table_name, COUNT(*) as count FROM websites
UNION ALL
SELECT 'Settings' as table_name, COUNT(*) as count FROM settings;
```

预期结果：
- Categories: 10 条记录
- Websites: 20 条记录  
- Settings: 3 条记录

## 联系支持

如果按照以上步骤仍然无法解决问题，请检查：
1. Supabase 项目状态
2. 网络连接
3. API 密钥有效性
4. 项目配置
