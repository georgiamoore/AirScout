// FROM https://github.com/mui/material-ui/blob/v5.11.9/docs/data/material/getting-started/templates/dashboard/Chart.tsx
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Title from "./Title";
import { pink, green, teal, blue, orange, red } from "@mui/material/colors";
export default function Chart({ data, titlePrefix }) {
  const getColour = (pollutant: string) => {
    // testing - PM10 ranges taken from https://www.epa.vic.gov.au/for-community/environmental-information/air-quality/pm10-particles-in-the-air
    const allPollutantRanges = {
      pm10: [
        { range: [300, Infinity], colour: red[300] },
        { range: [120, 300], colour: orange[300] },
        { range: [80, 120], colour: blue[300] },
        { range: [40, 80], colour: teal[300] },
        { range: [0, 40], colour: green[300] },
      ],
      // "pm2.5": [
      //   // Define ranges and colours for pm2.5 pollutant
      //   // ...
      // ]
    };
    
    if (!allPollutantRanges[pollutant]) {
        return [
          {
            key: "0",
            offset: "0%",
            stopColor: "000",
          },
        ];
      }
    const pollutantRanges = allPollutantRanges[pollutant];

  };


  const chartSubject = Object.keys(data[0])[1];

  const theme = useTheme();
  return (
    <React.Fragment>
      <Title>
        Average {chartSubject.toUpperCase()} ({titlePrefix})
      </Title>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
            {/* <Tooltip
              active={true}
              wrapperStyle={{
                visibility: "visible",
              }}
            /> */}
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: "middle",
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              {/*TODO needs units added!*/}
              {chartSubject}
            </Label>
          </YAxis>
          <defs>
            <linearGradient id={chartSubject+"gradient"} x1="0" y1="0" x2="0" y2="100%">

              {/* {gradientStops.map((stop, index) => {
                console.log(stop);
                return (
                  <stop
                    key={index}
                    offset={stop.offset}
                    stopColor={stop.colour}
                  />
                );
              })} */}


               {/* <stop key={chartSubject+"1"} offset="40%" stopColor="#ffb74d" /> 
               <stop key={chartSubject+"2"} offset="66%" stopColor="#64b5f6" /> 
               <stop key={chartSubject+"3"} offset="50%" stopColor="#4db6ac" /> 
               <stop key={chartSubject+"4"} offset="0%" stopColor="#81c784" /> 
               <stop key={chartSubject+"100"} offset="100%" stopColor="#81c784" />  */}
          

            </linearGradient>
          </defs>
          <ReferenceLine y={9800} label="Max" stroke="red" />
          <Line
            type="monotone"
            dataKey={chartSubject}
            stroke={`url(#${chartSubject}gradient)`}
            // activeDot={{ r: 8, stroke:"red" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
