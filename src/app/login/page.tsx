"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DUMMY_EMAIL = "beheer@lederwaren-danielle.nl";
const DUMMY_PASSWORD = "Ld#2024!Beheer$Xk9mN";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DUMMY_EMAIL);
  const [password, setPassword] = useState(DUMMY_PASSWORD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("user", JSON.stringify({
          email: DUMMY_EMAIL,
          naam: "Beheerder",
          rol: "Admin",
        }));
      }
      router.push("/dashboard");
      return;
    }
    setMessage({ type: "error", text: "Ongeldige inloggegevens." });
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Linkerhelft: branding / afbeelding */}
      <div
        className="md:w-1/2 relative flex flex-col items-center justify-center p-8 md:p-12 text-gray-100 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/thumb-1920-474157.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-[1]" aria-hidden />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-xs mb-8">
          <Image
            src="/lederwaren-danielle.png"
            alt="Lederwaren Daniëlle"
            width={280}
            height={120}
            className="object-contain w-full h-auto brightness-0 invert"
            priority
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-200 text-center mb-2">
          Hoofdportaal
        </h2>
        <p className="text-gray-300 text-center text-sm max-w-sm">
          AI Headquarters voor Lederwaren Daniëlle. Beheer van het bedrijf en
          automatisering van bedrijfsprocessen met AI.
        </p>
        <div className="mt-8 pt-8 border-t border-gray-600 w-full max-w-sm text-center text-sm text-gray-400">
          <p>Handelsweg 6, 7921 JR Zuidwolde</p>
          <p>
            <a href="tel:0528233787" className="hover:text-gray-200">
              0528 233 787
            </a>
            {" · "}
            <a href="mailto:info@lederwaren-danielle.nl" className="hover:text-gray-200">
              info@lederwaren-danielle.nl
            </a>
          </p>
        </div>
        </div>
      </div>

      {/* Rechterhelft: loginformulier */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Inloggen Hoofdportaal
          </h1>
          <p className="text-gray-600 text-sm mb-8">
            Log in voor beheer van Lederwaren Daniëlle.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800 mb-1.5"
              >
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            {message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black text-white py-3 font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Bezig met inloggen…" : "Inloggen"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/" className="text-gray-700 hover:underline">
              ← Terug naar start
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
