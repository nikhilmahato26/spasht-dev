export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "deal.create": "created a deal",
  "deal.update": "updated a deal",
  "deal.delete": "deleted a deal",
  "client.create": "added a client",
  "client.update": "updated a client",
  "client.delete": "deleted a client",
  "category.create": "added a category",
  "category.delete": "deleted a category",
  "payment.create": "recorded a payment",
  "costItem.create": "added a cost item",
  "user.create": "added a team member",
  "user.update": "updated a team member",
  "user.delete": "removed a team member",
  "payout.create": "recorded a payout",
};

export const ENTITY_LINK_PREFIX: Record<string, string> = {
  Deal: "/deals",
  Client: "/clients",
  User: "/team",
};
