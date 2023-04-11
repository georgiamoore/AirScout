import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { daqiHealthAdvice } from "../utils";
import InfoIcon from "@mui/icons-material/Info";

const DAQI: NextPage = () => {
  return (
    <main className={styles.main}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <h2 className="text-gray-800 text-xl font-bold sm:text-2xl mb-6">
          Daily Air Quality Index
        </h2>
        <Typography>
          The Daily Air Quality Index (DAQI) is used to summarise current levels
          of air pollution. The index uses a numbered system (1-10) divided into
          four bands with corresponding health advice and recommended actions to
          take.
        </Typography>
        <br/>
        <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
          Health advice to accompany Daily Air Quality Index values
        </h3>
      {/* Table styling adapted from https://floatui.com/components/tables#:~:text=Table%20with%20bordered%20column */}
        <div className="mt-6 mb-6 shadow-sm border rounded-lg overflow-x-auto">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr className="divide-x ">
                <th className="py-3 px-6 " rowSpan={2}>
                  Air Pollution Banding
                </th>
                <th className="py-3 px-6" rowSpan={2}>
                  Value/Range
                </th>
                <th className="py-3 px-6 border-b text-center" colSpan={2}>
                  Accompanying health messages
                </th>
              </tr>
              <tr className="divide-x">
                <th className="py-3 px-6 border-l">At risk individuals*</th>
                <th className="py-3 px-6">General population</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              <tr key="Low" className="divide-x">
                <td className="px-6 py-4 ">Low</td>
                <td className="px-6 py-4  ">1-3</td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["Low"].atRisk}
                </td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["Low"].general}
                </td>
              </tr>
              <tr key="Moderate" className="divide-x">
                <td className="px-6 py-4  ">Moderate</td>
                <td className="px-6 py-4  ">4-6</td>
                <td className="px-6 py-4 ">
                  {daqiHealthAdvice["Moderate"].atRisk}
                </td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["Moderate"].general}
                </td>
              </tr>
              <tr key="High" className="divide-x">
                <td className="px-6 py-4 ">High</td>
                <td className="px-6 py-4  ">7-9</td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["High"].atRisk}
                </td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["High"].general}
                </td>
              </tr>
              <tr key="VeryHigh" className="divide-x">
                <td className="px-6 py-4 ">Very High</td>
                <td className="px-6 py-4  ">10</td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["Very High"].atRisk}
                </td>
                <td className="px-6 py-4  ">
                  {daqiHealthAdvice["Very High"].general}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Typography>
          * Adults and children with heart or lung problems are at greater risk
          of symptoms.
        </Typography>
        <Typography variant="h6">
          For more information please visit{" "}
          <a
            href="https://uk-air.defra.gov.uk/air-pollution/daqi"
            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline items-center"
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            DEFRA's DAQI information page
          </a>{" "}
          and the{" "}
          <a
            href="https://www.metoffice.gov.uk/weather/guides/air-quality"
            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline items-center"
          >
            <InfoIcon className="w-5 h-5 mr-1" />
            Met Office's air quality information page
          </a>
          .
        </Typography>
      </div>
    </main>
  );
};
export default DAQI;
