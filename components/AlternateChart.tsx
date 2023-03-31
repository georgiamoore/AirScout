// FROM https://github.com/mui/material-ui/blob/v5.11.9/docs/data/material/getting-started/templates/dashboard/Chart.tsx
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import Title from "./Title";
import { pink, green, teal, blue, orange, red } from "@mui/material/colors";
import { Line } from "react-chartjs-2";
Chart.register(CategoryScale);
const allPollutantRanges = {
    // testing - PM10 ranges taken from https://www.epa.vic.gov.au/for-community/environmental-information/air-quality/pm10-particles-in-the-air
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
  
 

export default function LineChart({  data, titlePrefix }) {
    // console.log( document.getElementById('chartJSContainer').getContext('2d'))
    // console.log(data)
    const chartRef = React.useRef(null);

  React.useEffect(() => {
    const chart = chartRef.current;
// console.log(chart)
    if (chart) {
    //   console.log('CanvasRenderingContext2D', chart.ctx);
    //   console.log('HTMLCanvasElement', chart.canvas);
    }
  }, []);
    if (!data[0]){
        return <div>No data for this time period.</div>
    }
    const chartSubject = Object.keys(data[0])[1];
    // console.log(data.map((d) => Object.entries(d).forEach((key, index)=> console.log(key))))

    // const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
    const down = (ctx, pollutant) => {
        const pollutantRanges = allPollutantRanges[pollutant];
        console.log(pollutantRanges==null)
        if (pollutantRanges == null)  return '000';
          
        const value = ctx.p1.parsed.y;
        const range = pollutantRanges.find(({ range }) => value >= range[0] && value < range[1]);
        const colour = range ? range.colour : green[300];
        return colour;
      }
    const chartData = {
        // labels: data.map((d) => d.time),
        datasets: [
            {
                label: chartSubject,
                data: data,
                segment: {
                    borderColor: ctx =>  down(ctx, chartSubject),
                    // borderDash: ctx => skipped(ctx, [6, 6]),
                  },
            }

        ]
    }
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


//   const chartSubject = Object.keys(data[0])[1];
// console.log( chartSubject.replace(/\./g,'\\\\.'))
  const theme = useTheme();
  return (
    <React.Fragment>
      <Title>
        Average {chartSubject.toUpperCase()} ({titlePrefix})
      </Title>
      {/* <ResponsiveContainer> */}
      <Line
       ref={chartRef}
        data={chartData}
        options={{
            parsing: {
                xAxisKey: 'timestamp',
                yAxisKey: chartSubject.replace(/\./g,'\\.')
              },
        responsive: true,
          plugins: {
            // title: {
            //   display: true,
            //   text: "Users Gained between 2016-2020"
            // },
            legend: {
              display: false
            }
          }
        }}
      />
      {/* </ResponsiveContainer> */}
    </React.Fragment>
  );
}
