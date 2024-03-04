import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Provider } from "react-redux";
import {
  Box,
  CssBaseline,
  PaletteMode,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { ColorModeContext } from "./color-context";
import Sidenav from "./components/Sidenav";

import store from "./store";

function App(_Props: { toggleColorMode: void }) {
  const prefersDarkMode = useMediaQuery<string>("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<string>();

  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: (): void => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const dark = grey;
  const light = grey;
  const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary: dark,
            divider: dark[500],
            background: {
              default: "hsl(40,0%,8%)",
              paper: dark[900],
            },
            text: {
              primary: dark[100],
              secondary: dark[50],
            },
          }
        : {
            primary: light,
            divider: light[500],
            background: {
              default: light[200],
              paper: light[50],
            },
            text: {
              primary: light[900],
              secondary: light[800],
            },
          }),
    },
  });

  const theme = useMemo(
    () => createTheme(getDesignTokens(mode as PaletteMode)),
    [mode]
  );
  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <Box
            display="flex"
            width="100%"
            height="100%"
            position="fixed"
            top="4rem"
            maxHeight="calc(100% - 4rem)"
          >
            <ColorModeContext.Provider value={colorMode}>
              <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                <Navbar />
                <Sidenav />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                </Routes>
              </ThemeProvider>
            </ColorModeContext.Provider>
          </Box>
        </Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
