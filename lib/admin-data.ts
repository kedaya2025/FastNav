import { Website } from './data'
import { DatabaseDataManager, DatabaseCategory } from './database-data'

export interface AdminCategory {
  id: string
  name: string
  icon: string
}

// 管理后台数据管理（纯云端数据库存储）
export class AdminDataManager {
  // 获取分类数据（从数据库）
  static async getCategories(): Promise<AdminCategory[]> {
    try {
      const dbCategories = await DatabaseDataManager.getCategories()
      return dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      }))
    } catch (error) {
      console.error('从数据库获取分类失败:', error)
      return []
    }
  }

  // 保存分类数据（到数据库）
  static async saveCategories(categories: AdminCategory[]): Promise<boolean> {
    try {
      const dbCategories: DatabaseCategory[] = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      }))
      return await DatabaseDataManager.saveCategories(dbCategories)
    } catch (error) {
      console.error('保存分类到数据库失败:', error)
      return false
    }
  }

  // 获取网站数据（从数据库）
  static async getWebsites(): Promise<Website[]> {
    try {
      return await DatabaseDataManager.getWebsites()
    } catch (error) {
      console.error('从数据库获取网站失败:', error)
      return []
    }
  }

  // 保存网站数据（到数据库）
  static async saveWebsites(websites: Website[]): Promise<boolean> {
    try {
      return await DatabaseDataManager.saveWebsites(websites)
    } catch (error) {
      console.error('保存网站到数据库失败:', error)
      return false
    }
  }

  // 导出数据
  static async exportData(): Promise<{ categories: AdminCategory[], websites: Website[] }> {
    const categories = await this.getCategories()
    const websites = await this.getWebsites()
    return { categories, websites }
  }

  // 导入数据
  static async importData(data: { categories: AdminCategory[], websites: Website[] }): Promise<boolean> {
    const categoriesSuccess = await this.saveCategories(data.categories)
    const websitesSuccess = await this.saveWebsites(data.websites)
    return categoriesSuccess && websitesSuccess
  }
}

// React Hook for admin data management
export function useAdminData() {
  return {
    getCategories: AdminDataManager.getCategories,
    saveCategories: AdminDataManager.saveCategories,
    getWebsites: AdminDataManager.getWebsites,
    saveWebsites: AdminDataManager.saveWebsites,
    exportData: AdminDataManager.exportData,
    importData: AdminDataManager.importData,
  }
}
