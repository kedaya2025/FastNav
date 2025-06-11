#!/bin/bash

# FastNav 部署脚本
# 用于自动化部署到 Vercel (香港区域)

set -e

echo "🚀 开始部署 FastNav 到 Vercel (香港区域)..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "📝 请登录 Vercel..."
    vercel login
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到 Vercel
echo "🌐 部署到 Vercel (香港区域)..."
vercel --prod --regions hkg1

echo "✅ 部署完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在 Vercel 控制台配置环境变量"
echo "2. 连接 Supabase 数据库"
echo "3. 运行数据库迁移"
echo ""
echo "🔗 有用的链接："
echo "- Vercel 控制台: https://vercel.com/dashboard"
echo "- Supabase 控制台: https://supabase.com/dashboard"
