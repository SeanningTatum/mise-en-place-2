import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Link as LinkIcon, AlertCircle, Youtube, Globe, Clipboard, ArrowRight } from "lucide-react";
import { api } from "@/trpc/client";

interface RecipeExtractorProps {
  onExtracted: (recipe: ExtractedRecipeData) => void;
}

export interface ExtractedRecipeData {
  title: string;
  description: string | null;
  sourceUrl: string;
  sourceType: "youtube" | "blog";
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  ingredients: Array<{
    name: string;
    quantity: string | null;
    unit: string | null;
    notes: string | null;
  }>;
  steps: Array<{
    stepNumber: number;
    instruction: string;
    timestampSeconds: number | null;
    durationSeconds: number | null;
  }>;
}

export function RecipeExtractor({ onExtracted }: RecipeExtractorProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const extractMutation = api.recipes.extract.useMutation({
    onSuccess: (data) => {
      setError(null);
      onExtracted(data);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    setError(null);
    extractMutation.mutate({ url: url.trim() });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch {
      // Clipboard access denied, ignore
    }
  };

  // Detect if URL looks like YouTube
  const isYouTubeUrl = url.includes("youtube.com") || url.includes("youtu.be");

  return (
    <Card className="border-border/50 shadow-warm overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-linear-to-r from-primary via-primary/50 to-accent" />
      
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input area */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <LinkIcon className="h-4 w-4 text-primary" />
              Recipe URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder="Paste your recipe link here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={extractMutation.isPending}
                  className="h-12 pl-4 pr-12 text-base bg-card border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/60"
                  data-testid="recipe-url-input"
                />
                {url && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isYouTubeUrl ? (
                      <Youtube className="h-5 w-5 text-red-500" />
                    ) : (
                      <Globe className="h-5 w-5 text-primary" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePaste}
                  disabled={extractMutation.isPending}
                  className="h-12 px-4 gap-2 border-border/50 hover:bg-secondary/80"
                >
                  <Clipboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Paste</span>
                </Button>
                <Button
                  type="submit"
                  disabled={extractMutation.isPending || !url.trim()}
                  className="h-12 px-6 gap-2 shadow-warm hover:shadow-warm-lg font-medium"
                  data-testid="extract-recipe-button"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Extracting...</span>
                    </>
                  ) : (
                    <>
                      Extract
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading state with animation */}
          {extractMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-foreground">Analyzing your recipe</p>
                <p className="text-sm text-muted-foreground">
                  Reading content and extracting ingredients, steps, and nutrition info...
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Supported sources */}
          {!extractMutation.isPending && (
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Youtube className="h-4 w-4 text-red-500/70" />
                <span>YouTube videos</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary/70" />
                <span>Recipe blogs</span>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
