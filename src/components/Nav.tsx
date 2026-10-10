import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const linkCls = (active: boolean) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-4 flex items-center">
          <Image src="/logo.png" alt="AXS Modern" className="h-7 w-auto" />
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/" className={linkCls(false)}>
            Dashboard
          </Link>
          <Link href="/board" className={linkCls(false)}>
            Board
          </Link>
          <Link href="/my-tasks" className={linkCls(false)}>
            My Tasks
          </Link>
          <Link href="/clients" className={linkCls(false)}>
            Clients
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/users" className={linkCls(false)}>
              Team
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">
              {user.role === "ADMIN" ? "Admin" : "Member"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
