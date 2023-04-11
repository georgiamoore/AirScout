import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useState } from "react";
import ContentLoader from "react-content-loader";
import Container from "@mui/material/Container";
import ChartContainer from "../components/ChartContainer";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import useSWR, { mutate } from "swr";
import Title from "../components/Title";
import Score from "../components/Score";

const apiURL = process.env.NEXT_PUBLIC_API_URL;
const pollutants = ["pm2.5", "pm10", "o3", "no2", "so2"];

let date = new Date();
date.setDate(date.getDate() - 1);
let yesterday = date.toLocaleDateString("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const MapPlaceholder = (
  <>
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: 600,
      }}
    >
      <Title>{"Pollutant map for " + yesterday}</Title>
      <ContentLoader width="100%" height="600">
        <rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
      </ContentLoader>
    </Paper>
  </>
);

const ChartPlaceholder = pollutants.map((pollutant) => (
  <Grid
    item
    xs={2}
    sm={4}
    md={4}
    key={pollutant + "-chart-placeholder-container"}
  >
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: 240,
      }}
    >
      <ContentLoader width="100%" height="100%">
        <rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
      </ContentLoader>
    </Paper>
  </Grid>
));

const ScorePlaceholder = (
  <Paper
    sx={{
      p: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: { md: 600, sm: 350 },
    }}
  >
    <Title>Highest Daily Air Quality Index</Title>
    <ContentLoader width="100%" height="100%">
      <rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
    </ContentLoader>
  </Paper>
);

const Map = dynamic(() => import("../components/Map"), {
  loading: () => MapPlaceholder,
  ssr: false,
});

const Home: NextPage = () => {
  const CHART_CONTAINER_STATE = {
    annual: "annual",
    monthly: "monthly",
    weekly: "weekly",
    daily: "daily",
  };
  const [visibleChart, setVisibleChart] = useState(
    CHART_CONTAINER_STATE.annual
  );
  const multipleFetcher = (urls: string[]) => {
    const f = (url: string) =>
      fetch(url)
        .then((r) => r.json())
        .catch((err) => console.log(err));
    return Promise.all(urls.map((url) => f(url)));
  };

  //TODO implement requests using this function rather than multiple useEffect hooks
  const useMultipleRequests = (urls) => {
    const { data, error } = useSWR(urls, multipleFetcher);

    return {
      data: data,
      isError: !!error,
      isLoading: !data && !error,
      error: error,
    };
  };

  // TODO these requests should have their own error messages (fed into placeholder if needed)
  const { data: mapData, isLoading: mapDataLoading } = useMultipleRequests([
    apiURL + "/aston",
    apiURL + "/defra",
  ]);

  const { data: chartData, isLoading: chartDataLoading } = useMultipleRequests([
    `${apiURL}/stats`,
  ]);
  const { data: daqiData, isLoading: daqiDataLoading } = useMultipleRequests([
    `${apiURL}/daqi`,
  ]);

  let MapComponent, Charts, ScoreComponent;
  if (mapDataLoading) {
    MapComponent = MapPlaceholder;
  } else if (mapData) {
    MapComponent = <Map combinedData={mapData} />;
  }

  if (chartDataLoading) {
    Charts = ChartPlaceholder;
  } else if (chartData) {
    const timePeriods = Object.keys(chartData[0]);
    const filterChartDataByPollutant = (pollutant) => {
      return chartData.map((data) => {
        const filtered = {};
        timePeriods.forEach((timePeriod) => {
          filtered[timePeriod] = data[timePeriod].map(
            ({ timestamp, ...prev }) => {
              const obj = {};
              obj.timestamp = timestamp;
              obj[pollutant] = prev[pollutant];

              return obj;
            }
          );
        });
        return filtered;
      })[0];
    };

    Charts = (
      <>
        {pollutants.map((pollutant) => {
          return (
            <ChartContainer
              chart={filterChartDataByPollutant(pollutant)}
              key={pollutant + "container"}
              visibleChart={visibleChart}
            />
          );
        })}
      </>
    );
  }

  if (daqiDataLoading) {
    ScoreComponent = ScorePlaceholder;
  } else if (daqiData) {
    if (daqiData[0] === undefined) {
      console.log(daqiDataLoading);
      console.log(daqiData);
      daqiDataLoading = true;
      mutate([`${apiURL}/daqi`, multipleFetcher]);
    } else {
      ScoreComponent = <Score score={daqiData[0]} />;
    }
  }
  let inactiveButtonStyle =
    "inline-block p-4 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-600";
  let activeButtonStyle =
    "inline-block p-4 border-b-2 border-indigo-700 text-indigo-700";
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Container maxWidth="xl" sx={{ minWidth: "250px" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              {ScoreComponent}
            </Grid>

            <Grid item xs={12} md={9}>
              {MapComponent}
            </Grid>
          </Grid>
        </Container>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Title>Average pollutant values</Title>
          {/* table styling adapted from https://flowbite.com/docs/components/tabs/#interactive-tabs */}
          <ul className="w-full border-b flex items-center gap-x-3 overflow-x-auto">
            <li>
              <button
                className={
                  visibleChart === CHART_CONTAINER_STATE.annual
                    ? activeButtonStyle
                    : inactiveButtonStyle
                }
                onClick={() => setVisibleChart(CHART_CONTAINER_STATE.annual)}
              >
                Annual
              </button>
            </li>
            <li>
              <button
                className={
                  visibleChart === CHART_CONTAINER_STATE.monthly
                    ? activeButtonStyle
                    : inactiveButtonStyle
                }
                onClick={() => setVisibleChart(CHART_CONTAINER_STATE.monthly)}
              >
                Monthly
              </button>
            </li>
            <li>
              <button
                className={
                  visibleChart === CHART_CONTAINER_STATE.weekly
                    ? activeButtonStyle
                    : inactiveButtonStyle
                }
                onClick={() => setVisibleChart(CHART_CONTAINER_STATE.weekly)}
              >
                Weekly
              </button>
            </li>
            <li>
              <button
                className={
                  visibleChart === CHART_CONTAINER_STATE.daily
                    ? activeButtonStyle
                    : inactiveButtonStyle
                }
                onClick={() => setVisibleChart(CHART_CONTAINER_STATE.daily)}
              >
                Daily
              </button>
            </li>
          </ul>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 1, sm: 2, md: 12 }}
          >
            {Charts}
          </Grid>
        </Container>
      </main>
    </div>
  );
};

export default Home;
