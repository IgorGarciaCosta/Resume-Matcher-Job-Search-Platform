import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { MeshPhongMaterial } from "three";
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

const globeMaterial = new MeshPhongMaterial({
  color: "#181825",
  transparent: true,
  opacity: 0.95,
});

export default function GlobeView({ selectedCountry }: GlobeViewProps) {
  const globeRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<GeoFeature[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [GlobeComponent, setGlobeComponent] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<GeoFeature | null>(null);

  // Dynamically import react-globe.gl (heavy dep, code-split)
  useEffect(() => {
    import("react-globe.gl").then((mod) => {
      setGlobeComponent(() => mod.default);
    });
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

  const getPolygonCapColor = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      if (selectedIso && f.properties.ISO_A2 === selectedIso)
        return HIGHLIGHT_COLOR;
      if (
        hoveredCountry &&
        f.properties.ISO_A2 === (hoveredCountry as GeoFeature).properties.ISO_A2
      ) {
        return "rgba(124, 92, 252, 0.2)";
      }
      return COUNTRY_COLOR;
    },
    [selectedIso, hoveredCountry],
  );

  const getPolygonSideColor = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      if (selectedIso && f.properties.ISO_A2 === selectedIso)
        return HIGHLIGHT_SIDE;
      return COUNTRY_SIDE;
    },
    [selectedIso],
  );

  const getPolygonAltitude = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      if (selectedIso && f.properties.ISO_A2 === selectedIso) return 0.025;
      return 0.005;
    },
    [selectedIso],
  );

  const getPolygonLabel = useCallback(
    (feat: object) => {
      const f = feat as GeoFeature;
      const name = f.properties.NAME || f.properties.ADMIN || "";
      if (selectedIso && f.properties.ISO_A2 === selectedIso) {
        return `<div style="background:rgba(30,30,46,0.95);color:#e4e4ed;padding:6px 12px;border-radius:8px;font-size:13px;border:1px solid rgba(124,92,252,0.4)"><strong>${name}</strong></div>`;
      }
      return `<div style="background:rgba(30,30,46,0.9);color:#9494a8;padding:4px 10px;border-radius:6px;font-size:12px">${name}</div>`;
    },
    [selectedIso],
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

  if (!GlobeComponent) {
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
      {selectedCountry && (
        <div className={styles.countryBadge}>
          <span className={styles.badgeDot} />
          {selectedCountry.name}
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
          // Rings (pulse effect)
          ringsData={ringsData}
          ringColor={() => RING_COLOR}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          ringAltitude={0.03}
        />
      )}
      {!selectedCountry && countries.length > 0 && (
        <div className={styles.hint}>Click a job to see its country</div>
      )}
    </div>
  );
}
