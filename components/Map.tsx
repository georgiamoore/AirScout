import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Title from "./Title";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { FeatureCollection } from "@turf/turf";
import Paper from "@mui/material/Paper";
import RainLayer from "mapbox-gl-rain-layer";
import { pollutantValueRanges } from "../utils";

type MapProps = {
  combinedData: {
    source: string;
    data: { features: FeatureCollection[] };
  }[];
};
const createInterpolationsMap = (pollutantName, valueRanges) => {
  const interpolations = ["interpolate", ["linear"], ["get", pollutantName]];

  for (let i = 0; i < valueRanges.length; i++) {
    interpolations.push(valueRanges[i].range[0]);
    interpolations.push(valueRanges[i].colour);
  }

  return interpolations;
};

const Map = ({ combinedData }: MapProps) => {
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
  const interpolationsMap = {};
  pollutants.map((pollutant) => {
    interpolationsMap[pollutant] = createInterpolationsMap(
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
      // removing null geometries - https://github.com/willymaps/voronoihover/blob/master/js/voronoihover.js

      // removing properties where value is null (to prevent black spots on map where no pollutant data is available)
      combinedData = combinedData.filter((x) =>
        x.data.features
          .map((feature) => {
            Object.keys(feature.properties).forEach((key) => {
              if (isNaN(feature.properties[key])) {
                delete feature.properties[key];
              }
            });
            return feature;
          })
          .filter((feature) => {
            return Object.values(feature.properties).every((value) => {
              return value !== null;
            });
          })
      );

      let reducedCollection = turf.featureCollection([
        ...combinedData
          .filter((x) => x.data.features)
          .map((x) => x.data.features)
          .reduce((prev, current) => [...prev, ...current], []), // the [] here is used if no features are found (i.e. no API update)
      ]);

      const voronoiCollection = pollutants.map((pollutant) => {
        return {
          source: pollutant + "-voronoi",
          data: collectWithFilter(reducedCollection, pollutant),
        };
      });
      setLocations([...combinedData, ...voronoiCollection]);
    }
  }, [combinedData, locations.length]);

  useEffect(() => {
    if (map.current) return;
    if (locations.length < 1) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.on("load", () => {
      // map.current.addLayer(rainLayer);
      // rainLayer.on("refresh", (data: { timestamp: number }) => {
      //   setRainUpdateTimestamp(new Date(data.timestamp * 1000));
      // });
      locations.map((featureCollection) => {
        if (!map.current.getSource(featureCollection.source)) {
          map.current.addSource(featureCollection.source, {
            type: "geojson",
            data: featureCollection.data,
            // cluster: true,
            // clusterMaxZoom: 14, // Max zoom to cluster points on
            // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
          });
        } else {
          // source already exists, overwrite feature data
          map.current
            .getSource(featureCollection.source)
            .setData(featureCollection.data);
        }
        if (featureCollection.source.includes("voronoi")) {
          const pollutant = featureCollection.source.split("-")[0];
          // defining the linear interpolation colour coding values for each pollutant

          const interpolations = interpolationsMap[pollutant] || {};

          map.current.addLayer({
            id: "voronoi-" + pollutant,
            type: "fill",
            source: featureCollection.source,
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
            source: featureCollection.source,
            layout: {
              visibility: pollutant === "pm2.5" ? "visible" : "none",
            },
            paint: {
              "line-width": 2,
              "line-color": interpolations,
            },
          });
        } else {
          pollutants.map((pollutant) =>
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
            })
          );
        }
      });
    });

    map.current.on("idle", () => {
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
          const layerIDs = map.current
            .getStyle()
            .layers.map((layer) => layer.id)
            .filter((layerID) =>
              pollutants.some(
                (pollutant) =>
                  layerID.includes(pollutant) || layerID.includes("voronoi")
              )
            );
          const matchingLayers = layerIDs.filter(
            (layerID) =>
              layerID.startsWith(this.id) ||
              (layerID.includes("voronoi") && layerID.includes(this.id))
          );

          matchingLayers.forEach((layerID) => {
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
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  const getNumDataPoints = () => {
    return locations.map((item, index) => (
      <p key={index}>
        {item.source} data points:{" "}
        {item.data.features ? item.data.features.length : "N/A"}
      </p>
    ));
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
        </div>
      </Paper>
      {/* <p>loaded {locations ? locations.length : ""} data sources</p>
      {getNumDataPoints()} */}
      {/* <p>
        Rain data last updated:{" "}
        {rainUpdateTimestamp.toLocaleTimeString("en-GB")}
      </p>
      <p>
        Rain data last updated:{" "}
        {rainUpdateTimestamp.toLocaleDateString("en-GB")}
      </p> */}
    </>
  );
};

const collectWithFilter = (collection, propertyName) => {
  const filteredFeatures = turf.featureCollection(
    collection.features.filter(
      (f) =>
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

export default Map;
