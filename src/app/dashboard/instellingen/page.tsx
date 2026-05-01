"use client";

import { useState } from "react";

const INITIAL_PROFILE = {
  naam: "Beheerder",
  email: "beheer@lederwaren-danielle.nl",
};

interface MailAccountConfig {
  id: string;
  afzenderNaam: string;
  afzenderEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpGebruiker: string;
  smtpWachtwoord: string;
  secure: boolean;
  standaardVoorSupport: boolean;
}

const INITIAL_MAIL_ACCOUNTS: MailAccountConfig[] = [
  {
    id: "mail-1",
    afzenderNaam: "Klantenservice Lederwaren Danielle",
    afzenderEmail: "support@lederwaren-danielle.nl",
    smtpHost: "smtp.provider.nl",
    smtpPort: "587",
    smtpGebruiker: "support@lederwaren-danielle.nl",
    smtpWachtwoord: "",
    secure: true,
    standaardVoorSupport: true,
  },
];

export default function InstellingenPage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [mailAccounts, setMailAccounts] = useState(INITIAL_MAIL_ACCOUNTS);
  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: false,
    businessNaam: "",
    telefoonNummerId: "",
    accessToken: "",
    webhookSecret: "",
  });
  const [websiteChatConfig, setWebsiteChatConfig] = useState({
    enabled: false,
    provider: "Intercom",
    apiKey: "",
    websiteIds: "lederwaren-danielle.nl, b2b.lederwaren-danielle.nl",
  });
  const [exactConfig, setExactConfig] = useState({
    enabled: false,
    administratieCode: "",
    clientId: "",
    clientSecret: "",
    redirectUri: "https://app.lederwaren-danielle.nl/api/exact/callback",
  });
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [koppelingenOpgeslagen, setKoppelingenOpgeslagen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 3000);
  };

  const updateMailAccount = (id: string, key: keyof MailAccountConfig, value: string | boolean) => {
    setMailAccounts((current) =>
      current.map((account) => {
        if (account.id !== id) return account;
        return { ...account, [key]: value };
      })
    );
  };

  const addMailAccount = () => {
    setMailAccounts((current) => [
      ...current,
      {
        id: `mail-${Date.now()}`,
        afzenderNaam: "",
        afzenderEmail: "",
        smtpHost: "",
        smtpPort: "587",
        smtpGebruiker: "",
        smtpWachtwoord: "",
        secure: true,
        standaardVoorSupport: false,
      },
    ]);
  };

  const removeMailAccount = (id: string) => {
    setMailAccounts((current) => current.filter((account) => account.id !== id));
  };

  const saveKoppelingen = () => {
    setKoppelingenOpgeslagen(true);
    setTimeout(() => setKoppelingenOpgeslagen(false), 2500);
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Instellingen</h2>
        <p className="text-gray-600 mb-8">
          Account en configuratie. Wijzigingen worden direct opgeslagen.
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
                  placeholder="Nieuw wachtwoord"
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

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-gray-900">Koppelingen klantenservice</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Voorbereiding op centrale afhandeling binnen klantenservice (WhatsApp, e-mail, website chat en Exact).
                </p>
              </div>
              <button
                type="button"
                onClick={saveKoppelingen}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Koppelingen opslaan
              </button>
            </div>
            {koppelingenOpgeslagen && (
              <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Koppelingsinstellingen opgeslagen.
              </p>
            )}

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">WhatsApp Business</h4>
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={whatsappConfig.enabled}
                      onChange={(e) => setWhatsappConfig((current) => ({ ...current, enabled: e.target.checked }))}
                    />
                    Actief
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Business naam"
                    value={whatsappConfig.businessNaam}
                    onChange={(e) => setWhatsappConfig((current) => ({ ...current, businessNaam: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Telefoonnummer ID"
                    value={whatsappConfig.telefoonNummerId}
                    onChange={(e) => setWhatsappConfig((current) => ({ ...current, telefoonNummerId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="password"
                    placeholder="Meta access token"
                    value={whatsappConfig.accessToken}
                    onChange={(e) => setWhatsappConfig((current) => ({ ...current, accessToken: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="password"
                    placeholder="Webhook secret"
                    value={whatsappConfig.webhookSecret}
                    onChange={(e) => setWhatsappConfig((current) => ({ ...current, webhookSecret: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">Chat websites</h4>
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={websiteChatConfig.enabled}
                      onChange={(e) => setWebsiteChatConfig((current) => ({ ...current, enabled: e.target.checked }))}
                    />
                    Actief
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Provider (bijv. Intercom, Crisp, Tawk)"
                    value={websiteChatConfig.provider}
                    onChange={(e) => setWebsiteChatConfig((current) => ({ ...current, provider: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="password"
                    placeholder="Widget/API key"
                    value={websiteChatConfig.apiKey}
                    onChange={(e) => setWebsiteChatConfig((current) => ({ ...current, apiKey: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <textarea
                    placeholder="Websites/domains (komma-gescheiden)"
                    value={websiteChatConfig.websiteIds}
                    onChange={(e) => setWebsiteChatConfig((current) => ({ ...current, websiteIds: e.target.value }))}
                    className="md:col-span-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">E-mail afzenders + SMTP per adres</h4>
                  <button
                    type="button"
                    onClick={addMailAccount}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    + Mailadres toevoegen
                  </button>
                </div>
                <div className="space-y-3">
                  {mailAccounts.map((account) => (
                    <div key={account.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Mailprofiel
                        </p>
                        <button
                          type="button"
                          onClick={() => removeMailAccount(account.id)}
                          className="text-xs text-rose-600 hover:text-rose-700"
                          disabled={mailAccounts.length === 1}
                        >
                          Verwijderen
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Afzender naam"
                          value={account.afzenderNaam}
                          onChange={(e) => updateMailAccount(account.id, "afzenderNaam", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <input
                          type="email"
                          placeholder="Afzender e-mailadres"
                          value={account.afzenderEmail}
                          onChange={(e) => updateMailAccount(account.id, "afzenderEmail", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <input
                          type="text"
                          placeholder="SMTP host"
                          value={account.smtpHost}
                          onChange={(e) => updateMailAccount(account.id, "smtpHost", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <input
                          type="text"
                          placeholder="SMTP poort"
                          value={account.smtpPort}
                          onChange={(e) => updateMailAccount(account.id, "smtpPort", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <input
                          type="text"
                          placeholder="SMTP gebruikersnaam"
                          value={account.smtpGebruiker}
                          onChange={(e) => updateMailAccount(account.id, "smtpGebruiker", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <input
                          type="password"
                          placeholder="SMTP wachtwoord"
                          value={account.smtpWachtwoord}
                          onChange={(e) => updateMailAccount(account.id, "smtpWachtwoord", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-700">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={account.secure}
                            onChange={(e) => updateMailAccount(account.id, "secure", e.target.checked)}
                          />
                          TLS/SSL gebruiken
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={account.standaardVoorSupport}
                            onChange={(e) =>
                              setMailAccounts((current) =>
                                current.map((item) => ({
                                  ...item,
                                  standaardVoorSupport: item.id === account.id ? e.target.checked : false,
                                }))
                              )
                            }
                          />
                          Standaard afzender voor klantenservice
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">EXACT koppeling</h4>
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={exactConfig.enabled}
                      onChange={(e) => setExactConfig((current) => ({ ...current, enabled: e.target.checked }))}
                    />
                    Actief
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Administratie code / division"
                    value={exactConfig.administratieCode}
                    onChange={(e) => setExactConfig((current) => ({ ...current, administratieCode: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="EXACT client ID"
                    value={exactConfig.clientId}
                    onChange={(e) => setExactConfig((current) => ({ ...current, clientId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="password"
                    placeholder="EXACT client secret"
                    value={exactConfig.clientSecret}
                    onChange={(e) => setExactConfig((current) => ({ ...current, clientSecret: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Redirect URI"
                    value={exactConfig.redirectUri}
                    onChange={(e) => setExactConfig((current) => ({ ...current, redirectUri: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
