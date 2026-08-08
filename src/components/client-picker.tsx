"use client";

import { useMemo, useState } from "react";

type ClientOption = { id: string; name: string; company: string | null };

export function ClientPicker({
  clients,
  defaultClient,
}: {
  clients: ClientOption[];
  defaultClient?: ClientOption;
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ClientOption | null>(defaultClient ?? null);

  const filtered = useMemo(() => {
    if (!query) return clients;
    const q = query.toLowerCase();
    return clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q));
  }, [clients, query]);

  if (mode === "new") {
    return (
      <div className="border border-border rounded-card p-4 bg-surface-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-label text-text-muted font-semibold">New client</p>
          <button
            type="button"
            onClick={() => setMode("existing")}
            className="text-sm text-dev hover:underline"
          >
            Pick existing instead
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="newClientName"
            placeholder="Name *"
            required
            className="border border-border rounded-input px-3 py-2 text-base bg-surface col-span-2"
          />
          <input
            name="newClientPhone"
            placeholder="Phone"
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          />
          <input
            name="newClientEmail"
            placeholder="Email"
            type="email"
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          />
          <input
            name="newClientCompany"
            placeholder="Company"
            className="border border-border rounded-input px-3 py-2 text-base bg-surface col-span-2"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Client *</label>
        <button
          type="button"
          onClick={() => {
            setMode("new");
            setSelected(null);
          }}
          className="text-sm text-dev hover:underline"
        >
          + New client
        </button>
      </div>

      <input type="hidden" name="clientId" value={selected?.id ?? ""} required={!selected} />

      {selected ? (
        <div className="flex items-center justify-between border border-border rounded-input px-3 py-2 bg-surface-2">
          <span className="text-base">
            {selected.name}
            {selected.company ? ` · ${selected.company}` : ""}
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-sm text-text-muted hover:text-text"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="border border-border rounded-input px-3 py-2 text-base bg-surface w-full"
          />
          {filtered.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-input shadow-sm max-h-48 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelected(c);
                    setQuery("");
                  }}
                  className="block w-full text-left px-3 py-2 text-base hover:bg-surface-2"
                >
                  {c.name}
                  {c.company ? ` · ${c.company}` : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
