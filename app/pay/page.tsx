'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import config from '@/data/config.json'

export default function PayPage() {
  const router = useRouter()
  const [total, setTotal] = useState('0.00')

  useEffect(() => {
    const saved = sessionStorage.getItem('orderTotal')
    if (saved) setTotal(Number(saved).toFixed(2))
  }, [])

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* 顶部 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => router.push('/')} className="text-gray-500 mr-3 text-xl">←</button>
        <h2 className="font-bold text-gray-900 text-base">支付</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 space-y-6">
        {/* 金额 */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">应付金额</p>
          <p className="text-orange-500 font-bold text-4xl">¥{total}</p>
        </div>

        {/* 收款码 */}
        <div className="relative w-56 h-56 bg-gray-100 rounded-2xl overflow-hidden shadow-md">
          <Image
            src={config.qrcodeImage}
            alt="收款码"
            fill
            className="object-contain p-2"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
            
          </div>
        </div>

        {/* 提示 */}
        <div className="bg-orange-50 rounded-xl px-5 py-4 w-full text-center space-y-1">
          <p className="text-orange-600 font-medium text-sm">📱 扫码转账</p>
          <p className="text-gray-500 text-xs"> 🍳</p>
        </div>

        {/* 完成按钮 */}
        <button
          onClick={() => router.push('/')}
          className="w-full bg-orange-500 text-white py-3 rounded-full font-bold text-base active:bg-orange-600"
        >
          已转账，回首页 🏠
        </button>

        {/* 评价入口 */}
        <button
          onClick={() => router.push('/review')}
          className="text-gray-400 text-sm underline"
        >
          去写评价
        </button>
      </div>
    </div>
  )
}
