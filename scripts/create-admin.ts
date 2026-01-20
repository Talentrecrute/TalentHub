import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('101009mou!', 12)
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'admin@oceanic-job.com' },
      update: { 
        role: 'ADMIN', 
        password: hashedPassword,
        name: 'Admin OceanicJob'
      },
      create: {
        email: 'admin@oceanic-job.com',
        name: 'Admin OceanicJob',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin créé:', user.email, '- Role:', user.role)
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
