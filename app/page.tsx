'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dishesData from '@/data/dishes.json'
import config from '@/data/config.json'
import type { Dish, CartItem } from '@/types'

function groupByCategory(list: Dish[]) {
  const map = new Map<string, Dish[]>()
  list.filter(d => d.available).forEach(d => {
    if (!map.has(d.category)) map.set(d.category, [])
    map.get(d.category)!.push(d)
  })
  return map
}

const defaultOptions = {
  xiangcai: true,
  cong: true,
  jiang: true,
  rice: 'small',
  note: '',
}

export default function HomePage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const grouped = groupByCategory(dishesData as Dish[])
  const categories = Array.from(grouped.keys())

  useEffect(() => {
    if (categories.length > 0) setActiveCategory(categories[0])
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    for (const cat of categories) {
      const el = categoryRefs.current[cat]
      if (!el) continue
      const offsetTop = el.offsetTop - container.scrollTop
      if (offsetTop >= -10) {
        setActiveCategory(cat)
        break
      }
    }
  }

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat)
    categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getCount = (dishId: number) =>
    cart.find(i => i.dish.id === dishId)?.quantity ?? 0

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id)
      if (existing) {
        return prev.map(i =>
          i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { dish, quantity: 1, options: { ...defaultOptions } }]
    })
  }

  const removeFromCart = (dishId: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dishId)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter(i => i.dish.id !== dishId)
      return prev.map(i =>
        i.dish.id === dishId ? { ...i, quantity: i.quantity - 1 } : i
      )
    })
  }

  const totalCount = cart.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0)

  const goConfirm = () => {
    sessionStorage.setItem('cart', JSON.stringify(cart))
    router.push('/confirm')
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white relative overflow-hidden">
      {/* Banner */}
      <div className="relative w-full h-32 bg-orange-400 flex-shrink-0">
        <Image
          src={config.bannerImage}
          alt="banner"
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-end px-4 pb-3">
          <h1 className="text-white text-xl font-bold drop-shadow">{config.shopName}</h1>
        </div>
      </div>

      {/* Tab */}
      <div className="flex bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex-1 py-3 text-sm font-bold text-orange-500 border-b-2 border-orange-500 text-center">点菜</div>
        <button
          className="flex-1 py-3 text-sm text-gray-500 text-center"
          onClick={() => router.push('/review')}
        >评价</button>
      </div>

      {/* 主体 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧分类 */}
        <div className="w-20 bg-gray-50 overflow-y-auto flex-shrink-0 border-r border-gray-100">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`w-full py-4 px-1 text-xs text-center border-l-2 transition-all ${
                activeCategory === cat
                  ? 'border-orange-500 bg-white text-orange-500 font-bold'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 右侧菜品 */}
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {categories.map(cat => (
            <div key={cat} ref={el => { categoryRefs.current[cat] = el }}>
              <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50">{cat}</div>
              {grouped.get(cat)!.map(dish => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  count={getCount(dish.id)}
                  onAdd={() => addToCart(dish)}
                  onRemove={() => removeFromCart(dish.id)}
                />
              ))}
            </div>
          ))}
          <div className="h-24" />
        </div>
      </div>

      {/* 底部购物车 */}
      {totalCount > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-xl">
          <div className="relative">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl shadow">
              🛒
            </div>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalCount}
            </span>
          </div>
          <div className="flex-1">
            <span className="text-orange-500 font-bold text-lg">¥{totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={goConfirm}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold text-sm active:bg-orange-600"
          >
            去结算
          </button>
        </div>
      )}
    </div>
  )
}

function DishCard({
  dish, count, onAdd, onRemove,
}: {
  dish: Dish
  count: number
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-3 bg-white border-b border-gray-100">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={dish.image || '/images/default.jpg'}
          alt={dish.name}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/default.jpg' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{dish.name}</p>
        {dish.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{dish.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-orange-500 font-bold text-sm">¥{dish.price}</span>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <>
                <button
                  onClick={onRemove}
                  className="w-6 h-6 rounded-full border-2 border-orange-500 text-orange-500 flex items-center justify-center font-bold leading-none"
                >
                  −
                </button>
                <span className="text-sm font-bold w-4 text-center">{count}</span>
              </>
            )}
            <button
              onClick={onAdd}
              className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold leading-none active:bg-orange-600"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
