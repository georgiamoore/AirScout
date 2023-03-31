import { Button as MUIButton } from "@mui/material";
export default function Button({ onClick, children }) {
  return (
    <MUIButton
      sx={{ mx: 0.5, my: 1 }}
      className="px-3 py-1.5 text-sm text-white duration-150 bg-indigo-600 rounded-lg hover:bg-indigo-700 active:shadow-lg"
      onClick={onClick}
    >
      {children}
    </MUIButton>
  );
}
