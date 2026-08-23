import type { DealStatus } from "@/generated/prisma/client";

export const STATUS_LABELS: Record<DealStatus, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<DealStatus, string> = {
  LEAD: "bg-surface-2 text-text-muted",
  IN_PROGRESS: "bg-marketing-soft text-marketing",
  DELIVERED: "bg-company-soft text-company",
  PAID: "bg-accent-soft text-accent",
  CANCELLED: "bg-cost-soft text-cost",
};
