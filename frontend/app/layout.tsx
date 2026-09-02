import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ['latin'] });

export const metadata = { title: "LogIQ | Security Operations", description: "Intelligent log monitoring" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body className={inter.className}><AuthProvider><AppShell>{children}</AppShell></AuthProvider></body></html>;
}
