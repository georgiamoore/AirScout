import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React from "react";
import ContentLoader from "react-content-loader";
import Container from "@mui/material/Container";
import ChartContainer from "../components/ChartContainer";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import useSWR from "swr";
import Title from "../components/Title";
const apiURL = process.env.NEXT_PUBLIC_API_URL;
const MapPlaceholder = (
  <ContentLoader width="100%" height="600">
    <rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
  </ContentLoader>
);
const ChartPlaceholder = (
  <Grid item xs={2} sm={4} md={4}>
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
);
const Map = dynamic(() => import("../components/Map"), {
  loading: () => MapPlaceholder,
  ssr: false,
});
const Header = dynamic(() => import("../components/Header"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

const Home: NextPage = () => {
  const multipleFetcher = (urls: string[]) => {
    const f = (url: string) =>
      fetch(url)
        .then((r) => r.json())
        .catch((err) => console.log(err));
    return Promise.all(urls.map((url) => f(url)));
  };

  //TODO implement requests using this function rather than multiple useEffect hooks
  const useMultipleRequests = (urls) => {
    // const urls = [apiURL + '/plume', apiURL + '/waqi', apiURL + '/waqi-archive', apiURL + '/aston',
    //               apiURL + '/defra?pollutants=PM2.5', apiURL + '/defra_bmld', apiURL + '/defra_bold']
    const { data, error } = useSWR(urls, multipleFetcher);

    return {
      data: data,
      isError: !!error,
      isLoading: !data && !error,
      error: error,
    };
  };

  const { data: mapData, isLoading: mapDataLoading } = useMultipleRequests([
    // apiURL + "/aston",
    // apiURL + "/defra?pollutants=pm2.5",
    apiURL + "/defra",
  ]);
  const pollutants = ["pm2.5", "pm10", "o3", "no2", "so2"];
  // const chartUrls = pollutants.map(
  //   (pollutant) => `${apiURL}/stats?pollutants=${pollutant}`
  // );

  const { data: chartData, isLoading: chartDataLoading } = useMultipleRequests([
    `${apiURL}/stats`,
  ]);

  let MapComponent, Charts;
  if (mapDataLoading) {
    MapComponent = MapPlaceholder;
  } else if (mapData) {
    MapComponent = <Map combinedData={mapData} />;
  }
  if (chartDataLoading) {
    Charts = pollutants.map((pollutant) => ChartPlaceholder);
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
            />
            // )
          );
        })}
      </>
    );
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Container fixed sx={{ minWidth: "250px" }}>
          {/* <Title>Map of pollutant data</Title> */}
          {MapComponent}
        </Container>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 1, sm: 2, md: 12 }}
          >
            {Charts}
          </Grid>
          {/* <Copyright sx={{ pt: 4 }} /> */}
        </Container>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
