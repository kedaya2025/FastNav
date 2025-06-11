import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SettingsDB } from '@/lib/database'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

// 动态生成 metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await SettingsDB.getMultiple([
      'site_title',
      'site_description',
      'site_keywords'
    ])

    return {
      title: settings.site_title || 'FastNav - 现代化网址导航',
      description: settings.site_description || '简约时尚的网址导航站点，快速访问您喜爱的网站',
      keywords: settings.site_keywords || '网址导航,书签,网站收藏,快速导航',
    }
  } catch (error) {
    // 如果获取设置失败，使用默认值
    console.warn('获取网站设置失败，使用默认值:', error)
    return {
      title: 'FastNav - 现代化网址导航',
      description: '简约时尚的网址导航站点，快速访问您喜爱的网站',
      keywords: '网址导航,书签,网站收藏,快速导航',
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
