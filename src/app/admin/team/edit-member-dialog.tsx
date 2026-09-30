"use client";

import { useState } from "react";
import {
  Pencil,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { updateMember } from "./actions";

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
  const length = 14;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

export type EditMemberProps = {
  id: string;
  name: string;
  email: string;
  role: string;
  type: string;
  isActive: boolean;
};

export function EditMemberDialog({ member }: { member: EditMemberProps }) {
  const [open, setOpen] = useState(false);
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

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPassword("");
      setShowPassword(false);
      setCopied(false);
    }
  };

  const action = updateMember.bind(null, member.id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-text-faint hover:bg-bg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5 text-text-muted" />
          <span>Edit</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit team member</DialogTitle>
        </DialogHeader>

        <form
          action={async (formData) => {
            if (password) {
              formData.set("password", password);
            }
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-4 mt-2"
        >
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
                Name
              </label>
              <input
                name="name"
                defaultValue={member.name}
                required
                placeholder="Full name"
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
                placeholder="Email address"
                className="border border-border rounded-input px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-text-faint transition-colors"
              />
            </div>
          </div>

          {/* Role & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
                Role
              </label>
              <select
                name="role"
                defaultValue={member.role}
                className="border border-border rounded-input px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-text-faint transition-colors"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
                Type
              </label>
              <select
                name="type"
                defaultValue={member.type}
                className="border border-border rounded-input px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-text-faint transition-colors"
              >
                <option value="DEV">Dev</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>
          </div>

          {/* Password & Password Generator */}
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
                    {copied ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
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

          {/* Active Status */}
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={member.isActive}
              className="w-4 h-4 rounded border-border"
            />
            <span>Active member (can log in and be assigned to deals)</span>
          </label>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <SubmitButton
              pendingText="Saving..."
              className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
            >
              Save changes
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
