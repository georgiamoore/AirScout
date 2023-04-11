import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import InfoIcon from "@mui/icons-material/Info";

const Pollutants: NextPage = () => {
  return (
    <main className={styles.main}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <h2 className="text-gray-800 text-xl font-bold sm:text-2xl mb-6">
          Pollutants
        </h2>
 
        <h3 className="text-gray-800 text-l font-bold sm:text-xl">
          Particulate matter (PM)
        </h3>
        <br/>
        <Typography>
          PM consists of a mixture of solid particles and liquid droplets suspended in air. 
          PM is generally divided into two groups, categorised by the particles' size: PM10 and PM2.5. 
          <br/>PM10 = particles with a diameter of 10 micrometres or less.
          <br/>PM2.5 = particles with a diameter of 2.5 micrometres or less. 
          <br/>Sources of PM typically include combustion of fossil fuels, traffic and industrial activities. 
          <br/>Health risks posed by PM include increased risk of respiratory and cardiovascular diseases, with PM2.5 posing the greatest risk due to its ability to enter the bloodstream.
        </Typography>
        <br/>

        <h3 className="text-gray-800 text-l font-bold sm:text-xl">
        Nitrogen dioxide (NO2)
        </h3>
        <br/>
        <Typography>
        A reddish-brown gas, primarily released from vehicle exhausts and other processes using fossil fuel combustion. Exposure to high levels of NO2 can irritate the airways, reduce lung function and increase the risk of respiratory infections.  
        <br/> NO2 can aggravate asthma and other respiratory diseases, as it causes inflammation of the airways.
        <br/> NO2 is also a precursor to the formation of ozone.
        </Typography>
        <br/>

        <h3 className="text-gray-800 text-l font-bold sm:text-xl">
        Ground-level ozone (O3) 
        </h3>
        <br/>
        <Typography>
          Formed through reactions with other pollutants in the atmosphere, such as NO2 and volatile organic compounds (VOCs).
          Ozone levels increase during sunny weather, as the reaction is triggered by sunlight. 
          <br/> Ozone can irritate the airways, reduce lung function and increase the risk of lung diseases. 
        </Typography>
        <br/>

        <h3 className="text-gray-800 text-l font-bold sm:text-xl">
        Sulphur dioxide (SO2)
        </h3>
        <br/>
        <Typography>
          A strong-smelling, toxic gas. The primary source of SO2 is the combustion of fossil fuels in industrial processes.
          <br/>Exposure to SO2 causes breathing difficulty, particularly affecting those with asthma.
          <br/>High concentrations of SO2 can also trigger the formation of particulate matter (PM).
        </Typography>
        <br/>
      
        <Typography variant="h6">
          For more information please visit the{" "}
          <a
            href="https://www.who.int/teams/environment-climate-change-and-health/air-quality-and-health/health-impacts/types-of-pollutants"
            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline items-center"
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            WHO's air quality information page
          </a>{" "}
          and the{" "}<a
            href="https://www.epa.gov/criteria-air-pollutants"
            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline items-center"
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            US EPA's air pollutant information section
          </a>.
        </Typography>
      </div>
    </main>
  );
};
export default Pollutants;
