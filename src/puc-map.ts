import { layers, namedFlavor } from '@protomaps/basemaps';
import * as maplibregl from 'maplibre-gl';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Protocol } from 'pmtiles';
import mapLibreStyles from 'maplibre-gl/dist/maplibre-gl.css?inline';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import pinSvg from './assets/pin.svg?raw';

const pmtilesProtocol = new Protocol();
maplibregl.setWorkerUrl(mapLibreWorkerUrl);
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

const MAP_BOUNDS: maplibregl.LngLatBoundsLike = [
	[-43.235798, -22.982222],
	[-43.231003, -22.9773],
];

type PinProps = {
	tipo: string;
	predio: string;
	nome: string;
	descricao: string;
	imagem?: string;
	nivel?: number;
};

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

		.map-frame {
			position: relative;
			width: var(--puc-map-size);
			height: var(--puc-map-size);
		}

		#map {
			width: 100%;
			height: 100%;
			border-radius: 16px;
			box-shadow: 0 16px 48px rgb(27 39 51 / 18%);
		}
		.pin { line-height: 0; cursor: pointer; }
		.pin svg {
			display: block;
			stroke: #000000;
			fill: #FF0000;
		}

		.search {
			position: absolute;
			top: 16px;
			left: 16px;
			z-index: 2;
			display: flex;
			align-items: center;
			width: 48px;
			height: 48px;
			max-width: calc(100% - 72px);
			overflow: hidden;
			border-radius: 24px;
			background: white;
			color: #243447;
			box-shadow: 0 3px 14px rgb(27 39 51 / 18%);
			transition: width 280ms cubic-bezier(0.22, 1, 0.36, 1);
		}

		.search.open { width: 320px; }
		.search:focus-within { outline: 2px solid #507c9b; outline-offset: 3px; }

		.search-button {
			flex: 0 0 48px;
			width: 48px;
			height: 48px;
			display: grid;
			place-items: center;
			padding: 0;
			border: 0;
			border-radius: 50%;
			background: transparent;
			color: inherit;
			cursor: pointer;
		}

		.search-button:hover { background: #f0f4f7; }
		.search-button:focus-visible { outline: 0; }
		.search-button svg { width: 21px; height: 21px; }

		.search-input {
			width: 100%;
			min-width: 0;
			padding: 0 16px 0 2px;
			border: 0;
			outline: 0;
			background: transparent;
			color: inherit;
			font: 16px/1.4 system-ui, sans-serif;
			opacity: 0;
			visibility: hidden;
			transition: opacity 180ms ease;
		}

		.search.open .search-input { opacity: 1; visibility: visible; }
		.search-input::placeholder { color: #687787; }

		.search-results {
			position: absolute;
			top: 72px;
			left: 16px;
			z-index: 2;
			box-sizing: border-box;
			width: 320px;
			max-width: calc(100% - 72px);
			margin: 0;
			padding: 8px 0;
			list-style: none;
			border-radius: 20px;
			background: white;
			color: #243447;
			box-shadow: 0 3px 14px rgb(27 39 51 / 18%);
			font: 15px/1.4 system-ui, sans-serif;
		}

		.search-results li {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 12px 16px;
		}

		.search-results svg { width: 24px; height: 24px; flex-shrink: 0; }

		.maplibregl-ctrl-group:has(.maplibregl-ctrl-geolocate) {
			border-radius: 50%;
			box-shadow: 0 3px 14px rgb(27 39 51 / 18%);
		}

		.maplibregl-ctrl-group button.maplibregl-ctrl-geolocate {
			width: 44px;
			height: 44px;
			border-radius: 50%;
		}

		.maplibregl-ctrl-geolocate:focus-visible {
			outline: 2px solid #507c9b;
			outline-offset: 3px;
		}

		.location-status {
			position: absolute;
			left: 12px;
			right: 12px;
			bottom: 36px;
			z-index: 2;
			margin: 0;
			padding: 10px 12px;
			border-radius: 12px;
			background: white;
			color: #243447;
			box-shadow: 0 3px 14px rgb(27 39 51 / 18%);
			font: 14px/1.4 system-ui, sans-serif;
			pointer-events: none;
		}

		.location-status:empty { display: none; }

		@media (prefers-reduced-motion: reduce) {
			.search, .search-input { transition: none; }
		}
	`,
	];

	private map?: maplibregl.Map;

	@state()
	private searchOpen = false;

	@state()
	private searchQuery = '';

	@state()
	private locationStatus = '';

	connectedCallback() {
		super.connectedCallback();
		this.ownerDocument.addEventListener('pointerdown', this.handleOutsidePointer, true);
	}

	private handleOutsidePointer = (event: PointerEvent) => {
		const search = this.renderRoot.querySelector('.search');
		const results = this.renderRoot.querySelector('.search-results');
		const path = event.composedPath();
		if (this.searchOpen && search && !path.includes(search) && (!results || !path.includes(results))) {
			this.searchOpen = false;
		}
	};

	private async openSearch() {
		if (!this.searchOpen) this.searchQuery = '';
		this.searchOpen = true;
		await this.updateComplete;
		this.renderRoot.querySelector<HTMLInputElement>('.search-input')?.focus();
	}

	private handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			this.searchOpen = false;
			this.renderRoot.querySelector<HTMLButtonElement>('.search-button')?.focus();
		}
	}

	@property({ attribute: 'archive-url' })
	archiveUrl = '';

	@property({ attribute: 'pins-url' })
	pinsUrl = '';

	private markers: maplibregl.Marker[] = [];

	private async loadPins(url: string) {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`pins: ${res.status} ${url}`);
		const data = (await res.json()) as GeoJSON.FeatureCollection<GeoJSON.Point, PinProps>;

		for (const feature of data.features) {
			if (feature.geometry?.type !== 'Point' || !this.map) continue;
			const [lng, lat] = feature.geometry.coordinates;
			const { nome, descricao } = feature.properties ?? ({} as PinProps);

			const el = document.createElement('div');
			el.className = 'pin';
			el.title = nome ?? '';
			el.innerHTML = el.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        ${pinSvg}
        <span>${nome}</span>
    	</div>
	`;

			const content = document.createElement('div');
			const title = document.createElement('strong');
			title.textContent = nome ?? '';
			content.append(title);
			if (descricao && descricao !== nome) {
				const desc = document.createElement('p');
				desc.textContent = descricao;
				content.append(desc);
			}

			this.markers.push(
				new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, 1] })
					.setLngLat([lng, lat])
					.setPopup(new maplibregl.Popup({ offset: 26, closeButton: false }).setDOMContent(content))
					.addTo(this.map),
			);
		}
	}

	render() {
		const names = this.searchQuery.length > 0
			? ['Cardeal Leme']
			: ['Cardeal Leme', 'Entrada do Cardeal Leme', 'Salas do Cardeal Leme'];
		return html`
			<div class="map-frame">
				<div id="map" aria-label="Map of PUC-Rio"></div>
				<div class="search ${this.searchOpen ? 'open' : ''}" role="search"
					@keydown=${this.handleSearchKeydown}>
					<button class="search-button" type="button" aria-label="Abrir pesquisa"
						aria-expanded=${this.searchOpen} aria-controls="map-search"
						@click=${this.openSearch}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
							stroke-width="2" stroke-linecap="round" aria-hidden="true">
							<circle cx="10.5" cy="10.5" r="6.5"></circle>
							<path d="m16 16 4.5 4.5"></path>
						</svg>
					</button>
					<input id="map-search" class="search-input" type="search"
						placeholder="Pesquisar no mapa" aria-label="Pesquisar no mapa"
						.value=${this.searchQuery}
						@input=${(event: Event) => { this.searchQuery = (event.target as HTMLInputElement).value; }}
						?disabled=${!this.searchOpen} />
				</div>
				${this.searchOpen ? html`
					<ul class="search-results" aria-label="Sugestões de lugares" aria-live="polite">
						${names.map(name => html`
							<li>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"></path>
									<circle cx="12" cy="10" r="3"></circle>
								</svg>
								<span>${name}</span>
							</li>
						`)}
					</ul>
				` : ''}
				<p class="location-status" role="status" aria-live="polite" aria-atomic="true">${this.locationStatus}</p>
			</div>
		`;
	}

	firstUpdated() {
		const archiveBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
		const archiveUrl =
			this.archiveUrl || new URL('puc-rio.pmtiles', archiveBaseUrl).toString();

		this.map = new maplibregl.Map({
			container: this.renderRoot.querySelector('#map') as HTMLElement,
			bounds: MAP_BOUNDS,
			fitBoundsOptions: { padding: 36, maxZoom: 17 },
			minZoom: 16,
			maxZoom: 20,
			maxBounds: MAP_BOUNDS,
			locale: {
				'GeolocateControl.FindMyLocation': 'Mostrar minha localização',
				'GeolocateControl.LocationNotAvailable': 'Localização indisponível: verifique a permissão do navegador',
			},
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

		const pinsUrl = this.pinsUrl || new URL('pins.geojson', archiveBaseUrl).toString();
		this.loadPins(pinsUrl).catch((err) => console.error(err));
		this.map.addControl(new maplibregl.NavigationControl(), 'top-right');

		// The browser is asked for permission only when the user activates this control.
		const geolocate = new maplibregl.GeolocateControl({
			positionOptions: { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
			trackUserLocation: true,
			showUserLocation: true,
			showAccuracyCircle: true,
			fitBoundsOptions: { maxZoom: 18, duration: 600 },
		});
		geolocate.on('trackuserlocationstart', () => {
			this.locationStatus = 'Buscando sua localização… Autorize o acesso no navegador.';
		});
		geolocate.on('geolocate', () => {
			this.locationStatus = '';
		});
		geolocate.on('outofmaxbounds', () => {
			this.locationStatus = 'Sua localização está fora da área deste mapa da PUC-Rio.';
		});
		geolocate.on('error', (event) => {
			this.locationStatus = event.code === 1
				? 'Acesso à localização negado. Permita o acesso nas configurações do site e recarregue a página.'
				: event.code === 3
					? 'A localização está demorando. Verifique o GPS e a conexão; continuaremos tentando.'
					: 'Não foi possível obter sua localização. Verifique se a localização do dispositivo está ativada.';
		});
		geolocate.on('trackuserlocationend', () => {
			this.locationStatus = '';
		});
		geolocate.on('userlocationfocus', () => {
			this.locationStatus = '';
		});
		this.map.addControl(geolocate, 'top-right');
		if (!window.isSecureContext || !navigator.geolocation) {
			this.locationStatus = 'Localização indisponível. Abra o mapa em HTTPS e use um navegador com suporte à localização.';
		}
	}


	disconnectedCallback() {
		this.ownerDocument.removeEventListener('pointerdown', this.handleOutsidePointer, true);
		super.disconnectedCallback();
		this.markers.forEach((m) => m.remove());
		this.markers = [];
		this.map?.remove();
		this.map = undefined;
	}
}
