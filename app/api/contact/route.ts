import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email for sending (verified domain on Resend - looks professional)
const SENDER_EMAIL = 'contact@oceanic-job.com'

// Email where you RECEIVE contact messages (Gmail works better with Resend)
const RECIPIENT_EMAIL = 'raossidi@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Create beautiful HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message OceanicJob</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                📧 Nouveau Message
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Via OceanicJob.com
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Sender Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px; background-color: #f0fdfa; border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="display: inline-block; background-color: #0d9488; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">EXPÉDITEUR</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #1e293b; font-size: 16px;">👤 Nom:</strong>
                          <span style="color: #475569; font-size: 16px; margin-left: 10px;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #1e293b; font-size: 16px;">📧 Email:</strong>
                          <a href="mailto:${email}" style="color: #0d9488; font-size: 16px; margin-left: 10px; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong style="color: #1e293b; font-size: 16px;">📋 Sujet:</strong>
                          <span style="color: #475569; font-size: 16px; margin-left: 10px;">${subject}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 15px;">
                    <span style="display: inline-block; background-color: #0891b2; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">MESSAGE</span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 12px; padding: 25px; border-left: 4px solid #0d9488;">
                    <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Reply Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      ↩️ Répondre à ${name}
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="color: #64748b; font-size: 12px;">
                    <p style="margin: 0 0 5px;">📅 Reçu le: ${currentDate}</p>
                    <p style="margin: 0;">🌐 Source: <a href="https://oceanic.job" style="color: #0d9488; text-decoration: none;">OceanicJob.com</a></p>
                  </td>
                  <td style="text-align: right; color: #64748b; font-size: 12px;">
                    <p style="margin: 0;">🏝️ Connecter l'Océan Indien</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Plain text version
    const textContent = `
═══════════════════════════════════════════════════
📧 NOUVEAU MESSAGE VIA OCEANICJOB.COM
═══════════════════════════════════════════════════

👤 Nom: ${name}
📧 Email: ${email}
📋 Sujet: ${subject}

───────────────────────────────────────────────────
💬 MESSAGE:
───────────────────────────────────────────────────

${message}

───────────────────────────────────────────────────
📅 Reçu le: ${currentDate}
🌐 Source: OceanicJob Website
═══════════════════════════════════════════════════
    `.trim()

    // Send email via Resend
    console.log('📧 Sending email...')
    console.log('From:', `OceanicJob <${SENDER_EMAIL}>`)
    console.log('To:', RECIPIENT_EMAIL)
    console.log('ReplyTo:', email)
    console.log('Subject:', `[OceanicJob Contact] ${subject}`)
    
    const { data, error } = await resend.emails.send({
      from: `OceanicJob <${SENDER_EMAIL}>`,
      to: [RECIPIENT_EMAIL],
      replyTo: email,
      subject: `[OceanicJob Contact] ${subject}`,
      html: htmlContent,
      text: textContent,
    })

    console.log('📧 Resend response - Data:', data)
    console.log('📧 Resend response - Error:', error)

    if (error) {
      console.error('❌ Resend error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully! ID:', data?.id)
    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès', id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
