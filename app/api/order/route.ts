import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend('re_8z83qMd1_NZVncDgXy5F6pHjHeCxzD7XS')

const RICE_LABEL: Record<string, string> = {
  none: '不要米饭',
  half: '小半碗',
  small: '一小碗',
  full: '一碗',
}

export async function POST(req: NextRequest) {
  try {
    const { cart, totalPrice, name } = await req.json()

    // 生成订单明细文本
    const itemLines = cart.map((item: {
      dish: { name: string; price: number }
      quantity: number
      options: {
        xiangcai: boolean
        cong: boolean
        jiang: boolean
        rice: string
        note: string
      }
    }) => {
      const opts = []
      if (!item.options.xiangcai) opts.push('不要香菜')
      if (!item.options.cong) opts.push('不要葱')
      if (!item.options.jiang) opts.push('不要姜')
      opts.push(`米饭：${RICE_LABEL[item.options.rice] || item.options.rice}`)
      if (item.options.note) opts.push(`备注：${item.options.note}`)

      return `• ${item.dish.name} × ${item.quantity}（¥${(item.dish.price * item.quantity).toFixed(2)}）\n  ${opts.join('，')}`
    }).join('\n')

    const emailBody = `
🍽️ 新订单来啦！${name ? `（来自：${name}）` : ''}

${itemLines}

──────────────
合计：¥${Number(totalPrice).toFixed(2)}
下单时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    `.trim()

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: '2318702434@qq.com',
      subject: `🍽️ 新订单 ¥${Number(totalPrice).toFixed(2)}${name ? ` —— ${name}` : ''}`,
      text: emailBody,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('发送邮件失败:', err)
    return NextResponse.json({ error: '发送失败' }, { status: 500 })
  }
}
