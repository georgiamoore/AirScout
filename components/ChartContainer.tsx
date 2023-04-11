import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import LineChart from "./LineChart";

export default function ChartContainer({ chart, visibleChart }) {
  // todo move to utils.ts
  const CONTAINER_STATE = {
    annual: "annual",
    monthly: "monthly",
    weekly: "weekly",
    daily: "daily",
  };

  return (
    <Grid item xs={2} sm={2} md={4}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        {visibleChart === CONTAINER_STATE.annual && (
          <LineChart data={chart.year} />
        )}
        {visibleChart === CONTAINER_STATE.monthly && (
          <LineChart data={chart.month} />
        )}
        {visibleChart === CONTAINER_STATE.weekly && (
          <LineChart data={chart.week} />
        )}
        {visibleChart === CONTAINER_STATE.daily && (
          <LineChart data={chart.yesterday} />
        )}
        <div className={"flex-grow"} />
      </Paper>
    </Grid>
  );
}
