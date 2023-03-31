// FROM https://github.com/mui/material-ui/blob/v5.11.9/docs/data/material/getting-started/templates/dashboard/Title.tsx
import * as React from "react";
import Typography from "@mui/material/Typography";

interface TitleProps {
  children?: React.ReactNode;
}

export default function Title(props: TitleProps) {
  return (
    <Typography className=" text-indigo-600 " component="h3" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}
