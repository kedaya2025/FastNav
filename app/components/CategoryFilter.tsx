'use client'

import { Category } from '@/lib/data'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  if (!categories || !Array.isArray(categories)) {
    return null
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>
        const isSelected = selectedCategory === category.id

        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="w-full text-sm font-normal h-9 px-2 flex items-center"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2 flex-shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="flex-1 text-center">{category.name}</span>
          </Button>
        )
      })}
    </div>
  )
}
