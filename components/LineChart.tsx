// FROM https://github.com/mui/material-ui/blob/v5.11.9/docs/data/material/getting-started/templates/dashboard/Chart.tsx
import  React, { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import Title from "./Title";
import { green} from "@mui/material/colors";
import { Line } from "react-chartjs-2";
Chart.register(CategoryScale);
import { pollutantUnits, pollutantValueRanges } from "../utils";


export default function LineChart({ data, titlePrefix }) {
  const chartRef = useRef(null);

  if (!data[0]) {
    return <Title>No data for this time period. ({titlePrefix})</Title>;
  }
  const chartSubject = Object.keys(data[0])[1];

  const getSegmentColour = (ctx, pollutant) => {
    const pollutantRange = pollutantValueRanges[pollutant];
    if (pollutantRange == null) return "000";

    const value = ctx.p1.parsed.y;

    const range = pollutantRange.find(
      ({ range }) => value >= range[0] && value < range[1]
    );
    const colour = range ? range.colour : green[300];
    return colour;
  };
  const getPointColour = (ctx, pollutant) => {
    const pollutantRange = pollutantValueRanges[pollutant];
    if (pollutantRange == null) return "000";
    let value = ctx.dataset.data[ctx.dataIndex][pollutant];
    const range = pollutantRange.find(
      ({ range }) => value >= range[0] && value < range[1]
    );
    const colour = range ? range.colour : green[300];
    return colour;
  };
  const chartData = {
    // labels: data.map((d) => d.time),
    datasets: [
      {
        label: chartSubject,
        data: data,
        pointBackgroundColor: (ctx) => getPointColour(ctx, chartSubject),
        pointBorderColor: (ctx) => getPointColour(ctx, chartSubject),
        segment: {
          borderColor: (ctx) => getSegmentColour(ctx, chartSubject),
        },
      },
    ],
  };

  return (
    <React.Fragment>
      <Title>
        Average {chartSubject.toUpperCase()} ({pollutantUnits[chartSubject]}) ({titlePrefix})
      </Title>
      <div className="chart-container" style={{"position": "relative", "height":"100%", "width":"100%"}}>
      <Line
        ref={chartRef}
        data={chartData}
        options={{
          parsing: {
            xAxisKey: "timestamp",
            yAxisKey: chartSubject.replace(/\./g, "\\."),
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20,
                    maxRotation: 0,
                    minRotation: 0,
                }
            }
        },
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
      </div>
    </React.Fragment>
  );
}
