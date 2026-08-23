"use client";

import { useState } from "react";
import { ClientPicker } from "@/components/client-picker";

type ClientOption = { id: string; name: string; company: string | null };

export function DealNameSection({ clients }: { clients: ClientOption[] }) {
  const [clientName, setClientName] = useState("");
  const [sameAsClient, setSameAsClient] = useState(false);
  const [manualProjectName, setManualProjectName] = useState("");

  const projectName = sameAsClient ? clientName : manualProjectName;

  return (
    <>
      <ClientPicker clients={clients} onNameChange={setClientName} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
              Project name *
            </label>
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={sameAsClient}
                onChange={(e) => {
                  setSameAsClient(e.target.checked);
                  if (e.target.checked) setManualProjectName(clientName);
                }}
                className="w-3.5 h-3.5"
              />
              Same as client name
            </label>
          </div>
          <input
            name="projectName"
            required
            value={projectName}
            onChange={(e) => {
              setManualProjectName(e.target.value);
              setSameAsClient(false);
            }}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Link</label>
          <input
            name="link"
            placeholder="https://..."
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          />
        </div>
      </div>
    </>
  );
}
