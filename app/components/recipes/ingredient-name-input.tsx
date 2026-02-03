import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Loader2, Check } from "lucide-react";

interface IngredientNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "data-testid"?: string;
}

/**
 * Input component for ingredient names with autocomplete suggestions.
 * Shows existing ingredients that match the typed text, with AI-powered
 * similarity matching when available.
 */
export function IngredientNameInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Ingredient name",
  "data-testid": dataTestId,
}: IngredientNameInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Query for similar ingredients
  const { data: suggestions, isLoading } = api.ingredients.suggestSimilar.useQuery(
    { name: debouncedValue },
    {
      enabled: debouncedValue.length >= 2 && showSuggestions,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const hasSuggestions = suggestions?.matches && suggestions.matches.length > 0;
  const isExactMatch = suggestions?.source === "exact";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "bg-background border-border/50 focus:border-primary/50",
            isExactMatch && value.length > 0 && "pr-8",
            className
          )}
          data-testid={dataTestId}
          autoComplete="off"
        />
        {/* Show check mark for exact matches */}
        {isExactMatch && value.length > 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && value.length >= 2 && !isExactMatch && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Finding matches...
            </div>
          ) : hasSuggestions ? (
            <ul className="py-1 max-h-48 overflow-y-auto">
              {suggestions.matches.map((match) => (
                <li key={match.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(match.name)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                  >
                    <span>{match.name}</span>
                    {match.confidence >= 0.9 && (
                      <span className="text-xs text-muted-foreground">
                        exact
                      </span>
                    )}
                    {match.confidence >= 0.7 && match.confidence < 0.9 && (
                      <span className="text-xs text-muted-foreground">
                        similar
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {suggestions.source === "ai" && (
                <li className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/30">
                  AI-suggested matches
                </li>
              )}
            </ul>
          ) : (
            <div className="py-3 px-3 text-sm text-muted-foreground">
              No existing ingredients match. A new ingredient will be created.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
