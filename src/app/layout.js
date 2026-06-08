import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './AuthProvider'; // <-- IMPORT

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
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus 'children' dengan AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}