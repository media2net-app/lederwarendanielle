"use client";

import { useEffect, useState } from "react";
import { getDemoMode, resetDemoState, setDemoMode } from "@/lib/demo-state";
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

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/bestellingen", label: "Bestellingen" },
  { href: "/dashboard/magazijn", label: "Magazijn", badge: "NIEUW" },
  { href: "/dashboard/b2b-klanten", label: "B2B klanten" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/dashboard/klantenservice", label: "Klantenservice" },
  { href: "/dashboard/chat", label: "Interne chat", badge: "NIEUW" },
  { href: "/dashboard/producten", label: "Producten" },
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
  const [demoMode, setDemoModeState] = useState(true);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch (_) {}
    setDemoModeState(getDemoMode());
  }, []);

  return (
    <aside className="sidebar-leather-bg flex h-screen w-64 shrink-0 flex-col border-r border-black/20">
      <div className="flex flex-col h-full p-4">
        <nav className="flex flex-col gap-1 pt-2">
          {menuItems.map(({ href, label, badge }) => {
            const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{label}</span>
                  {badge && (
                    <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      {badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 space-y-2">
          <div className="rounded-lg bg-white/10 px-3 py-2.5">
            <div className="text-sm font-medium text-white">{user.naam}</div>
            <div className="text-xs text-gray-300 truncate" title={user.email}>{user.email}</div>
            <div className="mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200 bg-amber-900/40">
              {user.rol}
            </div>
          </div>
          <label className="flex items-center justify-between rounded-lg border border-white/20 px-3 py-2 text-xs text-gray-200">
            <span>Demo mode</span>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => {
                const checked = e.target.checked;
                setDemoModeState(checked);
                setDemoMode(checked);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              resetDemoState();
              setResetNotice("Demo data is gereset");
              setTimeout(() => setResetNotice(null), 2500);
              router.refresh();
            }}
            className="block w-full rounded-lg border border-amber-500/60 bg-amber-600/10 px-3 py-2.5 text-left text-sm text-amber-200 hover:bg-amber-600/20 transition-colors"
          >
            Demo reset
          </button>
          {resetNotice && <p className="text-xs text-emerald-300">{resetNotice}</p>}
          <button
            type="button"
            onClick={() => router.push("/dashboard/offerte")}
            className="block w-full rounded-lg border border-indigo-400/50 bg-indigo-500/10 px-3 py-2.5 text-left text-sm text-indigo-100 hover:bg-indigo-500/20 transition-colors"
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
            className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </aside>
  );
}
