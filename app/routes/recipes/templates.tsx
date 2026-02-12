import { useState } from "react";
import { redirect } from "react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TemplateCard,
  ImportModal,
} from "@/components/meal-plan-template";
import { ShareModal } from "@/components/profile";
import { Plus, FileText } from "lucide-react";
import { api } from "@/trpc/client";
import { Link } from "react-router";
import type { Route } from "./+types/templates";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/authentication/login");
  }

  // Get user profile for sharing links
  const profile = await context.trpc.profile.getMyProfile();

  return { user: session.user, profile };
}

export default function TemplatesPage({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData;
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string | null>(
    null
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { data: templates, isLoading } = api.mealPlanTemplate.list.useQuery();

  const handleLoadToWeek = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setImportModalOpen(true);
  };

  const handleShare = (templateId: string, slug: string) => {
    setSelectedTemplateId(templateId);
    setSelectedTemplateSlug(slug);
    setShareModalOpen(true);
  };

  const selectedTemplate = templates?.find(
    (t) => t.id === selectedTemplateId
  );

  return (
    <div className="space-y-6" data-testid="templates-page">
      <PageHeader
        title="My Templates"
        subtitle="Save and manage your meal plan templates"
        actions={
          <Button asChild>
            <Link to="/recipes/planner">
              <Plus className="h-4 w-4 mr-2" />
              Create from Planner
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              username={profile?.username}
              onLoadToWeek={handleLoadToWeek}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Import Modal */}
      {selectedTemplate && (
        <ImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          mealCount={selectedTemplate.mealCount}
        />
      )}

      {/* Share Modal */}
      {selectedTemplateSlug && profile?.username && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          username={profile.username}
          displayName={profile.displayName}
          shareType="plan"
          slug={selectedTemplateSlug}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-6 rounded-full bg-muted/50 mb-4">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">
        No templates yet
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Save your weekly meal plans as templates to reuse them later or share
        them with others. Start by adding meals to your planner.
      </p>
      <Button asChild>
        <Link to="/recipes/planner">Go to Weekly Planner</Link>
      </Button>
    </div>
  );
}

function TemplateCardSkeleton() {
  return (
    <div className="border rounded-sm overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
