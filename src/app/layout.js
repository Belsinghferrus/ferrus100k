import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Ferrus 100K Command Center',
  description: 'Personal Instagram growth operating system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          closeButton
          richColors
          toastOptions={{
            style: {
              background: '#111113',
              border: '1px solid #27272A',
              color: '#FFFFFF',
              fontSize: '13px',
            },
            className: 'font-sans',
          }}
        />
      </body>
    </html>
  )
}