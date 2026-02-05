import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  try {
    // In development, we can only send to verified emails (or everything to the account owner)
    // Production keys allow sending to anyone.
    // Ensure FROM address is correct. 'onboarding@resend.dev' is the default for testing.
    await resend.emails.send({
      from: 'TalentHub <onboarding@resend.dev>',
      to: email,
      subject,
      html
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export const sendRejectionEmail = async (
  email: string,
  candidateName: string,
  jobTitle: string,
  locale: 'fr' | 'en' = 'fr'
) => {
  const isFr = locale === 'fr'
  
  const subject = isFr 
    ? `Mise à jour concernant votre candidature - ${jobTitle}`
    : `Update regarding your application - ${jobTitle}`

  const html = isFr 
    ? `
    <p>Bonjour ${candidateName},</p>
    <p>Merci d'avoir postulé pour le poste de <strong>${jobTitle}</strong> chez nous.</p>
    <p>Bien que votre profil soit intéressant, nous avons décidé de ne pas donner suite à votre candidature pour le moment.</p>
    <p>Nous conservons votre profil dans notre base de données pour de futures opportunités.</p>
    <p>Cordialement,<br/>L'équipe de recrutement</p>
    `
    : `
    <p>Hello ${candidateName},</p>
    <p>Thank you for applying for the <strong>${jobTitle}</strong> position.</p>
    <p>Although your profile is impressive, we have decided not to proceed with your application at this time.</p>
    <p>We will keep your profile in our database for future opportunities.</p>
    <p>Best regards,<br/>The Recruitment Team</p>
    `

  return sendEmail(email, subject, html)
}

export const sendInterviewInvitation = async (
  email: string,
  candidateName: string | null,
  jobTitle: string,
  bookingLink: string,
  locale: 'fr' | 'en' = 'fr'
) => {
  const isFr = locale === 'fr'
  const name = candidateName || (isFr ? 'Candidat' : 'Candidate')

  const subject = isFr
    ? `Entretien pour le poste de ${jobTitle}`
    : `Interview for ${jobTitle}`

  const html = isFr
    ? `
    <p>Bonjour ${name},</p>
    <p>Votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu toute notre attention.</p>
    <p>Nous souhaiterions échanger avec vous pour discuter de votre parcours et de vos motivations.</p>
    <p>Veuillez choisir un créneau qui vous convient via le lien ci-dessous :</p>
    <p><a href="${bookingLink}" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Prendre rendez-vous</a></p>
    <p>Ou copiez ce lien : ${bookingLink}</p>
    <p>Cordialement,<br/>L'équipe de recrutement</p>
    `
    : `
    <p>Hello ${name},</p>
    <p>We are impressed by your application for the <strong>${jobTitle}</strong> position.</p>
    <p>We would like to invite you for an interview to discuss your background and motivations.</p>
    <p>Please select a time slot that works for you using the link below:</p>
    <p><a href="${bookingLink}" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Book Interview</a></p>
    <p>Or copy this link: ${bookingLink}</p>
    <p>Best regards,<br/>Recruiting Team</p>
    `

  return sendEmail(email, subject, html)
}
