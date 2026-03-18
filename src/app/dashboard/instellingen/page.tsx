"use client";

import { useState } from "react";

const INITIAL_PROFILE = {
  naam: "Beheerder",
  email: "beheer@lederwaren-danielle.nl",
};

export default function InstellingenPage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [opgeslagen, setOpgeslagen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 3000);
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Instellingen</h2>
        <p className="text-gray-600 mb-8">
          Account en configuratie. Wijzigingen worden lokaal opgeslagen (demo).
        </p>

        <div className="max-w-xl space-y-8">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Profiel / Account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">
                  Naam
                </label>
                <input
                  id="naam"
                  type="text"
                  value={profile.naam}
                  onChange={(e) => setProfile((p) => ({ ...p, naam: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label htmlFor="wachtwoord" className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord wijzigen
                </label>
                <input
                  id="wachtwoord"
                  type="password"
                  placeholder="Nieuw wachtwoord (demo: niet opgeslagen)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Opslaan
              </button>
              {opgeslagen && (
                <span className="ml-3 text-sm text-gray-600">Opgeslagen.</span>
              )}
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Notificaties</h3>
            <p className="text-sm text-gray-500 mb-4">
              Stel in of u e-mail wilt ontvangen bij nieuwe bestellingen of tickets (binnenkort).
            </p>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notif-orders" className="rounded border-gray-300" />
              <label htmlFor="notif-orders" className="text-sm text-gray-700">E-mail bij nieuwe bestelling</label>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input type="checkbox" id="notif-tickets" className="rounded border-gray-300" />
              <label htmlFor="notif-tickets" className="text-sm text-gray-700">E-mail bij nieuw ticket</label>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
