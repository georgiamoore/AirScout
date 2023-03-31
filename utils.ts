// (element) => {
//     switch (element.veracity) {
//       case "low":
//         return "green";
//       case "medium":
//         return "yellow";
//       case "high":
//         return "red";
//       default:
//         return "black";
//     }
//   }

import { pink, green, teal, blue, orange, red } from "@mui/material/colors";

// const green = "#58C0A1";
// const teal = "#53C2E2";
// const blue = "#5597DE";
// const orange = "#F2B35B";
// const red = "#F16D64";

export const getColour = (p: number) => {
  // testing - PM10 ranges taken from https://www.epa.vic.gov.au/for-community/environmental-information/air-quality/pm10-particles-in-the-air
  const ranges = {
    pm10: [
      { range: [300, Infinity], color: red },
      { range: [120, 300], color: orange },
      { range: [80, 120], color: blue },
      { range: [40, 80], color: teal },
      { range: [0, 40], color: green },
    ],
    pm25: [
      // Define ranges and colors for pm2.5 pollutant
      // ...
    ]
  }
  const pollutant = Object.keys(ranges).find((p) =>
    chartSubject.toLowerCase().includes(p)
  );

  if (!pollutant) {
    return pink;
  }
  // Find the matching range and calculate the offset
  const { min, max } = ranges[pollutant];
  const range = min.find((r) => p >= r.range[0] && p < r.range[1]);
  const offset = (p - range.range[0]) / (range.range[1] - range.range[0]);

  return {
    color: range.color,
    offset: `${offset * 100}%`,
  };
};


