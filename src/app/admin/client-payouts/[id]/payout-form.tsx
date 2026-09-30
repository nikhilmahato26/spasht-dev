"use client";

import { useState, useTransition } from "react";
import {
  Send,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  Code,
  Megaphone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatPaisa } from "@/lib/money";
import { recordSectionPayout } from "../actions";

type Section = "DEV" | "MARKETING";

type SectionBalance = {
  entitled: number;
  paid: number;
  due: number;
};

type DealOption = {
  id: string;
  projectName: string;
  status: string;
  sections: Record<Section, SectionBalance>;
};

const SECTIONS: { id: Section; label: string; icon: typeof Code }[] = [
  { id: "DEV", label: "Dev", icon: Code },
  { id: "MARKETING", label: "Marketing", icon: Megaphone },
];

export function PayoutForm({
  clientId,
  deals,
}: {
  clientId: string;
  deals: DealOption[];
}) {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [team, setTeam] = useState<Section>("DEV");
  const [amountInput, setAmountInput] = useState<string>("");
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentDeal = deals.find((d) => d.id === selectedDealId);
  const balance = currentDeal?.sections[team];

  const handleFillDue = () => {
    if (balance && balance.due > 0) {
      setAmountInput(String(balance.due / 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set("clientId", clientId);
    formData.set("dealId", selectedDealId);
    formData.set("team", team);
    formData.set("amount", amountInput);
    formData.set("method", method);
    formData.set("note", note);
    formData.set("date", date);

    startTransition(async () => {
      try {
        await recordSectionPayout(formData);
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

      {/* Section Selection */}
      <div>
        <label className="block text-2xs uppercase tracking-label font-semibold text-text-muted mb-1.5">
          Pay To Section
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const active = team === id;
            const activeClass =
              id === "DEV"
                ? "bg-dev-soft border-dev/40 text-dev"
                : "bg-marketing-soft border-marketing/40 text-marketing";
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTeam(id)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 border rounded-input px-3 py-2 text-sm font-semibold transition-colors ${
                  active ? activeClass : "bg-bg border-border text-text-muted hover:text-text"
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Entitlement & Balance Banner */}
      {balance && (
        <div className="bg-bg/80 border border-border rounded-input p-3 text-xs flex items-center justify-between gap-3">
          <div className="text-2xs text-text-faint space-x-2">
            <span>Pool: {formatPaisa(balance.entitled)}</span>
            <span>·</span>
            <span>Paid: {formatPaisa(balance.paid)}</span>
            <span>·</span>
            <span className="text-pending font-semibold">Due: {formatPaisa(balance.due)}</span>
          </div>

          {balance.due > 0 && (
            <button
              type="button"
              onClick={handleFillDue}
              className={`text-[11px] font-medium px-2.5 py-1 rounded border transition-colors shrink-0 ${
                team === "DEV"
                  ? "text-dev bg-dev-soft border-dev/30 hover:bg-dev/20"
                  : "text-marketing bg-marketing-soft border-marketing/30 hover:bg-marketing/20"
              }`}
            >
              Fill Due ({formatPaisa(balance.due)})
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
        disabled={isPending || !selectedDealId || !amountInput}
        className="w-full bg-text text-surface font-semibold text-sm py-2.5 px-4 rounded-btn hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send size={15} />
        <span>{isPending ? "Recording Payout..." : `Record ${team === "DEV" ? "Dev" : "Marketing"} Payout`}</span>
      </button>
    </form>
  );
}
