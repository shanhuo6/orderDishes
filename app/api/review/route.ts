import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ryiiqqttcjiunpgwgsxe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5aWlxcXR0Y2ppdW5wZ3dnc3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NDIzMzcsImV4cCI6MjA5OTIxODMzN30.JcWE0R_Q9c-KiXDq4AgeOJaEcv54MSl707ZRw0LK0Rw'
)

// 获取评价列表
export async function GET() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

// 提交新评价
export async function POST(req: NextRequest) {
  const { rating, content } = await req.json()

  if (!rating || !content?.trim()) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 })
  }

  const { error } = await supabase
    .from('reviews')
    .insert({ rating, content: content.trim() })

  if (error) return NextResponse.json({ error: '写入失败' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
