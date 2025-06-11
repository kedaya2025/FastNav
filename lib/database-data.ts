import { Website } from './data'

export interface DatabaseCategory {
  id: string
  name: string
  icon: string
  created_at?: string
  updated_at?: string
}

// 数据库数据管理类
export class DatabaseDataManager {
  // 获取分类数据
  static async getCategories(): Promise<DatabaseCategory[]> {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('获取分类失败')
      }
      
      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error('获取分类失败:', error)
      return []
    }
  }

  // 保存分类数据
  static async saveCategories(categories: DatabaseCategory[]): Promise<boolean> {
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('保存分类失败:', error)
      return false
    }
  }

  // 添加单个分类
  static async addCategory(category: DatabaseCategory): Promise<boolean> {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('添加分类失败:', error)
      return false
    }
  }

  // 获取网站数据
  static async getWebsites(): Promise<Website[]> {
    try {
      const response = await fetch('/api/websites')
      if (!response.ok) {
        throw new Error('获取网站失败')
      }
      
      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error('获取网站失败:', error)
      return []
    }
  }

  // 保存网站数据
  static async saveWebsites(websites: Website[]): Promise<boolean> {
    try {
      const response = await fetch('/api/websites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websites }),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('保存网站失败:', error)
      return false
    }
  }

  // 添加单个网站
  static async addWebsite(website: Website): Promise<boolean> {
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(website),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('添加网站失败:', error)
      return false
    }
  }

  // 更新单个网站
  static async updateWebsite(id: string, website: Partial<Website>): Promise<boolean> {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(website),
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('更新网站失败:', error)
      return false
    }
  }

  // 删除单个网站
  static async deleteWebsite(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('删除网站失败:', error)
      return false
    }
  }


}

// React Hook for database data management
export function useDatabaseData() {
  return {
    getCategories: DatabaseDataManager.getCategories,
    saveCategories: DatabaseDataManager.saveCategories,
    addCategory: DatabaseDataManager.addCategory,
    getWebsites: DatabaseDataManager.getWebsites,
    saveWebsites: DatabaseDataManager.saveWebsites,
    addWebsite: DatabaseDataManager.addWebsite,
    updateWebsite: DatabaseDataManager.updateWebsite,
    deleteWebsite: DatabaseDataManager.deleteWebsite,
  }
}
