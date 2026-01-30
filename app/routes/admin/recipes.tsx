import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconSearch,
  IconTrash,
  IconExternalLink,
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
import { useSearchParams, useRevalidator, Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiteHeader } from "./layout/site-header";
import { api } from "@/trpc/client";
import type { Route } from "./+types/recipes";

interface RecipeRow {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: "youtube" | "blog";
  thumbnailUrl: string | null;
  calories: number | null;
  protein: number | null;
  createdAt: Date;
  createdById: string;
  userName: string | null;
  userEmail: string | null;
}

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
  const search = url.searchParams.get("search") || undefined;
  const sourceType = url.searchParams.get("sourceType") as "youtube" | "blog" | undefined;

  const response = await context.trpc.recipes.adminList({
    page: page - 1,
    limit: pageSize,
    search,
    sourceType: sourceType || undefined,
  });

  return {
    recipes: response.recipes as RecipeRow[],
    total: response.total,
    page,
    pageSize,
  };
};

export default function AdminRecipes({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [deleteRecipe, setDeleteRecipe] = React.useState<RecipeRow | null>(null);

  const [searchInput, setSearchInput] = React.useState(searchParams.get("search") || "");

  const deleteMutation = api.recipes.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Recipe deleted");
      setDeleteRecipe(null);
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

  const columns: ColumnDef<RecipeRow>[] = [
    {
      accessorKey: "title",
      header: "Recipe",
      cell: ({ row }) => {
        const recipe = row.original;
        return (
          <div className="flex items-center gap-3">
            {recipe.thumbnailUrl && (
              <img
                src={recipe.thumbnailUrl}
                alt={recipe.title}
                className="h-10 w-16 rounded object-cover"
              />
            )}
            <div className="flex flex-col">
              <Link
                to={`/recipes/${recipe.id}`}
                className="font-medium hover:underline"
              >
                {recipe.title}
              </Link>
              <span className="text-muted-foreground text-sm truncate max-w-xs">
                {recipe.sourceUrl}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sourceType",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.sourceType}
        </Badge>
      ),
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.userName || "Unknown"}</span>
          <span className="text-muted-foreground text-sm">{row.original.userEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "calories",
      header: "Macros",
      cell: ({ row }) => {
        const { calories, protein } = row.original;
        if (!calories && !protein) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="text-sm">
            {calories && <div>{calories} kcal</div>}
            {protein && <div>{protein}g protein</div>}
          </div>
        );
      },
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
    {
      id: "actions",
      cell: ({ row }) => {
        const recipe = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={`/recipes/${recipe.id}`}>
                  <IconExternalLink className="mr-2 h-4 w-4" />
                  View Recipe
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <IconExternalLink className="mr-2 h-4 w-4" />
                  View Original
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteRecipe(recipe)}
                variant="destructive"
                className="cursor-pointer"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Recipe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const totalPages = Math.ceil(loaderData.total / loaderData.pageSize);

  const table = useReactTable({
    data: loaderData.recipes,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <SiteHeader title="Recipes" />
      <div className="px-4 lg:px-6">
        <div className="w-full space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <IconSearch className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search recipes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={searchParams.get("sourceType") || "all"}
              onValueChange={(value) =>
                updateSearchParams({
                  sourceType: value === "all" ? undefined : value,
                  page: "1",
                })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
              </SelectContent>
            </Select>
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
                      Loading recipes...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      No recipes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground flex-1 text-sm">
              {loaderData.total} recipe(s) total
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
                    {[10, 20, 30, 40, 50].map((size) => (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRecipe} onOpenChange={() => setDeleteRecipe(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRecipe?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRecipe && deleteMutation.mutate({ id: deleteRecipe.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
