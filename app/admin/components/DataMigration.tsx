'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Database, HardDrive } from 'lucide-react'
import { AdminDataManager } from '@/lib/admin-data'

interface DataMigrationProps {
  onMigrationComplete?: () => void
}

export default function DataMigration({ onMigrationComplete }: DataMigrationProps) {
  const [hasLocalData, setHasLocalData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    // 检查是否有本地数据需要迁移
    setHasLocalData(AdminDataManager.hasLocalStorageData())
  }, [])

  const handleMigration = async () => {
    setIsLoading(true)
    setMigrationStatus(null)

    try {
      const result = await AdminDataManager.migrateToDatabase()
      setMigrationStatus(result)
      
      if (result.success) {
        setHasLocalData(false)
        onMigrationComplete?.()
      }
    } catch (error) {
      setMigrationStatus({
        success: false,
        message: '迁移过程中发生错误'
      })
    }

    setIsLoading(false)
  }

  // 如果没有本地数据，不显示迁移组件
  if (!hasLocalData) {
    return null
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertCircle className="h-5 w-5" />
          数据迁移
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          检测到您有本地存储的数据，建议迁移到数据库以获得更好的性能和可靠性。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">本地存储数据</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  存储在浏览器中，可能会丢失
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                需要迁移
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-2xl text-gray-400">→</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">数据库存储</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  安全可靠，支持团队协作
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">
                推荐使用
              </p>
            </div>
          </div>

          {migrationStatus && (
            <div className={`p-4 rounded-lg border ${
              migrationStatus.success 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {migrationStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p className={`font-medium ${
                  migrationStatus.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {migrationStatus.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleMigration}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '迁移中...' : '开始迁移'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setHasLocalData(false)}
              disabled={isLoading}
            >
              稍后提醒
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
