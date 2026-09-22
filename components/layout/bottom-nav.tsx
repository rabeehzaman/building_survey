"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, PlusIcon, LayoutListIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex flex-col items-center gap-1 text-[11px] font-medium outline-none",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-14 items-center justify-center rounded-full transition-colors group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
          active && "bg-primary/12"
        )}
      >
        <Icon className="size-5" strokeWidth={active ? 2.25 : 2} />
      </span>
      {label}
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  // The survey form has its own action bar, so keep the screen focused on it.
  if (pathname.startsWith("/survey")) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3 items-center">
        <NavItem href="/" label="Home" icon={HomeIcon} active={pathname === "/"} />
        <Link
          href="/survey/new"
          className="group flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground outline-none hover:text-foreground"
        >
          <span className="-mt-6 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform group-focus-visible:ring-ring/50 group-active:scale-95">
            <PlusIcon className="size-6" strokeWidth={2.5} />
          </span>
          New Survey
        </Link>
        <NavItem
          href="/entries"
          label="Entries"
          icon={LayoutListIcon}
          active={pathname.startsWith("/entries")}
        />
      </div>
    </nav>
  )
}
