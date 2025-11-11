import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { cn } from "@/src/lib/utils"
import { ThemeProviderWrapper } from "@/src/components/ThemeProvider"
import { ThemeToggle } from "@/src/components/ThemeToggle"

export const metadata: Metadata = {
  title: "Cashlines - Money Tracking",
  description: "Self-hostable personal money tracking app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased dark:bg-slate-950">
        <ThemeProviderWrapper>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
            {/* Header / Navigation */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    💰 Cashlines
                  </Link>
                  <div className="flex items-center gap-6">
                    <nav className="flex gap-6">
                      <NavLink href="/">Dashboard</NavLink>
                      <NavLink href="/accounts">Accounts</NavLink>
                      <NavLink href="/income">Income</NavLink>
                      <NavLink href="/transactions">Transactions</NavLink>
                      <NavLink href="/routes">Routes</NavLink>
                      <NavLink href="/rules">Rules</NavLink>
                      <NavLink href="/templates">Templates</NavLink>
                      <NavLink href="/import">Import</NavLink>
                    </nav>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>Cashlines - Self-hosted Money Tracking © 2024</p>
              </div>
            </footer>
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
    >
      {children}
    </Link>
  )
}
