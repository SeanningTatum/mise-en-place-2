import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Link2,
  Lock,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/client";
import { cn } from "@/lib/utils";

interface ShareMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  mealName: string;
  isPublic: boolean;
  slug: string | null;
}

export function ShareMealModal({
  open,
  onOpenChange,
  mealId,
  mealName,
  isPublic: initialIsPublic,
  slug: initialSlug,
}: ShareMealModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const utils = api.useUtils();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsPublic(initialIsPublic);
      setCopied(false);
    }
  }, [open, initialIsPublic]);

  const setPublicMutation = api.multiCourseMeal.setPublic.useMutation({
    onSuccess: (data) => {
      setIsPublic(data.success ? !isPublic : isPublic);
      if (data.shareUrl) {
        setShareUrl(`${typeof window !== "undefined" ? window.location.origin : ""}${data.shareUrl}`);
      }
      utils.multiCourseMeal.getById.invalidate({ mealId });
      utils.multiCourseMeal.list.invalidate();
      toast.success(
        isPublic
          ? "Meal is now private"
          : "Meal is now public and shareable!"
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update visibility");
    },
  });

  const handleVisibilityToggle = () => {
    setPublicMutation.mutate({ mealId, isPublic: !isPublic });
  };

  // Build the share URL
  const buildShareUrl = () => {
    if (shareUrl) return shareUrl;
    if (!initialSlug) return null;
    // We need the username - for now just use relative path
    return typeof window !== "undefined"
      ? `${window.location.origin}/recipes/meals/${mealId}`
      : null;
  };

  const displayUrl = buildShareUrl();
  const shareText = `Check out my meal plan: "${mealName}" on Mise en Place!`;

  const handleCopy = async () => {
    if (!displayUrl) return;
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = [
    {
      name: "X",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(displayUrl || "")}`,
      color: "bg-black hover:bg-gray-800",
    },
    {
      name: "Facebook",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(displayUrl || "")}`,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      href: `mailto:?subject=${encodeURIComponent(`My Meal Plan: ${mealName}`)}&body=${encodeURIComponent(`${shareText}\n\n${displayUrl || ""}`)}`,
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      name: "SMS",
      icon: <MessageCircle className="h-5 w-5" />,
      href: `sms:?body=${encodeURIComponent(`${shareText} ${displayUrl || ""}`)}`,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Meal
          </DialogTitle>
          <DialogDescription>
            {isPublic
              ? "Your meal is public and can be viewed by anyone with the link."
              : "Make your meal public to share it with others."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <div className="p-2 rounded-full bg-green-100">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-amber-100">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {isPublic ? "Public" : "Private"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Anyone can view this meal"
                    : "Only you can view this meal"}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleVisibilityToggle}
              disabled={setPublicMutation.isPending}
            />
          </div>

          {/* Share Content - only shown when public */}
          {isPublic && displayUrl && (
            <>
              {/* URL Copy Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Share Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={displayUrl}
                    readOnly
                    className="flex-1 bg-muted/50 text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant={copied ? "default" : "secondary"}
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Social Sharing Buttons */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Share on:</p>
                <div className="flex justify-center gap-3">
                  {shareLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full text-white transition-transform hover:scale-105",
                        link.color
                      )}
                      title={`Share on ${link.name}`}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-3 pt-4 border-t">
                <div className="bg-white p-3 rounded-lg border-2 border-accent/30">
                  <QRCodeSVG
                    value={displayUrl}
                    size={112}
                    level="M"
                    marginSize={0}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan to view on mobile
                </p>
              </div>
            </>
          )}

          {/* Prompt to make public */}
          {!isPublic && (
            <div className="text-center py-4">
              <div className="p-4 rounded-full bg-muted/50 inline-block mb-3">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Toggle the switch above to make your meal public and get a shareable link.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
