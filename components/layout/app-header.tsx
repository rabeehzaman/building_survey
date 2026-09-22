"use client"

import Image from "next/image"
import Link from "next/link"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    // The header owns the status-bar inset so its background stays behind the
    // iOS status bar while sticky (the app runs with viewport-fit=cover).
    <header className="sticky top-0 z-40 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Image
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            className="rounded-[9px] shadow-sm"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">
              Building Survey
            </span>
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">
              Municipal field data
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}
