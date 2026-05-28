---
name: mobile-responsive
description: Ensure all newly added or modified React components and pages are fully mobile responsive
---

# Mobile Responsive Design Guidelines

All UI components and pages must be fully responsive, readable, and interactive across all device form factors (mobile, tablet, and desktop).

## 1. Layout & Breakpoint Strategy

- **Mobile-First Design**: Design layouts for small viewports (`< 640px`) by default, and introduce larger designs progressively using Tailwind CSS responsive variants (e.g., `sm:`, `md:`, `lg:`, `xl:`).
- **Flexible Widths**: Prefer relative percentage-based or viewport-based widths (`w-full`, `max-w-screen-md`, `max-w-4xl`) over hardcoded pixel widths (`w-[600px]`).
- **Dynamic Padding & Margins**: Scale spacing dynamically based on screen real estate (e.g., `p-4 sm:p-6 md:p-8`).

## 2. Flexbox & Grid Systems

- **Responsive Columns**: Configure grid layouts to wrap elements on smaller displays (e.g., `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- **Flex Direction Wrapping**: Enable flex items to wrap dynamically on mobile devices (`flex flex-col sm:flex-row flex-wrap`) to prevent clipping.
- **Appropriate Spacing**: Use Tailwind's gap properties (`gap-4 md:gap-6`) to maintain structural breathing room.

## 3. Component Adaptability

- **Data Tables**: Wrap tabular data, broad summaries, and line items in scrollable blocks (`overflow-x-auto`) to avoid pushing the parent layout out of bounds.
- **Header & Navigation Menus**: Fold sidebar navigation interfaces into collapsable overlay sheets, overlay drawers, or responsive header layouts (hamburger menu buttons) on mobile screens.
- **Conditional Visibility**: Hide unnecessary decorative elements or non-critical secondary details on mobile viewports using the `hidden sm:block` utility.

## 4. Interactive Touch Targets

- **Target Size**: Maintain tap targets with a minimum size of `44x44px` (Tailwind classes like `p-3`, `h-11`, `w-11`) for buttons, links, and switches.
- **Touch Margins**: Provide enough surrounding space (`gap-x-2`, `space-y-3`) to prevent accidental adjacent clicks.

## 5. Responsive Typography

- **Fluid Typography**: Select font size modifiers relative to breakpoints (e.g., `text-xl sm:text-2xl md:text-3xl`).
- **Line Lengths**: Keep paragraph containers readable by setting `max-w-prose` (60–75 characters per line).
