import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { FeatureCollection } from "@turf/turf";

type MapProps = {
  combinedData: FeatureCollection[];
};

const Map = ({ combinedData }: MapProps) => {
  const [lng, setLng] = useState(-1.890401);
  const [lat, setLat] = useState(52.486243);
  const [zoom, setZoom] = useState(14);
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const [locations, setLocations] = useState<
    {
      source: string;
      data: FeatureCollection;
    }[]
  >([]);

  useEffect(() => {
    if (locations.length == 0) {
      // removing null geometries - https://github.com/willymaps/voronoihover/blob/master/js/voronoihover.js

      let collection = turf.featureCollection([
        ...combinedData
          .map((x) => x.features)
          .reduce((prev, current) => [...prev, ...current]),
      ]);
      let bbox = turf.bbox(collection);
      let geojsonPolygon = {
        type: "FeatureCollection",
        features: [],
      };
      let voronoiPolygons = turf.voronoi(collection, { bbox });
      for (let i = 0; i < voronoiPolygons.features.length; i++) {
        let geojsonArray = geojsonPolygon.features;

        if (voronoiPolygons.features[i] != null) {
          let featurePush = {
            type: "Feature",
            properties: collection.features[i].properties,
            geometry: voronoiPolygons.features[i].geometry,
          };
          geojsonArray.push(featurePush);
        }
      }

      // if (voronoiDrawn == false) {
      //     addVoronoiLayer(geojsonPolygon);
      //     voronoiDrawn = true;
      // }
      console.log(combinedData.map((x, i) => ({ source: i, data: x })));
      console.log(combinedData.map((x) => x.features));
      setLocations([
        ...combinedData.map((data, i) => ({ source: "" + i + "", data: data })),
        {
          source: "plume-voronoi",
          data: turf.collect(geojsonPolygon, collection, "pm10", "values"),
        },
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

        if (featureCollection.source == "plume-voronoi") {
          map.current.addLayer({
            id: "pm10Voronoi" + featureCollection.source,
            type: "fill",
            source: featureCollection.source,
            layout: {
              visibility: "visible",
            },
            paint: {
              //shading polygon based on levels of pm10 in area
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "pm10"],
                0,
                "rgba(33,102,172,0)",
                4,
                "rgb(103,169,207)",
                8,
                "rgb(253,219,199)",
                12,
                "rgb(178,24,43)",
              ],
              "fill-opacity": 0.2,
              "fill-outline-color": "blue",
            },
          });
        } else {
          map.current.addLayer({
            id: "pm10" + featureCollection.source,
            type: "circle",
            source: featureCollection.source,
            filter: ["has", "pm10"],
            paint: {
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "pm10"],
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
        {/* {item.source} data points: {item.data.features.length} */}
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
    </>
  );
};

export default Map;
