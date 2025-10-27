# Design Guidelines: AI Resume Builder & ATS Optimizer

## Design Approach
**Selected Framework:** Material Design with Notion/Linear productivity tool inspiration
**Rationale:** This is a utility-focused, information-dense productivity application where efficiency, clarity, and data hierarchy are paramount. Material Design's structured approach combined with modern productivity tool patterns ensures professional polish while maintaining excellent usability.

---

## Core Design Elements

### Typography
**Font Family:** Inter (Google Fonts CDN)
- **Headings:** Inter 600-700 weight, sizes from text-3xl (page titles) to text-lg (section headers)
- **Body Text:** Inter 400-500 weight, text-base for general content, text-sm for labels/metadata
- **Code/Technical:** JetBrains Mono 400 weight for ATS scores and technical data

### Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Primary spacing: p-6, p-8 for sections
- Component spacing: gap-4, gap-6 for grids
- Micro spacing: p-2, p-4 for buttons/inputs

**Container Structure:**
- Max width: max-w-7xl for main content
- Two-column layout: 1/3 sidebar (job description) + 2/3 main (resume editor)
- Single column on mobile with collapsible sections

---

## Page Structure

### Main Application Layout

**Header (Sticky)**
- Logo/brand on left
- Primary navigation: "Resume Builder" | "ATS Testing" | "Templates"
- Export buttons group on right: [Download PDF] [Download Word]
- Height: h-16, shadow on scroll

**Three-Panel Dashboard**
1. **Left Panel (w-1/4):** Job Description Input
   - Sticky textarea with label "Paste Job Description"
   - Character counter
   - [Analyze Keywords] button
   - Extracted keywords display (chips/tags)
   - Keyword match percentage indicator

2. **Center Panel (w-1/2):** Resume Editor
   - Section tabs: Personal Info | Experience | Education | Skills | Summary
   - Rich text editor for each section
   - Real-time ATS score badge (floating top-right)
   - Inline suggestions for keyword optimization
   - Visual indicators showing matched vs. missing keywords

3. **Right Panel (w-1/4):** ATS Analysis Dashboard
   - Large circular progress indicator showing ATS score (0-100%)
   - Breakdown sections:
     - Keyword Match Score
     - Format Compatibility
     - Section Completeness
     - Improvement Suggestions (bulleted list)
   - Color-coded status indicators

---

## Component Library

### Form Elements
**Text Inputs/Textareas:**
- Border: 2px solid, rounded-lg
- Focus state: ring-4 with offset
- Label above input with text-sm weight-500
- Helper text below in text-xs

**Buttons:**
- Primary: Large (h-12), rounded-lg, weight-600
- Secondary: Outlined variant with 2px border
- Icon buttons: h-10 w-10, rounded-full
- Button groups: Connected with rounded corners on ends only

### Data Display

**ATS Score Indicator (Hero Component):**
- Large circular progress ring (200px diameter on desktop)
- Animated fill on score update
- Center displays score number (text-4xl weight-700)
- Below score: Status text ("Excellent" | "Good" | "Needs Work")
- Gradient fills based on score ranges

**Keyword Tags:**
- Pill-shaped (rounded-full)
- Two states: Matched (filled) | Missing (outlined)
- Small size: px-3 py-1, text-sm
- Icon prefix for matched keywords (checkmark via Heroicons)

**Resume Preview Card:**
- Paper-like shadow (shadow-lg)
- White background with subtle border
- Padding: p-8
- Sections separated by border-b with pb-6 mb-6

**Progress Sections:**
- Mini progress bars for each ATS criterion
- Labels on left, percentage on right, bar in middle
- Height: h-2, rounded-full
- Container spacing: space-y-4

### Navigation

**Tab Navigation:**
- Horizontal tabs for resume sections
- Active state: border-b-2 with weight-600 text
- Inactive: weight-400 with hover state
- Equal width tabs or auto-width based on content

**Section Headers:**
- text-xl weight-600
- Optional action button aligned right
- Separator line (border-b) below with mb-4

---

## Interactions & States

**Real-time Updates:**
- ATS score updates as user types (debounced 500ms)
- Keyword highlighting in resume editor
- Progress animations on score changes

**Loading States:**
- Skeleton screens for ATS analysis (3-4 pulsing bars)
- Spinner for PDF/Word generation
- Disabled button states during processing

**Empty States:**
- Illustration or icon for empty job description
- Clear call-to-action text: "Paste a job description to get started"
- Sample text link to try demo

**Success/Error States:**
- Toast notifications for downloads (top-right)
- Inline error messages for validation
- Success checkmarks for completed optimizations

---

## Icons
**Library:** Heroicons (via CDN)
- Document icons for resume sections
- Check/X marks for keyword matching
- Download icons for export buttons
- Analytics icons for ATS dashboard
- Lightbulb for suggestions

---

## Specific Sections

### Resume Editor Features
- Section reordering (drag handles with icon)
- Add/remove experience entries ([+ Add Experience] button)
- Bullet point editor with smart formatting
- Action verb suggestions dropdown
- Word count per section

### ATS Testing Tab (Separate View)
- Upload existing resume option
- Side-by-side comparison: Original vs. Optimized
- Detailed breakdown table with scores
- Downloadable ATS report

### Export Modal
- Format selection (radio buttons): PDF | Word | Both
- Template selection (3-4 preview cards)
- Filename input field
- [Download] primary button

---

## Responsive Behavior

**Desktop (lg+):** Three-panel layout as described
**Tablet (md):** Two-panel with collapsible sidebar
**Mobile (base):** 
- Stacked single column
- Bottom sheet for ATS score (sticky)
- Tabbed navigation for job description/resume/analysis
- Full-width export buttons at bottom

---

## Special Features

**Keyboard Shortcuts Hint:**
- Small floating tooltip (bottom-right): "Press Ctrl+S to save draft"
- Cmd/Ctrl + E to export
- Display on hover or persistent small badge

**Auto-save Indicator:**
- Subtle text in header: "Last saved: 2 min ago"
- Saving animation when active

This design creates a professional, data-rich productivity tool that guides users through resume optimization with clear visual hierarchy, real-time feedback, and efficient workflows.