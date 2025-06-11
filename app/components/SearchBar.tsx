'use client'

import { Search, X, BrainCircuit } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

const quickSearchEngines = [
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'Baidu', url: 'https://www.baidu.com/s?wd=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { name: 'DeepSeek', url: 'https://chat.baidu.com/search?word=' },
]

export default function SearchBar({ onSearch, placeholder = "搜索网站..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [selectedEngine, setSelectedEngine] = useState<string>('local') // 'local' for site search

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedEngine === 'local') {
      // 站内搜索
      onSearch(query)
    } else {
      // 站外搜索
      const engine = quickSearchEngines.find(eng => eng.name.toLowerCase() === selectedEngine)
      if (engine && query.trim()) {
        window.open(engine.url + encodeURIComponent(query), '_blank')
      }
    }
  }

  const clearSearch = () => {
    setQuery('')
    onSearch('')
  }

  const handleEngineSelect = (engineName: string) => {
    setSelectedEngine(engineName.toLowerCase())
  }

  const getPlaceholder = () => {
    if (selectedEngine === 'local') {
      return "搜索网站..."
    }
    const engine = quickSearchEngines.find(eng => eng.name.toLowerCase() === selectedEngine)
    return engine ? `在 ${engine.name} 中搜索...` : "搜索..."
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            // 只有在站内搜索模式下才实时更新搜索结果
            if (selectedEngine === 'local') {
              onSearch(e.target.value)
            }
          }}
          placeholder={getPlaceholder()}
          className="pl-10 pr-10 h-12 text-base rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border-white/20 dark:border-gray-700/50 focus:bg-white/20 dark:focus:bg-gray-800/50 transition-all duration-300"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 z-10 hover:bg-white/20 dark:hover:bg-gray-800/50"
            aria-label="清除搜索"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      {/* Search Engine Selection */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          variant={selectedEngine === 'local' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleEngineSelect('local')}
          className={`rounded-full px-4 py-2 transition-all duration-300 ${selectedEngine === 'local'
            ? "bg-primary text-primary-foreground"
            : "bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-800/50"
          }`}
        >
          站内搜索
        </Button>
        {quickSearchEngines.map((engine) => {
          const isDeepSeek = engine.name === 'DeepSeek'
          const isSelected = selectedEngine === engine.name.toLowerCase()

          if (isDeepSeek) {
            return (
              <Button
                key={engine.name}
                variant="outline"
                size="sm"
                onClick={() => handleEngineSelect(engine.name)}
                className={`
                  rounded-full px-4 py-2 font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2
                  ${isSelected
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-0 shadow-lg shadow-purple-500/25"
                    : "bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white border-0 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 shadow-md hover:shadow-lg hover:shadow-purple-500/25"
                  }
                `}
              >
                <BrainCircuit className="w-4 h-4" />
                {engine.name}
              </Button>
            )
          }

          return (
            <Button
              key={engine.name}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEngineSelect(engine.name)}
              className={`rounded-full px-4 py-2 transition-all duration-300 ${isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-800/50"
              }`}
            >
              {engine.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
