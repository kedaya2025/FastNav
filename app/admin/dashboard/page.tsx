'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Settings,
  LogOut,
  FolderOpen,
  Globe,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Github
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import DataMigration from '../components/DataMigration'
import { categories as initialCategories, websites as initialWebsites, Website } from '@/lib/data'
import { AdminDataManager } from '@/lib/admin-data'

interface Category {
  id: string
  name: string
  icon: string
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [websites, setWebsites] = useState<Website[]>(initialWebsites)
  const [selectedCategory, setSelectedCategory] = useState('search')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingWebsite, setEditingWebsite] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newWebsiteName, setNewWebsiteName] = useState('')
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('')
  const [newWebsiteDescription, setNewWebsiteDescription] = useState('')
  const [newWebsiteColor, setNewWebsiteColor] = useState('#6366f1')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddWebsite, setShowAddWebsite] = useState(false)
  const [editingWebsiteData, setEditingWebsiteData] = useState<{
    name: string
    description: string
    url: string
    color: string
    category: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMigration, setShowMigration] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeApp = async () => {
      // 检查登录状态
      const loggedIn = localStorage.getItem('adminLoggedIn')
      const loginTime = localStorage.getItem('adminLoginTime')

      if (loggedIn === 'true' && loginTime) {
        // 检查登录是否过期 (24小时)
        const now = Date.now()
        const loginTimestamp = parseInt(loginTime)
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (now - loginTimestamp < twentyFourHours) {
          setIsAuthenticated(true)

          // 检查是否需要显示数据迁移提示
          setShowMigration(AdminDataManager.hasLocalStorageData())

          try {
            // 初始化数据
            await AdminDataManager.initializeData(initialCategories, initialWebsites)

            // 加载保存的数据
            const savedCategories = await AdminDataManager.getCategories()
            const savedWebsites = await AdminDataManager.getWebsites()

            if (savedCategories.length > 0) {
              setCategories(savedCategories.filter(cat => cat.id !== 'all'))
            } else {
              setCategories(initialCategories.filter(cat => cat.id !== 'all'))
            }
            if (savedWebsites.length > 0) {
              setWebsites(savedWebsites)
            }
          } catch (error) {
            console.error('数据加载失败:', error)
            // Fallback 到同步方法
            const savedCategories = AdminDataManager.getCategoriesSync()
            const savedWebsites = AdminDataManager.getWebsitesSync()

            if (savedCategories.length > 0) {
              setCategories(savedCategories.filter(cat => cat.id !== 'all'))
            } else {
              setCategories(initialCategories.filter(cat => cat.id !== 'all'))
            }
            if (savedWebsites.length > 0) {
              setWebsites(savedWebsites)
            }
          }

          setIsLoading(false)
        } else {
          handleLogout()
        }
      } else {
        router.push('/admin')
      }
    }

    initializeApp()
  }, [router])

  // 添加全局点击事件来取消编辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // 如果点击的不是输入框或按钮，则取消编辑
      if (!target.closest('input') && !target.closest('button')) {
        setEditingCategory(null)
        setEditingWebsite(null)
        setEditingWebsiteData(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminLoginTime')
    router.push('/admin')
  }

  const handleSaveCategory = async (categoryId: string, newName: string) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, name: newName } : cat
    )
    setCategories(updatedCategories)
    await AdminDataManager.saveCategories(updatedCategories)
    setEditingCategory(null)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('确定要删除这个分类吗？该分类下的所有网站也将被删除。')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      const updatedWebsites = websites.filter(site => site.category !== categoryId)

      setCategories(updatedCategories)
      setWebsites(updatedWebsites)
      await Promise.all([
        AdminDataManager.saveCategories(updatedCategories),
        AdminDataManager.saveWebsites(updatedWebsites)
      ])

      // 如果删除的是当前选中的分类，切换到第一个分类
      if (selectedCategory === categoryId && updatedCategories.length > 0) {
        setSelectedCategory(updatedCategories[0].id)
      }
    }
  }

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newId = `category_${Date.now()}`
      const updatedCategories = [...categories, {
        id: newId,
        name: newCategoryName.trim(),
        icon: 'Folder'
      }]
      setCategories(updatedCategories)
      await AdminDataManager.saveCategories(updatedCategories)
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  const handleStartEditWebsite = (website: Website) => {
    setEditingWebsite(website.id)
    setEditingWebsiteData({
      name: website.name,
      description: website.description,
      url: website.url,
      color: website.color || '#6366f1',
      category: website.category
    })
  }

  const handleSaveWebsite = async (websiteId: string) => {
    if (!editingWebsiteData) return

    const updatedWebsites = websites.map(site =>
      site.id === websiteId ? { ...site, ...editingWebsiteData } : site
    )
    setWebsites(updatedWebsites)
    await AdminDataManager.saveWebsites(updatedWebsites)
    setEditingWebsite(null)
    setEditingWebsiteData(null)
  }

  const handleDeleteWebsite = async (websiteId: string) => {
    if (confirm('确定要删除这个网站吗？')) {
      const updatedWebsites = websites.filter(site => site.id !== websiteId)
      setWebsites(updatedWebsites)
      await AdminDataManager.saveWebsites(updatedWebsites)
    }
  }

  const handleAddWebsite = async () => {
    if (newWebsiteName.trim() && newWebsiteUrl.trim() && newWebsiteDescription.trim()) {
      const newWebsite: Website = {
        id: `website_${Date.now()}`,
        name: newWebsiteName.trim(),
        url: newWebsiteUrl.trim(),
        description: newWebsiteDescription.trim(),
        category: selectedCategory,
        color: newWebsiteColor
      }
      const updatedWebsites = [...websites, newWebsite]
      setWebsites(updatedWebsites)
      await AdminDataManager.saveWebsites(updatedWebsites)
      setNewWebsiteName('')
      setNewWebsiteUrl('')
      setNewWebsiteDescription('')
      setNewWebsiteColor('#6366f1')
      setShowAddWebsite(false)
    }
  }

  const handleMigrationComplete = async () => {
    setShowMigration(false)
    // 重新加载数据
    try {
      const savedCategories = await AdminDataManager.getCategories()
      const savedWebsites = await AdminDataManager.getWebsites()

      if (savedCategories.length > 0) {
        setCategories(savedCategories.filter(cat => cat.id !== 'all'))
      }
      if (savedWebsites.length > 0) {
        setWebsites(savedWebsites)
      }
    } catch (error) {
      console.error('重新加载数据失败:', error)
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {!isAuthenticated ? '验证登录状态...' : '加载数据中...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">
                FastNav 管理后台
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/settings')}
                className="text-muted-foreground hover:text-foreground"
              >
                网站设置
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                查看网站
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 bg-background flex justify-center">
        {/* Main Container with Fixed Width */}
        <div className="max-w-7xl w-full bg-background flex flex-col h-full">
          {/* Content Area with Sidebar */}
          <div className="flex-1 flex min-h-0">
            {/* Fixed Left Sidebar - Categories */}
            <aside className="w-64 bg-background border-r border-border flex-shrink-0">
              <div className="h-full flex flex-col">
                {/* Categories Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">分类管理</h2>
                    <Button
                      size="sm"
                      onClick={() => setShowAddCategory(true)}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>添加</span>
                    </Button>
                  </div>
                </div>

                {/* Add Category Form */}
                {showAddCategory && (
                  <div className="p-4 border-b border-border bg-muted/50">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="分类名称"
                        className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      />
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={handleAddCategory}>
                          <Save className="w-3 h-3 mr-1" />
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddCategory(false)
                            setNewCategoryName('')
                          }}
                        >
                          <X className="w-3 h-3 mr-1" />
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories List */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const websiteCount = websites.filter(w => w.category === category.id).length
                      const isSelected = selectedCategory === category.id

                      return (
                        <div
                          key={category.id}
                          className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {editingCategory === category.id ? (
                            <div className="flex items-center space-x-1 w-full overflow-hidden">
                              <input
                                type="text"
                                defaultValue={category.name}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveCategory(category.id, e.currentTarget.value)
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCategory(null)
                                  }
                                }}
                                className="w-24 px-1 py-1 text-xs border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                size="sm"
                                className="rounded-full h-6 px-3 text-xs flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const input = e.currentTarget.parentElement?.querySelector('input')
                                  if (input) {
                                    handleSaveCategory(category.id, input.value)
                                  }
                                }}
                              >
                                <Save className="w-3 h-3 mr-1" />
                                保存
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{category.name}</div>
                                <div className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  {websiteCount} 个网站
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingCategory(category.id)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteCategory(category.id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Side Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Fixed Category Management Section */}
              <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-semibold text-foreground">
                        {categories.find(c => c.id === selectedCategory)?.name || '未知分类'}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        管理该分类下的网站内容
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowAddWebsite(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>添加网站</span>
                    </Button>
                  </div>

                  {/* Add Website Form */}
                  {showAddWebsite && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium text-foreground mb-3">添加新网站</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newWebsiteName}
                          onChange={(e) => setNewWebsiteName(e.target.value)}
                          placeholder="网站名称"
                          className="px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                        <input
                          type="url"
                          value={newWebsiteUrl}
                          onChange={(e) => setNewWebsiteUrl(e.target.value)}
                          placeholder="网站URL (https://...)"
                          className="px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                        <input
                          type="text"
                          value={newWebsiteDescription}
                          onChange={(e) => setNewWebsiteDescription(e.target.value)}
                          placeholder="网站描述"
                          className="px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={newWebsiteColor}
                            onChange={(e) => setNewWebsiteColor(e.target.value)}
                            className="w-10 h-8 border border-input rounded cursor-pointer"
                          />
                          <span className="text-xs text-muted-foreground">品牌色彩</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-4">
                        <Button size="sm" onClick={handleAddWebsite}>
                          <Save className="w-4 h-4 mr-2" />
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddWebsite(false)
                            setNewWebsiteName('')
                            setNewWebsiteUrl('')
                            setNewWebsiteDescription('')
                            setNewWebsiteColor('#6366f1')
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          取消
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Scrollable Websites Content */}
              <main className="flex-1 overflow-y-auto p-6">
                {/* Data Migration Component */}
                {showMigration && (
                  <DataMigration onMigrationComplete={handleMigrationComplete} />
                )}

                {/* Current Category Websites */}
                <div className="space-y-2">
                  {websites
                    .filter(website => website.category === selectedCategory)
                    .map((website) => (
                      <Card key={website.id} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-3">
                          {editingWebsite === website.id && editingWebsiteData ? (
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                                style={{
                                  backgroundColor: editingWebsiteData.color
                                }}
                              >
                                {editingWebsiteData.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex items-center flex-1 space-x-2 min-w-0">
                                <input
                                  type="text"
                                  value={editingWebsiteData.name}
                                  placeholder="网站名称"
                                  className="w-24 px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                                  onChange={(e) => setEditingWebsiteData({...editingWebsiteData, name: e.target.value})}
                                />
                                <input
                                  type="text"
                                  value={editingWebsiteData.description}
                                  placeholder="网站描述"
                                  className="flex-1 px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background min-w-0"
                                  onChange={(e) => setEditingWebsiteData({...editingWebsiteData, description: e.target.value})}
                                />
                                <input
                                  type="url"
                                  value={editingWebsiteData.url}
                                  placeholder="网站URL"
                                  className="w-32 px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                                  onChange={(e) => setEditingWebsiteData({...editingWebsiteData, url: e.target.value})}
                                />
                                <input
                                  type="color"
                                  value={editingWebsiteData.color}
                                  className="w-6 h-6 border border-input rounded cursor-pointer flex-shrink-0"
                                  onChange={(e) => setEditingWebsiteData({...editingWebsiteData, color: e.target.value})}
                                />
                                <select
                                  value={editingWebsiteData.category}
                                  className="w-20 px-1 py-1 text-xs border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background flex-shrink-0"
                                  onChange={(e) => setEditingWebsiteData({...editingWebsiteData, category: e.target.value})}
                                >
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <Button
                                size="sm"
                                onClick={() => handleSaveWebsite(website.id)}
                                className="h-6 px-2 text-xs flex-shrink-0"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                完成
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {/* Website Icon */}
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                                  style={{
                                    backgroundColor: website.color || '#6366f1'
                                  }}
                                >
                                  {website.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Website Info - Aligned Columns */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center">
                                    <div className="w-32 flex-shrink-0">
                                      <span className="font-medium text-foreground truncate block">
                                        {website.name}
                                      </span>
                                    </div>
                                    <div className="w-144 flex-shrink-0 px-3">
                                      <span className="text-sm text-muted-foreground truncate block">
                                        {website.description}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs text-muted-foreground truncate block">
                                        {website.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStartEditWebsite(website)}
                                  className="h-7 w-7"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteWebsite(website.id)}
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                  {/* Empty State */}
                  {websites.filter(w => w.category === selectedCategory).length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🌐</div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        该分类下暂无网站
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        点击上方"添加网站"按钮来添加第一个网站
                      </p>
                      <Button
                        onClick={() => setShowAddWebsite(true)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加网站</span>
                      </Button>
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer - Spans Full Width */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>© 2024 FASTNAV 管理后台. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-3">
              {/* GitHub Icon */}
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/kedaya2025/FastNav"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="访问GitHub仓库"
                >
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
