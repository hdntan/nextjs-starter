import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // TODO: Replace with real API call
        // const res = await fetch(`${env.API_URL}/auth/login`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        // })
        // if (!res.ok) return null
        // const user = await res.json()
        // return { id: user.id, email: user.email, accessToken: user.accessToken }
        return {
          id: '1',
          email: credentials.email as string,
          accessToken: 'placeholder-token',
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken
      }
      return token
    },
    session({ session, token }) {
      session.user.accessToken = token.accessToken as string | undefined
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
