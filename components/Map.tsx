import { MutableRefObject, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Title from "./Title";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { feature, FeatureCollection } from "@turf/turf";
import Paper from "@mui/material/Paper";
import {
  getPollutantValueRisk,
  pollutantUnits,
  pollutantValueRanges,
} from "../utils";
import Typography from "@mui/material/Typography";
import * as ReactDOMClient from "react-dom/client";
import { Bar } from "react-chartjs-2";

type MapProps = {
  combinedData: {
    source: string;
    data: FeatureCollection;
  }[];
};

const generateColourInterpolationValues = (pollutantName, valueRanges) => {
  // const interpolations = ["interpolate", ["linear"], ["get", pollutantName]];
  //TODO check this works as expected
  const interpolations = [
    "interpolate",
    ["exponential", 2],
    ["get", pollutantName],
  ];

  for (let i = 0; i < valueRanges.length; i++) {
    interpolations.push(valueRanges[i].range[0]);
    interpolations.push(valueRanges[i].colour);
  }

  return interpolations;
};

// creates legend showing pollutant ranges & corresponding colours/risk
const PollutantInfo = ({ pollutant }) => (
  <div id="pollutant-info">
    <Typography>
      {pollutant.toUpperCase()} ranges ({pollutantUnits[pollutant]})
    </Typography>

    <table className="w-full table-auto text-sm text-left">
      <tbody className="divide-y">
        {pollutantValueRanges[pollutant].map(
          ({ range: [start, end], risk, colour }, idx) => (
            <tr key={idx} style={{ color: colour }}>
              <td>{risk}</td>
              <td className="text-right">
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
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  
  const pollutants = ["pm2.5", "pm10", "o3", "no2", "so2"];
  const contextual = ["temperature", "pressure", "humidity", "windspeed"];
  let addedPollutantLayers = [];
  const colourInterpolationsMap: string[] = [];
  // creates linear interpolation values for each pollutant (used in mapbox layer styling)
  pollutants.map((pollutant) => {
    colourInterpolationsMap[pollutant] = generateColourInterpolationValues(
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
        source.data.features
          ? source.data.features.map((feature) => {
              Object.keys(feature.properties!).forEach((key) => {
                if (
                  feature.properties![key] === "NaN" ||
                  feature.properties![key] === 0
                ) {
                  delete feature.properties![key];
                } else if (!isNaN(feature.properties![key])) {
                  feature.properties![key] = parseFloat(
                    parseFloat(feature.properties![key]).toFixed(2)
                  ); //toFixed returns a string, another parseFloat needed to convert it back
                }
              });
              return feature;
            })
          : {}
      );

      // combining all feature collections into one, to be used for interpolation layer
      let reducedCollection = turf.featureCollection([
        ...combinedData
          .filter((source) => source.data.features)
          .map((source) => source.data.features)
          .reduce((prev, current) => [...prev, ...current], []), // the [] here is used if no features are found (i.e. no API update)
      ]);

      // creating interpolation polygons for each pollutant
      const interpolationCollection = pollutants.map((pollutant) => {
        return {
          source: pollutant + "-interpolation",
          data: collectWithFilter(reducedCollection, pollutant),
        };
      });
      setLocations([...combinedData, ...interpolationCollection]);
    }
  }, [combinedData, locations.length]);

  // function to create interpolation polygons from a collection of points
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

    // generates a grid of hexagons (1 hex = 2 miles), interpolating pollutant values
    const options = {
      gridType: "hex",
      property: [propertyName],
      units: "miles",
    };
    const interpolationPolygons = turf.interpolate(
      filteredFeatures,
      2,
      options
    );

    let filteredInterpolationFeatures = turf.featureCollection([]);
    for (let i = 0; i < interpolationPolygons.features.length; i++) {
      if (interpolationPolygons.features[i] != null) {
        let featurePush = {
          type: "Feature",
          properties: interpolationPolygons.features[i].properties,
          geometry: interpolationPolygons.features[i].geometry,
        };
        filteredInterpolationFeatures.features.push(featurePush);
      }
    }

    return turf.collect(
      filteredInterpolationFeatures,
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
        if (featureCollection.source.includes("interpolation")) {
          addInterpolationLayers(map, featureCollection.source);
        } else {
          addStationLayers(map, featureCollection);
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



  // adds the interpolation layers
  const addInterpolationLayers = (map: MutableRefObject<any>, source) => {
    const pollutant = source.split("-")[0];

    const colourInterpolations = colourInterpolationsMap[pollutant] || {};

    map.current.addLayer({
      id: "interpolation-" + pollutant,
      type: "fill",
      source,
      layout: {
        visibility: pollutant === "pm2.5" ? "visible" : "none",
      },
      paint: {
        "fill-color": colourInterpolations,
        "fill-opacity": 0.2,
        "fill-outline-color": colourInterpolations,
      },
    });
    map.current.addLayer({
      id: "interpolation-line-" + pollutant,
      type: "line",
      source,
      layout: {
        visibility: pollutant === "pm2.5" ? "visible" : "none",
      },
      paint: {
        "line-width": 1,
        "line-color": colourInterpolations,
      },
    });
  };

  // generates average pollutant values for each station & adds these to map as circle markers
  const addStationLayers = (map: MutableRefObject<any>, featureCollection) => {
    if (featureCollection.data.features !== null) {
    // get array of unique stations
    const stationCodes = [
      ...new Set(
        featureCollection.data.features.map((feature) => {
          return (
            feature.properties.station_code || feature.properties.sensor_id
          );
        })
      ),
    ];

    // generates array of arrays of features for each station
    const stationFeatures = stationCodes.map((stationCode) => {
      return featureCollection.data.features.filter((feature) => {
        return (
          feature.properties.station_code === stationCode ||
          feature.properties.sensor_id === stationCode
        );
      });
    });

    const combinedPropertyList = pollutants.concat(contextual);

    // generate mean pollutant + contextual data values for each station
    const stationFeatureCollection = turf.featureCollection(
      stationFeatures.map((station) => {
        const meanValues = {};
        combinedPropertyList.map((property) => {
          const propertyValues = station.map((feature) => {
            return feature.properties[property];
            }).filter(
              (value) => value !== undefined
            );
          // sums all values for property & divides by total num
          const meanValue =
            propertyValues.reduce((a, b) => a + b, 0) / propertyValues.length;
          // check if mean is a number, round to 2 decimal places if so
          if (!isNaN(meanValue))
            meanValues[property] = Math.round(meanValue * 100) / 100;
        });
        // get unaveraged proprties for station
        meanValues.station_code = station[0].properties.station_code;
        meanValues.station_name = station[0].properties.station_name;
        meanValues.sensor_id = station[0].properties.sensor_id;

        return {
          type: "Feature",
          geometry: station[0].geometry,
          properties: meanValues,
        };
      })
    );

    map.current.addSource(featureCollection.source + "-stations", {
      type: "geojson",
      data: stationFeatureCollection,
    });
    // adding map layers for each pollutant with circle markers for each station/sensor
    pollutants.map((pollutant) => {
      if (stationFeatureCollection.features !== null)
        if (
          stationFeatureCollection.features.some(
            (obj) =>
              obj.properties &&
              obj.properties[pollutant] != null &&
              !isNaN(obj.properties[pollutant])
          )
        ) {
          map.current.addLayer({
            id: pollutant + featureCollection.source,
            type: "circle",
            source: featureCollection.source + "-stations",
            filter: ["has", pollutant],
            paint: {
              "circle-color": colourInterpolationsMap[pollutant],
              "circle-radius": 8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            },
            layout: {
              visibility: pollutant === "pm2.5" ? "visible" : "none",
            },
          });
          addStationInfoPopup(
            map,
            pollutant,
            featureCollection.source,
            stationFeatureCollection
          );
          addedPollutantLayers.push(pollutant);
        }
    });
  }
  };

  // adds a popup that appears on hover, with station name, pollutant value, timestamp & risk category
  const addStationInfoPopup = (
    map: MutableRefObject<any>,
    pollutant,
    source,
    stationFeatureCollection
  ) => {
    let stationInfoPopup: mapboxgl.Popup;
    map.current.on(
      "click",
      pollutant + source,
      (e: { features: { properties: any }[]; lngLat: { lng: number } }) => {
        map.current.getCanvas().style.cursor = "pointer";

        // retrieve only relevant source
        const sourceData = combinedData.filter((s) => s.source === source);
        // filter to only relevant station
        const unaveragedStationData = sourceData[0].data.features.filter(
          (feature) =>
            feature.properties.station_code ===
            e.features[0].properties.station_code
        );

        const meanStationData = stationFeatureCollection.features.filter(
          (feature) =>
            feature.properties.station_code ===
            e.features[0].properties.station_code
        );

        // get contextual data to generate bar charts
        const contextualData = unaveragedStationData.map((feature) => {
          return {
            timestamp: new Date(feature.properties.timestamp).toString(),
            temperature: feature.properties.temperature,
            windspeed: feature.properties.windspeed,
          };
        });

        const chartData = {
          datasets: [{ data: contextualData }],
        };

        // todo humidity + pressure

        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = meanStationData[0].properties;
        const stationName = properties.station_name;
        const risk = getPollutantValueRisk(pollutant, properties[pollutant]);

        const stationInfoComponent = (
          <>
            <Typography variant="h6">
              <strong>
                {stationName !== undefined ? stationName : "Aston sensor"}
              </strong>
            </Typography>
            <Typography variant="body2">
              {"Average " +
                pollutant.toUpperCase() +
                ": " +
                properties[pollutant] +
                " µg/m³ (" +
                risk +
                ")"}
              <br /> {"Average temperature: " + properties.temperature + "°C"}
            </Typography>
            {/* TODO this should be parameterised & refactored to be a functional component */}
            {contextualData[0].temperature && (
              <div className="max-h-32 mb-5">
                <Typography variant="body1">
                  <strong>Temperature</strong>
                </Typography>
                <Bar
                  data={chartData}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          title: function (context) {
                            let title = context[0].label || "";
                            if (context[0].parsed.x !== null) {
                              title = new Date(title)
                                .toTimeString()
                                .slice(0, 5);
                            }
                            return title;
                          },
                        },
                      },
                      legend: {
                        display: false,
                      },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    parsing: {
                      xAxisKey: "timestamp",
                      yAxisKey: "temperature",
                    },
                    scales: {
                      x: {
                        ticks: {
                          callback: function (value, index, ticks) {
                            // changes axis labels to be in format HH:MM
                            let timestamp = new Date(
                              this.getLabelForValue(value)
                            );
                            let time = timestamp.toTimeString().slice(0, 5);
                            return time === "00:00" // additionally adds weekday to 00:00 label
                              ? [
                                  time,
                                  timestamp.toLocaleDateString("en-GB", {
                                    weekday: "short",
                                  }),
                                ]
                              : time;
                          },
                          autoSkip: true,
                          maxTicksLimit: 20,
                          maxRotation: 0,
                          minRotation: 0,
                        },
                      },
                    },
                  }}
                ></Bar>
              </div>
            )}
            {contextualData[0].windspeed && (
              <div className="max-h-32 mb-5">
                <Typography variant="body1">
                  <strong>Windspeed</strong>
                </Typography>
                <Bar
                  data={chartData}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          title: function (context) {
                            let title = context[0].label || "";
                            if (context[0].parsed.x !== null) {
                              title = new Date(title)
                                .toTimeString()
                                .slice(0, 5);
                            }
                            return title;
                          },
                        },
                      },
                      legend: {
                        display: false,
                      },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    parsing: {
                      xAxisKey: "timestamp",
                      yAxisKey: "windspeed",
                    },
                    scales: {
                      x: {
                        ticks: {
                          callback: function (value, index, ticks) {
                            // changes axis labels to be in format HH:MM
                            let timestamp = new Date(
                              this.getLabelForValue(value)
                            );
                            let time = timestamp.toTimeString().slice(0, 5);
                            return time === "00:00" // additionally adds weekday to 00:00 label
                              ? [
                                  time,
                                  timestamp.toLocaleDateString("en-GB", {
                                    weekday: "short",
                                  }),
                                ]
                              : time;
                          },
                          autoSkip: true,
                          maxTicksLimit: 20,
                          maxRotation: 0,
                          minRotation: 0,
                        },
                      },
                    },
                  }}
                ></Bar>
              </div>
            )}
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

        stationInfoPopup = new mapboxgl.Popup()
          .setDOMContent(placeholder)
          .setLngLat(coordinates)
          .setMaxWidth("400px")
          .addTo(map.current);
      }
    );
    map.current.on("mouseenter", pollutant + source, () => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", pollutant + source, () => {
      map.current.getCanvas().style.cursor = "";
    });
  };

  // sets the active pollutant layer, and toggles the visibility of the other layers
  // adapted from this example https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/
  const createPollutantToggleMenu = () => {
    for (const id of addedPollutantLayers) {
      // using the addedPollutantLayers prevents menu options being created for empty layers
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
            addedPollutantLayers.some(
              (pollutant) =>
                layerID.includes(pollutant) || layerID.includes("interpolation")
            )
          );

        // getting layers that match the pollutant selected (including interpolation)
        const matchingLayers = layerIDs.filter(
          (layerID: string) =>
            layerID.startsWith(this.id) ||
            (layerID.includes("interpolation") && layerID.includes(this.id))
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
              addedPollutantLayers.find((p) => layerID.includes(p))
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
        <Title>{"Pollutant map for " + yesterday}</Title>
        <div ref={mapContainer} className="map-container">
          <nav id="menu" />
          <PollutantInfo pollutant={activePollutant} />
        </div>
      </Paper>
    </>
  );
};

export default Map;
