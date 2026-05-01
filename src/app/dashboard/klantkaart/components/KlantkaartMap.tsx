"use client";

import { useEffect, useRef } from "react";
import type { B2BKlant } from "@/lib/b2b-shared";

declare global {
  interface Window {
    // Leaflet does not have a `default` export in our installed typings.
    // Treat the dynamically imported module as the Leaflet module namespace instead.
    L?: typeof import("leaflet");
  }
}

export default function KlantkaartMap({ klanten }: { klanten: B2BKlant[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    const withCoords = klanten.filter((k) => k.lat != null && k.lng != null);
    if (withCoords.length === 0) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.crossOrigin = "";
    document.head.appendChild(link);

    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView([52.1, 5.3], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      withCoords.forEach((k) => {
        const marker = L.marker([k.lat!, k.lng!]).addTo(map);
        marker.bindPopup(
          `<strong>${k.bedrijfsnaam}</strong><br/>${k.contactpersoon}<br/>${k.plaats}, ${k.land}`
        );
      });

      if (withCoords.length > 1) {
        const bounds = L.latLngBounds(withCoords.map((k) => [k.lat!, k.lng!]));
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    });

    return () => {
      cancelled = true;
      link.remove();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [klanten]);

  return <div ref={mapRef} className="h-full min-h-[400px] w-full rounded-lg" />;
}
