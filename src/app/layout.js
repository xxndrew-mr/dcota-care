import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dcota Care',
  description: 'Aplikasi Dcota Care',
  icons: {
    icon: '/dcota-logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}