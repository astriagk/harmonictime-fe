# Design Tokens (cross-platform)

Portable, **platform-agnostic** source of truth for **colors, typography,
spacing, sizing, radii, breakpoints, and motion**. One set of values, consumed
by every app — web (CSS/SCSS/JS), Android, iOS — so they all look the same.

> This is the *values* companion to [`THEME.md`](./THEME.md) (usage rules and
> component patterns). Change a value **here first**, then update `THEME.md`.
>
> Values were extracted from this repo (`src/assets/scss/_variables.scss` and the
> global `assets/scss/*`). Where a value diverges from an industry standard, both
> are given: the **current** value (what the app renders today) and the
> **recommended** value (the standard to move toward for new / mobile apps).

---

## 1. Standards & cross-platform model

**Tokens are stored as unitless numbers.** A spacing/size token of `16` means
"16 of the platform's density-independent unit". Each platform attaches the
unit at consumption time — the physical size is the same everywhere:

| Concept | Web | Android | iOS |
|---------|-----|---------|-----|
| Layout / spacing | `px` (or `rem` = px ÷ 16) | `dp` | `pt` |
| Font size | `rem` / `px` | `sp` (respects user font scale) | `pt` (Dynamic Type) |
| Color | hex / `rgb()` | `0xAARRGGBB` | `UIColor` / hex |

`1dp ≈ 1px @160dpi`, `1pt = 1px @1x` → a token of `16` renders at the same
apparent size on all three. **Prefer `rem` on web and `sp` for Android text** so
user font-size preferences are respected (accessibility).

### The 8-point grid (industry standard)

Google Material, Airbnb, and (loosely) Apple HIG lay everything out on an
**8-point grid** with **4pt half-steps** for fine adjustments. Spacing and sizes
are multiples of 8 (8, 16, 24, 32…), with 4 available for tight cases. This is
the recommended scale in section 4.

> The current app uses a **5px** scale (a Bootstrap-template legacy). It's
> internally consistent but off-grid vs. the standard. Both are documented below;
> new work — especially anything shared with native mobile — should adopt the 8pt
> scale.

### Touch targets (mobile-critical)

The main web↔mobile difference. Interactive elements need a minimum hit area:

| Token | Value | Source |
|-------|-------|--------|
| `touch-target-min` | `44` | Apple HIG minimum (44×44pt) |
| `touch-target-comfortable` | `48` | Material minimum (48×48dp); WCAG 2.2 AAA |

Mouse-driven web can go smaller, but sizing every control to ≥ `44` keeps one
rule across platforms. (The current `button-height` of `50` clears both.)

### Other web ↔ mobile differences

- **Edge margins/gutters:** mobile uses tight screen margins (`16`); web uses a
  wide centered container (`container-max`) with larger gutters.
- **Density:** web tolerates denser layouts; mobile needs more breathing room.
- **Breakpoints:** section 7 is web-oriented; native apps use size classes
  instead, but the same `md/lg` thresholds are a fine guide.

---

## 2. Colors

Colors are already platform-neutral (hex). On Android use `0xFF` + the 6 digits;
on iOS convert to `UIColor`. Alpha values (e.g. overlays) are called out inline.

| Token | Value | Role |
|-------|-------|------|
| `color-primary` | `#bc8246` | Primary accent (warm gold) — hovers, active, highlights, button fills |
| `color-secondary` | `#8a8f6a` | Secondary accent (olive) — alt buttons |
| `color-heading` | `#201f1f` | All headings |
| `color-body` | `#848b8a` | Default body / paragraph text |
| `color-black` | `#201f1f` | Darkest text |
| `color-black-2` | `#323232` | Solid dark buttons, borders |
| `color-black-3` | `#222222` | — |
| `color-black-soft` | `#444444` | Soft dark text |
| `color-black-soft-2` | `#606060` | Soft dark text |
| `color-black-soft-3` | `#757575` | Muted text |
| `color-white` | `#ffffff` | Backgrounds, inverted text |
| `color-grey` | `#f5f5f5` | Light section backgrounds |
| `color-grey-2` | `#e1e1e1` | Light borders |
| `color-grey-3` | `#9d9d9d` | Muted icons / text |
| `color-footer-bg` | `#151616` | Footer background |
| `color-border` | `#ebebeb` | Default borders |
| `color-border-2` | `#383838` | Dark borders |
| `color-input-border` | `#eaedff` | Form input border |
| `color-input-text` | `#6f7172` | Form input text / placeholder |
| `color-overlay` | `#000000` @ `~40–75%` alpha | Modal / media scrims |

### Semantic / status colors

Badges, alerts, status pills (order status, stock, form feedback). Each role has
a soft background + a strong foreground pair.

| Token | Value | Role |
|-------|-------|------|
| `color-success-bg` | `#e8f5e9` | Success background (soft green) |
| `color-success-fg` | `#2e7d32` | Success text / icon |
| `color-warning-bg` | `#fff8e1` | Warning background (soft amber) |
| `color-warning-fg` | `#f57f17` | Warning text / icon |
| `color-warning-fg-strong` | `#e65100` | Stronger warning text |
| `color-error-bg` | `#fce4e4` | Error / danger background (soft red) |
| `color-error-fg` | `#c62828` | Error / danger text |
| `color-error-fg-strong` | `#b71c1c` | Stronger error text |
| `color-danger` | `#dc3545` | Inline danger accent (validation) |
| `color-danger-2` | `#d9534f` | Alt danger accent |
| `color-danger-3` | `#c0392b` | Delete / destructive action accent |
| `color-info-bg` | `#e3f2fd` | Info background (soft blue) |
| `color-info-fg` | `#1565c0` | Info text |
| `color-info-fg-alt` | `#1a56cc` | Alt info text |
| `color-neutral-bg` | `#f5f5f5` | Neutral / default badge background |
| `color-neutral-fg` | `#616161` | Neutral / default badge text |

> One canonical value per role. The codebase has near-duplicate reds
> (`#c62828`, `#b71c1c`, `#dc3545`, `#d9534f`, `#c0392b`) — when unifying apps,
> collapse to `color-error-fg` + `color-danger`. Decorative one-off hues
> (product-tag colors `#fbaf5d`, `#1cbbb4`, `#f06eaa`) are intentionally **not**
> tokenized.

---

## 3. Typography

Font sizes are unitless (see §1 for units per platform). Body is `14` today;
`16` is the modern default (better mobile readability) — listed as recommended.

| Token | Value | Recommended |
|-------|-------|-------------|
| `font-family-base` | `Poppins` | — (bundle the font on native apps) |
| `font-weight-light` | `300` | |
| `font-weight-regular` | `400` | |
| `font-weight-medium` | `500` | |
| `font-weight-semibold` | `600` | |
| `font-weight-bold` | `700` | |
| `font-size-base` | `14` | `16` |
| `line-height-base` | `24` | `1.5` (ratio) |
| `line-height-heading` | `1.2` (ratio) | |

**Heading scale** (weight `500`, color `color-heading`):

| Token | Value |
|-------|-------|
| `font-size-h1` | `40` |
| `font-size-h2` | `36` |
| `font-size-h3` | `27` |
| `font-size-h4` | `20` |
| `font-size-h5` | `16` |
| `font-size-h6` | `14` |

> On web express these in `rem` (÷16) so browser font settings scale them; on
> Android use `sp`; on iOS map to Dynamic Type text styles.

---

## 4. Spacing

Unitless scale. **Use the recommended 8pt scale for new / cross-platform work.**
The 5px scale is what the current web app renders and is kept for parity.

### 4a. Recommended — 8pt grid (multiples of 4)

| Token | Value | Typical use |
|-------|-------|-------------|
| `space-none` | `0` | — |
| `space-2xs` | `4` | Icon ↔ label, hairline gaps |
| `space-xs` | `8` | Tight padding, chip insets |
| `space-sm` | `12` | Compact stacks |
| `space-md` | `16` | Default gap / screen edge margin |
| `space-lg` | `24` | Section inner padding |
| `space-xl` | `32` | Between groups |
| `space-2xl` | `48` | Section spacing |
| `space-3xl` | `64` | Page-level rhythm |

### 4b. Current app — 5px scale (legacy)

Base unit **5**, full utility scale **every 5 from 5 → 200**, generated for all
four sides in margin and padding (`mt-*/mb-*/ml-*/mr-*`, `pt-*/pb-*/pl-*/pr-*`).
`space-N` = `N × 5` (so `space-6` = `30`).

| Token | Val | | Token | Val | | Token | Val | | Token | Val |
|-------|-----|-|-------|-----|-|-------|-----|-|-------|-----|
| `space-1` | `5` | | `space-11` | `55` | | `space-21` | `105` | | `space-31` | `155` |
| `space-2` | `10` | | `space-12` | `60` | | `space-22` | `110` | | `space-32` | `160` |
| `space-3` | `15` | | `space-13` | `65` | | `space-23` | `115` | | `space-33` | `165` |
| `space-4` | `20` | | `space-14` | `70` | | `space-24` | `120` | | `space-34` | `170` |
| `space-5` | `25` | | `space-15` | `75` | | `space-25` | `125` | | `space-35` | `175` |
| `space-6` | `30` | | `space-16` | `80` | | `space-26` | `130` | | `space-36` | `180` |
| `space-7` | `35` | | `space-17` | `85` | | `space-27` | `135` | | `space-37` | `185` |
| `space-8` | `40` | | `space-18` | `90` | | `space-28` | `140` | | `space-38` | `190` |
| `space-9` | `45` | | `space-19` | `95` | | `space-29` | `145` | | `space-39` | `195` |
| `space-10` | `50` | | `space-20` | `100` | | `space-30` | `150` | | `space-40` | `200` |

> Generate these in a loop, don't hand-list (see §9). Common rungs in real use:
> `15`, `20`, `30`, `50`, `100`.

---

## 5. Sizing & radii

Unitless.

| Token | Value | Notes |
|-------|-------|-------|
| `container-max` | `1140` | Web content max-width (at ≥1200 viewport) |
| `screen-margin` | `16` | Mobile screen edge margin |
| `input-height` | `60` | Form control height |
| `button-height` | `50` | Clears both touch-target minimums |
| `button-line-height` | `46` | Web only |
| `button-padding-x` | `42` | Horizontal button padding |
| `border-width` | `2` | Default border / outline weight |
| `touch-target-min` | `44` | See §1 |
| `touch-target-comfortable` | `48` | See §1 |

**Radii** — the base theme uses **sharp corners** (`radius-none` = `0`) for
buttons and inputs. A generic radius scale is provided for apps that want
rounding; keep `0` to match the current look.

| Token | Value |
|-------|-------|
| `radius-none` | `0` (current default) |
| `radius-sm` | `4` |
| `radius-md` | `8` |
| `radius-lg` | `16` |
| `radius-pill` | `999` |

---

## 6. Breakpoints (web)

Native apps use platform size classes; these thresholds still map cleanly.

| Token | Range |
|-------|-------|
| `bp-xs` | `max-width: 575` |
| `bp-sm` | `576 – 767` |
| `bp-md` | `768 – 991` |
| `bp-lg` | `992 – 1199` |
| `bp-laptop` | `1200 – 1600` |

---

## 7. Motion

| Token | Value |
|-------|-------|
| `duration-base` | `300` (ms) — default hover/interactive transition |
| `easing-base` | `ease` |

---

## 8. Generic (platform-neutral) token source

The one file to share. Unitless numbers; each platform's build step (Style
Dictionary, a script, or hand-mapping) turns these into CSS vars / Android
`dimens.xml` / iOS constants.

```json
{
  "color": {
    "primary": "#bc8246", "secondary": "#8a8f6a",
    "heading": "#201f1f", "body": "#848b8a",
    "black": "#201f1f", "black-2": "#323232",
    "white": "#ffffff", "grey": "#f5f5f5", "grey-2": "#e1e1e1", "grey-3": "#9d9d9d",
    "footer-bg": "#151616", "border": "#ebebeb", "border-2": "#383838",
    "input-border": "#eaedff", "input-text": "#6f7172",
    "success-bg": "#e8f5e9", "success-fg": "#2e7d32",
    "warning-bg": "#fff8e1", "warning-fg": "#f57f17",
    "error-bg": "#fce4e4", "error-fg": "#c62828",
    "danger": "#dc3545",
    "info-bg": "#e3f2fd", "info-fg": "#1565c0",
    "neutral-bg": "#f5f5f5", "neutral-fg": "#616161"
  },
  "font": {
    "family-base": "Poppins",
    "weight": { "light": 300, "regular": 400, "medium": 500, "semibold": 600, "bold": 700 },
    "size": { "base": 14, "h1": 40, "h2": 36, "h3": 27, "h4": 20, "h5": 16, "h6": 14 },
    "line-height": { "base": 24, "heading": 1.2 }
  },
  "space": { "none": 0, "2xs": 4, "xs": 8, "sm": 12, "md": 16, "lg": 24, "xl": 32, "2xl": 48, "3xl": 64 },
  "size": {
    "container-max": 1140, "screen-margin": 16,
    "input-height": 60, "button-height": 50, "border-width": 2,
    "touch-target-min": 44, "touch-target-comfortable": 48
  },
  "radius": { "none": 0, "sm": 4, "md": 8, "lg": 16, "pill": 999 },
  "breakpoint": { "xs": 575, "sm": 767, "md": 991, "lg": 1199, "laptop": 1600 },
  "motion": { "duration-base": 300, "easing-base": "ease" }
}
```

---

## 9. Platform copy-paste blocks

### CSS custom properties (web)

```css
:root {
  /* Colors */
  --color-primary: #bc8246;
  --color-secondary: #8a8f6a;
  --color-heading: #201f1f;
  --color-body: #848b8a;
  --color-black: #201f1f;
  --color-black-2: #323232;
  --color-white: #ffffff;
  --color-grey: #f5f5f5;
  --color-border: #ebebeb;
  --color-input-border: #eaedff;
  --color-input-text: #6f7172;

  /* Semantic / status */
  --color-success-bg: #e8f5e9;  --color-success-fg: #2e7d32;
  --color-warning-bg: #fff8e1;  --color-warning-fg: #f57f17;
  --color-error-bg: #fce4e4;    --color-error-fg: #c62828;
  --color-danger: #dc3545;
  --color-info-bg: #e3f2fd;     --color-info-fg: #1565c0;
  --color-neutral-bg: #f5f5f5;  --color-neutral-fg: #616161;

  /* Typography (rem = value ÷ 16) */
  --font-family-base: 'Poppins', sans-serif;
  --font-size-base: 0.875rem;   /* 14 */
  --line-height-base: 1.5;
  --font-size-h1: 2.5rem;       /* 40 */
  --font-size-h2: 2.25rem;      /* 36 */
  --font-size-h3: 1.6875rem;    /* 27 */
  --font-size-h4: 1.25rem;      /* 20 */
  --font-size-h5: 1rem;         /* 16 */
  --font-size-h6: 0.875rem;     /* 14 */

  /* Spacing — 8pt grid (recommended) */
  --space-2xs: 4px;  --space-xs: 8px;   --space-sm: 12px;
  --space-md: 16px;  --space-lg: 24px;  --space-xl: 32px;
  --space-2xl: 48px; --space-3xl: 64px;

  /* Sizing */
  --container-max: 1140px;
  --input-height: 60px;
  --button-height: 50px;
  --border-width: 2px;
  --touch-target-min: 44px;
  --radius-none: 0;

  /* Motion */
  --duration-base: 300ms;
  --easing-base: ease;
}
```

### SCSS (web — keeps the legacy 5px utility generator)

```scss
// Colors
$color-primary: #bc8246;
$color-secondary: #8a8f6a;
$color-heading: #201f1f;
$color-body: #848b8a;
$color-white: #ffffff;
$color-grey: #f5f5f5;
$color-border: #ebebeb;
$color-input-border: #eaedff;
$color-input-text: #6f7172;

// Semantic / status
$color-success-bg: #e8f5e9;  $color-success-fg: #2e7d32;
$color-warning-bg: #fff8e1;  $color-warning-fg: #f57f17;
$color-error-bg: #fce4e4;    $color-error-fg: #c62828;
$color-danger: #dc3545;
$color-info-bg: #e3f2fd;     $color-info-fg: #1565c0;
$color-neutral-bg: #f5f5f5;  $color-neutral-fg: #616161;

// Typography
$font-family-base: 'Poppins', sans-serif;
$font-size-base: 14px;
$line-height-base: 24px;

// Spacing — recommended 8pt tokens
$space: (2xs: 4px, xs: 8px, sm: 12px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px);

// Spacing — legacy 5px utility scale (current app), generated
@each $abbr, $prop in (m: margin, p: padding) {
  @each $side, $dir in (t: top, b: bottom, l: left, r: right) {
    @for $i from 1 through 40 {
      .#{$abbr}#{$side}-#{$i * 5} { #{$prop}-#{$dir}: #{$i * 5}px; }
    }
  }
}

// Sizing
$container-max: 1140px;
$input-height: 60px;
$button-height: 50px;
$border-width: 2px;
$touch-target-min: 44px;

// Motion
$duration-base: 300ms;

// Breakpoints
$bp-xs: 575px; $bp-sm: 767px; $bp-md: 991px; $bp-lg: 1199px; $bp-laptop: 1600px;
```

### TypeScript / JS (any app)

```ts
export const tokens = {
  color: {
    primary: '#bc8246', secondary: '#8a8f6a',
    heading: '#201f1f', body: '#848b8a',
    black: '#201f1f', black2: '#323232',
    white: '#ffffff', grey: '#f5f5f5', border: '#ebebeb',
    inputBorder: '#eaedff', inputText: '#6f7172', footerBg: '#151616',
    successBg: '#e8f5e9', successFg: '#2e7d32',
    warningBg: '#fff8e1', warningFg: '#f57f17',
    errorBg: '#fce4e4', errorFg: '#c62828',
    danger: '#dc3545',
    infoBg: '#e3f2fd', infoFg: '#1565c0',
    neutralBg: '#f5f5f5', neutralFg: '#616161',
  },
  font: {
    familyBase: 'Poppins',
    weight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
    size: { base: 14, h1: 40, h2: 36, h3: 27, h4: 20, h5: 16, h6: 14 },
    lineHeight: { base: 24, heading: 1.2 },
  },
  // recommended 8pt scale (unitless)
  space: { none: 0, xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },
  size: {
    containerMax: 1140, screenMargin: 16,
    inputHeight: 60, buttonHeight: 50, borderWidth: 2,
    touchTargetMin: 44, touchTargetComfortable: 48,
  },
  radius: { none: 0, sm: 4, md: 8, lg: 16, pill: 999 },
  breakpoint: { xs: 575, sm: 767, md: 991, lg: 1199, laptop: 1600 },
  motion: { durationBase: 300, easingBase: 'ease' },
} as const;

// unit helpers
export const px = (n: number) => `${n}px`;
export const rem = (n: number) => `${n / 16}rem`;
```

### Android (`dimens.xml` + colors)

```xml
<!-- res/values/dimens.xml — 8pt scale -->
<dimen name="space_xs">8dp</dimen>
<dimen name="space_sm">12dp</dimen>
<dimen name="space_md">16dp</dimen>
<dimen name="space_lg">24dp</dimen>
<dimen name="space_xl">32dp</dimen>
<dimen name="touch_target_min">48dp</dimen>
<dimen name="font_size_base">14sp</dimen>

<!-- res/values/colors.xml -->
<color name="primary">#FFBC8246</color>
<color name="success_fg">#FF2E7D32</color>
<color name="error_fg">#FFC62828</color>
```

### iOS (Swift constants)

```swift
enum Tokens {
    enum Space { static let xs: CGFloat = 8, sm: CGFloat = 12, md: CGFloat = 16, lg: CGFloat = 24, xl: CGFloat = 32 }
    enum Size  { static let touchTargetMin: CGFloat = 44, buttonHeight: CGFloat = 50 }
    enum Color { static let primary = UIColor(red: 0.737, green: 0.510, blue: 0.275, alpha: 1) } // #bc8246
}
```
