import { PropsWithChildren, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import ReactMapGL, {
  Marker,
  Popup,
  NavigationControl,
  Layer,
  Source,
} from "react-map-gl";
export async function getServerSideProps() {
  const plumeData = [];
  // const plumeData = await prisma.plume_sensor.findMany({
  //   select: {
  //     id: true,
  //     latitude: true,
  //     longitude: true,
  //     pm10: true,
  //     voc: true,
  //     no2: true,
  //   },
  //   where: {
  //     latitude: { not: null },
  //     longitude: { not: null },
  //   },
  //   orderBy: {
  //     id: "desc",
  //   },
  // });

  // restricted to Birmingham
  // const boundedData = await prisma.$queryRaw`SELECT id, latitude, longitude, pm10, voc, no2 from plume_sensor where ST_Intersects(ST_MakeEnvelope(-2.175293, 52.277401, -1.576538, 52.608052), st_point(longitude, latitude)::geography)`;
  return {
    props: { plumeData }, // will be passed to the page component as props
  };
}

type PlumeData = {
  id: string;
  latitude: number;
  longitude: number;
  pm10: number;
  voc: number;
  no2: number;
};

type Feature = {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: { id: string; pm10: number; time?: string };
};
type FeatureCollection = { type: string; features: Feature[] };

const formatPlumeData = (data: PlumeData[]) => {
  let formatted = data.map((sensor) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [sensor.longitude, sensor.latitude],
      },
      properties: { id: sensor.id, pm10: sensor.pm10 },
    };
  });

  return { type: "FeatureCollection", features: formatted };
};

const formatWAQIData = (data) => {
  let formatted = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [data.city.geo[0], data.city.geo[1]],
    },
    properties: { id: data.idx, pm10: data.iaqi.pm10.v, time: data.time },
  };

  return { type: "FeatureCollection", features: [formatted] };
};

const Map = ({ plumeData }) => {
  const [lng, setLng] = useState(-1.889054);
  const [lat, setLat] = useState(52.486473);
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
    const fetchLocations = async () => {
      const waqiUrl = `https://api.waqi.info/feed/birmingham/?token=${process.env.NEXT_PUBLIC_AQICN_TOKEN}`;
      // const waqiUrl = `https://api.waqi.info/map/bounds?token=${process.env.NEXT_PUBLIC_AQICN_TOKEN}&latlng=-2.041397,52.386497,-1.725540,52.563830`;
      await fetch(waqiUrl)
        .then((response) => response.text())
        .then((res) => JSON.parse(res))
        .then((json) => {
          console.log(json);
          // console.log(formatWAQIData(json.data))
          setLocations((prevLocations) => [
            ...prevLocations,
            { source: "waqi", data: formatWAQIData(json.data) },
          ]);
          // setLocations((prevLocations) => [
          //   ...prevLocations,
          //   { source: "plume", data: formatPlumeData(plumeData) },
          // ]);
        })
        .catch((err) => console.log({ err }));
    };
    fetchLocations();
  }, []);
  useEffect(() => {
    if (map.current) return;
    if (locations.length<1) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.on("load", () => {
      console.log(locations);
      locations.map((featureCollection) => {
        console.log(featureCollection);
        map.current.addSource(featureCollection.source, {
          type: "geojson",
          data: featureCollection.data,
          // cluster: true,
          // clusterMaxZoom: 14, // Max zoom to cluster points on
          // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });
      });

      map.current.addLayer({
        id: "pm10",
        type: "circle",
        source: "waqi", //todo replace
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
      map.current.addLayer({
        id: "voc",
        type: "circle",
        source: "waqi", //todo replace
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

      map.current.addLayer({
        id: "no2",
        type: "circle",
        source: "waqi", //todo replace
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
    });

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

  return (
    <div>
      <div ref={mapContainer} className="map-container">
        <nav id="menu" />
      </div>
      <p>
        loaded {locations.features ? locations.features.length : ""} data points
      </p>
    </div>
  );
};

export default Map;
