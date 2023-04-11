import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import InfoIcon from "@mui/icons-material/Info";
import { linkStyle } from "../utils";
const About: NextPage = () => {
  return (
    <main className={styles.main}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <h2 className="text-gray-800 text-xl font-bold sm:text-2xl mb-6">
          About this site
        </h2>
        <Typography>
          This site was created by{" "}
          <a href="https://github.com/georgiamoore" className={linkStyle}>
            Georgia Moore
          </a>
          , as an individual final year project.
          <br />
          It aims to provide an interactive and informative way to explore air
          pollution data in the West Midlands.
        </Typography>
        <br />
        <h2 className="text-gray-800 text-xl font-bold sm:text-2xl mb-6">
          Motivation
        </h2>
        <Typography>
          Outdoor air pollution is a major concern for public health worldwide.
          According to the{" "}
          <a
            href="https://www.rcplondon.ac.uk/projects/outputs/every-breath-we-take-lifelong-impact-air-pollution"
            className={linkStyle}
          >
            Royal College of Physicians
          </a>
          , pollution is estimated to cause around 40,000 deaths annually.
          Health problems stemming from pollutant exposure are estimated to cost
          the UK more than £20 billion each year.
          <br />
          The ability to monitor and understand air pollution is therefore
          incredibly important. This system aims to provide this data in a way
          that enables informed decision making, and to help people understand
          the impact of air pollution on their health.
        </Typography>
        <br />

        <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
          Data sources
        </h3>
        <br />

        <Typography>
          Pollutant measurements from Defra's{" "}
          <a
            href="https://uk-air.defra.gov.uk/networks/network-info?view=aurn"
            className={linkStyle}
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            Automatic Urban and Rural Network (AURN)
          </a>{" "}
          are retrieved using{" "}
          <a
            href="https://bookdown.org/david_carslaw/openair/"
            className={linkStyle}
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            openair
          </a>
          , licensed under the{" "}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/2/"
            className={linkStyle}
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            Open Government Licence v2.0
          </a>
          .
        </Typography>
        <Typography>
          Other pollutant measurements are retrieved from sensors at Aston
          University, using an internal data pipeline/API created by Riyad
          Rahman.{" "}
          <a href="https://github.com/AstonAirQuality" className={linkStyle}>
            <InfoIcon className="w-5 h-5 mr-1" />
            AstonAirQuality GitHub organisation
          </a>
          .
        </Typography>
      </div>
    </main>
  );
};
export default About;
