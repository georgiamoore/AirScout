import { MutableRefObject, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Title from "./Title";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { FeatureCollection } from "@turf/turf";
import Paper from "@mui/material/Paper";
import RainLayer from "mapbox-gl-rain-layer";
import {
  getPollutantValueMeaning,
  pollutantUnits,
  pollutantValueRanges,
} from "../utils";
import Typography from "@mui/material/Typography";
import * as ReactDOMClient from "react-dom/client";

type MapProps = {
  combinedData: {
    source: string;
    data: FeatureCollection;
  }[];
};

const generateColourInterpolationValues = (pollutantName, valueRanges) => {
  const interpolations = ["interpolate", ["linear"], ["get", pollutantName]];

  for (let i = 0; i < valueRanges.length; i++) {
    interpolations.push(valueRanges[i].range[0]);
    interpolations.push(valueRanges[i].colour);
  }

  return interpolations;
};

const PollutantInfo = ({ pollutant }) => (
  <div id="pollutant-info">
    <Typography>
      {pollutant.toUpperCase()} ranges ({pollutantUnits[pollutant]})
    </Typography>

    <table className="w-full table-auto text-sm text-left">
      <tbody className="divide-y">
        {pollutantValueRanges[pollutant].map(
          ({ range: [start, end], meaning, colour }, idx) => (
            <tr key={idx} style={{ color: colour }}>
              <td>{meaning}</td>
              <td>
                {start}
                {end !== Infinity ? " - " + end : "+"}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
);

const Map = ({ combinedData }: MapProps) => {
  const [activePollutant, setActivePollutant] = useState("pm2.5");
  const [lng, setLng] = useState(-1.890401);
  const [lat, setLat] = useState(52.486243);
  const [zoom, setZoom] = useState(14);
  const [rainUpdateTimestamp, setRainUpdateTimestamp] = useState(new Date());
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  const rainLayer = new RainLayer({
    id: "rain",
    source: "rainviewer",
    scale: "noaa",
    rainColor: "#0703fc",
  });
  const pollutants = ["pm2.5", "pm10", "o3", "no2", "so2"];
  const interpolationsMap: string[] = [];
  // creates linear interpolation values for each pollutant (used in mapbox layer styling)
  pollutants.map((pollutant) => {
    interpolationsMap[pollutant] = generateColourInterpolationValues(
      pollutant,
      pollutantValueRanges[pollutant]
    );
  });

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const [locations, setLocations] = useState<
    {
      source: string;
      data: { features: FeatureCollection[] };
    }[]
  >([]);

  useEffect(() => {
    if (locations.length == 0) {
      // removing properties where value is null (to prevent black spots on map where no pollutant data is available)
      combinedData = combinedData.filter((source) =>
        source.data.features.map((feature) => {
          Object.keys(feature.properties!).forEach((key) => {
            if (feature.properties![key] === "NaN") {
              delete feature.properties![key];
            }
          });
          return feature;
        })
      );

      // combining all feature collections into one, to be used for voronoi layer
      let reducedCollection = turf.featureCollection([
        ...combinedData
          .filter((source) => source.data.features)
          .map((source) => source.data.features)
          .reduce((prev, current) => [...prev, ...current], []), // the [] here is used if no features are found (i.e. no API update)
      ]);

      // creating voronoi polygons for each pollutant
      const voronoiCollection = pollutants.map((pollutant) => {
        return {
          source: pollutant + "-voronoi",
          data: collectWithFilter(reducedCollection, pollutant),
        };
      });
      setLocations([...combinedData, ...voronoiCollection]);
    }
  }, [combinedData, locations.length]);

  // function to create voronoi polygons from a collection of points
  const collectWithFilter = (collection, propertyName) => {
    const filteredFeatures = turf.featureCollection(
      collection.features.filter(
        (f) =>
          // removing any undesirable property values to prevent issues when combining
          f.properties[propertyName] !== undefined &&
          !isNaN(f.properties[propertyName]) &&
          f.properties[propertyName] !== "NaN"
      )
    );
    const bbox = turf.bbox(filteredFeatures);
    const voronoiPolygons = turf.voronoi(filteredFeatures, { bbox });

    let filteredVoronoiFeatures = turf.featureCollection([]);
    for (let i = 0; i < voronoiPolygons.features.length; i++) {
      if (voronoiPolygons.features[i] != null) {
        let featurePush = {
          type: "Feature",
          properties: filteredFeatures.features[i].properties,
          geometry: voronoiPolygons.features[i].geometry,
        };
        filteredVoronoiFeatures.features.push(featurePush);
      }
    }

    return turf.collect(
      filteredVoronoiFeatures,
      filteredFeatures,
      propertyName,
      "values"
    );
  };

  useEffect(() => {
    if (map.current) return; // map already initialised
    if (locations.length < 1) return; // no data to display
    // creating map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      addContextualLayers(map);
      locations.map((featureCollection) => {
        if (!map.current.getSource(featureCollection.source)) {
          // add new source & feature data to map
          map.current.addSource(featureCollection.source, {
            type: "geojson",
            data: featureCollection.data,
          });
        } else {
          // source already exists, overwrite feature data
          map.current
            .getSource(featureCollection.source)
            .setData(featureCollection.data);
        }
        if (featureCollection.source.includes("voronoi")) {
          addVoronoiLayers(map, featureCollection.source);
        } else {
          // adding regular layer with circle markers for each station/sensor
          pollutants.map((pollutant) => {
            map.current.addLayer({
              id: pollutant + featureCollection.source,
              type: "circle",
              source: featureCollection.source,
              filter: ["has", pollutant],
              paint: {
                "circle-color": interpolationsMap[pollutant],
                "circle-radius": 6,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              },
              layout: {
                visibility: pollutant === "pm2.5" ? "visible" : "none",
              },
            });
            addStationInfoPopup(map, pollutant, featureCollection.source);
          });
        }
      });
    });

    map.current.on("idle", () => {
      createPollutantToggleMenu();
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialise
    // positioning map to focus on Aston
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  // adds contextual information
  // (only rain info for now)
  const addContextualLayers = (map: MutableRefObject<any>) => {
    map.current.addLayer(rainLayer);
    // rainLayer.on("refresh", (data: { timestamp: number }) => {
    //   setRainUpdateTimestamp(new Date(data.timestamp * 1000));
    // });
  };

  // adds the voronoi layers
  const addVoronoiLayers = (map: MutableRefObject<any>, source) => {
    const pollutant = source.split("-")[0];

    const interpolations = interpolationsMap[pollutant] || {};

    map.current.addLayer({
      id: "voronoi-" + pollutant,
      type: "fill",
      source,
      layout: {
        visibility: pollutant === "pm2.5" ? "visible" : "none",
      },
      paint: {
        "fill-color": interpolations,
        "fill-opacity": 0.2,
        "fill-outline-color": interpolations,
      },
    });
    map.current.addLayer({
      id: "voronoi-line-" + pollutant,
      type: "line",
      source,
      layout: {
        visibility: pollutant === "pm2.5" ? "visible" : "none",
      },
      paint: {
        "line-width": 2,
        "line-color": interpolations,
      },
    });
  };

  // adds a popup that appears on hover, with station name, pollutant value, timestamp & meaning/risk category
  const addStationInfoPopup = (
    map: MutableRefObject<any>,
    pollutant,
    source
  ) => {
    let stationInfoPopup: mapboxgl.Popup;
    map.current.on(
      "mouseenter",
      pollutant + source,
      (e: { features: { properties: any }[]; lngLat: { lng: number } }) => {
        map.current.getCanvas().style.cursor = "pointer";

        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;
        const station = properties.station_name;
        const timestamp = new Date(properties.timestamp);
        const meaning = getPollutantValueMeaning(
          pollutant,
          properties[pollutant]
        );

        const stationInfoComponent = (
          <>
            {/* TODO check below ternary works as expected */}
            <Typography variant="h6">
              {station !== undefined ? station : "Aston sensor"}
            </Typography>
            <Typography variant="body1">
              {"Average " +
                pollutant.toUpperCase() +
                " for " +
                timestamp.toLocaleDateString("en-GB") +
                ": " +
                properties[pollutant] +
                " µg/m³ (" +
                meaning +
                ")"}
            </Typography>
          </>
        );

        // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
        // "Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to."
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // adapted from https://stackoverflow.com/questions/48916901/possible-to-render-react-component-within-mapboxgl-popup-in-sethtml-or-setdo
        const placeholder = document.createElement("div");
        const root = ReactDOMClient.createRoot(placeholder);
        root.render(stationInfoComponent);

        stationInfoPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        })
          .setDOMContent(placeholder)
          .setLngLat(coordinates)
          .addTo(map.current);
      }
    );

    map.current.on("mouseleave", pollutant + source, () => {
      map.current.getCanvas().style.cursor = "";
      stationInfoPopup.remove();
    });
  };

  // sets the active pollutant layer, and toggles the visibility of the other layers
  // adapted from this example https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/
  const createPollutantToggleMenu = () => {
    for (const id of pollutants) {
      if (document.getElementById(id)) {
        continue;
      }

      const link = document.createElement("a");
      link.id = id;
      link.href = "#";
      link.textContent = id.toUpperCase();
      link.className = id === "pm2.5" ? "active" : "";

      link.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setActivePollutant(id); // updates the pollutant info legend too using state

        // getting all layers with pollutant info
        const layerIDs = map.current
          .getStyle()
          .layers.map((layer: { id: any }) => layer.id)
          .filter((layerID: string | string[]) =>
            pollutants.some(
              (pollutant) =>
                layerID.includes(pollutant) || layerID.includes("voronoi")
            )
          );

        // getting layers that match the pollutant selected (including voronoi)
        const matchingLayers = layerIDs.filter(
          (layerID: string) =>
            layerID.startsWith(this.id) ||
            (layerID.includes("voronoi") && layerID.includes(this.id))
        );

        matchingLayers.forEach((layerID: any) => {
          const visibility = map.current.getLayoutProperty(
            layerID,
            "visibility"
          );

          if (visibility === "visible") {
            map.current.setLayoutProperty(layerID, "visibility", "none");
            this.className = "";
          } else {
            this.className = "active";
            map.current.setLayoutProperty(layerID, "visibility", "visible");
          }
        });

        // ensuring other menu options are inactive so only selected pollutant is highlighted
        layerIDs.forEach((layerID) => {
          if (!matchingLayers.includes(layerID)) {
            map.current.setLayoutProperty(layerID, "visibility", "none");
            const layerLink = document.getElementById(
              pollutants.find((p) => layerID.includes(p))
            );
            if (layerLink) {
              layerLink.className = "";
            }
          }
        });
      };

      const layers = document.getElementById("menu");
      layers.appendChild(link);
    }
  };

  let date = new Date();
  date.setDate(date.getDate() - 1);
  let yesterday = date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: 600,
        }}
      >
        <Title>{"Map of pollutant data for " + yesterday}</Title>
        <div ref={mapContainer} className="map-container">
          <nav id="menu" />
          <PollutantInfo pollutant={activePollutant} />
        </div>
      </Paper>
    </>
  );
};

export default Map;
