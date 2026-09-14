import { TablePageSkeleton } from "@/components/table-page-skeleton";

export default function MyPayoutsLoading() {
  return <TablePageSkeleton columns={4} showFilters={false} showAction={false} />;
}
