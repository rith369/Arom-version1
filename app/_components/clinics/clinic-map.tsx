"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Clinic } from "./clinic-data";

// Phnom Penh, when there is nothing to fit the map around.
const PHNOM_PENH: [number, number] = [11.5564, 104.9282];

function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:30px;height:30px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center">
        <span style="width:10px;height:10px;border-radius:9999px;background:#fff"></span>
      </div>
      <div style="width:9px;height:9px;margin-top:-6px;transform:rotate(45deg);background:${color}"></div>
    </div>`,
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -32],
  });
}

/** Moves the map so every clinic (and the person, when known) fits. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((point) => point.join(",")).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
    // The points only change when the key does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

/**
 * The Find Clinic & Hospital map (OpenStreetMap, no key needed). Tapping a
 * pin shows the clinic with View details and, for real clinics, Directions
 * in Google Maps. Listed places (not connected to AROM) have blue pins.
 */
export default function ClinicMap({
  clinics,
  me,
  km,
  onSelect,
}: {
  clinics: Clinic[];
  me: { lat: number; lng: number } | null;
  km: boolean;
  onSelect: (clinic: Clinic) => void;
}) {
  const icons = useMemo(() => ({ arom: pin("#1f6f5b"), listed: pin("#3b82a6") }), []);
  const points: [number, number][] = [
    ...clinics.map((clinic): [number, number] => [clinic.lat, clinic.lng]),
    ...(me ? [[me.lat, me.lng] as [number, number]] : []),
  ];

  return (
    <MapContainer
      center={PHNOM_PENH}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      {clinics.map((clinic) => (
        <Marker key={clinic.id} position={[clinic.lat, clinic.lng]} icon={clinic.isListed ? icons.listed : icons.arom}>
          <Popup>
            <div style={{ minWidth: 170 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#14362f" }}>{km ? clinic.nameKm : clinic.name}</p>
              {clinic.isListed && (
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
                  {km ? "ទូរស័ព្ទដើម្បីកក់" : "Call to book"}
                </p>
              )}
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => onSelect(clinic)}
                  style={{
                    border: "1px solid #185a4d",
                    background: "#185a4d",
                    color: "#fff",
                    borderRadius: 9999,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {km ? "មើលព័ត៌មាន" : "View details"}
                </button>
                <a
                  href={clinic.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: "1px solid #185a4d",
                    color: "#185a4d",
                    borderRadius: 9999,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {km ? "ទិសដៅ" : "Directions"}
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {me && (
        <CircleMarker
          center={[me.lat, me.lng]}
          radius={8}
          pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
}
