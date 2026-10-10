import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "TaskFlow · AXS Modern",
  description: "Client work tracking for your team",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {user ? <Nav /> : null}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
