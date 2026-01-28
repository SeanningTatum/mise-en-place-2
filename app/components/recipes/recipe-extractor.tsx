import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Extract a Recipe
        </CardTitle>
        <CardDescription>
          Paste a YouTube video or blog URL to extract a structured recipe with ingredients, steps, and nutrition info.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://example.com/recipe"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={extractMutation.isPending}
              className="flex-1"
              data-testid="recipe-url-input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handlePaste}
              disabled={extractMutation.isPending}
            >
              Paste
            </Button>
            <Button
              type="submit"
              disabled={extractMutation.isPending || !url.trim()}
              data-testid="extract-recipe-button"
            >
              {extractMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                "Extract"
              )}
            </Button>
          </div>

          {extractMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing content and extracting recipe... This may take 10-20 seconds.</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            Supports YouTube videos with captions and most recipe blogs. The recipe will be extracted using AI.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
