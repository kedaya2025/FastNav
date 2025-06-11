'use client'

import { Website } from '@/lib/data'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface WebsiteCardProps {
  website: Website
}

export default function WebsiteCard({ website }: WebsiteCardProps) {
  const handleClick = () => {
    window.open(website.url, '_blank', 'noopener,noreferrer')
  }

  // 从网站颜色生成RGB值
  const getRGBFromHex = (hex: string) => {
    const color = hex.replace('#', '')
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    return `${r}, ${g}, ${b}`
  }

  const websiteColor = website.color || '#6366f1'
  const rgbColor = getRGBFromHex(websiteColor)

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer relative overflow-hidden rounded-xl border border-white/20 dark:border-gray-800/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      style={{
        background: `linear-gradient(135deg, rgba(${rgbColor}, 0.1) 0%, rgba(${rgbColor}, 0.05) 100%)`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* 毛玻璃光泽效果 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, rgba(${rgbColor}, 0.2) 0%, rgba(${rgbColor}, 0.1) 50%, rgba(${rgbColor}, 0.05) 100%)`,
        }}
      />

      {/* 边框光效 */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, rgba(${rgbColor}, 0.3), rgba(${rgbColor}, 0.1))`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      <div className="relative p-3">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg"
            style={{
              backgroundColor: websiteColor,
              boxShadow: `0 4px 20px rgba(${rgbColor}, 0.4)`
            }}
          >
            {website.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {website.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {website.description}
            </p>
            <span className="text-xs text-muted-foreground/70 truncate block mt-0.5">
              {website.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
            </span>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-300 opacity-0 group-hover:opacity-100 flex-shrink-0 transform group-hover:scale-110" />
        </div>
      </div>
    </div>
  )
}
