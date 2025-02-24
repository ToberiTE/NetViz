import { useEffect, useState } from "react";
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
import { ColorModeContext } from "./color-context";
import store from "./store";

function App(_Props: { toggleColorMode: void }) {
  const prefersDarkMode = useMediaQuery<string>("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<string>();

  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);

  const colorMode = {
    toggleColorMode: (): void => {
      setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    },
  };

  const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            background: {
              default: "hsl(240,50%,8%)",
              paper: "hsl(240,50%,4%)",
            },
            text: {
              primary: "hsl(0,0%,90%)",
            },
          }
        : {
            background: {
              default: "hsl(165,100%,92%)",
              paper: "hsl(0,0%,96%)",
            },
            text: {
              primary: "hsl(0,0%,10%)",
            },
          }),
    },
  });

  const theme = () => createTheme(getDesignTokens(mode as PaletteMode));

  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <Box
            display="flex"
            width="100%"
            height="100%"
            position="fixed"
            top="3.5rem"
            maxHeight="calc(100% - 3.5rem)"
          >
            <ColorModeContext.Provider value={colorMode}>
              <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                <Navbar />
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
