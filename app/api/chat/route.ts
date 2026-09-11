import { NextRequest, NextResponse } from 'next/server'
import { processChatConversation, ChatMessage } from '@/lib/ai-agent'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: ChatMessage[] = body.messages || []

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const result = await processChatConversation(messages)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error?.message },
      { status: 500 }
    )
  }
}
