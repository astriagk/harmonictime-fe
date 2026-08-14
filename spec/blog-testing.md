# Blog — Test Script

Testing the blog from the UI. One post, taken through the whole flow, then the
checks that catch things which fail quietly.

API contract: [blog-frontend-usage.md](blog-frontend-usage.md).

---

## 0. Before you start

```bash
npm start           # http://localhost:4200
```

- Log in as a user holding role **1** (admin).
- Have on disk: a JPG/PNG **under 5 MB** (the cover), a second one (the
  in-article image), plus an **over 5 MB** file and a **.gif** to test the
  guards.
- Keep DevTools open on the Network tab.

---

## 1. Create a post

**Admin → Add Blog Post** (`/admin/blogs/new`).

### Article

**Title**
```
How To Spot A Fake Submariner
```
The URL preview underneath should fill in as you type:
`/pages/blog-details/how-to-spot-a-fake-submariner`. Leave the slug alone.

**Excerpt**
```
Five details that separate a genuine Rolex Submariner from a convincing replica — and the one most fakes still get wrong.
```
The counter should read about `118 / 400`.

### Body — three sections

The article is built from sections, each some text plus an optional image
shown beneath it. Build three so ordering and images can both be checked.

**Section 1** — leave the sub-heading blank.

| Type this | Then |
|---|---|
| `The cyclops lens is the first tell. On a genuine Submariner it magnifies the date 2.5x; most replicas manage 1.5x at best.` | select `2.5x` → **B**; select `1.5x` → *I* |
| `Read our authentication guide.` | select `authentication guide` → **link** → `https://krono2.com` |

Leave Section 1's image empty — a section without one must render as plain text.

**Section 2** — click **Add another section**.

- Sub-heading: `The dial`
- Text:
  | Type this | Then |
  |---|---|
  | `Look at the printing under a loupe.` | leave as normal text |
  | `Crisp, raised lume plots` ⏎ `No bleed at the edges` ⏎ `Even spacing on the chapter ring` | select all three → **bulleted list** |
- Image: upload your first file. Caption: `The dial under 10x magnification`

**Section 3** — add another.

- Sub-heading: `Serial numbers`
- Text:
  | Type this | Then |
  |---|---|
  | `Check the rehaut engraving, then cross-reference the card.` | leave as normal |
  | `If the seller will not photograph the movement, walk away.` | **blockquote** |
- Image: upload your second file. No caption.

Then check the section controls:
- **↑ / ↓** reorder — move Section 3 above Section 2 and back.
- **🗑** removes a section; on the last remaining one it must be disabled.
- The editor toolbar has **no image button** — images are a section field.

> **Check the upload.** In the Network tab each section image must POST to
> `/api/uploads/image` and come back as an `https://…` URL. The request body
> sent on save must contain those URLs under `Sections[].Image` — never a
> `data:image/…` blob.

### Organise

| Field | Value |
|---|---|
| Category | `Authentication` |
| Author | prefilled — leave it |
| Tags | pick `rolex`, then `authentication` |

Each tag becomes a chip and disappears from the dropdown. Click a chip's **×**
— it should return to the list.

### Cover image

**Cover** → *Choose Image* → your under-5 MB file. A preview appears. This is
the grid thumbnail and the article's hero — it is the only image that is not
part of a section.

Then the guards:
- the **over-5 MB** file → *"Image is too large — 5 MB maximum"*, and **no**
  upload request fires
- the **.gif** → *"Only JPG and PNG images are allowed"*

### Publish

Leave **Publish** and **SEO** collapsed. Press **Publish**.

Expected: it saves, you land on `/admin/blogs`, and the post appears with a
green **Published** pill.

---

## 2. Checks worth doing deliberately

**a) Required fields hidden in a collapsed section**
New post, fill in nothing, press **Publish**.
→ Red text under Title / Excerpt / Content / Category / Cover, *"Please fix the
highlighted fields."* in the sticky bar, and Publish/SEO auto-open if either
holds an error.

**b) A draft stays private**
New post titled `Unfinished Thoughts On Patina`, fill the required fields, then
**Save Draft**.
→ You stay on the page, status reads *Draft*, and the Content is replaced with
the server's sanitised version.
→ `/pages/blog-3-col` must **not** show it.

**c) Scheduling**
Edit that draft → open **Publish** → tick *Schedule for later* → pick a date
next year → **Publish**.
→ Published in admin, but still absent from `/pages/blog-3-col`.

**d) The title must not drag the slug**
Edit the Submariner post, change the title to `How To Spot A Fake Sub`.
→ The slug stays `how-to-spot-a-fake-submariner`. Now click **Edit** beside the
URL and change it yourself → the amber "breaks the existing URL" warning shows.

**e) Section order and images survive a round trip**
Reopen the published post for editing.
→ All three sections come back in order, with their headings, text, images and
caption intact. Reorder two, save, reopen → the new order persisted.

**f) Pagination is server-side**
Create 7 posts so the grid overflows its 6 per page.
→ `/pages/blog-3-col` shows 6 with a pager, and page 2 sends `?page=2`.

**g) Archive gives 410, not 404**
`/admin/blogs` → archive the Submariner post → confirm in the modal.
→ It moves to the **Archived** tab, disappears from `/pages/blog-3-col`, and its
URL reads **"This Article Has Been Removed"**.

**h) The article looks like an article**
Open the published post.
→ Hero image, then Section 1's text, then Section 2's sub-heading, text and
its full-width image with the caption under it, then Section 3. **Each image
sits under the text it belongs to** — not bunched at the top.
→ Sub-headings, both lists, the blockquote and the link must be **styled**.
Bare browser defaults mean the list rule in
[blog-details-area.component.scss](../src/app/shared/components/blogs/blog-details-area/blog-details-area.component.scss)
is not applying.

**i) Only admins see it**
Log in as a buyer → no blog entries in the Admin dropdown, desktop or mobile.

**j) API down**
Stop the backend, open `/admin/blogs` and `/pages/blog-3-col`.
→ Empty state plus a toast. Not a blank page, not a console error.

---

## 3. Clean up

Archive each test post from `/admin/blogs` — the trash icon on each row. They
move to the **Archived** tab and drop off the public site.
