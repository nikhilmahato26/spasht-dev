import { TablePageSkeleton } from "@/components/table-page-skeleton";

export default function ClientsLoading() {
  return <TablePageSkeleton columns={5} showFilters={false} />;
}
