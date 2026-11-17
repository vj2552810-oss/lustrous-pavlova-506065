"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, MapPin } from "lucide-react";
import { GOOGLE_MAPS_API_KEY, directionsUrl, isValidLatLng } from "@/lib/maps/config";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  priceLabel?: string;
  href?: string;
  /** false = approximate area reference, not a verified address */
  verified?: boolean;
  kind?: "hotel" | "area" | "destination" | "attraction";
}

interface Props {
  markers: MapMarker[];
  center?: { lat: number; lng: number } | null;
  zoom?: number;
  height?: number;
  ariaLabel: string;
  /** Shown when the Google Maps script cannot load. */
  fallbackHint?: string;
  className?: string;
}

type LoadState = "idle" | "loading" | "ready" | "failed";

const SCRIPT_ID = "pritivo-google-maps";

let loader: Promise<void> | null = null;

function loadGoogleMaps(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script error")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=marker&loading=async&v=weekly`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  }).catch((err) => {
    loader = null;
    throw err;
  });

  return loader;
}

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1b1b1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c9c4b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#141416" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3a3a3d" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#25252a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#9b968c" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#33333a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#22222a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a4638" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2c2c31" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#12161b" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5d6b73" }] },
];

const ICONS: Record<string, string> = {
  hotel: "M12 0C7.6 0 4 3.6 4 8c0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
  area: "M12 0C7.6 0 4 3.6 4 8c0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
  destination: "M12 0C7.6 0 4 3.6 4 8c0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8z",
  attraction: "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z",
};

function markerIcon(kind: string, verified: boolean) {
  const fill = verified ? "#c6a866" : "#8b8b90";
  const stroke = verified ? "#0b0b0c" : "#e6d3a3";
  return {
    path: ICONS[kind] ?? ICONS.hotel,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: stroke,
    strokeWeight: 1.5,
    scale: kind === "attraction" ? 1.1 : 1.5,
    anchor: kind === "attraction" ? undefined : { x: 12, y: 22 },
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function infoWindowHtml(marker: MapMarker) {
  const parts = [
    `<div style="font-family:Inter,Arial,sans-serif;max-width:250px;line-height:1.45">`,
    `<strong style="font-size:14px;color:#0b0b0c">${escapeHtml(marker.title)}</strong>`,
    marker.subtitle ? `<div style="font-size:12px;color:#555;margin-top:2px">${escapeHtml(marker.subtitle)}</div>` : "",
    marker.priceLabel ? `<div style="font-size:13px;color:#8f7438;font-weight:600;margin-top:6px">${escapeHtml(marker.priceLabel)}</div>` : "",
    marker.kind === "hotel" && !marker.verified
      ? `<div style="font-size:11px;color:#92400e;margin-top:6px">Approximate area — not a verified hotel address.</div>`
      : "",
    marker.kind === "attraction" ? `<div style="font-size:11px;color:#555;margin-top:6px">Nearby place data © Google</div>` : "",
    `<div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap">`,
    marker.href ? `<a href="${escapeHtml(marker.href)}" style="color:#8f7438;font-size:12px;font-weight:600;text-decoration:underline">View details</a>` : "",
    `<a href="${escapeHtml(directionsUrl({ lat: marker.lat, lng: marker.lng }))}" target="_blank" rel="noopener noreferrer" style="color:#8f7438;font-size:12px;font-weight:600;text-decoration:underline">Directions</a>`,
    `</div></div>`,
  ];
  return parts.filter(Boolean).join("");
}

export function MapCanvas({ markers, center, zoom = 13, height = 380, ariaLabel, fallbackHint, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [inView, setInView] = useState(false);

  const usable = markers.filter((m) => isValidLatLng(m.lat, m.lng));
  const payload = JSON.stringify(usable.map((m) => [m.id, m.lat, m.lng, m.title, m.subtitle, m.priceLabel, m.href, m.verified, m.kind]));

  // Only fetch the Maps SDK once the map would actually be visible.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView || !GOOGLE_MAPS_API_KEY || usable.length === 0) return;
    let cancelled = false;

    setState("loading");
    window.gm_authFailure = () => {
      setState("failed");
      setError("Google Maps rejected the API key. Check its website restrictions, billing and that the Maps JavaScript API is enabled.");
    };

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.maps) return;
        const gmaps = window.google.maps;
        const parsed: MapMarker[] = JSON.parse(payload);

        if (!mapRef.current) {
          mapRef.current = new gmaps.Map(containerRef.current, {
            center: center && isValidLatLng(center.lat, center.lng) ? center : { lat: parsed[0].lat, lng: parsed[0].lng },
            zoom,
            styles: MAP_STYLE,
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: true,
            clickableIcons: false,
          });
          infoRef.current = new gmaps.InfoWindow();
        }
        const map = mapRef.current;
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        const bounds = new gmaps.LatLngBounds();

        parsed.forEach((marker) => {
          const pin = new gmaps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map,
            title: marker.title,
            icon: markerIcon(marker.kind ?? "hotel", marker.verified !== false),
            zIndex: marker.kind === "hotel" ? 10 : 5,
          });
          pin.addListener("click", () => {
            if (!infoRef.current) return;
            infoRef.current.setContent(infoWindowHtml(marker));
            infoRef.current.open({ map, anchor: pin });
          });
          markersRef.current.push(pin);
          bounds.extend({ lat: marker.lat, lng: marker.lng });
        });

        if (parsed.length > 1) {
          map.fitBounds(bounds);
        } else {
          map.setCenter({ lat: parsed[0].lat, lng: parsed[0].lng });
          map.setZoom(zoom);
        }
        setState("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState("failed");
        setError(err.message || "Google Maps could not be loaded.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, payload, zoom]);

  const hasUnverified = usable.some((m) => m.verified === false);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`rounded-3xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 ${className}`} role="note">
        <p className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" /> Interactive map not available
        </p>
        <p className="mt-1 leading-6">
          Google Maps isn&apos;t configured on this site yet, so no map is drawn and no location is guessed.{" "}
          {fallbackHint ?? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable maps."}
        </p>
        <p className="mt-2 text-xs leading-5 text-amber-900/80">
          Hotel prices and availability come from our hotel provider — never from Google Maps.
        </p>
        {usable.length > 0 && (
          <p className="mt-3 flex flex-wrap gap-3">
            <a
              href={directionsUrl({ lat: usable[0].lat, lng: usable[0].lng })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-amber-900 underline"
            >
              Open in Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        )}
      </div>
    );
  }

  if (usable.length === 0) {
    return (
      <div className={`rounded-3xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600 ${className}`}>
        <p className="flex items-center gap-2 font-medium text-ink">
          <MapPin className="h-4 w-4 text-gold" aria-hidden="true" /> No verified location to map
        </p>
        <p className="mt-1 leading-6">
          This property has no verified coordinates yet, so we don&apos;t draw a pin. Hotel coordinates appear once the
          hotel provider supplies them.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-ink" style={{ height }}>
        <div ref={containerRef} className="h-full w-full" role="application" aria-label={ariaLabel} />
        {state !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/95 px-6 text-center text-white">
            {state === "failed" ? (
              <>
                <AlertTriangle className="h-8 w-8 text-gold" aria-hidden="true" />
                <p className="max-w-md text-sm text-white">{error}</p>
                <p className="max-w-md text-xs text-white/65">
                  The map could not load, but the address and “Get directions” link below still work.
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-gold" aria-hidden="true" />
                <p className="text-sm text-white/65">Loading map…</p>
              </>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Map data © Google. Hotel prices and availability come from our hotel provider — never from Google Maps.
        {hasUnverified ? " Grey pins are approximate area references, not verified hotel addresses." : ""}
      </p>
    </div>
  );
}
