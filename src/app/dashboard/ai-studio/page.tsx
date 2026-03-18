"use client";

import { useState } from "react";

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">AI Studio</h2>
        <p className="mb-8 text-gray-600">
          Maak sfeerbeelden van productfoto&apos;s. Upload een productfoto en beschrijf de gewenste sfeer of setting; AI genereert een passend lifestylebeeld.
        </p>

        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-medium text-gray-900">Nieuwe sfeerbeeld</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload een productfoto en geef aan in welke sfeer of omgeving het product getoond moet worden.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Productfoto uploaden</label>
              <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Sleep een afbeelding hierheen of klik om te kiezen</p>
                  <input type="file" accept="image/*" className="mt-2 hidden" id="product-upload" />
                  <label htmlFor="product-upload" className="mt-2 inline-block cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                    Bestand kiezen
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Sfeer of setting (optioneel)</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="bijv. Op een houten bureau met koffie en notitieboek, natuurlijk licht"
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Bezig met genereren…" : "Sfeerbeeld genereren"}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <strong className="text-gray-900">Tip:</strong> Beschrijf de gewenste achtergrond, belichting of stijl (bijv. minimalistisch, lifestyle, editoriaal). De AI plaatst je product in die setting.
          </div>
        </div>
      </div>
    </main>
  );
}
