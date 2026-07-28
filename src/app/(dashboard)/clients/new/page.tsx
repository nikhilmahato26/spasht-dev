import { requireUser } from "@/lib/dal";
import { ClientForm } from "@/components/client-form";
import { createClient } from "../actions";

export default async function NewClientPage() {
  await requireUser();
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">New client</h1>
      <ClientForm action={createClient} submitLabel="Create client" />
    </div>
  );
}
