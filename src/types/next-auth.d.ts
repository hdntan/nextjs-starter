import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      accessToken?: string
    }
  }

  interface User {
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
  }
}
