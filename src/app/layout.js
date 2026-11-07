import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Insta Growth Lab — Command Center',
  description: 'The operating system for serious Instagram creators.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster 
            theme="system" 
            position="top-right" 
            closeButton 
            richColors 
            toastOptions={{
              className: 'font-sans',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}