import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials.username || !credentials.password) {
          throw new Error('Username dan password wajib diisi.')
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            role: true,
            division: true,
          },
        })

        // Pesan sengaja disamakan untuk username salah maupun password salah —
        // pesan yang berbeda memungkinkan penebakan (enumerasi) username.
        if (!user) {
          throw new Error('Username atau password salah.')
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordCorrect) {
          throw new Error('Username atau password salah.')
        }

        if (user.status !== 'Active') {
          throw new Error('Akun Anda telah dinonaktifkan.')
        }

        return user
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.user_id
        token.username = user.username
        token.name = user.name
        token.role = user.role?.role_name || null
        token.divisionName = user.division?.division_name || null
        token.divisionId = user.division_id || null
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.name = token.name
        session.user.role = token.role
        session.user.divisionName = token.divisionName
        session.user.divisionId = token.divisionId
        session.user.phone = token.phone
      }
      return session
    },
  },

  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}