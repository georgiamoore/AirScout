import React from "react";
import Paper from "@mui/material/Paper";
import Button from "./Button";
import Title from "./Title";

export default function Score({ score }) {
    console.log(score)
  return (
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
      <Title>Score</Title>
      {/* <div className={"flex-grow"} /> */}
      {score.map((item) => {
        console.log(item)
        return (
          <div>
            <div>{item.pollutant}</div>
            <div>{item.poll_index}</div>
          </div>
        );
      })
      }
    </Paper>
  );
}
