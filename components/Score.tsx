import React from "react";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import Avatar from "@mui/material/Avatar";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Title from "./Title";
import { daqiColourMap, daqiHealthAdvice, linkStyle } from "../utils";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";

export default function Score({ score }) {
  let highest = Object.entries(score).reduce((highest, [pollutant, info]) => {
    if (highest.daqi === undefined) highest = highest[1];
    return highest.daqi > info.daqi
      ? {
          ...highest,
          pollutant: pollutant,
          colour: daqiColourMap[highest.daqi].colour,
          risk: daqiColourMap[highest.daqi].risk,
        }
      : {
          ...info,
          pollutant: pollutant,
          colour: daqiColourMap[info.daqi].colour,
          risk: daqiColourMap[info.daqi].risk,
        };
  });

  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: { md: 600, sm: 350 },
        overflow: "auto",
      }}
    >
      <div className={"flex flex-col justify-center items-center mb-4"}>
        <Title>Highest Daily Air Quality Index</Title>
        <List>
          <ListItem key="highest">
            <ListItemIcon>
              <Avatar
                sx={{
                  bgcolor: highest.colour,
                  width: 48,
                  height: 48,
                }}
              >
                {highest.daqi}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={<span className={"text-xl"}>{highest.risk}</span>}
              secondary={
                <>
                  {" " + highest.pollutant.toUpperCase()},
                  {" " + highest.station_name + " "}
                </>
              }
            />
          </ListItem>
        </List>
        {/* TODO above needs some context but not sure how to word it */}
        {/* <div className={"flex items-center m-2"}>
          <Typography component={"span"}>
            The above measurement is the highest Air Quality Index over the past
            24 hours.
          </Typography>
        </div> */}
        {/* adapted from https://flowbite.com/docs/components/alerts/#additional-content */}
        <div className="w-full p-4 mb-4 text-indigo-800 border border-indigo-300 rounded-lg bg-indigo-50 dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-800">
          <div className="flex items-center">
            <InfoIcon className="w-5 h-5 mr-1" />
            <h3 className="text-lg font-medium">Health advice</h3>
          </div>
          <div className="mt-2 mb-2 text-sm">
            <ul role="list" className="space-y-2 ">
              <li className="flex gap-x-3">
                <span>
                  <strong className="font-semibold text-indigo-900">
                    At-risk individuals
                  </strong>
                  <br />
                  {/* {daqiHealthAdvice["High"].atRisk} */}
                  {daqiHealthAdvice[highest.risk].atRisk}
                </span>
              </li>
              <li className="">
                <span>
                  <strong className="font-semibold text-indigo-900">
                    General population
                  </strong>
                  <br />
                  {/* {daqiHealthAdvice["High"].general} */}
                  {daqiHealthAdvice[highest.risk].general}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Accordion className={"m-2"}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography component={"span"}>
              Highest Air Quality Index for all pollutants
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {Object.entries(score).map(
                ([key, value]) =>
                  value.daqi !== 0 && (
                    <ListItem key={key}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor:
                              value.daqi !== 0
                                ? daqiColourMap[value.daqi].colour
                                : "grey",
                            width: 48,
                            height: 48,
                          }}
                        >
                          {value.daqi}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={key.toUpperCase()}
                        secondary={
                          <>
                            Site:
                            {" " + value.station_name}
                            <br />
                            Measurement period:
                            {" " + value.measurement_period}
                          </>
                        }
                      />
                    </ListItem>
                  )
              )}
            </List>
            <Typography component={"span"}>
              The Air Quality Index is calculated using pollutant measurements
              from the past 24 hours, averaged using the measurement periods
              shown above.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
      <div className={"flex-grow"} />{" "}
      {/* used to stick content to bottom of container */}
      <a
        href="/daqi"
        className={linkStyle}
      >
        <HelpIcon className={"mr-1"} />
        {"What is the Air Quality Index?"}
      </a>
    </Paper>
  );
}
