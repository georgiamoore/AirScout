import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "./Button";
import LineChart from "./LineChart";

export default function ChartContainer({ chart }) {
  
  const CONTAINER_STATE = {
    annual: "annual",
    monthly: "monthly",
    weekly: "weekly",
    daily: "daily",
  };
  const [visibleChart, setVisibleChart] = useState(CONTAINER_STATE.annual);

  return (
    <Grid item xs={2} sm={2} md={4}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems:"center",
          justifyContent:"center",
          height: 350,
          // minHeight: 350,
          // height: "auto"
          // overflow:"auto"
        }}
      >
        {visibleChart === CONTAINER_STATE.annual && (
          <LineChart data={chart.year} titlePrefix={"last 365 days"} />
        )}
        {visibleChart === CONTAINER_STATE.monthly && (
          <LineChart data={chart.month} titlePrefix={"last 30 days"} />
        )}
        {visibleChart === CONTAINER_STATE.weekly && (
          <LineChart data={chart.week} titlePrefix={"last 7 days"} />
        )}
        {visibleChart === CONTAINER_STATE.daily && (
          <LineChart data={chart.yesterday} titlePrefix={"yesterday"} />
        )}
        <div className={"flex-grow"} />
        <div>
          <Button onClick={() => setVisibleChart(CONTAINER_STATE.annual)}>Annual</Button>
          <Button onClick={() => setVisibleChart(CONTAINER_STATE.monthly)}>Monthly</Button>
          <Button onClick={() => setVisibleChart(CONTAINER_STATE.weekly)}>Weekly</Button>
          <Button onClick={() => setVisibleChart(CONTAINER_STATE.daily)}>Daily</Button>
        </div>
      </Paper>
    </Grid>
  );
}
