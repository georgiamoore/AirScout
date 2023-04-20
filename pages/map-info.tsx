/* eslint-disable @next/next/no-img-element */
import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import InfoIcon from "@mui/icons-material/Info";
import { linkStyle } from "../utils";
import Link from "next/link";

const MapInfo: NextPage = () => {
  return (
    <main className={styles.main}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <h2 className="text-gray-800 text-xl font-bold sm:text-2xl mb-6">
          About the pollutant map
        </h2>
        <Typography>
          The pollutant map displays the average levels of various air
          pollutants over the past 24 hours measured by the University’s air
          quality monitoring network, as well as data from across the West
          Midlands provided by external sources such as Defra. For more
          information on data sources, please visit the{" "}
          <Link href="/about">
            <a className={linkStyle}>
              <InfoIcon className="w-5 h-5 mr-1" />
              About
            </a>
          </Link>{" "}
          page.{" "}
        </Typography>
        <br />
        <Typography>
          The pollutants included on the map are ozone (O3), nitrogen dioxide
          (NO2), sulphur dioxide (SO2) and particulate matter (PM2.5 and PM10).
          For more information on pollutants, please visit the{" "}
          <Link href="/pollutants">
            <a className={linkStyle}>
              <InfoIcon className="w-5 h-5 mr-1" />
              Pollutants
            </a>
          </Link>{" "}
          page.
        </Typography>
        <br />
        <h2 className="text-gray-800 text-xl font-bold sm:text-2xl mb-6">
          How to use the map
        </h2>
        <Typography>
          On the map, you will see circular markers like this for each sensor
          site in the region:
          <img
            alt="A circle marker on the map, used to represent a sensor site."
            src="/marker.png"
          ></img>
          Clicking on one of these markers will open a popup showing the average
          pollutant value for the last 24 hours, as well as graphs of any
          available contextual information such as temperature.
          <img
            alt="The popup for an individual sensor site."
            src="/popup.png"
          ></img>
          Zooming out shows a grid of hexagons - these hexagons show a
          prediction of the average pollutant values across the region, using
          spatial interpolation based on existing values to estimate values for
          areas without sensors.
          <br />
          For example, in this image, the sensor in Birmingham city centre has a
          much lower pollutant value than those surrounding it, so the grid is
          coloured green in this area.
          <img
            alt="A grid of hexagons overlaying the map, colour-coded by average pollutant value in this area."
            src="/interpolation.png"
          ></img>
        </Typography>
        <br />
      </div>
    </main>
  );
};
export default MapInfo;
