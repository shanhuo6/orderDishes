// 全局类型定义

export interface Dish {
  id: number
  category: string
  name: string
  price: number
  description: string
  image: string
  available: boolean
}

export interface CartItem {
  dish: Dish
  quantity: number
  options: {
    xiangcai: boolean   // 香菜
    cong: boolean       // 葱
    jiang: boolean      // 姜
    rice: string        // 米饭分量: 'none' | 'half' | 'small' | 'full'
    note: string        // 备注
  }
}

export interface Config {
  shopName: string
  bannerImage: string
  qrcodeImage: string
}

export interface Review {
  id: string
  rating: number
  content: string
  created_at: string
}
