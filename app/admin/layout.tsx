import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FastNav 管理后台',
  description: 'FastNav 网站管理系统',
  robots: 'noindex, nofollow', // 防止搜索引擎索引管理页面
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
