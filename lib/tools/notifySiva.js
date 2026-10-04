import { Resend } from 'resend'
import { kv }     from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)

const MAX_PER_HOUR      = 5
const THROTTLE_WINDOW_S = 3600
const FALLBACK_CONTACT  = 'please reach out directly at sivaavanishk@gmail.com in the meantime.'

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Global cooldown across all visitors — prevents one person (or a script) from
// triggering repeated "I'm a recruiter" emails. Fails open on a KV hiccup so a
// real lead is never dropped because of an infra blip.
async function underThrottle() {
  try {
    const count = await kv.incr('notify_siva:count')
    if (count === 1) await kv.expire('notify_siva:count', THROTTLE_WINDOW_S)
    return count <= MAX_PER_HOUR
  } catch {
    return true
  }
}

export async function notifySiva({ recruiter_name, company, role, message = '' }) {
  if (!(await underThrottle())) {
    return {
      success: false,
      message: `I've had a lot of interest recently and I'm catching up on messages — ${FALLBACK_CONTACT}`,
    }
  }

  // Visitor-controlled fields go into an HTML email — escape them so a crafted
  // "company" or "message" can't inject markup/links into Siva's inbox.
  const safe = {
    recruiter_name: escapeHtml(recruiter_name),
    company:        escapeHtml(company),
    role:           escapeHtml(role),
    message:        escapeHtml(message),
  }

  const [emailResult] = await Promise.allSettled([
    resend.emails.send({
      from:    'Portfolio Agent <onboarding@resend.dev>',
      to:      process.env.NOTIFY_EMAIL,
      subject: `Lead: ${safe.company} · ${safe.role}`,
      html:    `
        <h2>New Recruiter Contact</h2>
        <p><b>${safe.recruiter_name}</b> from <b>${safe.company}</b></p>
        <p>Role: ${safe.role}</p>
        ${safe.message ? `<p>Message: ${safe.message}</p>` : ''}
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    }),

    kv.lpush('recruiter_leads', JSON.stringify({
      recruiter_name, company, role, message,
      ts: Date.now()
    })),
  ])

  if (emailResult.status === 'rejected') {
    console.error('notify_siva: email send failed:', emailResult.reason)
    return { success: false, message: `I couldn't send the notification right now — ${FALLBACK_CONTACT}` }
  }

  return { success: true, message: `Siva has been notified. He'll respond within a few hours.` }
}
