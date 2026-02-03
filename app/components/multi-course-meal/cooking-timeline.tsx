import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Pause, UtensilsCrossed, Printer, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  time: string;
  task: string;
  recipeId?: string;
  recipeName?: string;
  durationMinutes: number;
  category: "prep" | "cook" | "rest" | "serve";
}

interface CookingTimelineProps {
  timeline: TimelineItem[];
  mealName: string;
  servingTime: string;
  guestCount: number;
  onRegenerate?: () => void;
  onPrint?: () => void;
  isRegenerating?: boolean;
}

const categoryConfig = {
  prep: {
    label: "PREP",
    icon: Clock,
    color: "bg-muted text-muted-foreground",
    borderColor: "border-l-muted-foreground",
  },
  cook: {
    label: "COOK",
    icon: Flame,
    color: "bg-primary/10 text-primary",
    borderColor: "border-l-primary",
  },
  rest: {
    label: "REST",
    icon: Pause,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    borderColor: "border-l-amber-500",
  },
  serve: {
    label: "SERVE",
    icon: UtensilsCrossed,
    color: "bg-accent text-accent-foreground",
    borderColor: "border-l-accent",
  },
};

export function CookingTimeline({
  timeline,
  mealName,
  servingTime,
  guestCount,
  onRegenerate,
  onPrint,
  isRegenerating,
}: CookingTimelineProps) {
  // Group timeline by time
  const groupedTimeline = timeline.reduce((acc, item) => {
    if (!acc[item.time]) {
      acc[item.time] = [];
    }
    acc[item.time].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const timeGroups = Object.keys(groupedTimeline).sort();

  // Format serving time for display
  const servingDate = new Date(servingTime);
  const formattedDate = servingDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const formattedTime = servingDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4" data-testid="cooking-timeline">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Cooking Timeline</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Serving {guestCount} guests at {formattedTime}, {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="gap-1.5"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRegenerating && "animate-spin")}
              />
              Regenerate
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No timeline generated yet. Add courses and generate a timeline.
          </p>
        </Card>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[4.5rem] top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {timeGroups.map((time) => (
              <TimeGroup key={time} time={time} items={groupedTimeline[time]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TimeGroupProps {
  time: string;
  items: TimelineItem[];
}

function TimeGroup({ time, items }: TimeGroupProps) {
  return (
    <div className="relative flex gap-4" data-testid={`timeline-group-${time}`}>
      {/* Time Badge */}
      <div className="w-16 shrink-0 text-right">
        <Badge variant="secondary" className="font-mono text-sm">
          {time}
        </Badge>
      </div>

      {/* Connector dot */}
      <div className="absolute left-[4.25rem] top-2 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />

      {/* Tasks */}
      <div className="flex-1 space-y-2 pb-2">
        {items.map((item) => (
          <TimelineItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface TimelineItemCardProps {
  item: TimelineItem;
}

function TimelineItemCard({ item }: TimelineItemCardProps) {
  const config = categoryConfig[item.category];
  const Icon = config.icon;

  return (
    <Card
      className={cn("p-3 border-l-4", config.borderColor)}
      data-testid={`timeline-item-${item.id}`}
    >
      <div className="flex items-start gap-3">
        <Badge className={cn("shrink-0 gap-1", config.color)}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        <div className="flex-1 min-w-0">
          {item.recipeName && (
            <p className="text-xs font-medium text-primary mb-0.5">
              {item.recipeName}
            </p>
          )}
          <p className="text-sm">{item.task}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Duration: {item.durationMinutes} min
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CookingTimelineSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-16 h-6 bg-muted animate-pulse rounded" />
            <div className="flex-1 h-24 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
