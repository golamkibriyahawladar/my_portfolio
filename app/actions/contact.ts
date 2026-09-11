'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getDb, isDatabaseConfigured, schema } from '@/lib/db'
import { sendAdminNotificationEmail } from '@/lib/email'

export type ContactState = { status: 'idle' } | { status: 'success' } | { status: 'error'; message: string }

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(5).max(5000),
})

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject') || undefined,
    body: formData.get('body'),
  })

  if (!parsed.success) {
    return { status: 'error', message: 'Please fill in your name, a valid email and a message.' }
  }

  if (!isDatabaseConfigured) {
    return { status: 'error', message: 'The inbox is not connected yet. Please email me directly.' }
  }

  try {
    await getDb().insert(schema.messages).values(parsed.data)

    // Revalidate admin messages inbox and layout so badge updates immediately
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/messages')

    // Dispatch real-time email notification to admin inbox
    sendAdminNotificationEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      body: parsed.data.body,
    }).catch((err) => console.error('[Contact Action] Background email failed:', err))

    return { status: 'success' }
  } catch (error) {
    console.error('Failed to store contact message', error)
    return { status: 'error', message: 'Something went wrong. Please try again or email me directly.' }
  }
}
