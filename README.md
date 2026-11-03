# Open Map Surface

**Live:** https://lpfauecx.github.io/open-map-surface/ — open it, then use *Install as an app* (Edge/Chrome) for a desktop icon.

A free, open-source, shareable web map: `index.html` plus a `vendor/` folder of pinned libraries. No API keys, no backend, no build step, no CDN calls. Installs as a desktop or phone app with its own icon.

Built on [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://www.openstreetmap.org), with
[Leaflet-Geoman](https://geoman.io) for drawing, [Turf](https://turfjs.org) for measurement and
[lz-string](https://github.com/pieroxy/lz-string) for share links.

## What it does

- **Basemaps (keyless):** OpenStreetMap, Esri light and dark canvases, Esri World Street Map, Esri World Imagery (satellite), Esri Topo, OpenTopoMap, USGS Topo and USGS Imagery+Topo. (Carto's basemaps were dropped in Nov 2026 when they began requiring an API key.)
- **Overlays:** place labels and boundaries, roads, hillshade, FEMA flood hazard zones (US, WMS).
- **Draw:** pins, lines, areas, rectangles, radius circles. Edit vertices, drag shapes, erase. Eight colors.
- **Measure:** every shape reports its size in site-work units. Areas in acres and hectares (plus km² when large), lengths in km and miles, pins as decimal degrees.
- **Import:** GeoJSON, KML and CSV (needs `lat`/`lon`-style columns). Drag a file onto the page or click the drop zone. Imports over 400 features load as a clustered read-only layer.
- **Portfolio layers:** an imported GeoJSON whose features carry a `stage` property (`closed`, `pending`, `hard`, `dd`, `loi`, `lease`, `option`, `future`) is colored by stage with a legend, and each feature opens a deal card instead of a raw attribute table. Recognized fields: `name`, `id`, `lead`, `seller`, `address`, `city`, `county`, `state`, `acres`, `mw`, `price`, `priceNote`, `emd`, `emdNote`, `loi`, `psa`, `ipEnd`, `excl`, `closing`, `nextDate`, `nextLabel`, `status`, `next`, `notesDate`. Polygons with `approx: true` draw dashed. Keep such files out of a public repository: this repo ignores a `private/` folder for exactly that purpose, and the map never stores imported data anywhere but your own browser or a share link you create.
- **Export:** GeoJSON, KML (circles become polygons) and CSV of points. Copy GeoJSON to the clipboard.
- **Share:** "Copy share link" compresses the view, basemap, overlays and every drawn feature into the URL. Whoever opens the link sees the same map.
- **Search:** places and addresses via the public Nominatim service, or paste `lat, lon` to jump there.
- **Also:** right-click for coordinates and a quick pin, locate me, fullscreen, zoom-to-everything, light/dark theme, autosave in the browser.

Nothing you draw leaves your browser. The only network traffic is map tiles and, unless privacy mode is on, place search.

## Run it

Open `index.html` in any browser. That is it.

For a local server (needed only for some browsers' file-drop behavior):

```bash
npx -y http-server@14.1.1 . -p 8765
```

## Install it as an app

The folder is a Progressive Web App: a manifest, an icon set under `icons/` and a service worker (`sw.js`) that caches the page and libraries so the installed app opens offline (tiles still need a connection).

Browsers only allow installing from HTTPS or `localhost`, never from a file opened off disk. So:

1. Host the folder (see **Share it** below), or run the local server command above.
2. Open the page in Edge or Chrome. Click **Install as an app** in the Share section of the panel, or the install icon at the right end of the address bar.
3. The app appears in the Start menu and taskbar with the green pin icon and opens in its own window.

On iPhone and iPad: Safari → Share → **Add to Home Screen**. On Android Chrome: menu → **Install app**.

Installed copies update themselves: when you publish a new `index.html`, bump `VERSION` in `sw.js` and users see "A new version is ready" on their next open. The app also registers as a handler for `.geojson`, `.kml` and `.csv` files, so **Open with → Map Surface** works once installed, and the Start menu shortcut **New blank map** opens without the saved drawings.

## Share it

Two ways:

1. **Share link.** Click *Copy share link*. The whole map is in the URL. Works from any host, including a file opened from disk, as long as the recipient can open the same `index.html` (for example, the GitHub Pages URL below).
2. **Host it.** This repository is published with GitHub Pages from `main` at the Live link above; every push to `main` redeploys within a minute or two. Any static host works too: Netlify, Cloudflare Pages, S3, an internal IIS share.

## Customize

Everything is in `index.html`:

- `BASEMAPS` and `OVERLAYS` near the top of the script: add any XYZ tile URL or WMS endpoint.
- `COLORS`: the swatch palette.
- `MAX_EDITABLE`: how many imported features stay individually editable before switching to a read-only clustered layer.
- `SAMPLE`: the demo shapes shown on first load. Replace with your own GeoJSON or set `features` to an empty collection.
- `icons/icon.svg`: the app icon. Regenerate the PNGs from it at 192, 512 (and a 512 with 10% padding for the maskable one) after editing.
- `manifest.webmanifest`: app name, colors and shortcuts. `sw.js`: bump `VERSION` whenever you ship a change.
- The `:root` block in `<style>`: colors, fonts, radius.

## Usage notes on the free services

- OpenStreetMap, OpenTopoMap and OpenRailwayMap tiles are community run. Fine for a team tool; not for high-traffic public sites (use a paid tile host or self-host tiles then).
- Nominatim allows about one request per second. The search box debounces for you.
- Esri's public tile services and FEMA's NFHL WMS are free to view with attribution, which the map shows.

## Security and privacy

What the page does and does not do:

- **No server, no accounts.** Drawings autosave to this browser's local storage only, unencrypted. Anyone who can log in to your Windows profile can read them.
- **No third-party scripts at runtime.** Leaflet, Geoman, MarkerCluster, Turf and lz-string are bundled under `vendor/` at pinned versions, so a CDN outage or compromise cannot touch the page. System fonts only.
- **Share links are compressed, not encrypted.** Anyone holding a link can decode every shape, name and note. Treat a link like the GeoJSON file itself. The data sits in the URL fragment, which browsers never send to servers.
- **Tile providers see what you look at.** Every pan and zoom requests tiles by coordinate from the basemap provider (OSM, Carto, Esri, USGS, FEMA, OpenRailwayMap) together with your IP address. Tile requests carry only the site origin as Referer (OpenStreetMap requires one and blocks requests without it); the page path and the share-link fragment are never sent. For confidential work, self-host tiles or route them through a proxy.
- **Privacy mode** (Share section) turns off place search (Nominatim) and the Google Maps link, so the only outbound traffic is tiles.
- **Untrusted input is sanitized.** Names, notes and imported attributes are HTML-escaped; colors must be a 6-digit hex; share links are rejected above 250 KB or 20,000 features; map views and basemap keys are validated before use.

Reproduce the vendored files from their upstream releases:

| File | Source | SHA-384 |
|---|---|---|
| vendor/leaflet/leaflet.min.js | leaflet 1.9.4 | NElt3Op+9NBMCYaef5HxeJmU4Xeard/Lku8ek6hoPTvYkQPh3zLIrJP7KiRocsxO |
| vendor/geoman/leaflet-geoman.min.js | @geoman-io/leaflet-geoman-free 2.17.0 | 7CTDkMmRSjHvjl8ftuwzLq/ogrEnsuNoi3825eH06KuMNWWwcfaNIHol5+I3EAzO |
| vendor/markercluster/leaflet.markercluster.js | leaflet.markercluster 1.5.3 | eXVCORTRlv4FUUgS/xmOyr66XBVraen8ATNLMESp92FKXLAMiKkerixTiBvXriZr |
| vendor/turf/turf.min.js | @turf/turf 6.5.0 | 82q0nm29xZzIo5BMtDYnh2/NxeO6FoaK1S/0nF84w3cEsqbBfun3JdMyDVYWfVY5 |
| vendor/lz-string/lz-string.min.js | lz-string 1.5.0 | 0d+Gr7vM4Drod8E3hXKgciWJSWbjD/opKLLygI9ktiWbuvlDwQLzU46wJ9s5gsp7 |

Verify with `openssl dgst -sha384 -binary FILE | openssl base64 -A`.

## License

MIT. See `LICENSE`.
