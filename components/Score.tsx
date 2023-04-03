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
  let highest = score.reduce((max, item) =>
    item.poll_index > max.poll_index ? item : max
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
            bgcolor: daqiColourMap[highest.poll_index].colour,
            width: 56,
            height: 56,
          }}
        >
          {highest.poll_index}
        </Avatar>
        <Typography component={"span"} className={`ms-2 text-xl `}>
          {daqiColourMap[highest.poll_index].meaning}
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
            {score.map((item) => (
              <ListItem key={item.pollutant}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: daqiColourMap[item.poll_index].colour,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {item.poll_index}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={item.pollutant.toUpperCase()}
                  secondary={
                    <>
                      Time:
                      {" " +
                        new Date(item.date).toLocaleString("en-GB", {
                          timeStyle: "short",
                          dateStyle: "medium",
                        })}
                      <br />
                      Site:
                      {" " + item.site}
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
        </AccordionDetails>
      </Accordion>

      <div className={"flex-grow"} />
      {/* <p>What is the Air Quality Index?</p> */}
      {/* ^ link with ? icon */}
    </Paper>
  );
}
