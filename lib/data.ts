export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  icon?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories = [
  { id: 'all', name: '全部', icon: 'Grid3X3' },
  { id: 'search', name: '搜索引擎', icon: 'Search' },
  { id: 'social', name: '社交媒体', icon: 'Users' },
  { id: 'dev', name: '开发工具', icon: 'Code' },
  { id: 'design', name: '设计资源', icon: 'Palette' },
  { id: 'productivity', name: '效率工具', icon: 'Zap' },
  { id: 'entertainment', name: '娱乐休闲', icon: 'Play' },
  { id: 'news', name: '新闻资讯', icon: 'Newspaper' },
  { id: 'shopping', name: '购物网站', icon: 'ShoppingBag' },
  { id: 'education', name: '学习教育', icon: 'BookOpen' },
];

// 获取当前的分类和网站数据（优先从数据库，fallback 到 localStorage，最后使用默认数据）
export async function getCurrentData() {
  // 服务端渲染时返回默认数据
  if (typeof window === 'undefined') {
    return { categories, websites: defaultWebsites }
  }

  try {
    // 首先尝试从数据库获取数据
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
      return {
        categories: dbCategories,
        websites: dbWebsites
      }
    }

    // 否则 fallback 到 localStorage
    const adminCategories = localStorage.getItem('fastnav_admin_categories')
    const adminWebsites = localStorage.getItem('fastnav_admin_websites')

    return {
      categories: adminCategories ? JSON.parse(adminCategories) : categories,
      websites: adminWebsites ? JSON.parse(adminWebsites) : defaultWebsites
    }
  } catch {
    return { categories, websites: defaultWebsites }
  }
}

// 同步版本，用于服务端渲染和需要立即返回的场景
export function getCurrentDataSync() {
  if (typeof window === 'undefined') {
    return { categories, websites: defaultWebsites }
  }

  try {
    const adminCategories = localStorage.getItem('fastnav_admin_categories')
    const adminWebsites = localStorage.getItem('fastnav_admin_websites')

    return {
      categories: adminCategories ? JSON.parse(adminCategories) : categories,
      websites: adminWebsites ? JSON.parse(adminWebsites) : defaultWebsites
    }
  } catch {
    return { categories, websites: defaultWebsites }
  }
}

export const defaultWebsites: Website[] = [
  // 搜索引擎
  {
    id: '1',
    name: 'Google',
    url: 'https://www.google.com',
    description: '全球最大的搜索引擎',
    category: 'search',
    color: '#4285f4'
  },
  {
    id: '2',
    name: '百度',
    url: 'https://www.baidu.com',
    description: '中国最大的搜索引擎',
    category: 'search',
    color: '#2932e1'
  },
  {
    id: '3',
    name: 'Bing',
    url: 'https://www.bing.com',
    description: '微软搜索引擎',
    category: 'search',
    color: '#0078d4'
  },
  
  // 社交媒体
  {
    id: '4',
    name: 'Twitter',
    url: 'https://twitter.com',
    description: '全球社交媒体平台',
    category: 'social',
    color: '#1da1f2'
  },
  {
    id: '5',
    name: '微博',
    url: 'https://weibo.com',
    description: '中国社交媒体平台',
    category: 'social',
    color: '#e6162d'
  },
  {
    id: '6',
    name: 'Instagram',
    url: 'https://www.instagram.com',
    description: '图片分享社交平台',
    category: 'social',
    color: '#e4405f'
  },
  
  // 开发工具
  {
    id: '7',
    name: 'GitHub',
    url: 'https://github.com',
    description: '代码托管和协作平台',
    category: 'dev',
    color: '#181717'
  },
  {
    id: '8',
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    description: '程序员问答社区',
    category: 'dev',
    color: '#f48024'
  },
  {
    id: '9',
    name: 'CodePen',
    url: 'https://codepen.io',
    description: '前端代码分享平台',
    category: 'dev',
    color: '#000000'
  },
  
  // 设计资源
  {
    id: '10',
    name: 'Dribbble',
    url: 'https://dribbble.com',
    description: '设计师作品展示平台',
    category: 'design',
    color: '#ea4c89'
  },
  {
    id: '11',
    name: 'Behance',
    url: 'https://www.behance.net',
    description: 'Adobe创意作品平台',
    category: 'design',
    color: '#1769ff'
  },
  {
    id: '12',
    name: 'Figma',
    url: 'https://www.figma.com',
    description: '协作设计工具',
    category: 'design',
    color: '#f24e1e'
  },
  
  // 效率工具
  {
    id: '13',
    name: 'Notion',
    url: 'https://www.notion.so',
    description: '全能笔记和协作工具',
    category: 'productivity',
    color: '#000000'
  },
  {
    id: '14',
    name: 'Trello',
    url: 'https://trello.com',
    description: '项目管理工具',
    category: 'productivity',
    color: '#0079bf'
  },
  {
    id: '15',
    name: 'Slack',
    url: 'https://slack.com',
    description: '团队沟通协作平台',
    category: 'productivity',
    color: '#4a154b'
  },
  
  // 娱乐休闲
  {
    id: '16',
    name: 'YouTube',
    url: 'https://www.youtube.com',
    description: '全球最大视频分享平台',
    category: 'entertainment',
    color: '#ff0000'
  },
  {
    id: '17',
    name: 'Netflix',
    url: 'https://www.netflix.com',
    description: '在线视频流媒体服务',
    category: 'entertainment',
    color: '#e50914'
  },
  {
    id: '18',
    name: 'Spotify',
    url: 'https://www.spotify.com',
    description: '音乐流媒体平台',
    category: 'entertainment',
    color: '#1db954'
  },
  
  // 新闻资讯
  {
    id: '19',
    name: 'BBC News',
    url: 'https://www.bbc.com/news',
    description: '英国广播公司新闻',
    category: 'news',
    color: '#bb1919'
  },
  {
    id: '20',
    name: 'CNN',
    url: 'https://www.cnn.com',
    description: '美国有线电视新闻网',
    category: 'news',
    color: '#cc0000'
  },
  
  // 购物网站
  {
    id: '21',
    name: 'Amazon',
    url: 'https://www.amazon.com',
    description: '全球最大电商平台',
    category: 'shopping',
    color: '#ff9900'
  },
  {
    id: '22',
    name: '淘宝',
    url: 'https://www.taobao.com',
    description: '中国最大购物网站',
    category: 'shopping',
    color: '#ff4400'
  },
  
  // 学习教育
  {
    id: '23',
    name: 'Coursera',
    url: 'https://www.coursera.org',
    description: '在线课程学习平台',
    category: 'education',
    color: '#0056d3'
  },
  {
    id: '24',
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    description: '免费在线教育平台',
    category: 'education',
    color: '#14bf96'
  },
];

// 为了向后兼容，保持websites的导出
export const websites = defaultWebsites;
