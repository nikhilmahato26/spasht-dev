import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { ClientForm } from "@/components/client-form";
import { updateClient } from "../../actions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const client = await db.client.findUnique({ where: { id } });
  if (!client) notFound();

  const action = updateClient.bind(null, id);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">Edit client</h1>
      <ClientForm action={action} defaultValues={client} submitLabel="Save changes" />
    </div>
  );
}
