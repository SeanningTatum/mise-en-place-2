import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconGitMerge,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useSearchParams, useRevalidator } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteHeader } from "./layout/site-header";
import { api } from "@/trpc/client";
import type { Route } from "./+types/ingredients";

interface IngredientRow {
  id: string;
  name: string;
  category: string | null;
  createdAt: Date;
  usageCount: number;
}

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
  const search = url.searchParams.get("search") || undefined;
  const category = url.searchParams.get("category") || undefined;

  const [ingredientsResponse, categories] = await Promise.all([
    context.trpc.ingredients.list({
      page: page - 1,
      limit: pageSize,
      search,
      category,
    }),
    context.trpc.ingredients.categories(),
  ]);

  return {
    ingredients: ingredientsResponse.ingredients as IngredientRow[],
    total: ingredientsResponse.total,
    page,
    pageSize,
    categories,
  };
};

export default function AdminIngredients({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [mergeDialogOpen, setMergeDialogOpen] = React.useState(false);
  const [mergeTarget, setMergeTarget] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState(searchParams.get("search") || "");

  const mergeMutation = api.ingredients.merge.useMutation({
    onSuccess: (data) => {
      toast.success(`Merged ${data.mergedCount} reference(s)`);
      setMergeDialogOpen(false);
      setRowSelection({});
      setMergeTarget(null);
      revalidator.revalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchInput !== currentSearch) {
        updateSearchParams({ search: searchInput || undefined, page: "1" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchParams]);

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
  };

  const selectedRows = Object.keys(rowSelection).filter((key) => rowSelection[key]);
  const selectedIngredients = loaderData.ingredients.filter((ing) =>
    selectedRows.includes(ing.id)
  );

  const handleMerge = () => {
    if (selectedRows.length !== 2 || !mergeTarget) return;
    const sourceId = selectedRows.find((id) => id !== mergeTarget);
    if (!sourceId) return;
    mergeMutation.mutate({ sourceId, targetId: mergeTarget });
  };

  const columns: ColumnDef<IngredientRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Ingredient",
      cell: ({ row }) => (
        <span className="font-medium capitalize">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <Badge variant="outline" className="capitalize">
            {category}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "Usage",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.usageCount} recipe{row.original.usageCount !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  ];

  const totalPages = Math.ceil(loaderData.total / loaderData.pageSize);

  const table = useReactTable({
    data: loaderData.ingredients,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    getRowId: (row) => row.id,
    pageCount: totalPages,
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <SiteHeader title="Ingredients" />
      <div className="px-4 lg:px-6">
        <div className="w-full space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 sm:max-w-sm">
                <IconSearch className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search ingredients..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              {loaderData.categories.length > 0 && (
                <Select
                  value={searchParams.get("category") || "all"}
                  onValueChange={(value) =>
                    updateSearchParams({
                      category: value === "all" ? undefined : value,
                      page: "1",
                    })
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {loaderData.categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedRows.length === 2 && (
              <Button onClick={() => setMergeDialogOpen(true)} className="gap-2">
                <IconGitMerge className="h-4 w-4" />
                Merge Selected
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {revalidator.state === "loading" ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading ingredients...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No ingredients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground flex-1 text-sm">
              {selectedRows.length} of {loaderData.total} ingredient(s) selected
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${loaderData.pageSize}`}
                  onValueChange={(value) => updateSearchParams({ pageSize: value, page: "1" })}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue placeholder={loaderData.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 50, 100].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {loaderData.page} of {totalPages || 1}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => updateSearchParams({ page: "1" })}
                  disabled={loaderData.page <= 1}
                >
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => updateSearchParams({ page: String(loaderData.page - 1) })}
                  disabled={loaderData.page <= 1}
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => updateSearchParams({ page: String(loaderData.page + 1) })}
                  disabled={loaderData.page >= totalPages}
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => updateSearchParams({ page: String(totalPages) })}
                  disabled={loaderData.page >= totalPages}
                >
                  <IconChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Ingredients</DialogTitle>
            <DialogDescription>
              Select which ingredient to keep. All recipe references from the other ingredient will
              be moved to the selected one, then the other will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">Keep which ingredient?</p>
            <div className="space-y-2">
              {selectedIngredients.map((ing) => (
                <label
                  key={ing.id}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="mergeTarget"
                    value={ing.id}
                    checked={mergeTarget === ing.id}
                    onChange={(e) => setMergeTarget(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <span className="font-medium capitalize">{ing.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      ({ing.usageCount} recipe{ing.usageCount !== 1 ? "s" : ""})
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!mergeTarget || mergeMutation.isPending}
            >
              {mergeMutation.isPending ? "Merging..." : "Merge Ingredients"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
