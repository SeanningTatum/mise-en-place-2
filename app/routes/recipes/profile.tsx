import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RecipeVisibilityList, ShareModal } from "@/components/profile";
import { toast } from "sonner";
import { Check, X, Loader2, User, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "./+types/profile";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/authentication/login");
  }

  return { user: session.user };
}

export default function ProfileSettingsPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const navigate = useNavigate();

  // Queries
  const { data: profile, isLoading: profileLoading } = api.profile.getMyProfile.useQuery();
  const { data: recipes, isLoading: recipesLoading } = api.profile.getMyRecipesForVisibility.useQuery();

  // Mutations
  const utils = api.useUtils();
  const createProfileMutation = api.profile.createProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile created!");
      utils.profile.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProfileMutation = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      utils.profile.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const setVisibilityMutation = api.profile.setRecipeVisibility.useMutation({
    onSuccess: () => {
      utils.profile.getMyRecipesForVisibility.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Local form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Username validation
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const checkUsernameMutation = api.profile.checkUsername.useQuery(
    { username },
    {
      enabled: username.length >= 3 && username !== profile?.username,
    }
  );

  // Sync form state with profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setIsPublic(profile.isPublic);
    }
  }, [profile]);

  // Debounced username validation
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(username.length > 0 ? "Username must be at least 3 characters" : null);
      return;
    }

    if (username === profile?.username) {
      setUsernameAvailable(true);
      setUsernameError(null);
      return;
    }

    setUsernameChecking(true);
    const timer = setTimeout(() => {
      if (checkUsernameMutation.data) {
        setUsernameAvailable(checkUsernameMutation.data.available);
        setUsernameError(checkUsernameMutation.data.error || null);
      }
      setUsernameChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, profile?.username, checkUsernameMutation.data]);

  const handleSave = async () => {
    if (!usernameAvailable) {
      toast.error("Please choose a valid username");
      return;
    }

    if (profile) {
      // Update existing profile
      await updateProfileMutation.mutateAsync({
        username,
        displayName: displayName || null,
        bio: bio || null,
        isPublic,
      });
    } else {
      // Create new profile
      await createProfileMutation.mutateAsync({
        username,
        displayName: displayName || undefined,
        bio: bio || undefined,
      });
    }
  };

  const handleToggleVisibility = async (recipeId: string, newIsPublic: boolean) => {
    await setVisibilityMutation.mutateAsync({
      recipeId,
      isPublic: newIsPublic,
    });
  };

  const isSaving = createProfileMutation.isPending || updateProfileMutation.isPending;
  const isLoading = profileLoading || recipesLoading;

  const initials = (displayName || username || user.name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const profileUrl = profile?.username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${profile.username}`
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold">Public Profile</h1>
        <p className="text-muted-foreground mt-1">
          Share your recipe collection with a public profile page
        </p>
      </div>

      {/* Public Profile Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display">Profile Visibility</CardTitle>
              <CardDescription>
                Enable to share your recipes with anyone
              </CardDescription>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={!profile}
            />
          </div>
        </CardHeader>
        {isPublic && profileUrl && (
          <CardContent className="pt-0">
            <Alert className="bg-accent/10 border-accent/30">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  Your profile is live at{" "}
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {profileUrl}
                  </a>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Profile Details</CardTitle>
          <CardDescription>
            Customize how your profile appears to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage src={profile?.avatarUrl || undefined} alt={displayName || username} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-display">
                {initials || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName || username || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">
                Avatar can be changed in account settings
              </p>
            </div>
          </div>

          <Separator />

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-username"
                className={cn(
                  "pr-10",
                  usernameError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : usernameAvailable === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : usernameAvailable === false ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : null}
              </div>
            </div>
            {username && (
              <p className="text-xs text-muted-foreground">
                Your profile URL: miseenplace.app/u/{username || "..."}
              </p>
            )}
            {usernameError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {usernameError}
              </p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your cooking style..."
              maxLength={500}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !usernameAvailable || !username}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {profile ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Visibility */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recipe Visibility</CardTitle>
            <CardDescription>
              Choose which recipes appear on your public profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeVisibilityList
              recipes={recipes || []}
              onToggleVisibility={handleToggleVisibility}
              isLoading={setVisibilityMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      {profile && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          username={profile.username}
          displayName={profile.displayName}
        />
      )}
    </div>
  );
}
