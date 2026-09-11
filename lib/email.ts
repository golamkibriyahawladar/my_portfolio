/**
 * Real-time Email Notification Dispatcher
 * Sends inbound contact inquiries to the site administrator's email.
 * Supports Resend (recommended) or direct fallback.
 */

interface NotificationPayload {
  name: string
  email: string
  subject?: string
  body: string
}

export async function sendAdminNotificationEmail(payload: NotificationPayload) {
  const adminEmail = process.env.ADMIN_EMAIL || 'golamkibriyahawladar@gmail.com'
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log('[Email Dispatcher] RESEND_API_KEY is not set. Skipped email notification (stored in DB).')
    return { success: false, reason: 'NO_API_KEY' }
  }

  const subject = payload.subject
    ? `[Portfolio Inquiry] ${payload.subject} — from ${payload.name}`
    : `[Portfolio Inquiry] New message from ${payload.name}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #070709; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; width: 100%; border-collapse: collapse; background-color: #0e0e12; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(180deg, rgba(163, 230, 53, 0.08) 0%, rgba(163, 230, 53, 0) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <table role="presentation" style="width: 100%;">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: rgba(163, 230, 53, 0.15); border: 1px solid rgba(163, 230, 53, 0.3); color: #a3e635; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                New Inquiry Received
              </div>
              <h1 style="margin: 12px 0 4px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                Portfolio Contact Form
              </h1>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
                A visitor submitted a message through your live portfolio.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Sender Details -->
    <tr>
      <td style="padding: 24px 32px 16px 32px;">
        <table role="presentation" style="width: 100%; background-color: #14141a; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
          <tr>
            <td style="padding: 16px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); width: 80px;">Sender:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #ffffff; font-weight: 600;">${payload.name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: rgba(255, 255, 255, 0.5);">Email:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #a3e635;">
                    <a href="mailto:${payload.email}" style="color: #a3e635; text-decoration: none;">${payload.email}</a>
                  </td>
                </tr>
                ${
                  payload.subject
                    ? `<tr>
                        <td style="padding: 4px 0; font-size: 13px; color: rgba(255, 255, 255, 0.5);">Subject:</td>
                        <td style="padding: 4px 0; font-size: 13px; color: #ffffff;">${payload.subject}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: rgba(255, 255, 255, 0.5);">Date:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: rgba(255, 255, 255, 0.4); font-family: monospace;">
                    ${new Date().toUTCString()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Message Content -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255, 255, 255, 0.4); margin-bottom: 8px;">
          Message Body
        </div>
        <div style="background-color: #121216; border-left: 3px solid #a3e635; padding: 16px; border-radius: 0 8px 8px 0; color: #e4e4e7; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${payload.body}</div>
      </td>
    </tr>

    <!-- Action Button -->
    <tr>
      <td style="padding: 0 32px 32px 32px; text-align: center;">
        <a href="mailto:${payload.email}?subject=${encodeURIComponent(
          `Re: ${payload.subject || 'Portfolio Inquiry'}`
        )}" style="display: inline-block; padding: 12px 28px; background-color: #a3e635; color: #000000; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 10px; transition: background-color 0.2s;">
          Reply to ${payload.name} →
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px; background-color: #08080a; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: rgba(255, 255, 255, 0.3);">
        Sent automatically from your portfolio CMS • <a href="http://localhost:3000/admin/messages" style="color: rgba(255, 255, 255, 0.5); text-decoration: underline;">View in Admin Inbox</a>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Notification <onboarding@resend.dev>',
        to: [adminEmail],
        reply_to: payload.email,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Email Dispatcher] Resend API error:', errorText)
      return { success: false, error: errorText }
    }

    const data = await res.json()
    console.log('[Email Dispatcher] Email notification sent successfully to', adminEmail, data)
    return { success: true, data }
  } catch (err: any) {
    console.error('[Email Dispatcher] Failed to dispatch email:', err)
    return { success: false, error: err?.message }
  }
}
