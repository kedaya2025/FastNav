# FastNav 🚀

现代化的团队导航应用，快速访问常用网站和工具。

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kedaya2025/FastNav&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ADMIN_USERNAME,ADMIN_PASSWORD&regions=hkg1)

## ✨ 特性

- 🎯 快速导航和智能搜索
- 📱 响应式设计，支持深色模式
- 👥 团队协作，安全管理后台
- 🌍 香港区域部署，低延迟访问

## 🏗️ 技术栈

Next.js 14 + TypeScript + Tailwind CSS + Supabase + Vercel

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/kedaya2025/FastNav.git
cd FastNav

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用，http://localhost:3000/admin 进入管理后台。

### 生产部署

#### 一键部署
点击上方 "Deploy to Vercel" 按钮，配置环境变量即可。

#### 手动部署
```bash
npm run deploy
```

#### Supabase 配置
1. 创建 [Supabase](https://supabase.com) 项目（选择香港区域）
2. 获取项目 URL 和 API 密钥
3. 在 Vercel 中配置环境变量
4. 访问 `https://your-app.vercel.app/api/migrate` 初始化数据库

## 🔧 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 生产环境 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 生产环境 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 | 生产环境 |
| `ADMIN_USERNAME` | 管理员用户名 | 是 |
| `ADMIN_PASSWORD` | 管理员密码 | 是 |
| `DB_HOST` | 数据库主机 | 开发环境 |
| `DB_PORT` | 数据库端口 | 开发环境 |
| `DB_NAME` | 数据库名称 | 开发环境 |
| `DB_USER` | 数据库用户 | 开发环境 |
| `DB_PASSWORD` | 数据库密码 | 开发环境 |

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
