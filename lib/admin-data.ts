import { Website } from './data'
import { DatabaseDataManager, DatabaseCategory } from './database-data'

export interface AdminCategory {
  id: string
  name: string
  icon: string
}

// 管理后台数据管理（支持数据库和 localStorage）
export class AdminDataManager {
  private static CATEGORIES_KEY = 'fastnav_admin_categories'
  private static WEBSITES_KEY = 'fastnav_admin_websites'
  private static USE_DATABASE = true // 是否使用数据库

  // 获取分类数据（优先数据库，fallback 到 localStorage）
  static async getCategories(): Promise<AdminCategory[]> {
    if (this.USE_DATABASE) {
      try {
        const dbCategories = await DatabaseDataManager.getCategories()
        if (dbCategories.length > 0) {
          return dbCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon
          }))
        }
      } catch (error) {
        console.error('从数据库获取分类失败，fallback 到 localStorage:', error)
      }
    }

    // Fallback 到 localStorage
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.CATEGORIES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // 获取分类数据（同步版本，仅 localStorage）
  static getCategoriesSync(): AdminCategory[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.CATEGORIES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // 保存分类数据（优先数据库，同时保存到 localStorage 作为备份）
  static async saveCategories(categories: AdminCategory[]): Promise<boolean> {
    let success = false

    if (this.USE_DATABASE) {
      try {
        const dbCategories: DatabaseCategory[] = categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon
        }))
        success = await DatabaseDataManager.saveCategories(dbCategories)
      } catch (error) {
        console.error('保存分类到数据库失败:', error)
      }
    }

    // 同时保存到 localStorage 作为备份
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories))
        if (!success) success = true // 如果数据库失败但 localStorage 成功，也算成功
      } catch (error) {
        console.error('保存分类到 localStorage 失败:', error)
      }
    }

    return success
  }

  // 获取网站数据（优先数据库，fallback 到 localStorage）
  static async getWebsites(): Promise<Website[]> {
    if (this.USE_DATABASE) {
      try {
        const dbWebsites = await DatabaseDataManager.getWebsites()
        if (dbWebsites.length > 0) {
          return dbWebsites
        }
      } catch (error) {
        console.error('从数据库获取网站失败，fallback 到 localStorage:', error)
      }
    }

    // Fallback 到 localStorage
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.WEBSITES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // 获取网站数据（同步版本，仅 localStorage）
  static getWebsitesSync(): Website[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.WEBSITES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // 保存网站数据（优先数据库，同时保存到 localStorage 作为备份）
  static async saveWebsites(websites: Website[]): Promise<boolean> {
    let success = false

    if (this.USE_DATABASE) {
      try {
        success = await DatabaseDataManager.saveWebsites(websites)
      } catch (error) {
        console.error('保存网站到数据库失败:', error)
      }
    }

    // 同时保存到 localStorage 作为备份
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.WEBSITES_KEY, JSON.stringify(websites))
        if (!success) success = true // 如果数据库失败但 localStorage 成功，也算成功
      } catch (error) {
        console.error('保存网站到 localStorage 失败:', error)
      }
    }

    return success
  }

  // 初始化数据（如果数据库和本地存储都为空，则使用默认数据）
  static async initializeData(defaultCategories: AdminCategory[], defaultWebsites: Website[]): Promise<void> {
    const existingCategories = await this.getCategories()
    const existingWebsites = await this.getWebsites()

    if (existingCategories.length === 0) {
      await this.saveCategories(defaultCategories)
    }

    if (existingWebsites.length === 0) {
      await this.saveWebsites(defaultWebsites)
    }
  }

  // 清除所有数据（包括数据库和 localStorage）
  static async clearAllData(): Promise<void> {
    // 清除 localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CATEGORIES_KEY)
      localStorage.removeItem(this.WEBSITES_KEY)
    }

    // TODO: 添加清除数据库数据的 API
    // 目前暂时只清除 localStorage
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

  // 数据迁移
  static async migrateToDatabase(): Promise<{ success: boolean; message: string }> {
    return await DatabaseDataManager.migrateFromLocalStorage()
  }

  // 检查是否需要数据迁移
  static hasLocalStorageData(): boolean {
    return DatabaseDataManager.hasLocalStorageData()
  }
}

// React Hook for admin data management
export function useAdminData() {
  return {
    getCategories: AdminDataManager.getCategories,
    getCategoriesSync: AdminDataManager.getCategoriesSync,
    saveCategories: AdminDataManager.saveCategories,
    getWebsites: AdminDataManager.getWebsites,
    getWebsitesSync: AdminDataManager.getWebsitesSync,
    saveWebsites: AdminDataManager.saveWebsites,
    initializeData: AdminDataManager.initializeData,
    clearAllData: AdminDataManager.clearAllData,
    exportData: AdminDataManager.exportData,
    importData: AdminDataManager.importData,
    migrateToDatabase: AdminDataManager.migrateToDatabase,
    hasLocalStorageData: AdminDataManager.hasLocalStorageData,
  }
}
