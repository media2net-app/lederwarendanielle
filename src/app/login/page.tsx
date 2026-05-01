"use client";

import { useState } from "react";
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
    <main className="relative min-h-screen overflow-hidden bg-black text-gray-100">
      <div className="login-ambient-orb login-ambient-orb--one" aria-hidden />
      <div className="login-ambient-orb login-ambient-orb--two" aria-hidden />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
        <section className="w-full max-w-md">
          <div className="login-auth-card login-card-motion ui-card w-full border bg-white/[0.04] p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Inloggen
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Log in om verder te gaan naar het beheer van Lederwaren Daniëlle.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@bedrijf.nl"
                  required
                  className="login-auth-field ui-input w-full bg-white/5 px-4 py-3.5 placeholder:text-gray-500 focus:-translate-y-0.5"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-auth-field ui-input w-full bg-white/5 px-4 py-3.5 placeholder:text-gray-500 focus:-translate-y-0.5"
                />
              </div>

              {message && (
                <div
                  className={`login-auth-message border px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "border-emerald-300/35 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-300/35 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-auth-submit ui-btn-primary group relative mt-2 w-full overflow-hidden py-3.5 font-semibold hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">{isSubmitting ? "Bezig met inloggen..." : "Inloggen"}</span>
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-400">
              <Link href="/" className="transition-colors duration-300 hover:text-white">
                ← Terug naar start
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
