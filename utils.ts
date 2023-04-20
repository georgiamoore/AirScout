import { green, yellow, red, purple } from "@mui/material/colors";

export const pollutantValueRanges = {
  // Ranges from https://uk-air.defra.gov.uk/air-pollution/daqi?view=more-info
  pm10: [
    { range: [0, 50], colour: green[600], risk: "Low" },
    { range: [51, 75], colour: yellow[900], risk: "Moderate" },
    { range: [76, 100], colour: red[900], risk: "High" },
    { range: [101, Infinity], colour: purple["A700"], risk: "Very High" },
  ],
  "pm2.5": [
    { range: [0, 35], colour: green[600], risk: "Low" },
    { range: [36, 53], colour: yellow[900], risk: "Moderate" },
    { range: [56, 70], colour: red[900], risk: "High" },
    { range: [71, Infinity], colour: purple["A700"], risk: "Very High" },
  ],
  o3: [
    { range: [0, 100], colour: green[600], risk: "Low" },
    { range: [101, 160], colour: yellow[900], risk: "Moderate" },
    { range: [161, 240], colour: red[900], risk: "High" },
    { range: [241, Infinity], colour: purple["A700"], risk: "Very High" },
  ],
  no2: [
    { range: [0, 200], colour: green[600], risk: "Low" },
    { range: [201, 400], colour: yellow[900], risk: "Moderate" },
    { range: [401, 600], colour: red[900], risk: "High" },
    { range: [601, Infinity], colour: purple["A700"], risk: "Very High" },
  ],
  so2: [
    { range: [0, 266], colour: green[600], risk: "Low" },
    { range: [267, 532], colour: yellow[900], risk: "Moderate" },
    { range: [533, 1064], colour: red[900], risk: "High" },
    { range: [1065, Infinity], colour: purple["A700"], risk: "Very High" },
  ],
};

export const getPollutantValueRisk = (pollutant, value) => {
  for (const range of pollutantValueRanges[pollutant]) {
    if (value >= range.range[0] && value < range.range[1]) {
      return range.risk;
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
  1: { risk: "Low", colour: green[300] },
  2: { risk: "Low", colour: green[600] },
  3: { risk: "Low", colour: green[800] },
  4: { risk: "Moderate", colour: yellow["A200"] },
  5: { risk: "Moderate", colour: yellow[700] },
  6: { risk: "Moderate", colour: yellow[900] },
  7: { risk: "High", colour: red[300] },
  8: { risk: "High", colour: red[900] },
  9: { risk: "High", colour: red["A700"] },
  10: { risk: "Very High", colour: purple["A700"] },
};

export const daqiHealthAdvice = {
  Low: {
    general: "Enjoy your usual outdoor activities.",
    atRisk: "Enjoy your usual outdoor activities.",
  },
  Moderate: {
    general: "Enjoy your usual outdoor activities.",
    atRisk:
      "Adults and children with lung problems, and adults with heart problems, who experience symptoms, should consider reducing strenuous physical activity, particularly outdoors.",
  },
  High: {
    general:
      "Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.",
    atRisk:
      "Adults and children with lung problems, and adults with heart problems, should reduce strenuous physical exertion, particularly outdoors, and particularly if they experience symptoms. People with asthma may find they need to use their reliever inhaler more often. Older people should also reduce physical exertion.",
  },
  "Very High": {
    general:
      "Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.",
    atRisk:
      "Adults and children with lung problems, adults with heart problems, and older people, should avoid strenuous physical activity. People with asthma may find they need to use their reliever inhaler more often.",
  },
};

export const linkStyle = "font-medium text-indigo-600 hover:underline items-center"
export const paperHeight = 700;