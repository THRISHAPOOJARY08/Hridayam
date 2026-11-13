---
name: Routeless Karnataka
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#442100'
  on-tertiary: '#ffffff'
  tertiary-container: '#653400'
  on-tertiary-container: '#fc922b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-lg-medium:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for rural students, daily bus commuters, and local travelers across Karnataka. The experience bridges bilingual literacy (Kannada and English) under challenging real-world conditions: low-cost Android hardware, intermittent mobile connectivity, and severe outdoor glare at rural bus shelters.

The design philosophy combines functional minimalism with warm civic utility. Rather than leaning into hyper-futuristic transit concepts or ornate regional motifs, the interface prioritizes clarity, trust, and physical legibility. Visual decisions evoke the familiarity of state transit infrastructure, distilled into modern software patterns:
- **Immediate Legibility:** High-contrast surfaces calibrated for direct sunlight viewing.
- **Cognitive Ease:** Dual-script balance where Kannada and English coexist seamlessly without typographic hierarchy collisions.
- **Ergonomic Safety:** Touch targets exceed typical platform baselines (minimum 48px to 56px) to accommodate one-handed operation on crowded buses.
- **Honest Utility:** Absence of heavy blurs, compute-intensive particle effects, or synthetic neon gradients that degrade performance on low-RAM devices.

## Colors

The palette is tuned specifically for light mode as the default state to maximize visibility under sunlight and high-ambient-glare environments across rural Karnataka.

- **Primary (`#1E3A8A` - Royal Sapphire):** Anchored in the iconic presence of state transit systems. Used for navigation bars, core action buttons, active route headers, and key semantic anchors.
- **Secondary (`#0D9488` - Vibrant Teal):** Signifies live progress, real-time connectivity, confirmed reservations, and accessible travel passes.
- **Tertiary / Accent (`#D97706` - Warm Saffron Gold):** Adjusted for high sunlight contrast against light backgrounds. Used for active alerts, bus delays, critical badge highlights, and real-time arrival states.
- **Neutral Surface & Canvas:**
  - Base Canvas: `#F8FAFC` (Slate 50) prevents ocular fatigue while keeping the app airy.
  - Surface Containers: `#FFFFFF` (Pure White) provides punchy contrast for content cards.
  - Structural Dividing Lines: `#CBD5E1` (Slate 300) provides dependable boundary definition under washed-out screen brightness.
  - Primary Text & Headings: `#0F172A` (Slate 900) ensures a strict minimum contrast ratio of 12:1 against canvas.
  - Secondary Text: `#334155` (Slate 700) guarantees WCAG AAA compliance for route numbers, stops, and timestamps.

## Typography

The typographic strategy accommodates parallel script parity between Kannada and English. While Plus Jakarta Sans and Inter serve Latin glyphs, Noto Sans Kannada must be integrated at equivalent baseline metrics for local script rendering.

- **Bilingual Stacking:** Kannada text requires 10–15% more vertical line height than Latin script to avoid clipping subscript consonants (vattakshara). All body containers must allow natural line expansion rather than fixed bounding-box heights.
- **Hierarchical Anchors:** Route identifiers, platform numbers, and vehicle registration numbers must render in Bold tabular numerals to prevent layout jank during live data updates.
- **Micro-copy Discipline:** Avoid all typography below 11px. Vital transit information (departure times, platform bays, fares) must never be set below `body-md` (14px).

## Layout & Spacing

This layout system follows an adaptive mobile-first column model with strict 4px / 8px coordinate increments.

- **Form Factor Adaptation:**
  - **Mobile (<640px):** Single-column layout with fixed 16px (`1rem`) outer screen margins and 12px gutters. Primary interactive buttons stretch to full container width for thumbsafe interaction.
  - **Tablet (640px - 1024px):** 6-column fluid grid, 24px margins, allowing split-pane views for schedule search and live bus map tracking.
  - **Desktop / Kiosk (>1024px):** 12-column layout capped at 1120px max content width to prevent transit tables from horizontal hyper-extension.
- **Physical Reach:** High-priority triggers (Search Route, Scan Pass, Emergency SOS) reside within the natural bottom screen thumb zone (bottom 40% of viewport).

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows, as budget LCD panels wash out soft gradient shadows under sunlight. Depth is established through crisp structural framing and layered planar contrast:

- **Surface Tiering:**
  - Base: `#F8FAFC`
  - Container / Card: `#FFFFFF` with a structural `1px` border of `#E2E8F0`.
  - Floating Transit Bars & Modals: `#FFFFFF` with a crisp `1px` border (`#CBD5E1`) paired with a single performance-friendly shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)`.
- **Active Selection Depth:** Selected routes, active filters, or highlighted stops do not use elevation lift; they switch to a solid `2px` inset or outset border in `#1E3A8A` or a filled background tint (`rgba(30, 58, 138, 0.06)`).
- **Zero Glassmorphism:** No backdrop-blur or translucent transparency filters are used, ensuring 60fps scrolling and lower battery consumption on entry-level chipsets.

## Shapes

The design uses a consistent 12px (`0.75rem` / `rounded-md` equivalent or Level 2 scaled) curvature across primary interaction surfaces:

- **Cards, Modals, and Sheets:** Standardized to 12px corner radius (`0.75rem`). This softens the civic utility of transit data while retaining structure and information density.
- **Buttons and Input Controls:** Standardized to 12px radius, creating unified tactile consistency between text input and CTA triggers.
- **Badges and Status Chips:** Retain a smaller 6px to 8px radius or full pill-capsules for live tracking indicators (`LIVE`, `ON TIME`, `DELAYED`).

## Components

### Buttons
- **Primary CTA:** Solid `#1E3A8A` background with `#FFFFFF` text. Minimum height: 52px on mobile. 12px border radius. Accompanied by a 20px leading icon (e.g., bus icon, search icon) paired with bilingual labels where appropriate.
- **Secondary Action:** Transparent fill, 1.5px solid `#1E3A8A` border, `#1E3A8A` text.
- **Tertiary / Danger Action:** Light red tint (`#FEF2F2`) with `#B91C1C` text and border for SOS or cancel operations.

### Cards (Buses, Routes & Passes)
- Pure white (`#FFFFFF`) background, `1px solid #E2E8F0` border, 12px corner radius.
- Padding: 16px. Internal layout splits cleanly into route number (prominent `headline-md`), destination bilingual text, platform pill, and real-time departure countdown.
- Interactive cards receive a stateful hover/pressed border transition to `#1E3A8A`.

### Status Badges & Chips
- **Live / On Time:** Background `#CCFBF1`, text `#0F766E`, border `#99F6E4`. Includes a static dot indicator.
- **Delayed / Caution:** Background `#FEF3C7`, text `#92400E`, border `#FDE68A`.
- **Pass Status (Active Student Pass):** Full `#1E3A8A` background with crisp white text and a gold `#F59E0B` verification seal.

### Input Fields & Search Bars
- 52px height minimum for finger-friendly typing.
- Default: `#FFFFFF` fill, `1.5px solid #CBD5E1` border, 12px radius, 16px horizontal padding.
- Focused: `2px solid #1E3A8A` outline with zero fuzzy glow. Includes clear visual affordances like microphone icon (for voice-assisted search in Kannada) and quick station-swap buttons.

### Selection Controls (Checkboxes & Radios)
- Sized at a minimum of 24x24px with a 48x48px accessible tap boundary.
- Selected state fills with `#1E3A8A` displaying high-contrast pure white marks.

### Route Timeline & Stops List
- Vertical line with 2px width (`#CBD5E1`).
- Completed stops: Solid `#0D9488` dots (10px).
- Current live bus position: Prominent `#F59E0B` bus beacon (20px).
- Upcoming stops: Hollow `#94A3B8` circles (10px).
- Every stop name displays in bold Kannada script with Latin English directly underneath in `body-md`.