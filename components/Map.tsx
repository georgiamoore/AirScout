import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { FeatureCollection } from "@turf/turf";
import RainLayer from "mapbox-gl-rain-layer";

type MapProps = {
  combinedData: {
    source: string;
    data: { features: FeatureCollection[] };
  }[];
};

const Map = ({ combinedData }: MapProps) => {
  const [lng, setLng] = useState(-1.890401);
  const [lat, setLat] = useState(52.486243);
  const [zoom, setZoom] = useState(14);
  const [rainUpdateTimestamp, setRainUpdateTimestamp] = useState(new Date());
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
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

      let collection = turf.featureCollection([
        ...combinedData
          .filter((x) => x.data.features)
          .map((x) => x.data.features)
          .reduce((prev, current) => [...prev, ...current]),
      ]);

      const pollutants = ["pm2.5", "pm10", "o3", "no2", "so2"];
      const voronoiCollection = pollutants.map((pollutant) => {
        return {
          source: pollutant + "-voronoi",
          data: collectWithFilter(collection, pollutant),
        };
      });
      setLocations([
        ...combinedData,
        // {
        //   source: "pm2.5-voronoi",
        //   data: collectWithFilter(collection, "pm2.5"),
        // },
        ...voronoiCollection,
      ]);
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
      const rainLayer = new RainLayer({
        id: "rain",
        source: "rainviewer",
        scale: "noaa",
      });
      map.current.addLayer(rainLayer);
      rainLayer.on("refresh", (data: { timestamp: number }) => {
        setRainUpdateTimestamp(new Date(data.timestamp * 1000));
      });
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
          console.log(featureCollection.data);
          // defining the linear interpolation colour coding values for each pollutant
          const interpolationsMap = {
            "pm2.5": {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "pm2.5"],
                0,
                "rgba(33,102,172,0)",
                4,
                "rgb(103,169,207)",
                8,
                "rgb(253,219,199)",
                12,
                "rgb(178,24,43)",
              ],
            },
            "o3": {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "o3"],
                0,
                "rgba(33,102,172,0)",
                50,
                "rgb(103,169,207)",
                100,
                "rgb(253,219,199)",
                150,
                "rgb(178,24,43)",
              ],
            },
            // TODO add other pollutants
          };

          const interpolations = interpolationsMap[pollutant] || {};
          map.current.addLayer({
            id: "voronoi-" + pollutant,
            type: "fill",
            source: featureCollection.source,
            layout: {
              visibility: "visible",
            },
            paint: {
              ...interpolations,
              "fill-opacity": 0.2,
              "fill-outline-color": "blue",
            },
          });
        } else {
          map.current.addLayer({
            id: "pm2.5" + featureCollection.source,
            type: "circle",
            source: featureCollection.source,
            filter: ["has", "pm2.5"],
            paint: {
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "pm2.5"],
                0,
                "rgba(33,102,172,0)",
                20,
                "rgb(103,169,207)",
                40,
                "rgb(253,219,199)",
                60,
                "rgb(178,24,43)",
              ],
            },
            layout: {
              visibility: "visible",
            },
          });

          // //TODO broken(?)
          // map.current.addLayer({
          //   id: "voc" + featureCollection.source,
          //   type: "circle",
          //   source: featureCollection.source,
          //   filter: ["has", "voc"],
          //   paint: {
          //     "circle-color": [
          //       "interpolate",
          //       ["linear"],
          //       ["get", "voc"],
          //       80,
          //       "rgba(33,102,172,0)",
          //       90,
          //       "rgb(103,169,207)",
          //       100,
          //       "rgb(253,219,199)",
          //       110,
          //       "rgb(178,24,43)",
          //     ],
          //   },
          //   layout: {
          //     visibility: "visible",
          //   },
          // });

          // //TODO broken(?)
          // map.current.addLayer({
          //   id: "no2" + featureCollection.source,
          //   type: "circle",
          //   source: featureCollection.source,
          //   filter: ["has", "no2"],
          //   paint: {
          //     "circle-color": [
          //       "interpolate",
          //       ["linear"],
          //       ["get", "no2"],
          //       80,
          //       "rgba(33,102,172,0)",
          //       90,
          //       "rgb(103,169,207)",
          //       100,
          //       "rgb(253,219,199)",
          //       110,
          //       "rgb(178,24,43)",
          //     ],
          //   },
          //   layout: {
          //     visibility: "visible",
          //   },
          // });
        }
      });
    });

    // TODO this toggle menu is defunct for now, needs to be rewritten
    // sensor types (e.g. plume/waqi) need to be combined
    // e.g. toggle pm10 view for all pm10 layers (rather than by sensor type)

    // map.current.on("idle", () => {
    //   // If these two layers were not added to the map, abort
    //   if (
    //     !map.current.getLayer("pm10") ||
    //     !map.current.getLayer("voc") ||
    //     !map.current.getLayer("no2")
    //   )
    //     return;

    //   // Enumerate ids of the layers.
    //   const toggleableLayerIds = ["pm10", "voc", "no2"];

    //   // Set up the corresponding toggle button for each layer.
    //   for (const id of toggleableLayerIds) {
    //     // Skip layers that already have a button set up.
    //     if (document.getElementById(id)) {
    //       continue;
    //     }

    //     // Create a link.
    //     const link = document.createElement("a");
    //     link.id = id;
    //     link.href = "#";
    //     link.textContent = "toggle " + id;
    //     link.className = "active";

    //     // Show or hide layer when the toggle is clicked.
    //     link.onclick = function (e) {
    //       const clickedLayer = this.id;
    //       e.preventDefault();
    //       e.stopPropagation();

    //       const visibility = map.current.getLayoutProperty(
    //         clickedLayer,
    //         "visibility"
    //       );

    //       // Toggle layer visibility by changing the layout object's visibility property.
    //       if (visibility === "visible") {
    //         map.current.setLayoutProperty(clickedLayer, "visibility", "none");
    //         this.className = "";
    //       } else {
    //         this.className = "active";
    //         map.current.setLayoutProperty(
    //           clickedLayer,
    //           "visibility",
    //           "visible"
    //         );
    //       }
    //     };

    //     const layers = document.getElementById("menu");
    //     layers.appendChild(link);
    //   }
    // });

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

  return (
    <>
      <div ref={mapContainer} className="map-container">
        {/* <nav id="menu" /> */}
      </div>
      <p>loaded {locations ? locations.length : ""} data sources</p>
      {getNumDataPoints()}
      <p>
        Rain data last updated:{" "}
        {rainUpdateTimestamp.toLocaleTimeString("en-GB")}
      </p>
      <p>
        Rain data last updated:{" "}
        {rainUpdateTimestamp.toLocaleDateString("en-GB")}
      </p>
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
        properties: collection.features[i].properties,
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
