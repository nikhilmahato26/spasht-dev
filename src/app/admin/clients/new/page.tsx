import { Users } from "lucide-react";
import { requirePermission } from "@/lib/dal";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/page-header";
import { createClient } from "../actions";

export default async function NewClientPage() {
  await requirePermission("CLIENTS_MANAGE");
  return (
    <div>
      <PageHeader icon={Users} color="#b9832a" title="New client" />
      <ClientForm action={createClient} submitLabel="Create client" />
    </div>
  );
}
