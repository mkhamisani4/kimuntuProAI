import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'

export const metadata = {
    title: 'KimuntuPro AI - Professional AI Assistant',
    description: 'Professional success, business growth, and legal assistance - all powered by cutting-edge artificial intelligence.',
    icons: {
        icon: '/assets/LOGOS(4).svg',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <LanguageProvider>
                        {children}
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
