"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, Copy, Check } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { updateMember } from "../actions";

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
  const length = 14;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

export function MemberEditForm({
  member,
}: {
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    type: string;
    isActive: boolean;
  };
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword();
    setPassword(newPass);
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = password;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const action = updateMember.bind(null, member.id);

  return (
    <form
      action={async (formData) => {
        if (password) {
          formData.set("password", password);
        }
        await action(formData);
        setPassword("");
        setShowPassword(false);
        setCopied(false);
      }}
      className="flex flex-col gap-3.5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Name
          </label>
          <input
            name="name"
            defaultValue={member.name}
            required
            className="border border-border rounded-input px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-text-faint transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={member.email}
            required
            className="border border-border rounded-input px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-text-faint transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Role
          </label>
          <FormSelect
            name="role"
            defaultValue={member.role}
            placeholder="Role"
            options={[
              { value: "MEMBER", label: "Member" },
              { value: "ADMIN", label: "Admin" },
            ]}
            className="w-full h-auto py-2 rounded-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Type
          </label>
          <FormSelect
            name="type"
            defaultValue={member.type}
            placeholder="Type"
            options={[
              { value: "DEV", label: "Dev" },
              { value: "MARKETING", label: "Marketing" },
            ]}
            className="w-full h-auto py-2 rounded-input"
          />
        </div>
      </div>

      {/* Password & Generator */}
      <div className="flex flex-col gap-1.5 p-3 rounded-input bg-bg border border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-label text-text font-semibold flex items-center gap-1.5">
            <KeyRound size={13} className="text-dev" />
            <span>Password</span>
          </label>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="text-2xs font-semibold text-dev hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>⚡ Generate Password</span>
          </button>
        </div>

        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="w-full border border-border rounded-input pl-3 pr-16 py-2 text-sm bg-surface text-text font-mono placeholder:font-sans placeholder:text-text-muted focus:outline-none focus:border-text-faint transition-colors"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-text-muted">
            {password && (
              <button
                type="button"
                onClick={handleCopyPassword}
                title="Copy password"
                className="p-1 rounded hover:text-text hover:bg-border/30 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
              className="p-1 rounded hover:text-text hover:bg-border/30 transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-text-faint mt-0.5">
          {password ? (
            <span className="text-emerald-400">
              New password ready. Click Copy to share it with the member before saving.
            </span>
          ) : (
            "Leave blank to keep existing password, or click Generate Password."
          )}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={member.isActive}
          className="w-4 h-4 rounded border-border"
        />
        <span>Active member (can log in and be assigned to deals)</span>
      </label>

      <SubmitButton
        pendingText="Saving..."
        className="self-start bg-text text-surface border border-text px-4 py-2 rounded-btn text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
      >
        Save changes
      </SubmitButton>
    </form>
  );
}
