import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { cn } from "@/src/lib/utils"

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
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col bg-slate-50">
          {/* Header / Navigation */}
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="text-2xl font-bold text-slate-900">
                  💰 Cashlines
                </Link>
                <nav className="flex gap-6">
                  <NavLink href="/">Dashboard</NavLink>
                  <NavLink href="/accounts">Accounts</NavLink>
                  <NavLink href="/income">Income</NavLink>
                  <NavLink href="/transactions">Transactions</NavLink>
                  <NavLink href="/routes">Routes</NavLink>
                  <NavLink href="/rules">Rules</NavLink>
                  <NavLink href="/import">Import</NavLink>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
              <p>Cashlines - Self-hosted Money Tracking © 2024</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      {children}
    </Link>
  )
}
