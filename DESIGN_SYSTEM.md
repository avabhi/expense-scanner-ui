# ExpenseAI Design System Specifications

Welcome to the ExpenseAI design system guide. This document serves as the single source of truth for design tokens, themes, typography, and responsive component styling used in the application.

---

## 1. Dual-Theme Strategy

The application features two design environments matching the **Stitch** guidelines:
1. **Light Theme (Stitch Corporate)**: Emphasizes a clean, corporate business layout with high-readability canvases, structured borders, and a deep corporate blue brand tone.
2. **Dark Theme (High-Tech Dashboard)**: Uses a deep navy/slate dashboard workspace with high-contrast corporate blue and periwinkle highlights suited for modern data analytics.

Themes are toggled by adding or removing the `.dark` class from the `<html>` or `<body>` element. All UI elements use Tailwind v4 CSS variables (`bg-background`, `text-primary`, `border-border`, etc.) to automatically adapt to the active theme.

---

## 2. Design Tokens Reference

The following table maps design tokens defined in [globals.css](file:///Users/abhinavvishwakarma/projects/expense-scanner-ui/src/app/globals.css) to their corresponding theme values and Tailwind classes:

| Token Name | Tailwind Utility Class | Light Theme Value (Default) | Dark Theme Value (`.dark`) | UI Purpose / Mapping |
| :--- | :--- | :--- | :--- | :--- |
| `--background` | `bg-background` | `#f8f9fa` (off-white) | `#11131b` (dark slate) | Main screen canvas background. |
| `--foreground` | `text-foreground` | `#191c1d` (dark slate) | `#e2e1ed` (cool light gray) | Primary body text and headers. |
| `--card` | `bg-card` | `#ffffff` (white) | `#1d1f27` (slate card surface) | Panels, statistics blocks, and grids. |
| `--card-foreground`| `text-card-foreground` | `#191c1d` (dark slate) | `#e2e1ed` (cool light gray) | Text elements nested inside card blocks. |
| `--primary` | `bg-primary`, `text-primary` | `#1a56db` (corporate blue) | `#1a56db` (corporate blue) | Call-to-actions, active links, focus rings. |
| `--secondary` | `bg-secondary` | `#10b981` (emerald green) | `#7bd0ff` (sky blue) | Status badges, verified tags, helper buttons. |
| `--muted` | `bg-muted` | `#edeeef` (soft gray) | `#191b23` (dark slate muted) | Inactive components, list headers, dividers. |
| `--muted-foreground`| `text-muted-foreground` | `#434654` (slate-600) | `#c3c5d7` (slate-400) | Help guides, timestamps, secondary labels. |
| `--accent` | `bg-accent` | `#f3f4f5` (light gray) | `#282a32` (dark gray accent) | Hover backgrounds, input focus fills. |
| `--destructive` | `bg-destructive` | `#ba1a1a` (crimson red) | `#ffb4ab` (coral pink) | Danger banners, delete buttons, error chips. |
| `--border` | `border-border` | `#c3c5d7` (cool gray) | `#434654` (slate border) | Card borders, dividers, grid borders. |
| `--input` | `border-input` | `#c3c5d7` | `#434654` | Default input border token. |
| `--ring` | `ring-ring` | `#1a56db` | `#b5c4ff` | Focus outline rings on interactable elements. |

---

## 3. Sidebar Navigation Tokens

The navigation sidebar and top header are styled dynamically using distinct sidebar variable mappings:

| Token Name | Tailwind Utility Class | Light Theme Value (Default) | Dark Theme Value (`.dark`) | UI Purpose / Mapping |
| :--- | :--- | :--- | :--- | :--- |
| `--sidebar` | `bg-sidebar` | `#ffffff` | `#0c0e15` | Navigation panel backgrounds. |
| `--sidebar-foreground`| `text-sidebar-foreground`| `#191c1d` | `#e2e1ed` | Links, search placeholders, brand logo. |
| `--sidebar-primary` | `bg-sidebar-primary` | `#1a56db` | `#1a56db` | Active link bullet borders. |
| `--sidebar-accent` | `bg-sidebar-accent` | `#f3f4f5` | `#191b23` | Sidebar list item hover overlays. |
| `--sidebar-border` | `border-sidebar-border` | `#c3c5d7` | `#434654` | Border lines surrounding navigation panel. |

---

## 4. Typography & Scales

- **Font Family**: Standardized to `ui-sans-serif, system-ui, sans-serif` via Tailwind's `@apply font-sans`.
- **Sizing Scale**:
  - `text-3xl`: Main workspace headers (e.g. Dashboard titles, 30px).
  - `text-xl` / `text-lg`: Secondary page section headers (e.g. Card titles, 20px/18px).
  - `text-sm`: Primary interaction text, descriptions, table body values (14px).
  - `text-xs`: Labels, badges, form input headers, subtext (12px).
  - `text-[10px]`: Auditing hashes, status logs, metadata tags (10px, often styled as `font-mono uppercase`).

---

## 5. Border Radius System

All borders utilize a dynamic radius token calculated relative to the base `--radius` variable (`0.5rem` or `8px` matching Stitch's `ROUND_EIGHT` layout system):

```css
--radius-sm:  calc(var(--radius) * 0.6); /* 4.8px - Small badges */
--radius-md:  calc(var(--radius) * 0.8); /* 6.4px - Input controls */
--radius-lg:  var(--radius);             /* 8.0px - Standard buttons */
--radius-xl:  calc(var(--radius) * 1.4); /* 11.2px - Card containers */
--radius-2xl: calc(var(--radius) * 1.8); /* 14.4px - Large actions, dropzones */
--radius-3xl: calc(var(--radius) * 2.2); /* 17.6px - Dialog modals, drawers */
```

In Tailwind, these are applied using standard classes: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`.

---

## 6. Shared Component Guidelines

When creating or editing UI components, developers should adhere to the following predefined styling classes:

### A. Button Variants
- **Primary CTA**: `bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-md transition`
- **Secondary / Action**: `border border-border bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-xl transition`
- **Outline / Control**: `border border-border bg-card text-foreground hover:bg-muted font-bold rounded-xl transition`
- **Ghost**: `text-primary hover:text-primary-hover hover:bg-transparent font-bold transition`

### B. Standard Badges
- **Status (Verified/Complete)**: `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold rounded-full`
- **Status (Processing/Syncing)**: `bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-none font-bold rounded-full`
- **Categorization Pill**: `text-[10px] px-2 py-0.5 rounded-full border-border bg-muted/30 text-muted-foreground`

### C. Tables & Lists
- Wrap all tables in an `<div className="overflow-x-auto">` element to enforce mobile scrolling safety.
- Apply a border to the header divider and subtle hover rows:
  ```tsx
  <div className="overflow-x-auto border border-border rounded-xl">
    <Table>
      <TableHeader className="bg-muted/20 border-b border-border">
        ...
      </TableHeader>
      <TableBody>
        <TableRow className="border-border hover:bg-muted/10">
          ...
        </TableRow>
      </TableBody>
    </Table>
  </div>
  ```

### D. Modals & Dialogs
- Modal frames must follow the standard curvature limits: `rounded-3xl` (`--radius-3xl`).
- Keep content columns adaptive (`grid grid-cols-1 md:grid-cols-2`) and set standard body scroll constraints (`max-h-[450px] overflow-y-auto`) to fit small mobile screens.

---

## 7. Developer Rules of Thumb

1. **Never Hardcode Colors**: Do not use raw color tokens like `bg-slate-900` or `text-zinc-50`. Always use design system aliases like `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, and `border-border`.
2. **Design Mobile-First**: Every page column layout must stack by default. Desktop layouts should be declared with the `lg:` or `md:` prefixes (e.g. `flex-col lg:flex-row`, `grid-cols-1 md:grid-cols-3`).
3. **Respect Spacing Boundaries**: Keep margins and paddings aligned to multiples of `4` (`p-4`, `py-6`, `gap-8`) to maintain vertical visual balance.
4. **Touch Target Accessibility**: Maintain minimum tap size constraints of `44x44px` on interactive targets (buttons, check inputs, mobile drawer toggles).

---

## 8. Static Stitch Palette Tokens (Tailwind v4 `@theme` Overrides)

If a developer needs to override the dynamic light/dark theme variables, or target a specific theme's colors directly, the static hex-based color values from the Stitch design system are configured as custom properties inside the `@theme` directive in `globals.css`. 

These colors can be used with any Tailwind utility prefix (`bg-`, `text-`, `border-`, `accent-`, etc.):

| Color Utility Class Base | Static Hex Value | Target Design Layer |
| :--- | :--- | :--- |
| `stitch-primary-light` | `#1a56db` | Light Theme Brand Corporate Blue |
| `stitch-primary-dark` | `#b5c4ff` | Dark Theme Periwinkle Blue |
| `stitch-secondary-light` | `#10b981` | Light Theme Success Emerald Green |
| `stitch-secondary-dark` | `#7bd0ff` | Dark Theme Sky Blue |
| `stitch-bg-light` | `#f8f9fa` | Light Theme Off-White Background |
| `stitch-bg-dark` | `#11131b` | Dark Theme Deep Midnight Background |
| `stitch-card-light` | `#ffffff` | Light Theme Card Surface |
| `stitch-card-dark` | `#1d1f27` | Dark Theme Card Surface |
| `stitch-border-light` | `#c3c5d7` | Light Theme Boundary Border |
| `stitch-border-dark` | `#434654` | Dark Theme Boundary Border |
| `stitch-muted-light` | `#edeeef` | Light Theme Inactive Base |
| `stitch-muted-dark` | `#191b23` | Dark Theme Inactive Base |

For example, to force a primary blue text color regardless of dark mode status, use `text-stitch-primary-light`. To force a dark theme card panel surface in a light mode screen, use `bg-stitch-card-dark`.
