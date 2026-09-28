import { layers, namedFlavor } from '@protomaps/basemaps';
import * as maplibregl from 'maplibre-gl';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Protocol } from 'pmtiles';
import mapLibreStyles from 'maplibre-gl/dist/maplibre-gl.css?inline';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

const pmtilesProtocol = new Protocol();
maplibregl.setWorkerUrl(mapLibreWorkerUrl);
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

const MAP_BOUNDS: maplibregl.LngLatBoundsLike = [
	[-43.235798, -22.982222],
	[-43.231003, -22.9773],
];

@customElement('puc-map')
export class PucMap extends LitElement {
	static styles = [
		unsafeCSS(mapLibreStyles),
		css`
		:host {
			width: 100%;
			height: 100dvh;
			min-height: 320px;
			box-sizing: border-box;
			display: grid;
			place-items: center;
			padding: 24px;
			background: #eef2f6;
			--puc-map-size: min(78vw, 78vh, 760px);
		}

		#map {
			width: var(--puc-map-size);
			height: var(--puc-map-size);
			border-radius: 16px;
			box-shadow: 0 16px 48px rgb(27 39 51 / 18%);
		}
	`,
	];

	private map?: maplibregl.Map;

	render() {
		return html`<div id="map" aria-label="Map of PUC-Rio"></div>`;
	}

	firstUpdated() {
		const archiveUrl = `${window.location.origin}${import.meta.env.BASE_URL}puc-rio.pmtiles`;

		this.map = new maplibregl.Map({
			container: this.renderRoot.querySelector('#map') as HTMLElement,
			bounds: MAP_BOUNDS,
			fitBoundsOptions: { padding: 36, maxZoom: 17 },
			minZoom: 16,
			maxZoom: 20,
			maxBounds: MAP_BOUNDS,
			style: {
				version: 8,
				glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
				sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
				sources: {
					basemap: {
						type: 'vector',
						url: `pmtiles://${archiveUrl}`,
						attribution:
							'<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
					},
				},
				layers: layers(
					'basemap',
					{ ...namedFlavor('light'), pois: undefined },
					{ lang: 'pt' },
				),
			},
		});

		this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.map?.remove();
		this.map = undefined;
	}
}
