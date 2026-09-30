"use client";

import { useState, useTransition } from "react";
import {
  Send,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatPaisa } from "@/lib/money";
import { recordClientTeamPayout } from "../actions";

type AssigneeInfo = {
  userId: string;
  role: string | null;
  user: {
    id: string;
    name: string;
    type: string;
  };
  allocationAmount: number;
  totalPaid: number;
  dueBalance: number;
};

type DealOption = {
  id: string;
  projectName: string;
  status: string;
  assignments: AssigneeInfo[];
};

type TeamMemberOption = {
  id: string;
  name: string;
  email: string;
  type: string;
  role: string;
};

export function PayoutForm({
  clientId,
  deals,
  activeTeamMembers,
}: {
  clientId: string;
  deals: DealOption[];
  activeTeamMembers: TeamMemberOption[];
}) {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [teamTypeFilter, setTeamTypeFilter] = useState<"ALL" | "DEV" | "MARKETING">("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentDeal = deals.find((d) => d.id === selectedDealId);

  // Filter members by team type if toggled
  const filteredTeamMembers = activeTeamMembers.filter((m) => {
    if (teamTypeFilter === "ALL") return true;
    return m.type === teamTypeFilter;
  });

  // Check if selected user is an assignee on the current deal
  const currentAssignment = currentDeal?.assignments.find((a) => a.userId === selectedUserId);

  const handleFillDue = () => {
    if (currentAssignment && currentAssignment.dueBalance > 0) {
      setAmountInput(String(currentAssignment.dueBalance / 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("clientId", clientId);
    formData.set("dealId", selectedDealId);
    formData.set("userId", selectedUserId);
    formData.set("amount", amountInput);
    formData.set("method", method);
    formData.set("note", note);
    formData.set("date", date);

    startTransition(async () => {
      try {
        await recordClientTeamPayout(formData);
        setFeedback({
          type: "success",
          message: `Successfully recorded payout of ₹${Number(amountInput).toLocaleString("en-IN")}!`,
        });
        setAmountInput("");
        setNote("");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record payout";
        setFeedback({ type: "error", message: msg });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {feedback && (
        <div
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-input text-sm border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Deal Selection */}
      <div>
        <label className="block text-2xs uppercase tracking-label font-semibold text-text-muted mb-1.5">
          Select Project / Deal
        </label>
        <select
          value={selectedDealId}
          onChange={(e) => setSelectedDealId(e.target.value)}
          className="w-full bg-bg border border-border rounded-input px-3 py-2 text-sm text-text focus:outline-none focus:border-text-faint transition-colors"
        >
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.projectName} ({deal.status})
            </option>
          ))}
          {deals.length === 0 && <option value="">No deals for this client</option>}
        </select>
      </div>

      {/* Team Filter & Member Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-2xs uppercase tracking-label font-semibold text-text-muted">
            Team Member (Dev or Marketing)
          </label>
          <div className="flex items-center gap-1 bg-bg p-0.5 rounded-sm border border-border">
            {(["ALL", "DEV", "MARKETING"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTeamTypeFilter(t)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs transition-colors ${
                  teamTypeFilter === t
                    ? "bg-surface text-text shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
          className="w-full bg-bg border border-border rounded-input px-3 py-2 text-sm text-text focus:outline-none focus:border-text-faint transition-colors"
        >
          <option value="">-- Choose Team Member --</option>
          {/* First show assigned members on this deal */}
          {currentDeal && currentDeal.assignments.length > 0 && (
            <optgroup label="Assigned on this Deal">
              {currentDeal.assignments
                .filter((a) => teamTypeFilter === "ALL" || a.user.type === teamTypeFilter)
                .map((a) => (
                  <option key={`assigned-${a.userId}`} value={a.userId}>
                    {a.user.name} ({a.user.type}) · Due: {formatPaisa(a.dueBalance)}
                  </option>
                ))}
            </optgroup>
          )}

          {/* All active members */}
          <optgroup label="All Team Members">
            {filteredTeamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.type}) · {member.role}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Assignment Entitlement & Balance Banner */}
      {currentAssignment && (
        <div className="bg-bg/80 border border-border rounded-input p-3 text-xs flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 font-medium text-text">
              <UserCheck size={14} className="text-dev" />
              <span>{currentAssignment.user.name}</span>
              <span className="text-2xs uppercase tracking-wider text-text-muted px-1.5 py-0.2 bg-border/40 rounded">
                {currentAssignment.user.type}
              </span>
            </div>
            <div className="text-2xs text-text-faint mt-1 space-x-2">
              <span>Entitled: {formatPaisa(currentAssignment.allocationAmount)}</span>
              <span>·</span>
              <span>Paid: {formatPaisa(currentAssignment.totalPaid)}</span>
              <span>·</span>
              <span className="text-pending font-semibold">
                Due: {formatPaisa(currentAssignment.dueBalance)}
              </span>
            </div>
          </div>

          {currentAssignment.dueBalance > 0 && (
            <button
              type="button"
              onClick={handleFillDue}
              className="text-[11px] font-medium text-dev bg-dev-soft border border-dev/30 hover:bg-dev/20 px-2.5 py-1 rounded transition-colors shrink-0"
            >
              Fill Due ({formatPaisa(currentAssignment.dueBalance)})
            </button>
          )}
        </div>
      )}

      {/* Amount & Method Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs uppercase tracking-label font-semibold text-text-muted mb-1.5">
            Payout Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
            />
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 15000"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-bg border border-border rounded-input pl-9 pr-3 py-2 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-text-faint transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs uppercase tracking-label font-semibold text-text-muted mb-1.5">
            Payment Method
          </label>
          <div className="relative">
            <CreditCard
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-bg border border-border rounded-input pl-9 pr-3 py-2 text-sm text-text focus:outline-none focus:border-text-faint transition-colors"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date & Note Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs uppercase tracking-label font-semibold text-text-muted mb-1.5">
            Disbursement Date
          </label>
          <div className="relative">
            <Calendar
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
            />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-bg border border-border rounded-input pl-9 pr-3 py-2 text-sm text-text focus:outline-none focus:border-text-faint transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs uppercase tracking-label font-semibold text-text-muted mb-1.5">
            Reference / Note (Optional)
          </label>
          <div className="relative">
            <FileText
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
            />
            <input
              type="text"
              placeholder="UTR, milestone ref, remarks..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-bg border border-border rounded-input pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-text-faint transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !selectedUserId || !amountInput}
        className="w-full bg-text text-surface font-semibold text-sm py-2.5 px-4 rounded-btn hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send size={15} />
        <span>{isPending ? "Recording Payout..." : "Record Team Payout"}</span>
      </button>
    </form>
  );
}
