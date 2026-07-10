'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/types'

const RICE_OPTIONS = [
  { value: 'none', label: '不要米饭' },
  { value: 'half', label: '小半碗' },
  { value: 'small', label: '一小碗' },
  { value: 'full', label: '一碗' },
]

export default function ConfirmPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('cart')
    if (!saved) { router.push('/'); return }
    setCart(JSON.parse(saved))
  }, [router])

  const updateOption = (
    dishId: number,
    key: keyof CartItem['options'],
    value: boolean | string
  ) => {
    setCart(prev =>
      prev.map(item =>
        item.dish.id === dishId
          ? { ...item, options: { ...item.options, [key]: value } }
          : item
      )
    )
  }

  const totalPrice = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, totalPrice, name }),
      })
      if (!res.ok) throw new Error('提交失败')
      sessionStorage.setItem('orderTotal', String(totalPrice))
      router.push('/pay')
    } catch {
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!cart.length) return null

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-500 mr-3 text-xl">←</button>
        <h2 className="font-bold text-gray-900 text-base">确认订单</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* 称呼 */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">你是谁 🥰</p>
          <input
            type="text"
            placeholder="输入你的称呼（如：宝贝、老公）"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
        </div>

        {/* 每道菜的定制 */}
        {cart.map(item => (
          <div key={item.dish.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-900 text-sm">{item.dish.name}</span>
              <span className="text-gray-500 text-xs">×{item.quantity}  ¥{(item.dish.price * item.quantity).toFixed(2)}</span>
            </div>

            {/* 香菜葱姜 */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                { key: 'xiangcai' as const, label: '香菜' },
                { key: 'cong' as const, label: '葱' },
                { key: 'jiang' as const, label: '姜' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => updateOption(item.dish.id, key, !item.options[key])}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    item.options[key]
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {item.options[key] ? `✓ ${label}` : `✗ 不要${label}`}
                </button>
              ))}
            </div>

            {/* 米饭分量 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">米饭分量</p>
              <div className="flex gap-2 flex-wrap">
                {RICE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateOption(item.dish.id, 'rice', opt.value)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      item.options.rice === opt.value
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-400 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 备注 */}
            <input
              type="text"
              placeholder="备注（可不填）"
              value={item.options.note}
              onChange={e => updateOption(item.dish.id, 'note', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-400 bg-white"
            />
          </div>
        ))}
      </div>

      {/* 底部提交 */}
      <div className="px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-500 text-sm">合计</span>
          <span className="text-orange-500 font-bold text-lg">¥{totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-full font-bold text-base active:bg-orange-600 disabled:opacity-60"
        >
          {loading ? '提交中...' : '提交订单 💕'}
        </button>
      </div>
    </div>
  )
}
