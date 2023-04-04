import { green, yellow, orange, red, purple } from "@mui/material/colors";
// import { purple } from "tailwindcss/colors";
export const pollutantValueRanges = {
  // Ranges from https://uk-air.defra.gov.uk/air-pollution/daqi?view=more-info
  // TODO ensure data period matches (e.g. ozone should be 8 hour average)
  pm10: [
    { range: [0, 50], colour: green[600], meaning: "Low" },
    { range: [51, 75], colour: yellow[900], meaning: "Moderate" },
    { range: [76, 100], colour: red[900], meaning: "High" },
    { range: [101, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  "pm2.5": [
    { range: [0, 35], colour: green[600], meaning: "Low" },
    { range: [36, 53], colour: yellow[900], meaning: "Moderate" },
    { range: [56, 70], colour: red[900], meaning: "High" },
    { range: [71, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  o3: [
    { range: [0, 100], colour: green[600], meaning: "Low" },
    { range: [101, 160], colour: yellow[900], meaning: "Moderate" },
    { range: [161, 240], colour: red[900], meaning: "High" },
    { range: [241, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  no2: [
    { range: [0, 200], colour: green[600], meaning: "Low" },
    { range: [201, 400], colour: yellow[900], meaning: "Moderate" },
    { range: [401, 600], colour: red[900], meaning: "High" },
    { range: [601, Infinity], colour: purple["A700"], meaning: "Very High" },
  ],
  so2: [
    { range: [0, 266], colour: green[600], meaning: "Low" },
    { range: [267, 532], colour: yellow[900], meaning: "Moderate" },
    { range: [533, 1064], colour: red[900], meaning: "High" },
    { range: [1065, Infinity], colour: purple["A700"], meaning: "Very High" },
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
  2: { meaning: "Low", colour: green[600]},
  3: { meaning: "Low", colour: green[800]},
  4: { meaning: "Moderate", colour: yellow["A200"]},
  5: { meaning: "Moderate", colour: yellow[700]},
  6: { meaning: "Moderate", colour: yellow[900]},
  7: { meaning: "High", colour: red[300]},
  8: { meaning: "High", colour: red[900]},
  9: { meaning: "High", colour: red["A700"]},
  10: { meaning: "Very High", colour: purple["A700"]},
};
