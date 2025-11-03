import './globals.css'

export const metadata = {
  title: 'Kimuntu ProLaunch AI',
  description: 'Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
