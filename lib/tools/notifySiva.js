import { Resend } from 'resend'
import { kv }     from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifySiva({ recruiter_name, company, role, message = '' }) {
  await Promise.all([
    resend.emails.send({
      from:    'Portfolio Agent <onboarding@resend.dev>',
      to:      process.env.NOTIFY_EMAIL,
      subject: `Lead: ${company} · ${role}`,
      html:    `
        <h2>New Recruiter Contact</h2>
        <p><b>${recruiter_name}</b> from <b>${company}</b></p>
        <p>Role: ${role}</p>
        ${message ? `<p>Message: ${message}</p>` : ''}
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    }),

    kv.lpush('recruiter_leads', JSON.stringify({
      recruiter_name, company, role, message,
      ts: Date.now()
    }))
  ])

  return { success: true, message: `Siva has been notified. He'll respond within a few hours.` }
}
