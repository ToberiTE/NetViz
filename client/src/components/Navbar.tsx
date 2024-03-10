import { Link } from "react-router-dom";
import { Typography, useTheme, Box, IconButton, Theme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext } from "../color-context";
import { Brightness4, Brightness7 } from "@mui/icons-material";

const Navbar: React.FC = () => {
  const theme = useTheme<Theme>();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      padding="0.75rem 2.5rem"
      height="4rem"
      width="100%"
      bgcolor={theme.palette.background.default}
      position="fixed"
      top="0"
      zIndex="100"
    >
      <Box display="flex" gap={2}>
        <Link to="/">
          <img
            src="/netviz.svg"
            alt="Logo"
            style={{
              display: "flex",
              height: "1.75rem",
              aspectRatio: "16/9",
              alignItems: "center",
              filter: theme.palette.mode === "light" ? "invert(0.8)" : "",
            }}
          />
        </Link>
        <Typography variant="h5">NetViz&trade;</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <IconButton
          onClick={colorMode.toggleColorMode}
          color="inherit"
          title={
            theme.palette.mode === "dark"
              ? "Toggle light mode"
              : "Toggle dark mode"
          }
        >
          {theme.palette.mode === "dark" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Navbar;
