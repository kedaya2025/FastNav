# FastNav 数据库迁移指南

## 概述

FastNav 项目已从本地存储（localStorage）迁移到数据库存储（Supabase），以支持团队协作和更好的数据管理。

## 数据库架构

### 表结构

#### categories 表
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### websites 表
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

## 环境变量配置

### 本地开发
创建 `.env.local` 文件：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 管理员账号配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### Vercel 部署
Vercel 会自动配置 Supabase 环境变量，只需要手动添加：
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## 数据迁移

### 自动迁移
1. 登录管理后台
2. 如果检测到本地存储数据，会显示迁移提示
3. 点击"开始迁移"按钮
4. 迁移完成后，本地存储数据会被清除

### 手动迁移
如果需要手动迁移，可以使用以下 API：

```javascript
// 迁移数据
const response = await fetch('/api/migrate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    categories: localCategories,
    websites: localWebsites
  }),
});
```

## API 接口

### 分类管理
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建新分类
- `PUT /api/categories` - 批量更新分类

### 网站管理
- `GET /api/websites` - 获取所有网站
- `POST /api/websites` - 创建新网站
- `PUT /api/websites` - 批量更新网站
- `PUT /api/websites/[id]` - 更新单个网站
- `DELETE /api/websites/[id]` - 删除单个网站

### 数据迁移
- `POST /api/migrate` - 迁移本地存储数据到数据库

## 数据管理类

### DatabaseDataManager
新的数据库数据管理类，提供：
- 异步数据操作
- 错误处理
- 类型安全

### AdminDataManager
更新的管理数据类，支持：
- 数据库优先，localStorage 作为备份
- 自动 fallback 机制
- 数据迁移功能

## 兼容性

### 向后兼容
- 支持从 localStorage 自动迁移
- 保持原有 API 接口
- 渐进式升级

### 数据库兼容
- 主要支持 Supabase (PostgreSQL)
- 兼容标准 PostgreSQL 语法
- 支持其他 PostgreSQL 兼容数据库

## 部署步骤

1. **创建 Supabase 项目**
   - 访问 [Supabase](https://supabase.com)
   - 创建新项目
   - 获取项目 URL 和 API 密钥

2. **执行数据库脚本**
   ```sql
   -- 运行 database/schema.sql 中的脚本
   ```

3. **配置环境变量**
   - 本地：创建 `.env.local`
   - Vercel：在项目设置中添加环境变量

4. **部署应用**
   ```bash
   npm run build
   npm run start
   ```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查环境变量配置
   - 确认 Supabase 项目状态
   - 验证 API 密钥权限

2. **迁移失败**
   - 检查数据格式
   - 确认数据库表结构
   - 查看浏览器控制台错误

3. **权限问题**
   - 确认使用 SERVICE_ROLE_KEY
   - 检查 RLS 策略设置

### 调试方法

1. **查看网络请求**
   ```javascript
   // 在浏览器控制台中
   console.log('API Response:', response);
   ```

2. **检查数据库日志**
   - 在 Supabase 控制台查看日志
   - 监控 SQL 查询执行

3. **本地测试**
   ```bash
   # 启动开发服务器
   npm run dev
   
   # 查看控制台输出
   ```

## 性能优化

### 数据库优化
- 使用索引提高查询性能
- 批量操作减少网络请求
- 缓存常用数据

### 前端优化
- 异步加载数据
- 乐观更新 UI
- 错误重试机制

## 安全考虑

### 数据保护
- 使用环境变量存储敏感信息
- 实施适当的访问控制
- 定期备份数据

### API 安全
- 验证输入数据
- 使用 HTTPS 传输
- 实施速率限制
