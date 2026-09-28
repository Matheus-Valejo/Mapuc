# Mapuc

The map square scales to the viewport by default (up to 760 px). Set `--puc-map-size` on the component to choose another size:

```html
<puc-map style="--puc-map-size: 600px"></puc-map>
```
The component and map files must be hosted, and in order to use them, the following imports must be made:

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
