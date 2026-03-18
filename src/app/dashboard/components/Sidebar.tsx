"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/bestellingen", label: "Bestellingen" },
  { href: "/dashboard/b2b-klanten", label: "B2B klanten" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/dashboard/klantenservice", label: "Klantenservice" },
  { href: "/dashboard/producten", label: "Producten" },
  { href: "/dashboard/taken", label: "Taken" },
  { href: "/dashboard/agenda", label: "Agenda" },
  { href: "/dashboard/rapportage", label: "Rapportage" },
  { href: "/dashboard/ai-studio", label: "AI Studio" },
  { href: "/dashboard/merken", label: "Merken & webshops" },
  { href: "/dashboard/klantkaart", label: "Klantkaart" },
  { href: "/dashboard/instellingen", label: "Instellingen" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-leather-bg flex h-screen w-64 shrink-0 flex-col border-r border-black/20">
      <div className="flex flex-col h-full p-4">
        <nav className="flex flex-col gap-1 pt-2">
          {menuItems.map(({ href, label }) => {
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
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <Link
            href="/login"
            className="block rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Uitloggen
          </Link>
        </div>
      </div>
    </aside>
  );
}
