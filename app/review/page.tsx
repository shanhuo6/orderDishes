'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Review } from '@/types'

const STARS = [1, 2, 3, 4, 5]

export default function ReviewPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/review')
      const data = await res.json()
      setReviews(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const handleSubmit = async () => {
    if (!content.trim()) { alert('请写点什么 💬'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }),
      })
      if (!res.ok) throw new Error()
      setContent('')
      setRating(5)
      setShowForm(false)
      await fetchReviews()
    } catch {
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* 顶部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="text-gray-500 mr-3 text-xl">←</button>
          <h2 className="font-bold text-gray-900 text-base">评价 ({reviews.length})</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-orange-500 text-sm font-medium"
        >
          {showForm ? '取消' : '写评价 ✍️'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 写评价表单 */}
        {showForm && (
          <div className="px-4 py-4 bg-orange-50 border-b border-orange-100">
            {/* 星级 */}
            <div className="flex gap-2 mb-3">
              {STARS.map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="text-2xl transition-transform active:scale-110"
                >
                  {s <= rating ? '❤️' : '🤍'}
                </button>
              ))}
              <span className="text-xs text-gray-400 self-center ml-1">
                {['', '很差', '较差', '一般', '不错', '非常棒！'][rating]}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="说说这顿饭怎么样？"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none bg-white"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-2 w-full bg-orange-500 text-white py-2 rounded-full font-bold text-sm disabled:opacity-60"
            >
              {submitting ? '提交中...' : '发布评价'}
            </button>
          </div>
        )}

        {/* 评价列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">加载中...</div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <span className="text-5xl mb-3">💬</span>
            <p className="text-sm">还没有评价，第一个来说说吧</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map(r => (
              <div key={r.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {STARS.map(s => (
                      <span key={s} className="text-sm">{s <= r.rating ? '❤️' : '🤍'}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
