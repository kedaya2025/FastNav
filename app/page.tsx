'use client'

import { useState, useMemo, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import WebsiteCard from './components/WebsiteCard'
import ThemeToggle from './components/ThemeToggle'
import { websites as defaultWebsites, categories as defaultCategories, getCurrentDataSync } from '@/lib/data'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [websites, setWebsites] = useState(defaultWebsites)
  const [categories, setCategories] = useState(defaultCategories)
  const [isLoading, setIsLoading] = useState(true)

  // 加载管理后台的数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 尝试从数据库获取数据
        const [categoriesResponse, websitesResponse] = await Promise.all([
          fetch('/api/categories').catch(() => null),
          fetch('/api/websites').catch(() => null)
        ])

        let dbCategories = null
        let dbWebsites = null

        if (categoriesResponse?.ok) {
          const categoriesData = await categoriesResponse.json()
          if (categoriesData.success) {
            dbCategories = categoriesData.data
          }
        }

        if (websitesResponse?.ok) {
          const websitesData = await websitesResponse.json()
          if (websitesData.success) {
            dbWebsites = websitesData.data
          }
        }

        // 如果数据库有数据，使用数据库数据
        if (dbCategories && dbWebsites) {
          setCategories(dbCategories)
          setWebsites(dbWebsites)
        } else {
          // 否则 fallback 到 localStorage
          const currentData = getCurrentDataSync()
          setWebsites(currentData.websites)
          setCategories(currentData.categories)
        }
      } catch (error) {
        console.error('数据加载失败:', error)
        // 出错时使用 localStorage 数据
        const currentData = getCurrentDataSync()
        setWebsites(currentData.websites)
        setCategories(currentData.categories)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredWebsites = useMemo(() => {
    if (!websites || !Array.isArray(websites)) return []

    return websites.filter(website => {
      const matchesSearch = website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          website.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          website.url.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || website.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [websites, searchQuery, selectedCategory])

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex justify-center">
      {/* Main Container with Fixed Width */}
      <div className="max-w-7xl w-full bg-background flex flex-col">
        {/* Fixed Header Section - Spans Full Container Width */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-50">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
                FASTNAV
              </span>
            </div>
            
            {/* Right side navigation */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content Area with Sidebar */}
        <div className="flex-1 flex min-h-0">
          {/* Fixed Left Sidebar - Categories Only */}
          <aside className="hidden lg:block w-48 bg-background border-r border-border flex-shrink-0">
            <div className="h-full flex flex-col">
              {/* Categories */}
              <div className="flex-1 p-6 overflow-y-auto">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </div>
          </aside>

          {/* Right Side Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Fixed Search Section */}
            <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
              <div className="px-6 py-4">
                {/* Search Section */}
                <div className="max-w-2xl mx-auto">
                  <SearchBar onSearch={setSearchQuery} />
                </div>
              </div>
            </section>

            {/* Scrollable Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {/* Mobile Category Filter */}
              <div className="lg:hidden mb-6">
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {categories && Array.isArray(categories) && categories.map((category) => {
                    const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>
                    const isSelected = selectedCategory === category.id

                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center space-x-2 whitespace-nowrap"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{category.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Results Count */}
              {(searchQuery || selectedCategory !== 'all') && (
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    找到 <span className="font-semibold text-foreground">{filteredWebsites.length}</span> 个网站
                  </p>
                </div>
              )}

              {/* Website Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWebsites.map((website, index) => (
                  <div
                    key={website.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-slide-up"
                  >
                    <WebsiteCard website={website} />
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredWebsites.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    没有找到相关网站
                  </h3>
                  <p className="text-muted-foreground">
                    尝试调整搜索关键词或选择其他分类
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Fixed Footer - Spans Full Container Width */}
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>© 2024 FASTNAV. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-3">
              {/* GitHub Icon */}
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="访问GitHub"
                >
                  <Icons.Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
