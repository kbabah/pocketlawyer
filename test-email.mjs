// Quick Postmark email test — run with: node test-email.mjs [recipient@example.com]
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    // Strip inline comments first, then surrounding quotes
    value = value.replace(/\s+#.*$/, '').trim()
    value = value.replace(/^["']|["']$/g, '').trim()
    process.env[key] = process.env[key] ?? value
  }
}

loadEnv()

const token = process.env.POSTMARK_SERVER_TOKEN
const from = process.env.EMAIL_FROM
const fromName = process.env.EMAIL_FROM_NAME || 'PocketLawyer'
const messageStream = process.env.POSTMARK_MESSAGE_STREAM || 'outbound'
const recipient = process.argv[2] || from

console.log('=== Postmark Email Test ===')
console.log(`  Token:          ${token ? token.slice(0, 8) + '...' : '❌ MISSING'}`)
console.log(`  From:           ${fromName} <${from}>`)
console.log(`  Stream:         ${messageStream}`)
console.log(`  Sending to:     ${recipient}`)
console.log('')

if (!token) {
  console.error('❌ POSTMARK_SERVER_TOKEN is not set. Check your .env file.')
  process.exit(1)
}
if (!from) {
  console.error('❌ EMAIL_FROM is not set. Check your .env file.')
  process.exit(1)
}

const { ServerClient } = await import('postmark')
const client = new ServerClient(token)

try {
  const result = await client.sendEmail({
    From: `${fromName} <${from}>`,
    To: recipient,
    Subject: '✅ PocketLawyer Email Test',
    HtmlBody: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#10b981">Email delivery is working ✅</h2>
        <p>This is a test message from PocketLawyer.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600">From</td><td>${fromName} &lt;${from}&gt;</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600">Stream</td><td>${messageStream}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-weight:600">Sent at</td><td>${new Date().toISOString()}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">You can delete this test email.</p>
      </div>
    `,
    TextBody: `PocketLawyer email test — sent at ${new Date().toISOString()}. If you received this, delivery is working.`,
    MessageStream: messageStream,
  })

  console.log('✅ Email sent successfully!')
  console.log(`   Message ID: ${result.MessageID}`)
  console.log(`   Submitted:  ${result.SubmittedAt}`)
  console.log(`   To:         ${result.To}`)
} catch (err) {
  console.error('❌ Failed to send email:')
  if (err.recipients?.length) {
    console.error('   Suppressed/inactive recipients:', err.recipients)
    console.error('   → Go to Postmark dashboard → Suppressions and remove these addresses.')
  } else {
    console.error('  ', err.message || err)
    if (err.code === 300) console.error('   → Invalid sender — make sure the From address/domain is verified in Postmark.')
    if (err.code === 401) console.error('   → Inactive Postmark account or invalid server token.')
  }
  process.exit(1)
}
