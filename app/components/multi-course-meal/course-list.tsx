import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { CourseCard } from "./course-card";
import type { CourseType, CourseWithRecipe } from "@/repositories/multi-course-meal";

interface CourseListProps {
  courses: CourseWithRecipe[];
  guestCount: number;
  onAddCourse: () => void;
  onEditCourse: (courseId: string) => void;
  onRemoveCourse: (courseId: string) => void;
  onGetAISuggestions: () => void;
  isLoadingSuggestions?: boolean;
}

export function CourseList({
  courses,
  guestCount,
  onAddCourse,
  onEditCourse,
  onRemoveCourse,
  onGetAISuggestions,
  isLoadingSuggestions,
}: CourseListProps) {
  return (
    <div className="space-y-4" data-testid="course-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Courses</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onGetAISuggestions}
          disabled={isLoadingSuggestions}
          className="gap-2"
          data-testid="get-ai-suggestions-btn"
        >
          <Sparkles className="h-4 w-4" />
          {isLoadingSuggestions ? "Analyzing..." : "Get AI Suggestions"}
        </Button>
      </div>

      {/* Course Cards */}
      {courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              courseType={course.courseType}
              courseOrder={course.courseOrder}
              recipe={course.recipe}
              guestCount={guestCount}
              onEdit={() => onEditCourse(course.id)}
              onRemove={() => onRemoveCourse(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No courses added yet. Start building your menu!
          </p>
        </div>
      )}

      {/* Add Course Button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={onAddCourse}
        data-testid="add-course-btn"
      >
        <Plus className="h-4 w-4" />
        Add Course
      </Button>
    </div>
  );
}
