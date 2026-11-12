# The Poster Room

An offline, dependency-free cinema-artwork archive. Thirty source posters are paired with original fictional story concepts inspired by the artwork. These are **not official film plots, release information, or verified film descriptions**.

## Open the collection

Double-click `index.html`, or open it in a current Chrome, Edge, Firefox, or Safari browser. Keep the folder intact: the site uses relative file paths and works through `file://` without a server, installation, internet access, external fonts, or CDNs.

- **Discover a story:** hover over a poster with a mouse. Use **Read story** to pin it open, or tap that button on a touchscreen. **Show artwork** turns it back.
- **Keyboard:** Tab to a control and press Enter or Space. A revealed story is a focusable, scrollable region; Shift+Tab from its Read story control reaches it. Focusing a hovered story keeps it open when the mouse leaves.
- **Explore:** search titles, genres, and synopses; choose a genre to combine filters. Reset returns the complete collection.
- **Full poster:** a separate control opens the untouched full-resolution artwork. Previous/Next and Left/Right arrows navigate the current filtered results, wrapping at the ends. Escape or Close returns focus to the opener. The modal keeps background controls inert.
- **Save story:** downloads an individual UTF-8 `.txt`. Local Blob downloads avoid Chromium's `file://` download-link limitation. The generated text is verified byte-for-byte against the supplied description files.
- **Motion:** the half-turn animation is removed when the browser/OS requests reduced motion.

## Files

- `index.html`, `styles.css`, `app.js`: interface and behavior.
- `catalog.js`: the local `window.POSTERS` array loaded before the app. This avoids fetch/CORS issues when opening files directly.
- `catalog.json`: readable source catalog; not fetched by the site.
- `assets/`: original JPGs, retained without modification.
- `thumbs/`: efficient grid images with matching source filenames.
- `descriptions/`: individual original story `.txt` files.
- `manifest.json`: original asset inventory and integrity metadata.
- `tests/`: dependency-free automated tests and browser screenshots.

The data contract is `{index,id,name,title,genre,visualAnalysis,synopsis,image,thumbnail,descriptionFile}`. Displayed catalog strings are inserted as text, not HTML. Titles/genres are editorial interpretations of the provided artwork, not assertions of real film metadata.

## Run the tests

Requires Node.js 22+ with its built-in test runner, fetch, and WebSocket, plus an installed Chromium-based browser. No npm install or browser download is needed.

```bash
node --test tests/*.test.cjs
```

On the build machine the test runner uses the installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. On another machine, set `CHROME_PATH` to the browser executable first. `TMPDIR` may point to a scratch folder for the temporary isolated browser profile.

The real browser suite opens the actual `index.html` via `file://`, reads the complete real catalog, renders all 30 posters, and checks:

- Four desktop columns; two at 600px; one at 360px; no narrow-screen horizontal overflow.
- Every thumbnail and full-resolution original decodes in Chrome.
- Search, real genres, combined filters, empty state, and reset.
- Enter/Space flip, actual mouse hover half-turn, hidden-face accessibility, and focus-pinned stories.
- Full-image modal, original resolution, Previous/Next wrapping, filtered navigation, arrow keys, Escape, native dialog focus containment, and opener focus restoration.
- Every original description exists and matches its synopsis; actual browser download reproduces a supplied `.txt` exactly.
- Actual emulated touch events for flip, return, open, and close; reduced-motion handling; story scrolling.

Screenshots are regenerated at `tests/desktop.png`, `tests/mobile.png`, `tests/mobile-story.png`, and `tests/modal.png`. These are real Chrome captures. `tests/TDD.md` records the observed red/green slices.

## Boundaries

This is a local static site, not a published service. Browser automated checks were run in the installed Windows Chrome; the other browsers above are supported by the standards used but were not independently exercised during this build. No analytics, login, remote API, storage, or tracking is included.
