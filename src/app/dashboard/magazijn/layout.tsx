"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const magazijnTabs = [
  { href: "/dashboard/magazijn/pick-pack", label: "Pick & Pack" },
  { href: "/dashboard/magazijn/voorraad", label: "Voorraad" },
  { href: "/dashboard/magazijn/inventaris", label: "Inventaris" },
];

export default function MagazijnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="flex gap-1">
          {magazijnTabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                pathname === href
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
