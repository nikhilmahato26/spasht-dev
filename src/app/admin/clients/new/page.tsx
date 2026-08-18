import { Users } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/page-header";
import { createClient } from "../actions";

export default async function NewClientPage() {
  await requireUser();
  return (
    <div>
      <PageHeader icon={Users} color="#B9832A" title="New client" />
      <ClientForm action={createClient} submitLabel="Create client" />
    </div>
  );
}
