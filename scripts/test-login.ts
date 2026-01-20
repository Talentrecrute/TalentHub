import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function testLogin() {
  const email = 'admin@oceanic-job.com'
  const password = '101009mou!'
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  console.log('User found:', !!user)
  console.log('User email:', user?.email)
  console.log('User role:', user?.role)
  console.log('Has password:', !!user?.password)
  
  if (user?.password) {
    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValid)
  }
  
  await prisma.$disconnect()
}

testLogin()
