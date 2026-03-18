import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lederwaren Daniëlle | Hoofdportaal",
  description:
    "AI Headquarters voor Lederwaren Daniëlle. Beheer van het bedrijf en automatisering van bedrijfsprocessen met AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
