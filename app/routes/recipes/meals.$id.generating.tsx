import { useEffect, useState } from "react";
import { redirect, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/meals.$id.generating";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ChefAnimation } from "@/components/loading/chef-animation";
import { GenerationProgressBar } from "@/components/loading/generation-progress-bar";
import { LoadingTips } from "@/components/loading/loading-tips";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  // Verify meal exists
  try {
    await context.trpc.multiCourseMeal.getById({ mealId: params.id });
  } catch {
    return redirect("/recipes/meals");
  }

  return { mealId: params.id };
}

export function meta() {
  return [
    { title: "Generating Timeline | Mise en Place" },
    { name: "description", content: "Creating your cooking timeline..." },
  ];
}

export default function GeneratingPage({ loaderData }: Route.ComponentProps) {
  const { mealId } = loaderData;
  const navigate = useNavigate();
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Poll for generation status
  const { data: status, refetch } = api.multiCourseMeal.getGenerationStatus.useQuery(
    { mealId },
    {
      refetchInterval: 1500, // Poll every 1.5 seconds
      enabled: !error,
    }
  );

  // Simulate progress animation while generating
  useEffect(() => {
    if (status?.status === "generating") {
      const timer = setInterval(() => {
        setProgress((prev) => {
          // Slowly increase progress, never hitting 100 until complete
          if (prev < 85) return prev + Math.random() * 5;
          return prev;
        });
      }, 800);
      return () => clearInterval(timer);
    }
  }, [status?.status]);

  // Handle completion
  useEffect(() => {
    if (status?.status === "complete") {
      setProgress(100);
      // Small delay for animation, then navigate
      setTimeout(() => {
        navigate(`/recipes/meals/${mealId}`, { replace: true });
      }, 500);
    } else if (status?.status === "error") {
      setError(status.error || "Generation failed. Please try again.");
      setProgress(0);
    }
  }, [status?.status, status?.error, mealId, navigate]);

  // Retry mutation
  const retryMutation = api.multiCourseMeal.startGeneration.useMutation({
    onSuccess: () => {
      setError(null);
      setProgress(10);
      refetch();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleRetry = () => {
    retryMutation.mutate({ mealId });
  };

  const handleCancel = () => {
    navigate(`/recipes/meal`, { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 p-4 rounded-full bg-destructive/10 w-fit">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Generation Failed
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {error}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              disabled={retryMutation.isPending}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${retryMutation.isPending ? "animate-spin" : ""}`} />
              {retryMutation.isPending ? "Retrying..." : "Try Again"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Chef Animation */}
        <ChefAnimation />

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Creating Your Timeline
          </h1>
          <p className="text-muted-foreground">
            Our AI is analyzing your recipes and crafting the perfect cooking schedule...
          </p>
        </div>

        {/* Progress Bar */}
        <GenerationProgressBar progress={Math.round(progress)} />

        {/* Tips Carousel */}
        <LoadingTips className="mt-8" />

        {/* Cancel Button */}
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
