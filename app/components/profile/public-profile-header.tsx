import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, User } from "lucide-react";
import { format } from "date-fns";

interface PublicProfileHeaderProps {
  displayName: string | null;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  viewCount: number;
  createdAt: Date;
  totalRecipes: number;
  totalSaves: number;
  onShareClick: () => void;
}

export function PublicProfileHeader({
  displayName,
  username,
  bio,
  avatarUrl,
  createdAt,
  totalRecipes,
  totalSaves,
  onShareClick,
}: PublicProfileHeaderProps) {
  const initials = (displayName || username)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-primary/5 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-warm-lg">
          <AvatarImage src={avatarUrl || undefined} alt={displayName || username} />
          <AvatarFallback className="bg-primary/20 text-primary text-2xl font-display">
            {initials || <User className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>

        {/* Profile Info */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              {displayName || username}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              @{username}
            </p>
          </div>

          {bio && (
            <p className="text-muted-foreground max-w-lg">
              {bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalRecipes}</span>{" "}
            {totalRecipes === 1 ? "recipe" : "recipes"}
            <span className="text-muted-foreground/50">•</span>
            <span className="font-semibold text-foreground">{totalSaves}</span>{" "}
            {totalSaves === 1 ? "save" : "saves"}
            <span className="text-muted-foreground/50">•</span>
            Member since {format(new Date(createdAt), "MMM yyyy")}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <Button
              onClick={onShareClick}
              className="gap-2 shadow-warm hover:shadow-warm-lg transition-shadow"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
