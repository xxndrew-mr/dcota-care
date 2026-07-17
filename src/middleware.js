import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/login',
  },
});

// Hanya halaman /dashboard/* yang dilindungi middleware ini;
// setiap API route melakukan cek role sendiri.
export const config = {
  matcher: ['/dashboard/:path*'],
};
