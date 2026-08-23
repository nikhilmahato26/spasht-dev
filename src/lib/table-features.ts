import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  type RowData,
} from "@tanstack/react-table";

export type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "right";
};

export const tableFeatureSet = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<DataTableColumnMeta>(),
});

export function createColumns<TData extends RowData>() {
  return createColumnHelper<typeof tableFeatureSet, TData>();
}
