# Taiwan Together

Local mobile-first PWA prototype for two travelers, November 6–11, 2026.

Run `npm run dev`, then open http://localhost:5173. No dependencies or install step needed.

## Content and behavior

- Nov 6 and Nov 7 imported from the provided final Markdown itineraries; Nov 8–11 explicitly pending.
- Current Taiwan date selects the Daily Guide during the trip; Trip Summary opens outside the trip. Hash links allow opening each screen directly.
- Daily cards start collapsed and allow one expanded activity. Completed cards remain faded with checkmarks; All/Completed/Unfinished filter and undo supported.
- Expenses permit multiple expanded day cards. Estimates use NT$1 = PHP1.968, for two people and PHP per person. Restaurant choice is exclusive and persisted.
- Budget is partial: Nov 6 has no estimates supplied; Nov 8–11 not supplied. Nov 7 gross planning figures retain the source's overlapping EasyCard prepaid value and fares, clearly labeled.
- Theme, lunch choice and activity progress live in browser localStorage. No cross-device sync or backend.
- Header checklist button opens a shared pre-flight list with To do / To bring starter items. Add, edit, move between sections, check/uncheck and delete are saved locally alongside activity progress. Each phone retains its own copy. Deletion has an inline confirmation; intentionally deleted starter items do not return on reload.
- Download for offline use caches the local guide and available images. External Google Maps links still need internet or separate offline maps.
- PWA works at localhost; testing on a phone using a LAN HTTP address permits the UI but service workers/install normally require HTTPS. Phone PWA testing can follow when hosted on HTTPS.

GitHub Pages hosting: public `jcarl19/taiwan-trip` repository, branch `main`, root folder. Site URL: https://jcarl19.github.io/taiwan-trip/ . Changes pushed to main are automatically published by GitHub Pages. `.nojekyll` enables serving the static app directly. Relative paths and hash navigation support the project subdirectory.

For updates: run `npm run check` and `node scripts/check-prototype.cjs`, review changes, then commit and push to `main`. Local importer scripts, image research metadata and review sheets are intentionally ignored. Uploaded app files contain no credentials or traveler document numbers.

Open the HTTPS Pages URL on each phone, download the guide for offline use, and add it to the home screen. Each origin/device has its own browser storage; localhost progress does not transfer to the deployed site.

Images: original Taipei SVG illustration plus local Wikimedia Commons photos of Longshan, CKS Memorial Hall, Rainbow Six Crossing, Red House, DON DON DONKI, Eslite's building, Taoyuan Terminal 1 and a Ximending food stall. Credits, licenses and historical photo dates where relevant appear in the expanded activity. New day photos include Qingtiangang, Shilin, Tianhou Temple, Nishi Honganji, Cixian Temple, Tiaoshi, Yehliu, Shifen and Jiufen. All photos are included in the offline download. Full provenance is in `data/photos.json`.

Source itinerary travel details and unconfirmed arrangements were retained, not independently verified. The prototype follows the chat's UI decisions over the Markdown's older interactive-control specification.
