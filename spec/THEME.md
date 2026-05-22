# Harmonic Time — Theme & Style Reference

**Read this before creating or restyling any component, page, or style.**
Every new UI element must reuse the tokens, classes, and patterns below so the
app stays visually consistent. Do **not** invent new colors, fonts, button
shapes, or spacing — pull from what already exists here.

> Base theme: **Outstock** (Theme_Pure) — clean, minimal eCommerce template.
> Global styles live in `src/assets/scss/`, entry point `main.scss`, tokens in
> `_variables.scss`.

---

## 1. Golden rules

1. **Never hardcode a color — always use the SCSS variables in section 2.**
   This is what makes a theme switch a one-file change. `src/assets/scss` is on
   the Sass `includePaths` (configured in `angular.json` →
   `stylePreprocessorOptions`), so **any** component `.scss` can simply:
   ```scss
   @import 'variables';
   .thing { color: $theme-color; }
   ```
   No hex literals for palette colors. If you reach for `#…`, stop and use the
   matching token instead (e.g. `$theme-color`, `$heading-color`,
   `$body-text-color`, `$white`, `$black-2`, `$border`).
2. **Reuse global classes before writing CSS.** Buttons → `.os-btn*`, links,
   ratings, tables, modals, empty states all already exist (sections 4–6).
   Most new screens need little to no new CSS.
3. **Font is always Poppins** (`$pop`). Don't introduce other font families.
4. **Headings use the heading scale** (section 3). Don't set arbitrary heading
   sizes.
5. **Spacing uses the helper classes** (`pt-`, `pb-`, `mb-`, `mr-`, etc. from
   `_spacing.scss`) and Bootstrap utilities — avoid inline `style="margin…"`.
6. **Primary accent = `$theme-color` (`#bc8246`, warm gold).** Use it for
   hovers, active states, highlights, and `<span>` accents inside buttons.
7. **Hover transitions** are global (`.3s` on most elements via `_common.scss`).
   Reuse `@include transition(.3s)` for new interactive elements.

---

## 2. Color tokens (`_variables.scss`)

| Token | Hex | Use |
|-------|-----|-----|
| `$theme-color` | `#bc8246` | **Primary accent** — hovers, active, highlights, button fills |
| `$theme-2-color` | `#8a8f6a` | Secondary accent (olive) — alt buttons/`os-btn-4` |
| `$body-text-color` | `#848b8a` | Default body / paragraph text |
| `$heading-color` | `#201f1f` | All headings |
| `$black` | `#201f1f` | Darkest text |
| `$black-2` | `#323232` | Buttons (`os-btn-black`), borders |
| `$black-3` | `#222222` | — |
| `$black-soft` | `#444` | Soft dark text |
| `$black-soft-2` | `#606060` | Soft dark text |
| `$black-soft-3` | `#757575` | Muted text |
| `$white` | `#ffffff` | Backgrounds, inverted text |
| `$grey` | `#f5f5f5` | Light section backgrounds (`grey-bg`) |
| `$grey-2` | `#e1e1e1` | Light borders |
| `$grey-3` | `#9d9d9d` | Muted icons/text |
| `$footer-bg` | `#151616` | Footer background |
| `$border` | `#ebebeb` | Default borders |
| `$border-2` | `#383838` | Dark borders |

Text selection and `::-moz-selection` are themed to `$theme-color` bg + white text — don't override.

---

## 3. Typography

- Family: `Poppins` (weights 300/400/500/600/700), loaded via Google Fonts in `_common.scss`.
- Body: `14px`, weight `normal`, `line-height: 24px`, color `$body-text-color`.
- Headings: weight `500`, color `$heading-color`, `line-height: 1.2`.

| Tag | Size |
|-----|------|
| h1 | 40px |
| h2 | 36px |
| h3 | 27px |
| h4 | 20px |
| h5 | 16px |
| h6 | 14px |

- Paragraph `<p>`: 14px, `margin-bottom: 15px`.
- Use `.uppercase` / `.capitalize` helpers for text-transform.

---

## 4. Buttons (`.os-btn` family, `_common.scss`)

Base `.os-btn`: inline-block, uppercase, `font-weight 600`, `height 50px`,
`line-height 46px`, `padding 0 42px`, `2px solid $border`, `font-size 12px`,
transparent bg. Hover fills from the top with `$theme-color` and turns text
white (animated `::after`). A `<span>` inside a button renders in `$theme-color`.

Variants:

| Class | Look |
|-------|------|
| `.os-btn` | Outline (border `$border`), gold fill on hover. Default. |
| `.os-btn os-btn-black` | **Solid dark** (`$black-2` bg, white text), gold fill on hover. Primary CTA. |
| `.os-btn os-btn-2` | Outline with `$black-2` border. |
| `.os-btn os-btn-3` | Wider padding (`0 77px`). |
| `.os-btn os-btn-white` | White outline (use on dark backgrounds). |
| `.os-btn-4` | Olive (`$theme-2-color`) fill on hover. |
| `.os-btn-5` | White text outline variant. |

**Use the existing button classes for every CTA.** For a primary action use
`os-btn os-btn-black`; for secondary use plain `os-btn`.

### Text links / inline actions
Plain links inherit color and turn `$theme-color` on hover where the parent
opts in (e.g. `.rating-left a:hover { color: $theme-color }`). For a lightweight
text action (not a full button) make an `<a class="cursor-pointer">` and give it
a hover to `$theme-color`. Example pattern already in use: the product
"Add your Review" link and the seller-orders "Add/Update Tracking" link.

---

## 5. Reusable layout & utility classes

- `.cursor-pointer` — pointer cursor (use on clickable non-links).
- `.p-relative` — `position: relative`.
- `.w-img img` / `.m-img img` — responsive images (100% / max 100%).
- `.grey-bg` — light grey section bg (`$grey`); `.white-bg` / `.bg-white` — white.
- `.text-center`, `.d-block`, `.d-flex`, `justify-content-*`, `align-items-*` — Bootstrap 5 utilities are available; prefer them for layout.
- Spacing: `pt-100`, `pb-90`, `mb-30`, `mr-20`, `ml-10`, `mt-20`, … from `_spacing.scss`. Use these instead of inline styles.
- Container max-width is `1140px` at ≥1200px.

### Empty-state pattern (use this everywhere a list can be empty)
```html
<div class="text-center pt-50">
  <h3>No &lt;Things&gt; Found</h3>
  <a class="os-btn os-btn-black mt-20 cursor-pointer">Primary Action</a>
</div>
```

### Tables
Wrap in `.white-bg.table-responsive` and use Bootstrap `.table`. Keep one logical
record per `<tr>`; stack repeated sub-items with `<span class="d-block">` inside a
single `<td>` rather than emitting multiple `<td>`s.

### Tabs
Bootstrap 5 nav-tabs (`data-bs-toggle="tab"`, `.nav-link`, `.tab-pane fade`).

---

## 6. Modals

Two patterns are in use — match the nearest existing one:

- **Bootstrap modal** (product/review): `.modal.fade` + `data-bs-toggle="modal"`
  / `data-bs-target="#id"`, dialog `.modal-dialog modal-dialog-centered`. Close
  with a `[data-bs-dismiss="modal"]` button.
- **Manual modal** (seller tracking / "add lookup"): toggled by an `*ngIf` flag,
  `.modal.fade.show` + a sibling `.modal-backdrop.fade.show`. See
  `seller/orders/orders.component.*` for the reference styles.

Modal action footers: `Cancel` = plain `os-btn`, confirm = `os-btn`; button text
reflects state ("Add"/"Update", "Save"/"Saving…").

---

## 7. Forms

- Inputs/textareas are full-width within their group; labels above the field,
  required marked with `<span class="required">*</span>`.
- Validation messages: `<span class="text-danger">…</span>`, shown after submit.
- Use Reactive Forms (`FormBuilder`) for new forms, matching existing components.

---

## 8. Feedback (toasts)

Toasts use `ngx-toastr`, configured globally (`positionClass: 'toast-top-center'`,
`timeOut: 3000`, `enableHtml: true`). Use `ToastrService`:
- `.success()` for completed actions, `.error()` for failures/removals,
  `.warning()` for soft blocks (e.g. "already in cart"). Keep messages short and
  product-named (e.g. `` `${name} added to cart` ``).

---

## 9. Icons

Font Awesome (`fas`/`fal`/`far`/`fa`) and Ionicons (`ion-*`) are loaded. Reuse the
icon set already present in similar components (e.g. `fa-star` `fas`/`fal` for
ratings, `fa-heart` for wishlist, `ion-bag`/`fa-cart-plus` for cart).

---

## 10. Checklist before committing UI work

- [ ] Colors come from `$variables` / documented tokens — no stray hex.
- [ ] Used an existing `os-btn*` class for buttons; links hover to `$theme-color`.
- [ ] Headings use the heading scale; font is Poppins.
- [ ] Spacing via helper/Bootstrap classes, not inline `style`.
- [ ] Reused the empty-state / table / modal / toast patterns above.
- [ ] Matches the look of the nearest existing screen.
