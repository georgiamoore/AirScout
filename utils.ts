import { green, yellow, orange, red, purple } from "@mui/material/colors";
// import { purple } from "tailwindcss/colors";
export const pollutantValueRanges = {
  // testing - PM10 ranges taken from https://www.epa.vic.gov.au/for-community/environmental-information/air-quality/pm10-particles-in-the-air
  pm10: [
    { range: [0, 40], colour: green[500], meaning: "Low" },
    { range: [40, 80], colour: yellow["A200"], meaning: "Moderate" },
    { range: [80, 120], colour: yellow[900], meaning: "Moderate" },
    { range: [120, 300], colour: red[900], meaning: "High" },
    { range: [300, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  "pm2.5": [
    { range: [0, 25], colour: green[500], meaning: "Low" },
    { range: [25, 50], colour: yellow["A200"], meaning: "Moderate" },
    { range: [50, 100], colour: yellow[900], meaning: "Moderate" },
    { range: [100, 300], colour: red[900], meaning: "High" },
    { range: [300, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  o3: [
    { range: [0, 50], colour: green[500], meaning: "Low" },
    { range: [50, 100], colour: yellow["A200"], meaning: "Moderate" },
    { range: [100, 150], colour: yellow[900], meaning: "Moderate" },
    { range: [150, 300], colour: red[900], meaning: "High" },
    { range: [300, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  no2: [
    { range: [0, 60], colour: green[500], meaning: "Low" },
    { range: [60, 120], colour: yellow["A200"], meaning: "Moderate" },
    { range: [120, 180], colour: yellow[900], meaning: "Moderate" },
    { range: [180, 360], colour: red[900], meaning: "High" },
    { range: [360, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  so2: [
    { range: [0, 100], colour: green[500], meaning: "Low" },
    { range: [100, 200], colour: yellow["A200"], meaning: "Moderate" },
    { range: [200, 300], colour: yellow[900], meaning: "Moderate" },
    { range: [300, 600], colour: red[900], meaning: "High" },
    { range: [600, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
};

export const getPollutantValueMeaning = (pollutant, value) => {
  for (const range of pollutantValueRanges[pollutant]) {
    if (value >= range.range[0] && value < range.range[1]) {
      return range.meaning;
    }
  }
  return null;
};

export const pollutantUnits = {
  // TODO check these units
  pm10: "µg/m³",
  "pm2.5": "µg/m³",
  o3: "µg/m³",
  no2: "µg/m³",
  so2: "µg/m³",
};

export const daqiColourMap = {
  1: { meaning: "Low", colour: green[300] },
  2: { meaning: "Low", colour: green[500] },
  3: { meaning: "Low", colour: green[800] },
  4: { meaning: "Moderate", colour: yellow["A200"] },
  5: { meaning: "Moderate", colour: yellow[700] },
  6: { meaning: "Moderate", colour: yellow[900] },
  7: { meaning: "High", colour: red[300] },
  8: { meaning: "High", colour: red[900] },
  9: { meaning: "High", colour: red["A700"] },
  10: { meaning: "Very High", colour: purple["A700"] },
};
