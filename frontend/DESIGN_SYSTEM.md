# Task Manager - Design System & Color Palette

## Overview
A professional, productivity-focused color palette with calm and neutral tones, one primary accent color, and subtle animations for a clean task management experience.

## Color Palette

### Primary Colors
- **Primary**: `#3B82F6` (Blue) - Primary accent for CTAs, important actions
- **Primary Dark**: `#1E40AF` (Darker Blue) - Hover states
- **Primary Light**: `#DBEAFE` (Light Blue) - Focus states, backgrounds

### Neutral Colors (Calm & Professional)
- **Background**: `#F8FAFC` (Off-white) - Page background, soft on eyes
- **Surface**: `#FFFFFF` (White) - Cards, containers
- **Border**: `#E2E8F0` (Light Gray) - Dividers, outlines
- **Text Primary**: `#0F172A` (Dark Slate) - Main text content
- **Text Secondary**: `#475569` (Slate) - Secondary text, labels
- **Text Tertiary**: `#94A3B8` (Light Slate) - Disabled text, helper text

### Status Colors
- **Success**: `#10B981` (Green) - Completed tasks
- **Warning**: `#F59E0B` (Amber) - Overdue, urgent items
- **Error**: `#EF4444` (Red) - Errors, critical states
- **Info**: `#0EA5E9` (Cyan) - Informational

### Task Status Badges
- **TODO**: Red (`#EF4444`)
- **IN_PROGRESS**: Blue (`#3B82F6`)
- **REVIEW**: Amber (`#F59E0B`)
- **COMPLETED**: Green (`#10B981`)

### Priority Indicators
- **LOW**: Green (`#10B981`)
- **MEDIUM**: Amber (`#F59E0B`)
- **HIGH**: Orange (`#F97316`)
- **URGENT**: Red (`#EF4444`)

## Design Tokens (CSS Variables)

All colors are defined as CSS custom properties in `styles/design-tokens.css`:

```css
:root {
  --color-primary: #3B82F6;
  --color-primary-dark: #1E40AF;
  --color-primary-light: #DBEAFE;
  
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94A3B8;
  
  /* Status & Priority colors... */
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  --transition-fast: 0.15s ease;
  --transition-smooth: 0.3s ease;
  --transition-slow: 0.5s ease;
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

## Animations

### Subtle & Lightweight
All animations use CSS for performance and don't affect component behavior.

1. **fadeIn** - Simple opacity transition (0.3-0.4s)
2. **slideInDown** - Navbar entrance, error messages
3. **slideInUp** - Card/modal entrance
4. **scaleIn** - Modal overlay, badges
5. **buttonPress** - Button interaction feedback (0.2s)

### Usage
- Cards and modals slide in on load
- Hover effects include subtle shadows and color transitions
- Button presses have micro-animation feedback
- Error messages fade in smoothly

## CSS Architecture

### Component-Level Styling
Each component has its own CSS module to prevent global style pollution:

- `AuthForms.module.css` - Authentication pages
- `Dashboard.module.css` - Main dashboard layout
- `Profile.module.css` - User profile page
- `TaskForm.module.css` - Task creation form
- `TaskItem.module.css` - Individual task cards
- `Navbar.module.css` - Navigation bar with notifications

### Global Design System
- `styles/design-tokens.css` - CSS variables, animations, reusable keyframes
- `App.css` - Only design system resets, no component styling

## Responsive Design

All components include responsive breakpoints:
- **Desktop** (≥768px) - Full layout with optimized spacing
- **Tablet** (768px-480px) - Adjusted grids and spacing
- **Mobile** (<480px) - Stacked layout, simplified typography

## Key Features

✅ **Professional**: Calm, neutral palette suitable for productivity tools
✅ **Consistent**: All components use the same color variables
✅ **Accessible**: Sufficient contrast ratios for readability
✅ **Performant**: Lightweight CSS animations, no layout shifts
✅ **Scoped**: CSS modules prevent style conflicts between pages
✅ **Responsive**: Mobile-first approach with media queries
✅ **Subtle**: Animations are gentle and don't distract from task management

## Usage Example

All components import and use CSS modules:

```tsx
import styles from './Component.module.css';

export function Component() {
  return <div className={styles.container}>Content</div>;
}
```

CSS modules use design tokens:

```css
.button {
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  transition: all var(--transition-smooth);
}

.button:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}
```
