import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    // Credentials (email/password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt for:', credentials?.email)
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials')
            throw new Error("Invalid credentials")
          }

          console.log('📡 Querying database...')
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          console.log('👤 User found:', !!user, '| Has password:', !!user?.password)

          if (!user || !user.password) {
            console.log('❌ User not found or no password')
            throw new Error("Invalid credentials")
          }

          console.log('🔑 Comparing passwords...')
          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('🔑 Password check result:', isCorrectPassword)

          if (!isCorrectPassword) {
            console.log('❌ Password incorrect')
            throw new Error("Invalid credentials")
          }

          console.log('✅ Login successful for:', user.email, '| Role:', user.role)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          }
        } catch (error: any) {
          console.error('🚨 Auth error:', error.message)
          console.error('🚨 Full error:', error)
          throw new Error("Invalid credentials")
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log(`✅ Sign-in attempt: ${account?.provider} for ${user.email}`)
      
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        if (existingUser) {
          console.log(`✅ Existing user found: ${existingUser.id}`)
        } else {
          console.log(`🆕 New user will be created`)
        }
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // If signing in, redirect to home
      if (url.includes('/api/auth/callback')) {
        return baseUrl
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Allow URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      return baseUrl
    },
    async jwt({ token, user, account }) {
      // First time sign in
      if (user) {
        token.id = user.id
        token.role = user.role || "CANDIDATE"
      }
      
      // For OAuth sign-ins, fetch fresh data from DB
      if (account?.provider === "google") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
