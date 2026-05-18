"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type HeaderLink = [string, string]

const primaryLinks: HeaderLink[] = [
  ["/destinations", "Galamērķi"],
  ["/itinerary", "Plānot ceļojumu"],
  ["/routes", "Publiskie maršruti"],
]

const planLinks: HeaderLink[] = [
  ["/trip-planner", "Ceļojuma plānotājs"],
  ["/quiz", "Kurp doties?"],
  ["/compare", "Salīdzināt"],
  ["/checklist", "Sagatavošanās darbi"],
]

const secondaryLinks: HeaderLink[] = [
  ["/explore", "Izpētīt"],
  ["/contact", "Kontakti"],
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
}

function NavLink({ href, label, pathname, onClick }: { href: string; label: string; pathname: string; onClick?: () => void }) {
  const active = isActivePath(pathname, href)

  return (
    <Link href={href} onClick={onClick} className={`clean-nav-link ${active ? "clean-nav-link-active" : ""}`}>
      {label}
    </Link>
  )
}

function PlanningMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = planLinks.some(([href]) => isActivePath(pathname, href))

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("click", closeOnOutsideClick)
    return () => document.removeEventListener("click", closeOnOutsideClick)
  }, [])

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        className={`clean-nav-link inline-flex items-center gap-1.5 ${active ? "clean-nav-link-active" : ""}`}
        aria-expanded={open}
      >
        Plānošana un rīki
        <span className="text-xs text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[230px] pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10">
            {planLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActivePath(pathname, href)
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { user } = useAuth()
  const pathname = usePathname() ?? ""
  const [mobileOpen, setMobileOpen] = useState(false)
  const canSeeAdmin = user?.role === "admin"

  useEffect(() => setMobileOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-xl font-semibold tracking-tight text-sky-700" aria-label="TravelLatvia sākumlapa">
            TravelLatvia
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map(([href, label]) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
            <PlanningMenu pathname={pathname} />
            {secondaryLinks.map(([href, label]) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user && <NavLink href="/profile" label="Mans profils" pathname={pathname} />}
             {canSeeAdmin && <NavLink href="/admin" label="Administrators" pathname={pathname} />}
            {!user && (
              <>
                <Link href="/login" className="clean-nav-link">Pieslēgties</Link>
                <Link href="/signup" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800">
                  Reģistrēties
                </Link>
              </>
            )}
          </div>

         <div className="flex items-center gap-2 lg:hidden">
            {canSeeAdmin && (
              <Link
                href="/admin"
                className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-800"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
              aria-label="Atvērt navigāciju"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 py-3 lg:hidden">
            <div className="grid gap-1">
              {[...primaryLinks, ...planLinks, ...secondaryLinks].map(([href, label]) => (
                <NavLink key={href} href={href} label={label} pathname={pathname} />
              ))}
              {user ? (
                <>
                  <NavLink href="/profile" label="Mans profils" pathname={pathname} />
                  {canSeeAdmin && <NavLink href="/admin" label="Administrators" pathname={pathname} />}
                </>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href="/login" className="clean-nav-link justify-center">Pieslēgties</Link>
                  <Link href="/signup" className="rounded-lg bg-sky-700 px-4 py-2 text-center text-sm font-medium text-white">Reģistrēties</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
