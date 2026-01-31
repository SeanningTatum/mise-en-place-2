import { SiteHeader } from "./layout/site-header";
import {
  StatCard,
  StatCardGrid,
  TimeSeriesChart,
  DistributionChart,
  InsightsCard,
  type Insight,
} from "@/components/analytics";
import { Users, ShieldCheck, UserX, Shield, ChefHat, Youtube, FileText, Calendar, Utensils, CalendarDays, Share2, Eye, Bookmark, Globe } from "lucide-react";
import type { Route } from "./+types/_index";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const [
    stats,
    growthData,
    roleDistribution,
    verificationDistribution,
    recipeStats,
    recipeGrowthData,
    sourceTypeDistribution,
    topCreators,
    mealPlanStats,
    mealPlanGrowthData,
    mealTypeDistribution,
    dayOfWeekDistribution,
    mostPlannedRecipes,
    profileSharingStats,
    profileGrowthData,
    profileVisibilityDistribution,
    recipeImportGrowthData,
    topProfilesByViews,
    mostSavedRecipes,
  ] = await Promise.all([
    context.trpc.analytics.getUserStats(),
    context.trpc.analytics.getUserGrowth({ startDate, endDate }),
    context.trpc.analytics.getRoleDistribution(),
    context.trpc.analytics.getVerificationDistribution(),
    context.trpc.analytics.getRecipeStats(),
    context.trpc.analytics.getRecipeGrowth({ startDate, endDate }),
    context.trpc.analytics.getSourceTypeDistribution(),
    context.trpc.analytics.getTopRecipeCreators({ limit: 5 }),
    context.trpc.analytics.getMealPlanStats(),
    context.trpc.analytics.getMealPlanGrowth({ startDate, endDate }),
    context.trpc.analytics.getMealTypeDistribution(),
    context.trpc.analytics.getDayOfWeekDistribution(),
    context.trpc.analytics.getMostPlannedRecipes({ limit: 5 }),
    context.trpc.analytics.getProfileSharingStats(),
    context.trpc.analytics.getProfileGrowth({ startDate, endDate }),
    context.trpc.analytics.getProfileVisibilityDistribution(),
    context.trpc.analytics.getRecipeImportGrowth({ startDate, endDate }),
    context.trpc.analytics.getTopProfilesByViews({ limit: 5 }),
    context.trpc.analytics.getMostSavedRecipes({ limit: 5 }),
  ]);

  return {
    stats,
    growthData,
    roleDistribution,
    verificationDistribution,
    recipeStats,
    recipeGrowthData,
    sourceTypeDistribution,
    topCreators,
    mealPlanStats,
    mealPlanGrowthData,
    mealTypeDistribution,
    dayOfWeekDistribution,
    mostPlannedRecipes,
    profileSharingStats,
    profileGrowthData,
    profileVisibilityDistribution,
    recipeImportGrowthData,
    topProfilesByViews,
    mostSavedRecipes,
  };
};

export default function AdminHome({ loaderData }: Route.ComponentProps) {
  // Handle loading state during client navigation
  if (!loaderData) {
    return (
      <div>
        <SiteHeader title="Dashboard" />
        <div className="flex items-center justify-center p-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const {
    stats,
    growthData,
    roleDistribution,
    verificationDistribution,
    recipeStats,
    recipeGrowthData,
    sourceTypeDistribution,
    topCreators,
    mealPlanStats,
    mealPlanGrowthData,
    mealTypeDistribution,
    dayOfWeekDistribution,
    mostPlannedRecipes,
    profileSharingStats,
    profileGrowthData,
    profileVisibilityDistribution,
    recipeImportGrowthData,
    topProfilesByViews,
    mostSavedRecipes,
  } = loaderData;

  // Generate insights based on the data
  const insights: Insight[] = [];

  if (stats.verificationRate >= 80) {
    insights.push({
      text: `${stats.verificationRate}% email verification rate - excellent user engagement`,
      type: "positive",
    });
  } else if (stats.verificationRate >= 50) {
    insights.push({
      text: `${stats.verificationRate}% email verification rate - room for improvement`,
      type: "neutral",
    });
  } else {
    insights.push({
      text: `${stats.verificationRate}% email verification rate - consider improving onboarding flow`,
      type: "negative",
    });
  }

  if (stats.bannedUsers > 0) {
    const bannedPercent = Math.round(
      (stats.bannedUsers / stats.totalUsers) * 100
    );
    insights.push({
      text: `${stats.bannedUsers} banned user${stats.bannedUsers > 1 ? "s" : ""} (${bannedPercent}% of total)`,
      type: bannedPercent > 5 ? "negative" : "neutral",
    });
  } else {
    insights.push({
      text: "No banned users - healthy community",
      type: "positive",
    });
  }

  if (stats.adminUsers > 0) {
    insights.push({
      text: `${stats.adminUsers} admin${stats.adminUsers > 1 ? "s" : ""} managing the platform`,
      type: "neutral",
    });
  }

  if (growthData.length > 0) {
    const recentSignups = growthData.slice(-7).reduce((sum, d) => sum + d.count, 0);
    insights.push({
      text: `${recentSignups} new user${recentSignups !== 1 ? "s" : ""} in the last 7 days`,
      type: recentSignups > 0 ? "positive" : "neutral",
    });
  }

  // Recipe insights
  const recipeInsights: Insight[] = [];
  if (recipeStats.totalRecipes > 0) {
    recipeInsights.push({
      text: `${recipeStats.totalRecipes} total recipe${recipeStats.totalRecipes !== 1 ? "s" : ""} in the database`,
      type: "positive",
    });

    if (recipeStats.youtubeRecipes > recipeStats.blogRecipes) {
      recipeInsights.push({
        text: `YouTube recipes (${recipeStats.youtubeRecipes}) outnumber blog recipes (${recipeStats.blogRecipes})`,
        type: "neutral",
      });
    } else if (recipeStats.blogRecipes > recipeStats.youtubeRecipes) {
      recipeInsights.push({
        text: `Blog recipes (${recipeStats.blogRecipes}) outnumber YouTube recipes (${recipeStats.youtubeRecipes})`,
        type: "neutral",
      });
    }

    if (recipeGrowthData.length > 0) {
      const recentRecipes = recipeGrowthData.slice(-7).reduce((sum, d) => sum + d.count, 0);
      recipeInsights.push({
        text: `${recentRecipes} new recipe${recentRecipes !== 1 ? "s" : ""} added in the last 7 days`,
        type: recentRecipes > 0 ? "positive" : "neutral",
      });
    }

    if (topCreators.length > 0) {
      const topCreator = topCreators[0];
      recipeInsights.push({
        text: `${topCreator.userName} is the top contributor with ${topCreator.recipeCount} recipe${topCreator.recipeCount !== 1 ? "s" : ""}`,
        type: "positive",
      });
    }
  } else {
    recipeInsights.push({
      text: "No recipes yet - start adding recipes to see analytics",
      type: "neutral",
    });
  }

  // Meal planner insights
  const mealPlanInsights: Insight[] = [];
  if (mealPlanStats.totalMealPlans > 0) {
    mealPlanInsights.push({
      text: `${mealPlanStats.uniquePlanners} user${mealPlanStats.uniquePlanners !== 1 ? "s" : ""} actively planning meals`,
      type: "positive",
    });

    mealPlanInsights.push({
      text: `Average of ${mealPlanStats.avgEntriesPerPlan} meals per weekly plan`,
      type: mealPlanStats.avgEntriesPerPlan >= 7 ? "positive" : "neutral",
    });

    if (mealPlanGrowthData.length > 0) {
      const recentPlans = mealPlanGrowthData.slice(-7).reduce((sum, d) => sum + d.count, 0);
      mealPlanInsights.push({
        text: `${recentPlans} new meal plan${recentPlans !== 1 ? "s" : ""} created in the last 7 days`,
        type: recentPlans > 0 ? "positive" : "neutral",
      });
    }

    if (mostPlannedRecipes.length > 0) {
      const topRecipe = mostPlannedRecipes[0];
      mealPlanInsights.push({
        text: `"${topRecipe.recipeTitle}" is the most planned recipe (${topRecipe.planCount} times)`,
        type: "positive",
      });
    }
  } else {
    mealPlanInsights.push({
      text: "No meal plans yet - users can start planning their weekly meals",
      type: "neutral",
    });
  }

  // Profile sharing insights
  const profileSharingInsights: Insight[] = [];
  if (profileSharingStats.totalProfiles > 0) {
    profileSharingInsights.push({
      text: `${profileSharingStats.publicProfiles} public profile${profileSharingStats.publicProfiles !== 1 ? "s" : ""} (${profileSharingStats.publicRate}% of total)`,
      type: profileSharingStats.publicRate >= 50 ? "positive" : "neutral",
    });

    if (profileSharingStats.totalViews > 0) {
      profileSharingInsights.push({
        text: `${profileSharingStats.totalViews.toLocaleString()} total profile view${profileSharingStats.totalViews !== 1 ? "s" : ""}`,
        type: "positive",
      });
    }

    if (profileSharingStats.totalImports > 0) {
      profileSharingInsights.push({
        text: `${profileSharingStats.totalImports} recipe${profileSharingStats.totalImports !== 1 ? "s" : ""} saved from shared profiles`,
        type: "positive",
      });
    }

    if (profileSharingStats.publicRecipes > 0) {
      profileSharingInsights.push({
        text: `${profileSharingStats.publicRecipes} public recipe${profileSharingStats.publicRecipes !== 1 ? "s" : ""} available for discovery`,
        type: "positive",
      });
    }

    if (topProfilesByViews.length > 0) {
      const topProfile = topProfilesByViews[0];
      profileSharingInsights.push({
        text: `@${topProfile.username} is the most viewed profile with ${topProfile.viewCount} view${topProfile.viewCount !== 1 ? "s" : ""}`,
        type: "positive",
      });
    }
  } else {
    profileSharingInsights.push({
      text: "No profiles created yet - users can set up public profiles to share recipes",
      type: "neutral",
    });
  }

  return (
    <div>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Stats Cards */}
            <div className="px-4 lg:px-6">
              <StatCardGrid columns={4}>
                <StatCard
                  label="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  description="All registered accounts"
                />
                <StatCard
                  label="Verified Users"
                  value={stats.verifiedUsers}
                  icon={ShieldCheck}
                  description={`${stats.verificationRate}% verification rate`}
                />
                <StatCard
                  label="Admins"
                  value={stats.adminUsers}
                  icon={Shield}
                  description="Platform administrators"
                />
                <StatCard
                  label="Banned Users"
                  value={stats.bannedUsers}
                  icon={UserX}
                  description="Restricted accounts"
                />
              </StatCardGrid>
            </div>

            {/* Charts Row */}
            <div className="px-4 lg:px-6">
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                <TimeSeriesChart
                  title="User Growth"
                  description="New signups over time"
                  data={growthData}
                  dataKey="count"
                  dataLabel="New Users"
                  type="area"
                  showTimeRangeSelector
                />
                <DistributionChart
                  title="User Roles"
                  description="Distribution by role"
                  data={roleDistribution}
                  type="donut"
                />
              </div>
            </div>

            {/* Second Row: Verification Distribution + Insights */}
            <div className="px-4 lg:px-6">
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                <DistributionChart
                  title="Email Verification"
                  description="Verified vs unverified users"
                  data={verificationDistribution}
                  type="donut"
                  colors={["var(--chart-2)", "var(--chart-4)"]}
                />
                <InsightsCard
                  title="Platform Insights"
                  description="Key observations about your user base"
                  insights={insights}
                />
              </div>
            </div>

            {/* Recipe Analytics Section */}
            <div className="px-4 lg:px-6 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Recipe Analytics</h2>

              {/* Recipe Stats Cards */}
              <div className="mb-6">
                <StatCardGrid columns={4}>
                  <StatCard
                    label="Total Recipes"
                    value={recipeStats.totalRecipes}
                    icon={ChefHat}
                    description="All recipes in database"
                  />
                  <StatCard
                    label="YouTube Recipes"
                    value={recipeStats.youtubeRecipes}
                    icon={Youtube}
                    description="From YouTube videos"
                  />
                  <StatCard
                    label="Blog Recipes"
                    value={recipeStats.blogRecipes}
                    icon={FileText}
                    description="From blog posts"
                  />
                  <StatCard
                    label="Avg Calories"
                    value={recipeStats.avgCalories ?? "N/A"}
                    description={recipeStats.avgCalories ? "Per serving" : "No data"}
                  />
                </StatCardGrid>
              </div>

              {/* Recipe Charts Row */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 mb-6">
                <TimeSeriesChart
                  title="Recipe Growth"
                  description="Recipes created over time"
                  data={recipeGrowthData}
                  dataKey="count"
                  dataLabel="New Recipes"
                  type="area"
                  showTimeRangeSelector
                />
                <DistributionChart
                  title="Source Type Distribution"
                  description="YouTube vs Blog recipes"
                  data={sourceTypeDistribution}
                  type="donut"
                />
              </div>

              {/* Recipe Insights */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                <InsightsCard
                  title="Recipe Insights"
                  description="Key observations about recipe data"
                  insights={recipeInsights}
                />
                {topCreators.length > 0 && (
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Top Recipe Creators</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Users with the most recipes
                    </p>
                    <div className="space-y-3">
                      {topCreators.map((creator, index) => (
                        <div
                          key={creator.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{creator.userName}</p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {creator.recipeCount} recipe{creator.recipeCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meal Planner Analytics Section */}
            <div className="px-4 lg:px-6 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Meal Planner Analytics</h2>

              {/* Meal Plan Stats Cards */}
              <div className="mb-6">
                <StatCardGrid columns={4}>
                  <StatCard
                    label="Total Meal Plans"
                    value={mealPlanStats.totalMealPlans}
                    icon={Calendar}
                    description="Weekly plans created"
                  />
                  <StatCard
                    label="Active Planners"
                    value={mealPlanStats.uniquePlanners}
                    icon={Users}
                    description="Users with meal plans"
                  />
                  <StatCard
                    label="Total Meals Planned"
                    value={mealPlanStats.totalMealPlanEntries}
                    icon={Utensils}
                    description="Individual meal slots filled"
                  />
                  <StatCard
                    label="Avg Meals/Plan"
                    value={mealPlanStats.avgEntriesPerPlan}
                    icon={CalendarDays}
                    description="Average meals per weekly plan"
                  />
                </StatCardGrid>
              </div>

              {/* Meal Plan Charts Row */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 mb-6">
                <TimeSeriesChart
                  title="Meal Planning Activity"
                  description="New meal plans created over time"
                  data={mealPlanGrowthData}
                  dataKey="count"
                  dataLabel="New Plans"
                  type="area"
                  showTimeRangeSelector
                />
                <DistributionChart
                  title="Meals by Type"
                  description="Distribution by breakfast, lunch, dinner, snacks"
                  data={mealTypeDistribution}
                  type="donut"
                />
              </div>

              {/* Second Row: Day Distribution + Insights */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                <DistributionChart
                  title="Meals by Day"
                  description="Which days are planned most"
                  data={dayOfWeekDistribution}
                  type="bar"
                />
                <InsightsCard
                  title="Meal Planning Insights"
                  description="Key observations about meal planning"
                  insights={mealPlanInsights}
                />
              </div>

              {/* Most Planned Recipes */}
              {mostPlannedRecipes.length > 0 && (
                <div className="mt-6">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Most Planned Recipes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Recipes that appear most frequently in meal plans
                    </p>
                    <div className="space-y-3">
                      {mostPlannedRecipes.map((recipe, index) => (
                        <div
                          key={recipe.recipeId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{recipe.recipeTitle}</p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {recipe.planCount} time{recipe.planCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Sharing Analytics Section */}
            <div className="px-4 lg:px-6 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Profile Sharing Analytics</h2>

              {/* Profile Sharing Stats Cards */}
              <div className="mb-6">
                <StatCardGrid columns={4}>
                  <StatCard
                    label="Total Profiles"
                    value={profileSharingStats.totalProfiles}
                    icon={Users}
                    description="User profiles created"
                  />
                  <StatCard
                    label="Public Profiles"
                    value={profileSharingStats.publicProfiles}
                    icon={Globe}
                    description={`${profileSharingStats.publicRate}% public rate`}
                  />
                  <StatCard
                    label="Total Views"
                    value={profileSharingStats.totalViews}
                    icon={Eye}
                    description="Profile page visits"
                  />
                  <StatCard
                    label="Recipes Saved"
                    value={profileSharingStats.totalImports}
                    icon={Bookmark}
                    description="Recipes saved from shared profiles"
                  />
                </StatCardGrid>
              </div>

              {/* Profile Sharing Charts Row */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 mb-6">
                <TimeSeriesChart
                  title="Profile Growth"
                  description="New profiles created over time"
                  data={profileGrowthData}
                  dataKey="count"
                  dataLabel="New Profiles"
                  type="area"
                  showTimeRangeSelector
                />
                <DistributionChart
                  title="Profile Visibility"
                  description="Public vs private profiles"
                  data={profileVisibilityDistribution}
                  type="donut"
                  colors={["var(--chart-2)", "var(--chart-4)"]}
                />
              </div>

              {/* Recipe Imports + Insights */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 mb-6">
                <TimeSeriesChart
                  title="Recipe Saves"
                  description="Recipes saved from shared profiles over time"
                  data={recipeImportGrowthData}
                  dataKey="count"
                  dataLabel="Recipes Saved"
                  type="bar"
                  showTimeRangeSelector
                />
                <InsightsCard
                  title="Sharing Insights"
                  description="Key observations about profile sharing"
                  insights={profileSharingInsights}
                />
              </div>

              {/* Leaderboards Row */}
              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                {topProfilesByViews.length > 0 && (
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Most Viewed Profiles</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Public profiles with the most views
                    </p>
                    <div className="space-y-3">
                      {topProfilesByViews.map((profile, index) => (
                        <div
                          key={profile.profileId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{profile.displayName}</p>
                              <p className="text-xs text-muted-foreground">@{profile.username}</p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {profile.viewCount} view{profile.viewCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mostSavedRecipes.length > 0 && (
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Most Saved Recipes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Recipes saved most from shared profiles
                    </p>
                    <div className="space-y-3">
                      {mostSavedRecipes.map((recipe, index) => (
                        <div
                          key={recipe.recipeId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{recipe.recipeTitle}</p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {recipe.saveCount} save{recipe.saveCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
