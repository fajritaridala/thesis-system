import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import authServices from '@/services/auth.service';
import { SessionExt, UserExt } from '@/types/auth.types';
import { AUTH_SECRET } from '@/utils/config/env';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 24,
  },
  secret: AUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'MetaMask',
      credentials: {
        address: { label: 'address', type: 'text' },
      },
      async authorize(credentials: Record<'address', string> | undefined) {
        const address = credentials?.address as string | undefined;
        try {
          if (!address) {
            throw new Error('address tidak diterima');
          }

          const result = await authServices.login(address);
          if (result.status === 200 && result.data.needsRegistration) {
            return {
              id: result.data.data || address,
              address: result.data.data || address,
              needsRegistration: result.data.needsRegistration,
            };
          }

          const accessToken = result.data.data;
          const me = await authServices.getProfileWithToken(accessToken);
          const user = me.data.data as UserExt;

          if (me.status === 200 && user) {
            user.accessToken = accessToken;
            return user;
          }

          return null;
        } catch (error) {
          const err = error as Error;
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as UserExt;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as UserExt;
      return session as SessionExt;
    },
  },
};

export default NextAuth(authOptions);
