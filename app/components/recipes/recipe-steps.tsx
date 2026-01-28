import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  stepNumber: number;
  instruction: string;
  timestampSeconds: number | null;
  durationSeconds: number | null;
}

interface RecipeStepsProps {
  steps: Step[];
  onTimestampClick?: (timestampSeconds: number) => void;
  activeStep?: number | null;
  showYouTubeTimestamps?: boolean;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RecipeSteps({
  steps,
  onTimestampClick,
  activeStep,
  showYouTubeTimestamps = true,
}: RecipeStepsProps) {
  return (
    <div className="space-y-4" data-testid="recipe-steps">
      <h3 className="font-semibold text-lg">Steps</h3>
      <ol className="space-y-4">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex gap-4 p-3 rounded-lg transition-colors",
              activeStep === step.stepNumber && "bg-primary/5 ring-1 ring-primary/20"
            )}
            data-testid={`recipe-step-${step.stepNumber}`}
          >
            <span
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                activeStep === step.stepNumber
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.stepNumber}
            </span>
            <div className="flex-1 space-y-2">
              {showYouTubeTimestamps && step.timestampSeconds !== null && onTimestampClick && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs font-mono"
                  onClick={() => onTimestampClick(step.timestampSeconds!)}
                  data-testid={`timestamp-button-${step.stepNumber}`}
                >
                  <Play className="h-3 w-3" />
                  {formatTimestamp(step.timestampSeconds)}
                </Button>
              )}
              <p className="text-sm leading-relaxed">{step.instruction}</p>
              {step.durationSeconds && (
                <Badge variant="secondary" className="text-xs">
                  ~{Math.ceil(step.durationSeconds / 60)} min
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
