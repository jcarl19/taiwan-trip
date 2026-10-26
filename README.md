# Taiwan Together

Local mobile-first PWA prototype for two travelers, November 6–11, 2026.

Run `npm run dev`, then open http://localhost:5173. No dependencies or install step needed.

## Content and behavior

- Nov 6–11 imported from the provided final Markdown itineraries. Nov 9 keeps one grouped day-tour card with four stop sections. Nov 11 has 14 departure-day activities and the final 5J 313 flight schedule: 10:20 AM TPE T1 to 1:05 PM MNL T3.
- Current Taiwan date selects the Daily Guide during the trip; Trip Summary opens outside the trip. Hash links allow opening each screen directly.
- Daily cards start collapsed and allow one expanded activity. Completed cards remain faded with checkmarks; All/Completed/Unfinished filter and undo supported.
- Expenses permit multiple expanded day cards. Estimates use NT$1 = PHP1.968, for two people and PHP per person. Restaurant choice is exclusive and persisted.
- Budget is partial: Nov 6 costs and Nov 11 lunch, Grab and baggage add-on costs are excluded. Nov 7 gross planning figures retain the source's overlapping EasyCard prepaid value and fares, clearly labeled. Nov 8 row amounts total NT$1,300–2,090. Native PHP quotes and allowances on Nov 9 are preserved; TWD equivalents use the app rate. Nov 11 counts the NT$320 Airport MRT fare and one breakfast alternative: hómee KITCHEN totals NT$720–1,020; 7-Eleven totals NT$460–580. The default undecided breakfast shows the combined range NT$460–1,020. This is a range across alternatives, not two meals. The selection is saved locally and updates the guide, summary and expenses.
- Theme, lunch choice and activity progress live in browser localStorage. No cross-device sync or backend.
- Header checklist button opens a shared pre-flight list with To do / To bring starter items. Add, edit, move between sections, check/uncheck and delete are saved locally alongside activity progress. Each phone retains its own copy. Deletion has an inline confirmation; intentionally deleted starter items do not return on reload.
- Checklist rows can be dragged to reorder within their own section, without a handle icon. On touch screens, hold for 250 ms before dragging; normal swipes still scroll. Checkboxes and form controls do not start a drag. Focus a row and press Alt+ArrowUp/ArrowDown for keyboard reordering. Order and checkmarks persist locally. SortableJS 1.15.7 (MIT) is vendored in `assets/` with its license and included in offline caching; no runtime CDN is required.
- Header To Buy icon opens a per-day shopping list. On opening, the current Taiwan date is selected (clamped to Nov 6/11 outside the trip); left/right arrows browse the six days. Each entry has a name and one estimated unit price with a PHP/TWD toggle, retaining its entered currency. Conversion uses the shared 1.968 planning rate. Each item is counted once as an additional estimate in its day's and the trip's totals and has its own Expenses table row. Buying/checking an item does not remove its estimate; editing/deleting recalculates totals. All shopping entries and bought status stay in localStorage, never the public repo. Nov 9 has no fixed pasalubong allowance; shopping estimates are added only through To Buy entries.
- Download for offline use caches the local guide and available images. External Google Maps links still need internet or separate offline maps.
- PWA works at localhost; testing on a phone using a LAN HTTP address permits the UI but service workers/install normally require HTTPS. Phone PWA testing can follow when hosted on HTTPS.

GitHub Pages hosting: public `jcarl19/taiwan-trip` repository, branch `main`, root folder. Site URL: https://jcarl19.github.io/taiwan-trip/ . Changes pushed to main are automatically published by GitHub Pages. `.nojekyll` enables serving the static app directly. Relative paths and hash navigation support the project subdirectory.

For updates: run `npm run check` and `node scripts/check-prototype.cjs`, review changes, then commit and push to `main`. Local importer scripts, image research metadata and review sheets are intentionally ignored. Uploaded app files contain no credentials or traveler document numbers.

Open the HTTPS Pages URL on each phone, download the guide for offline use, and add it to the home screen. Each origin/device has its own browser storage; localhost progress does not transfer to the deployed site.

Images: original Taipei SVG illustration plus local Wikimedia Commons photos of Longshan, CKS Memorial Hall, Rainbow Six Crossing, Red House, DON DON DONKI, Eslite's building, Taoyuan Terminal 1 and a Ximending food stall. Credits, licenses and historical photo dates where relevant appear in the expanded activity. New day photos include Qingtiangang, Shilin, Tianhou Temple, Nishi Honganji, Cixian Temple, Tiaoshi, Yehliu, Shifen and Jiufen. All photos are included in the offline download. Full provenance is in `data/photos.json`.

Source itinerary travel details and unconfirmed arrangements were retained, not independently verified. The prototype follows the chat's UI decisions over the Markdown's older interactive-control specification.

Nov 10 follows the final zoo / round-trip gondola / Meow Chan / Xinyi / Raohe itinerary (17 activities). No Observatory admission. NT$3,740 for two uses the agreed 1.968 planning rate: PHP7,360.32 total, PHP3,680.16/person (rounded in UI). Source PHP figures at 1.85 were replaced by the app currency calculations. Gondola passes are counted once. Restaurant window seating and operating conditions remain unconfirmed. Destination photos are local, attributed, and included in the offline download.
