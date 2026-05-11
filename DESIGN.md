# Design

## Design System Overview

PulsePipe uses a restrained product UI system for an authenticated infrastructure dashboard. The product should feel dense, credible, and task-focused. Components favor predictable forms, tables, status badges, and panels over decorative layouts.

## Color Palette

Use OKLCH tokens from Tailwind where possible:

- `paper`: primary content surface, `oklch(98% 0.006 232)`
- `panel`: secondary surface, `oklch(96% 0.008 232)`
- `ink`: primary text and filled controls, `oklch(18% 0.012 232)`
- `muted`: secondary text, `oklch(48% 0.018 232)`
- `line`: borders and dividers, `oklch(88% 0.014 232)`
- `accent`: primary action and selected state, `oklch(56% 0.15 178)`
- `warning`: queued, processing, and retrying states
- `danger`: failed and dead-letter states

Accent color should be sparse and functional: primary actions, selected navigation, focus, and system state only.

## Typography

Use the system UI font stack. Product labels, tables, and controls should stay compact and consistent. Use fixed rem sizes, not viewport-scaled type. Headings should be confident but not marketing-scale inside the app.

## Components

- Sidebar navigation: stable, compact, selected state visible through background, color, and icon treatment.
- Panels: 8px radius, thin border, light shadow only when it improves grouping.
- Buttons: consistent height, icon plus text for commands, visible hover, active, disabled, and focus states.
- Inputs/selects: full labels where ambiguity exists, clear placeholder only where label is nearby.
- Tables: compact rows, clear headers, truncation for long IDs/URLs, row hover for inspectable data.
- Badges: status text always present, semantic tone never communicated by color alone.
- Empty states: teach the next action and keep the page useful.

## Layout

Dashboard pages use a persistent sidebar and content area. Preserve vertical rhythm with 24px to 32px major gaps and 12px to 16px local gaps. Data-heavy pages should prioritize table scanability and responsive overflow over card grids.

## Motion

Use only short 150ms to 220ms ease-out transitions for hover, focus, inline success, and loading feedback. Do not animate page entry or table layout.

## Demo Experience

The product should include a visible local demo path: create a demo webhook destination, create an API key, copy a curl command, send a test event, and watch delivery attempts succeed or fail. Demo helpers must not weaken production defaults without explicit development configuration.
