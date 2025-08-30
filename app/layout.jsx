import { Inter } from "next/font/google"
import "./globals.css"
import { TaxationProvider } from "@/contexts/TaxationContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TaxPro - Professional Tax Management System",
  description: "Comprehensive taxation management system for users and administrators",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TaxationProvider>{children}</TaxationProvider>
      </body>
    </html>
  )
}
