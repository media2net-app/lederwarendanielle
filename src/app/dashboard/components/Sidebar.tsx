"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface User {
  email: string;
  naam: string;
  rol: string;
}

const DEFAULT_USER: User = {
  email: "beheer@lederwaren-danielle.nl",
  naam: "Beheerder",
  rol: "Admin",
};

/** Publieke PNG voor consistente rendering in dashboard navigatie. */
const LOGO_SRC = "/lederwaren-danielle.png";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/planning", label: "Planning", badge: "ACTIEF" },
  { href: "/dashboard/bestellingen", label: "Bestellingen" },
  { href: "/dashboard/magazijn", label: "Magazijn", badge: "NIEUW" },
  { href: "/dashboard/b2b-klanten", label: "B2B klanten" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/dashboard/klantenservice", label: "Klantenservice" },
  { href: "/dashboard/chat", label: "Interne chat", badge: "NIEUW" },
  { href: "/dashboard/producten", label: "Producten" },
  { href: "/dashboard/gebruikers", label: "Gebruikers" },
  { href: "/dashboard/taken", label: "Taken" },
  { href: "/dashboard/agenda", label: "Agenda" },
  { href: "/dashboard/rapportage", label: "Rapportage" },
  { href: "/dashboard/forecast", label: "Forecast", badge: "NIEUW" },
  { href: "/dashboard/ai-studio", label: "AI Studio" },
  { href: "/dashboard/merken", label: "Merken & webshops" },
  { href: "/dashboard/klantkaart", label: "Klantkaart" },
  { href: "/dashboard/instellingen", label: "Instellingen" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderMenu = () => (
    <>
      <nav className="flex flex-col gap-1 pt-1">
        {menuItems.map(({ href, label, badge }) => {
          const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/20 text-white ring-1 ring-white/25"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{label}</span>
                {badge && (
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      badge === "ACTIEF"
                        ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                        : badge === "NIEUW"
                          ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                          : badge === "NIET ACTIEF"
                            ? "border-rose-300/40 bg-rose-400/15 text-rose-100"
                            : "border-white/15 bg-white/10 text-slate-100"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 space-y-2">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
          <div className="text-sm font-medium text-white">{user.naam}</div>
          <div className="text-xs text-gray-300 truncate" title={user.email}>{user.email}</div>
          <div className="mt-1 inline-block rounded border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200">
            {user.rol}
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/offerte")}
          className="ui-btn-secondary block w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10"
        >
          Offerte
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem("user");
            }
            router.push("/login");
          }}
          className="ui-btn-ghost block w-full px-3 py-2.5 text-left text-sm text-gray-400 hover:bg-white/10 hover:text-white"
        >
          Uitloggen
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-black/75 px-4 text-white backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-white/20 bg-white/5 p-2 text-white"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/dashboard" className="flex min-w-0 flex-1 justify-center px-1" aria-label="Lederwaren Daniëlle — dashboard">
          <img
            src={LOGO_SRC}
            alt="Lederwaren Daniëlle"
            width={260}
            height={56}
            className="block h-7 w-auto max-w-[min(100%,200px)] object-contain brightness-0 invert"
            loading="eager"
            decoding="async"
          />
        </Link>
        <div className="w-9" />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Sluit menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="mobile-sidebar-image relative h-full w-[86%] max-w-xs border-r border-white/10">
            <div className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="min-w-0 pt-0.5"
                  aria-label="Lederwaren Daniëlle — dashboard"
                >
                  <img
                    src={LOGO_SRC}
                    alt="Lederwaren Daniëlle"
                    width={260}
                    height={56}
                    className="block h-9 w-auto max-w-[200px] object-contain brightness-0 invert"
                    loading="eager"
                    decoding="async"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="shrink-0 rounded p-1 text-gray-200 hover:bg-white/10 hover:text-white"
                  aria-label="Sluiten"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderMenu()}
            </div>
          </aside>
        </div>
      )}

      <aside className="sidebar-leather-bg hidden h-screen w-64 shrink-0 border-r border-white/10 md:flex md:flex-col">
        <div className="flex h-full flex-col p-4">
          <Link
            href="/dashboard"
            className="mb-4 block shrink-0 outline-none ring-offset-2 ring-offset-[#0b0d10] focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Lederwaren Daniëlle — dashboard"
          >
            <img
              src={LOGO_SRC}
              alt="Lederwaren Daniëlle"
              width={260}
              height={56}
              className="block h-11 w-auto max-w-full object-contain object-left brightness-0 invert"
              loading="eager"
              decoding="async"
            />
          </Link>
          {renderMenu()}
        </div>
      </aside>
    </>
  );
}
