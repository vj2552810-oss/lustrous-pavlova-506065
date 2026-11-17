/**
 * Minimal structural typings for the parts of the Google Maps JavaScript API this
 * project uses. Kept local so no extra dependency is required.
 */
declare namespace google {
  namespace maps {
    class Map {
      constructor(el: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
    }
    class LatLngBounds {
      constructor();
      extend(latLng: LatLngLiteral): void;
    }
    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      styles?: unknown[];
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      clickableIcons?: boolean;
    }
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(event: string, handler: () => void): void;
      setMap(map: Map | null): void;
      setIcon(icon: unknown): void;
    }
    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map | null;
      title?: string;
      icon?: unknown;
      label?: string | { text: string; color?: string; fontSize?: string; fontWeight?: string };
      zIndex?: number;
    }
    class InfoWindow {
      constructor(opts?: { content?: string | Node; disableAutoPan?: boolean });
      open(opts: { map: Map; anchor: Marker }): void;
      close(): void;
      setContent(content: string | Node): void;
    }
    namespace event {
      function addListener(instance: unknown, event: string, handler: () => void): unknown;
      function clearInstanceListeners(instance: unknown): void;
    }
  }
}

interface Window {
  google?: typeof google;
  gm_authFailure?: () => void;
}
