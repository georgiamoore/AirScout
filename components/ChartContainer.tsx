import React, { useState } from "react";
import Chart from "../components/Chart";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";

export default function ChartContainer({ chart }) {
  const CONTAINER_STATE = {
    annual: "annual",
    monthly: "monthly",
    weekly: "weekly",
    daily: "daily",
  };
  const [visibleChart, setVisibleChart] = useState(CONTAINER_STATE.daily);
  // TODO handle empty data here
  return (
    <Grid item xs={2} sm={4} md={4}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: 240,
        }}
      >
        {visibleChart === CONTAINER_STATE.annual && (
          <Chart data={JSON.parse(chart.year)} titlePrefix={"last 365 days"} />
        )}
        {visibleChart === CONTAINER_STATE.monthly && (
          <Chart data={JSON.parse(chart.month)} titlePrefix={"last 30 days"} />
        )}
        {visibleChart === CONTAINER_STATE.weekly && (
          <Chart data={JSON.parse(chart.week)} titlePrefix={"last 7 days"} />
        )}
        {visibleChart === CONTAINER_STATE.daily && (
          <Chart data={JSON.parse(chart.yesterday)} titlePrefix={"yesterday"} />
        )}
      </Paper>
      <Button onClick={() => setVisibleChart(CONTAINER_STATE.annual)}>
        Annual
      </Button>
      <Button onClick={() => setVisibleChart(CONTAINER_STATE.monthly)}>
        Monthly
      </Button>
      <Button onClick={() => setVisibleChart(CONTAINER_STATE.weekly)}>
        Weekly
      </Button>
      <Button onClick={() => setVisibleChart(CONTAINER_STATE.daily)}>
        Daily
      </Button>
    </Grid>
  );
}
