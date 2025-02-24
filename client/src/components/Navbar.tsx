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
      alignItems="center"
      justifyContent="space-between"
      px="1rem"
      height="3.5rem"
      width="100%"
      bgcolor={theme.palette.background.default}
      position="fixed"
      top="0"
      zIndex="2"
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
              filter: theme.palette.mode === "light" ? "invert(0.9)" : "",
            }}
          />
        </Link>
        <Typography variant="h5">NetViz</Typography>
      </Box>
      <Box>
        <IconButton
          disableTouchRipple
          onClick={colorMode.toggleColorMode}
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
