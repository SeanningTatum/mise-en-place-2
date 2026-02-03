# Interactive Diagram Viewer Implementation

> **Date**: February 3, 2026  
> **Component**: `app/components/markdown-renderer.tsx`  
> **Feature**: Pan/zoom/drag viewer for mermaid diagrams

## Problem Statement

Mermaid diagrams in markdown documentation were difficult to read due to:
1. **Sizing constraints** - Diagrams rendered too small in the available space
2. **No interactivity** - Users couldn't zoom in to see details
3. **Complex diagrams** - Large flowcharts and ER diagrams were illegible

## Solution Overview

We created an interactive fullscreen viewer that opens when users click on any mermaid diagram, providing:
- Zoom in/out with mouse wheel, pinch gestures, and buttons
- Pan/drag to navigate large diagrams
- Keyboard shortcuts for power users
- Mobile-friendly touch support

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ MermaidBlock                                            │
│ ├── Renders diagram inline with hover hint             │
│ └── Opens DiagramViewer on click                       │
│                                                         │
│ DiagramViewer (Modal)                                   │
│ ├── Toolbar (zoom controls, reset, close)              │
│ ├── SVG container with CSS transforms                  │
│ └── Event handlers (mouse, touch, keyboard)            │
└─────────────────────────────────────────────────────────┘
```

## Key Implementation Patterns

### 1. CSS Transform-Based Pan/Zoom

Instead of manipulating the SVG viewBox (which can be complex), we use CSS transforms on a wrapper div:

```tsx
<div
  style={{
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.1s ease-out",
  }}
>
  <div dangerouslySetInnerHTML={{ __html: svg }} />
</div>
```

**Why this works well:**
- GPU-accelerated transforms are smooth
- Single point of control for both pan and zoom
- Easy to reset (`scale: 1, translate: 0,0`)
- Works with any SVG content

### 2. Mouse Drag for Panning

Track drag state and calculate position delta from start point:

```tsx
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
const [position, setPosition] = useState({ x: 0, y: 0 });

const handleMouseDown = useCallback((e: React.MouseEvent) => {
  if (e.button !== 0) return; // Left click only
  setIsDragging(true);
  setDragStart({ 
    x: e.clientX - position.x, 
    y: e.clientY - position.y 
  });
}, [position]);

const handleMouseMove = useCallback((e: React.MouseEvent) => {
  if (!isDragging) return;
  setPosition({
    x: e.clientX - dragStart.x,
    y: e.clientY - dragStart.y,
  });
}, [isDragging, dragStart]);

const handleMouseUp = useCallback(() => {
  setIsDragging(false);
}, []);
```

**Key insight:** Store `dragStart` as the offset between mouse position and element position, not just the mouse position. This prevents the element from jumping when you start dragging.

### 3. Mouse Wheel Zoom

Multiplicative scaling feels more natural than additive:

```tsx
const handleWheel = useCallback((e: React.WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1; // 10% zoom per scroll
  setScale((s) => Math.min(Math.max(s * delta, 0.25), 5)); // Clamp 25%-500%
}, []);
```

**Why multiplicative:**
- Zooming from 100% to 110% feels the same as 200% to 220%
- Consistent "feel" at all zoom levels
- Prevents getting stuck at very small scales

### 4. Touch/Pinch Gesture Support

For mobile and trackpad pinch-to-zoom:

```tsx
const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
const [initialScale, setInitialScale] = useState(1);

const handleTouchStart = useCallback((e: React.TouchEvent) => {
  if (e.touches.length === 1) {
    // Single touch = drag
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  } else if (e.touches.length === 2) {
    // Two touches = pinch zoom
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    setInitialPinchDistance(Math.sqrt(dx * dx + dy * dy));
    setInitialScale(scale);
  }
}, [position, scale]);

const handleTouchMove = useCallback((e: React.TouchEvent) => {
  if (e.touches.length === 2 && initialPinchDistance !== null) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const newScale = initialScale * (distance / initialPinchDistance);
    setScale(Math.min(Math.max(newScale, 0.25), 5));
  }
}, [initialPinchDistance, initialScale]);
```

**Key insight:** Store `initialScale` and `initialPinchDistance` at touch start, then calculate new scale as a ratio. This prevents scale jumping.

### 5. Keyboard Shortcuts

Add/remove event listeners based on modal state:

```tsx
useEffect(() => {
  if (!isOpen) return;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "+" || e.key === "=") handleZoomIn();
    else if (e.key === "-") handleZoomOut();
    else if (e.key === "0") handleReset();
  };
  
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onClose, handleZoomIn, handleZoomOut, handleReset]);
```

**Important:** Include all callback dependencies to avoid stale closures.

### 6. Cursor Feedback

Visual feedback that element is draggable:

```tsx
className={cn(
  "w-full h-full overflow-hidden",
  isDragging ? "cursor-grabbing" : "cursor-grab"
)}
```

### 7. Smooth Transitions (Except While Dragging)

```tsx
transition: isDragging ? "none" : "transform 0.1s ease-out",
```

Transitions make zoom buttons feel polished, but must be disabled during drag for responsive panning.

## Mermaid Configuration for Readability

Increased default sizes for better legibility:

```tsx
mermaid.initialize({
  fontSize: 14,  // Was 12
  flowchart: { 
    nodeSpacing: 60,   // Was 50
    rankSpacing: 60,   // Was 50
    wrappingWidth: 200, // Was 150
  },
  sequence: { 
    width: 180,        // Was 150
    actorFontSize: 14, // Was 12
  },
  // ... similar increases for all diagram types
});
```

## UI/UX Decisions

### Hover Hint
Shows "Click to expand" only on hover to keep the diagram clean:

```tsx
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
  <IconMaximize /> Click to expand
</div>
```

### Floating Toolbar
Positioned at top center, semi-transparent background:

```tsx
<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 
                bg-background/95 backdrop-blur rounded-lg border shadow-lg">
```

### Help Text
Persistent hint at bottom of viewer:

```
Scroll to zoom • Drag to pan • Press Esc to close
```

### White Card Background
Diagram displayed on white card for contrast against dark modal overlay:

```tsx
<div className="bg-white rounded-xl p-8 shadow-2xl">
```

## Component Structure

```tsx
// Main component - renders inline diagram
function MermaidBlock({ code }: MermaidBlockProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  return (
    <>
      <div onClick={() => setIsViewerOpen(true)} className="cursor-pointer">
        {/* Hover hint */}
        {/* SVG diagram */}
      </div>
      
      <DiagramViewer
        svg={svg}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}

// Fullscreen viewer with pan/zoom
function DiagramViewer({ svg, isOpen, onClose }: DiagramViewerProps) {
  // State: scale, position, isDragging, dragStart, pinch state
  // Handlers: zoom, pan, touch, keyboard
  // Render: Dialog with toolbar + transformed SVG container
}
```

## Testing Considerations

1. **Mouse interactions**: Click-drag to pan, wheel to zoom
2. **Touch interactions**: Single touch drag, two-finger pinch
3. **Keyboard**: +/- for zoom, 0 for reset, Esc to close
4. **Zoom limits**: Should clamp between 25% and 500%
5. **State reset**: Opening viewer should reset to 100% centered
6. **Large diagrams**: Should handle complex flowcharts/ER diagrams

## Dependencies Used

- `@radix-ui/react-dialog` - Modal/overlay primitives
- `@tabler/icons-react` - Icons for toolbar
- `mermaid` - Diagram rendering
- `tailwind-merge` (via `cn()`) - Class merging

## Potential Improvements

1. **Zoom to cursor position** - Currently zooms to center, could zoom toward mouse
2. **Minimap** - For very large diagrams, show position indicator
3. **Share link** - Deep link to specific diagram at specific zoom/position
4. **Export** - Download as PNG/SVG at current zoom level
5. **Fit to screen** - Auto-calculate initial scale based on diagram size

## References

- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Mermaid Configuration](https://mermaid.js.org/config/setup/modules/mermaidAPI.html)
