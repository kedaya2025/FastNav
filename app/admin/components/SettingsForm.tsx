'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface Settings {
  site_title: string
  site_description: string
  site_keywords: string
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({
    site_title: '',
    site_description: '',
    site_keywords: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings({
          site_title: data.data.site_title || '',
          site_description: data.data.site_description || '',
          site_keywords: data.data.site_keywords || ''
        })
      } else {
        toast.error('加载设置失败')
      }
    } catch (error) {
      console.error('加载设置失败:', error)
      toast.error('加载设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('设置保存成功')
      } else {
        toast.error(data.message || '保存设置失败')
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存设置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">加载设置中...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>网站设置</CardTitle>
        <CardDescription>
          配置网站的标题、描述和关键词，这些信息将显示在浏览器标签页和搜索引擎结果中
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site_title">网站标题</Label>
            <Input
              id="site_title"
              value={settings.site_title}
              onChange={(e) => handleInputChange('site_title', e.target.value)}
              placeholder="FastNav - 现代化网址导航"
              maxLength={60}
            />
            <p className="text-sm text-muted-foreground">
              建议长度：50-60个字符，当前：{settings.site_title.length}个字符
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">网站描述</Label>
            <Textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              placeholder="简约时尚的网址导航站点，快速访问您喜爱的网站"
              rows={3}
              maxLength={160}
            />
            <p className="text-sm text-muted-foreground">
              建议长度：120-160个字符，当前：{settings.site_description.length}个字符
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_keywords">关键词</Label>
            <Input
              id="site_keywords"
              value={settings.site_keywords}
              onChange={(e) => handleInputChange('site_keywords', e.target.value)}
              placeholder="网址导航,书签,网站收藏,快速导航"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground">
              用逗号分隔多个关键词，建议3-8个关键词
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
