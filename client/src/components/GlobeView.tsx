import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import type { CountryCoord } from "../data/countryCoordinates";
import styles from "./GlobeView.module.css";

// GeoJSON feature type (minimal)
interface GeoFeature {
  type: string;
  properties: {
    ISO_A2?: string;
    ADMIN?: string;
    NAME?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GlobeViewProps {
  selectedCountry: CountryCoord | null;
  globeFilterIso?: string | null;
  hasJobSelected?: boolean;
  onCountryClick?: (iso: string, name: string) => void;
  onBackgroundClick?: () => void;
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

// Globe theme colors (matching dark theme)
const GLOBE_BG = "rgba(0, 0, 0, 0)";
const COUNTRY_COLOR = "rgba(124, 92, 252, 0.08)";
const COUNTRY_SIDE = "rgba(124, 92, 252, 0.03)";
const COUNTRY_BORDER = "rgba(124, 92, 252, 0.25)";
const HIGHLIGHT_COLOR = "rgba(124, 92, 252, 0.55)";
const HIGHLIGHT_SIDE = "rgba(124, 92, 252, 0.35)";
const RING_COLOR = "rgba(124, 92, 252, 0.8)";
const ATMOSPHERE_COLOR = "#7c5cfc";

export default memo(function GlobeView({
  selectedCountry,
  globeFilterIso: externalFilterIso,
  hasJobSelected = false,
  onCountryClick,
  onBackgroundClick,
}: GlobeViewProps) {
  const globeRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<GeoFeature[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [GlobeComponent, setGlobeComponent] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [globeMaterial, setGlobeMaterial] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<GeoFeature | null>(null);
  const [clickedIso, setClickedIso] = useState<string | null>(null);
  const [clickedName, setClickedName] = useState("");

  // Clear internal clicked state when parent removes the globe filter
  useEffect(() => {
    if (externalFilterIso === null) {
      setClickedIso(null);
      setClickedName("");
    }
  }, [externalFilterIso]);

  // Dynamically import react-globe.gl and three (heavy deps, code-split)
  useEffect(() => {
    Promise.all([import("react-globe.gl"), import("three")]).then(
      ([globeMod, threeMod]) => {
        setGlobeMaterial(
          new threeMod.MeshPhongMaterial({
            color: "#181825",
            transparent: true,
            opacity: 0.95,
          }),
        );
        setGlobeComponent(() => globeMod.default);
      },
    );
  }, []);

  // Fetch GeoJSON countries
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => setCountries(data.features))
      .catch(console.error);
  }, []);

  // Resize observer for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Use the ISO code directly from the resolved country data
  const selectedIso = selectedCountry?.iso ?? null;

  // When a job is selected, only use its country (even if null).
  // Only fall back to globe-clicked when no job is selected.
  const activeIso = hasJobSelected ? selectedIso : (selectedIso ?? clickedIso);

  // Animate globe to selected country
  useEffect(() => {
    if (!selectedCountry || !globeRef.current) return;
    const globe = globeRef.current as {
      pointOfView: (
        coords: { lat: number; lng: number; altitude: number },
        ms: number,
      ) => void;
    };
    globe.pointOfView(
      { lat: selectedCountry.lat, lng: selectedCountry.lng, altitude: 1.8 },
      1200,
    );
  }, [selectedCountry]);

  const handlePolygonClick = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      const iso = f.properties.ISO_A2;
      const name = f.properties.NAME || f.properties.ADMIN || "";
      if (iso && iso !== "-99") {
        setClickedIso(iso);
        setClickedName(name);
        // Compute centroid from polygon coordinates
        if (globeRef.current && f.geometry.coordinates) {
          const coords = f.geometry.coordinates as number[][][];
          const ring =
            f.geometry.type === "MultiPolygon"
              ? (coords as unknown as number[][][][])[0][0]
              : coords[0];
          if (ring && ring.length > 0) {
            let sumLng = 0,
              sumLat = 0;
            for (const pt of ring) {
              sumLng += pt[0];
              sumLat += pt[1];
            }
            const globe = globeRef.current as {
              pointOfView: (
                c: { lat: number; lng: number; altitude: number },
                ms: number,
              ) => void;
            };
            globe.pointOfView(
              {
                lat: sumLat / ring.length,
                lng: sumLng / ring.length,
                altitude: 1.8,
              },
              1200,
            );
          }
        }
        if (onCountryClick) onCountryClick(iso, name);
      }
    },
    [onCountryClick],
  );

  const handleGlobeClick = useCallback(() => {
    setClickedIso(null);
    setClickedName("");
    onBackgroundClick?.();
  }, [onBackgroundClick]);

  const getPolygonCapColor = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      if (activeIso && f.properties.ISO_A2 === activeIso)
        return HIGHLIGHT_COLOR;
      if (
        hoveredCountry &&
        f.properties.ISO_A2 === (hoveredCountry as GeoFeature).properties.ISO_A2
      ) {
        return "rgba(124, 92, 252, 0.2)";
      }
      return COUNTRY_COLOR;
    },
    [activeIso, hoveredCountry],
  );

  const getPolygonSideColor = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      if (activeIso && f.properties.ISO_A2 === activeIso) return HIGHLIGHT_SIDE;
      return COUNTRY_SIDE;
    },
    [activeIso],
  );

  const getPolygonAltitude = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      if (activeIso && f.properties.ISO_A2 === activeIso) return 0.025;
      return 0.005;
    },
    [activeIso],
  );

  const getPolygonLabel = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      const name = f.properties.NAME || f.properties.ADMIN || "";
      if (activeIso && f.properties.ISO_A2 === activeIso) {
        return `<div style="background:rgba(30,30,46,0.95);color:#e4e4ed;padding:6px 12px;border-radius:8px;font-size:13px;border:1px solid rgba(124,92,252,0.4)"><strong>${name}</strong></div>`;
      }
      return `<div style="background:rgba(30,30,46,0.9);color:#9494a8;padding:4px 10px;border-radius:6px;font-size:12px">${name}</div>`;
    },
    [activeIso],
  );

  // Rings data for the pulsing effect on selected country
  const ringsData = useMemo(() => {
    if (!selectedCountry) return [];
    return [
      {
        lat: selectedCountry.lat,
        lng: selectedCountry.lng,
        maxR: 6,
        propagationSpeed: 3,
        repeatPeriod: 800,
      },
    ];
  }, [selectedCountry]);

  if (!GlobeComponent || !globeMaterial) {
    return (
      <div ref={containerRef} className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSphere} />
          <span>Loading globe...</span>
        </div>
      </div>
    );
  }

  const Globe = GlobeComponent;

  return (
    <div ref={containerRef} className={styles.container}>
      {(selectedCountry || (!hasJobSelected && clickedIso)) && (
        <div className={styles.countryBadge}>
          <span className={styles.badgeDot} />
          {selectedCountry ? selectedCountry.name : clickedName}
        </div>
      )}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor={GLOBE_BG}
          globeImageUrl=""
          showGlobe={true}
          showAtmosphere={true}
          atmosphereColor={ATMOSPHERE_COLOR}
          atmosphereAltitude={0.18}
          animateIn={true}
          globeMaterial={globeMaterial}
          // Country polygons
          polygonsData={countries}
          polygonGeoJsonGeometry="geometry"
          polygonCapColor={getPolygonCapColor}
          polygonSideColor={getPolygonSideColor}
          polygonStrokeColor={() => COUNTRY_BORDER}
          polygonAltitude={getPolygonAltitude}
          polygonLabel={getPolygonLabel}
          polygonsTransitionDuration={400}
          onPolygonHover={setHoveredCountry}
          onPolygonClick={handlePolygonClick}
          onGlobeClick={handleGlobeClick}
          // Rings (pulse effect)
          ringsData={ringsData}
          ringColor={() => RING_COLOR}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          ringAltitude={0.03}
        />
      )}
      {!selectedCountry &&
        (!clickedIso || hasJobSelected) &&
        countries.length > 0 && (
          <div className={styles.hint}>Click a job to see its country</div>
        )}
    </div>
  );
});
