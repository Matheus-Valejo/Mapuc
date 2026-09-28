# Mapuc

The map square scales to the viewport by default (up to 760 px). Set `--puc-map-size` on the component to choose another size:

```html
<puc-map style="--puc-map-size: 600px"></puc-map>
```

In order to use the map, the following imports must be made:

```html
<script
  type="module"
  src="https://mapas.mapuc.com/mapuc.js"
></script>

<puc-map
  archive-url="https://mapas.mapuc.com/puc-rio.pmtiles"
  style="--puc-map-size: 600px"
></puc-map>
```

## Build and host the web component

Run `pnpm build`. The standalone component is written to `dist/embed/`. Publish the contents of that directory at the root of `https://pucmap.com/`, preserving the `assets/` directory. It contains `mapuc.js`, the MapLibre worker, and `puc-rio.pmtiles`.

The host must allow cross-origin requests to these files. The PMTiles file must support HTTP byte-range requests so the browser can read individual map tiles.

The normal `dist/` output remains the demo page; `dist/embed/` contains the files clients load with the snippet above.
