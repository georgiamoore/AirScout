import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { FeatureCollection } from "../types";

type MapProps = {
  plumeData: FeatureCollection;
  WAQIData: FeatureCollection;
  archiveData: FeatureCollection;
}

const formatWAQIData = (data) => {
  console.log(data);
  let formatted = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [data.longitude, data.latitude],
    },
    // TODO idx below is an inappropriate ID -> refers to sensor station id rather than measurement id
    // (will be fixed during backend api dev)
    properties: { id: data.idx, pm10: data.pm10, time: data.utc_date },
  };

  return { type: "FeatureCollection", features: [formatted] };
};

const Map = ({ plumeData, WAQIData, archiveData }: MapProps) => {
  const [lng, setLng] = useState(-1.890401);
  // const [lng, setLng] = useState(-1.889054);
  const [lat, setLat] = useState(52.486243);
  // const [lat, setLat] = useState(52.486473);
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
      // var collection = (formatPlumeData(plumeData.plumeData));
      console.log(plumeData);
      var collection = plumeData;
      let bbox = turf.bbox(collection);
      // var collection = turf.featureCollection(formatPlumeData(plumeData.plumeData));
      var geojsonPolygon = {
        type: "FeatureCollection",
        features: [],
      };

      let voronoiPolygons = turf.voronoi(collection, { bbox });
      for (var i = 0; i < voronoiPolygons.features.length; i++) {
        var geojsonArray = geojsonPolygon.features;

        if (voronoiPolygons.features[i] != null) {
          var featurePush = {
            type: "Feature",
            properties: collection.features[i].properties,
            geometry: voronoiPolygons.features[i].geometry,
          };
          geojsonArray.push(featurePush);
        }
      }
      console.log(turf.collect(geojsonPolygon, collection, "pm10", "values"));

      // if (voronoiDrawn == false) {
      //     addVoronoiLayer(geojsonPolygon);
      //     voronoiDrawn = true;
      // }
      setLocations([
        { source: "waqi", data: formatWAQIData(WAQIData) },
        { source: "plume", data: plumeData },
        // { source: "plume", data: formatPlumeData(plumeData.plumeData) },
        { source: "archive", data: archiveData },
        {
          source: "plume-voronoi",
          data: turf.collect(geojsonPolygon, collection, "pm10", "values"),
        },
      ]);
    }
  }, [WAQIData, archiveData, locations.length, plumeData.plumeData]);

  // useEffect(() => {
  //   console.log(plumeData.plumeData);
  //   setLocations((prevLocations) => [
  //     ...prevLocations,
  //     { source: "plume", data: formatPlumeData(plumeData.plumeData) },
  //   ]);
  // }, [plumeData.plumeData]);

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
        console.log(featureCollection);
        // console.log(featureCollection.data);
        // console.log(voronoi(featureCollection.data));
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

        map.current.addLayer({
          //TODO fsr waqi data isn't showing up on this layer
          id: "pm10" + featureCollection.source,
          type: "circle",
          source: featureCollection.source,
          filter: ["has", "pm10"],
          paint: {
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "pm10"],
              20,
              "rgba(33,102,172,0)",
              40,
              "rgb(103,169,207)",
              60,
              "rgb(253,219,199)",
              80,
              "rgb(178,24,43)",
            ],
          },
          layout: {
            visibility: "visible",
          },
        });

        //TODO broken(?)
        map.current.addLayer({
          id: "voc" + featureCollection.source,
          type: "circle",
          source: featureCollection.source,
          filter: ["has", "voc"],
          paint: {
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "voc"],
              80,
              "rgba(33,102,172,0)",
              90,
              "rgb(103,169,207)",
              100,
              "rgb(253,219,199)",
              110,
              "rgb(178,24,43)",
            ],
          },
          layout: {
            visibility: "visible",
          },
        });

        //TODO broken(?)
        map.current.addLayer({
          id: "no2" + featureCollection.source,
          type: "circle",
          source: featureCollection.source,
          filter: ["has", "no2"],
          paint: {
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "no2"],
              80,
              "rgba(33,102,172,0)",
              90,
              "rgb(103,169,207)",
              100,
              "rgb(253,219,199)",
              110,
              "rgb(178,24,43)",
            ],
          },
          layout: {
            visibility: "visible",
          },
        });

        map.current.addLayer({
          id: "gen" + featureCollection.source,
          type: "fill",
          source: featureCollection.source,
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "pm10"],
              20,
              "rgba(33,102,172,0)",
              40,
              "rgb(103,169,207)",
              60,
              "rgb(253,219,199)",
              80,
              "rgb(178,24,43)",
            ], // could interpolate here but voronoi does not retain props https://github.com/Turfjs/turf/issues/1450
            // idk why the pm10-based fill isn't working - same issue as above likely
            "fill-opacity": 1,
            "fill-outline-color": "coral",
          },
        });
      });
    });

    // TODO this toggle menu is defunct for now, needs to be rewritten
    // sensor types (e.g. plume/waqi) need to be combined
    // e.g. toggle pm10 view for all pm10 layers (rather than by sensor type)
    map.current.on("idle", () => {
      // If these two layers were not added to the map, abort
      if (
        !map.current.getLayer("pm10") ||
        !map.current.getLayer("voc") ||
        !map.current.getLayer("no2")
      )
        return;

      // Enumerate ids of the layers.
      const toggleableLayerIds = ["pm10", "voc", "no2"];

      // Set up the corresponding toggle button for each layer.
      for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
          continue;
        }

        // Create a link.
        const link = document.createElement("a");
        link.id = id;
        link.href = "#";
        link.textContent = "toggle " + id;
        link.className = "active";

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
          const clickedLayer = this.id;
          e.preventDefault();
          e.stopPropagation();

          const visibility = map.current.getLayoutProperty(
            clickedLayer,
            "visibility"
          );

          // Toggle layer visibility by changing the layout object's visibility property.
          if (visibility === "visible") {
            map.current.setLayoutProperty(clickedLayer, "visibility", "none");
            this.className = "";
          } else {
            this.className = "active";
            map.current.setLayoutProperty(
              clickedLayer,
              "visibility",
              "visible"
            );
          }
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
        {item.source} data points: {item.data.features.length}
      </p>
    ));
  };

  return (
    <>
      <div ref={mapContainer} className="map-container">
        <nav id="menu" />
      </div>
      <p>loaded {locations ? locations.length : ""} data sources</p>
      {getNumDataPoints()}
    </>
  );
};

export default Map;
