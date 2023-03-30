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
} from "recharts";
import Title from "./Title";

export default function Chart({ data, titlePrefix }) {
  const theme = useTheme();
  return (
    <React.Fragment>
      <Title>
        Average {Object.keys(data[0])[1]} ({titlePrefix})
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
            <Tooltip
              active={true}
              wrapperStyle={{
                visibility: "visible",
              }}
            />
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
              {Object.keys(data[0])[1]}
            </Label>
          </YAxis>
          <Line
            type="monotone"
            dataKey={Object.keys(data[0])[1]}
            stroke={"#E31C79"}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
