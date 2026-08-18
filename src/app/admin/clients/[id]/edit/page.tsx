import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader icon={Users} color="#B9832A" title="Edit client" />
      <ClientForm action={action} defaultValues={client} submitLabel="Save changes" />
    </div>
  );
}
