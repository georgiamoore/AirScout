import { green, yellow, orange, red } from "@mui/material/colors";
export const pollutantValueRanges = {
  // testing - PM10 ranges taken from https://www.epa.vic.gov.au/for-community/environmental-information/air-quality/pm10-particles-in-the-air
  pm10: [
    { range: [0, 40], colour: green[300] },
    { range: [40, 80], colour: yellow[300] },
    { range: [80, 120], colour: orange[300] },
    { range: [120, 300], colour: red[300] },
    { range: [300, Infinity], colour: red[800] },
  ],
  "pm2.5": [
    { range: [0, 25], colour: green[300] },
    { range: [25, 50], colour: yellow[300] },
    { range: [50, 100], colour: orange[300] },
    { range: [100, 300], colour: red[300] },
    { range: [300, Infinity], colour: red[800] },
  ],
  o3: [
    { range: [0, 50], colour: green[300] },
    { range: [50, 100], colour: yellow[300] },
    { range: [100, 150], colour: orange[300] },
    { range: [150, 300], colour: red[300] },
    { range: [300, Infinity], colour: red[800] },
  ],
  no2: [
    { range: [0, 60], colour: green[300] },
    { range: [60, 120], colour: yellow[300] },
    { range: [120, 180], colour: orange[300] },
    { range: [180, 360], colour: red[300] },
    { range: [360, Infinity], colour: red[800] },
  ],
  so2: [
    { range: [0, 100], colour: green[300] },
    { range: [100, 200], colour: yellow[300] },
    { range: [200, 300], colour: orange[300] },
    { range: [300, 600], colour: red[300] },
    { range: [600, Infinity], colour: red[800] },
  ],
};
export const pollutantUnits = {
  // TODO check these units
  pm10: "µg/m³",
  "pm2.5": "µg/m³",
  o3: "µg/m3",
  no2: "µg/m3",
  so2: "µg/m3",
};
