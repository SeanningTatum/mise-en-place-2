import { useState } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Calendar,
  UtensilsCrossed,
  Download,
  Eye,
  MoreHorizontal,
  Trash2,
  Share2,
  Pencil,
  Copy,
  Globe,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import type { TemplateListItem } from "@/repositories/meal-plan-template";

interface TemplateCardProps {
  template: TemplateListItem;
  username?: string;
  onLoadToWeek?: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onShare?: (templateId: string, slug: string) => void;
  showActions?: boolean;
}

export function TemplateCard({
  template,
  username,
  onLoadToWeek,
  onEdit,
  onShare,
  showActions = true,
}: TemplateCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const utils = api.useUtils();

  const updateMutation = api.mealPlanTemplate.update.useMutation({
    onSuccess: () => {
      utils.mealPlanTemplate.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update template");
    },
  });

  const deleteMutation = api.mealPlanTemplate.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      utils.mealPlanTemplate.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const handleToggleVisibility = async () => {
    const newVisibility = !template.isPublic;
    await updateMutation.mutateAsync({
      templateId: template.id,
      isPublic: newVisibility,
    });
    toast.success(newVisibility ? "Template is now public" : "Template is now private");
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ templateId: template.id });
    setDeleteDialogOpen(false);
  };

  const handleCopyLink = () => {
    if (!username) return;
    const url = `${window.location.origin}/u/${username}/plans/${template.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <>
      <Card
        className="group overflow-hidden hover:shadow-md transition-shadow"
        data-testid={`template-card-${template.id}`}
      >
        {/* Cover Image */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {template.coverImageUrl ? (
            <img
              src={template.coverImageUrl}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Visibility badge */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={template.isPublic ? "default" : "secondary"}
              className={cn(
                "gap-1 text-xs",
                template.isPublic
                  ? "bg-primary/90 hover:bg-primary/90"
                  : "bg-secondary/90"
              )}
            >
              {template.isPublic ? (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
            </Badge>
          </div>

          {/* Theme badge */}
          {template.theme && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-background/90 capitalize">
                {template.theme.replace("-", " ")}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">
              {template.name}
            </h3>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    data-testid="template-card-menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(template.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                  )}
                  {onLoadToWeek && (
                    <DropdownMenuItem onClick={() => onLoadToWeek(template.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Load to Week
                    </DropdownMenuItem>
                  )}
                  {template.isPublic && username && (
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  )}
                  {onShare && template.isPublic && (
                    <DropdownMenuItem
                      onClick={() => onShare(template.id, template.slug)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              {template.mealCount} meals
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {template.importCount} imports
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {template.viewCount} views
            </span>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="pt-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={template.isPublic}
                onCheckedChange={handleToggleVisibility}
                disabled={updateMutation.isPending}
                data-testid="template-visibility-toggle"
              />
              <span className="text-xs text-muted-foreground">
                {template.isPublic ? "Public" : "Private"}
              </span>
            </div>
            {onLoadToWeek && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLoadToWeek(template.id)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Load
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{template.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Public template card variant - for displaying on public profile pages
 */
interface PublicTemplateCardProps {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    theme: string | null;
    coverImageUrl: string | null;
    importCount: number;
    viewCount: number;
    mealCount: number;
  };
  username: string;
}

export function PublicTemplateCard({
  template,
  username,
}: PublicTemplateCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {template.coverImageUrl ? (
          <img
            src={template.coverImageUrl}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Theme badge */}
        {template.theme && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/90 capitalize">
              {template.theme.replace("-", " ")}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <Link
          to={`/u/${username}/plans/${template.slug}`}
          className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
        >
          {template.name}
        </Link>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {template.mealCount} meals
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {template.importCount} imports
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="default" size="sm" className="w-full">
          <Link to={`/u/${username}/plans/${template.slug}`}>View Plan</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
