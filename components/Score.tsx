import React from "react";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import Avatar from "@mui/material/Avatar";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "./Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Title from "./Title";
import { daqiColourMap } from "../utils";

export default function Score({ score }) {
  let highest = Object.values(score).reduce((highest, pollutant) =>
    highest.daqi > pollutant.daqi ? highest : pollutant
  );
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: { md: 600, sm: 350 },
        overflow: "auto",
      }}
    >
      <Title>Latest Air Quality Index</Title>
      <div className={"flex items-center m-2"}>
        <Avatar
          sx={{
            bgcolor: daqiColourMap[highest.daqi].colour,
            width: 56,
            height: 56,
          }}
        >
          {highest.daqi}
        </Avatar>
        <Typography component={"span"} className={`ms-2 text-xl `}>
          {daqiColourMap[highest.daqi].risk}
        </Typography>
      </div>
      <Typography component={"span"} className={"m-2"}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        malesuada lacus ex, sit amet blandit leo lobortis eget.
      </Typography>
      <Accordion className={"m-2"}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography component={"span"}>
            Air Quality Index for all pollutants
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {Object.entries(score).map(([key, value]) => (
              <ListItem key={key}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: daqiColourMap[value.daqi].colour,
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
            ))}
          </List>
          <Typography component={"span"}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
          <Typography component={"span"}>
            TODO needs full scale for reference
          </Typography>
        </AccordionDetails>
      </Accordion>

      <div className={"flex-grow"} />
      {/* <p>What is the Air Quality Index?</p> */}
      {/* ^ link with ? icon */}
    </Paper>
  );
}
