import {
  Box,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Device,
  setDevices,
  setScanStatus,
  setSelectedFlag,
  setSelectedTarget,
  setSelectedTiming,
} from "../../reducers/dashboardSlice";
import React, { useState } from "react";
import { selectDashboardFields } from "../../reducers/selectors";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import NetworkTable from "./NetworkTable";
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { ScanStatus, StatusCircle } from "../CustomComponents";
import { flags, timings } from "../ScanOptions";

const Dashboard: React.FC = React.memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch<Dispatch<AnyAction>>();
  const { devices, selectedFlag, selectedTarget, selectedTiming, scanStatus } =
    useSelector(selectDashboardFields);
  const [statusMessage, setStatusMessage] = useState<string>();
  const [validation, setValidation] = useState<boolean>(false);
  const [showScanTable, setShowScanTable] = useState<boolean>(false);
  const [showScanOptions, setShowScanOptions] = useState<boolean>(true);
  const [showScanMessage, setShowScanMessage] = useState<boolean>(true);

  const HandleValidationErrors = (): void => {
    if (selectedTarget.length < 2 && !selectedFlag && !selectedTiming) {
      HandleMessage("Scan requires more information.", "info");
      setValidation(false);
    } else {
      setValidation(true);
    }
  };

  const HandleMessage = (message: string, status: string) => {
    setStatusMessage(message);
    dispatch(setScanStatus(status));
    setShowScanMessage(true);
  };

  const runScan = async (
    selectedFlag: string,
    selectedTarget: string,
    selectedTiming: string
  ): Promise<void> => {
    HandleValidationErrors();
    if (validation === true) {
      try {
        const url = new URL("/scan", import.meta.env.VITE_BASE_URL);
        url.searchParams.append("flag", selectedFlag);
        url.searchParams.append("target", encodeURIComponent(selectedTarget));
        url.searchParams.append("timing", selectedTiming);
        HandleMessage("", "pending");
        const res = await fetch(url.href);

        if (!res.ok) {
          HandleMessage("Scan failed.", "error");
          return;
        }

        const data = await res.json();

        const deviceObj: Device[] = data.map((item: any) => ({
          hostname: item.hostname,
          ipAddress: item.ipAddress,
          macAddress: item.macAddress,
          vendor: item.vendor,
          status: item.status,
          openPorts: item.openPorts,
        }));

        dispatch(setDevices(deviceObj));
        if (data.length) {
          HandleMessage("Scan succeded.", "success");
        }
      } catch (error) {
        HandleMessage("Server error.", "error");
      }
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {scanStatus && (
        <Collapse in={showScanMessage}>
          <ScanStatus
            scanStatus={scanStatus}
            message={statusMessage}
            onClose={() => setShowScanMessage(false)}
          />
        </Collapse>
      )}
      {/* BODY CONTAINER */}
      <Box
        sx={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
        }}
      >
        {/* SCAN OPTIONS MENU */}
        <Box
          sx={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            right: "0",
          }}
        >
          <Button
            variant="text"
            disableTouchRipple
            sx={{
              boxShadow: "none",
              display: "flex",
              justifyContent: "start",
              color: theme.palette.text.primary,
              borderBottomRightRadius: "0",
              borderTopLeftRadius: "0",
              borderTopRightRadius: "0",
              opacity: showScanOptions ? "1" : "0.5",
              borderBottomLeftRadius: showScanOptions ? "0" : "",
              backgroundColor: theme.palette.background.default,
              "&:hover": {
                backgroundColor: theme.palette.background.default,
              },
            }}
            onClick={() => setShowScanOptions(!showScanOptions)}
          >
            {showScanOptions ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          <Collapse orientation="horizontal" in={showScanOptions}>
            <Box display="flex">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottomLeftRadius: "0.5rem",
                  p: "1rem",
                  gap: "1rem",
                  backgroundColor: theme.palette.background.default,
                }}
              >
                {/* Flags */}
                <FormControl>
                  <InputLabel size="small" aria-invalid id="flag">
                    Flag
                  </InputLabel>
                  <Select
                    labelId="flag"
                    size="small"
                    input={<OutlinedInput label="Flag" />}
                    value={selectedFlag}
                    onChange={(e) => dispatch(setSelectedFlag(e.target.value))}
                  >
                    {flags.map((i) => (
                      <MenuItem key={i.Description} value={i.Flag}>
                        {i.Description + " " + i.Flag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/*  Target */}
                <TextField
                  label="Target"
                  spellCheck="false"
                  size="small"
                  type="text"
                  onChange={(e) => dispatch(setSelectedTarget(e.target.value))}
                />
                {/*  Timing */}
                <FormControl>
                  <InputLabel size="small" aria-invalid id="timing">
                    Timing
                  </InputLabel>
                  <Select
                    labelId="timing"
                    size="small"
                    input={<OutlinedInput label="Timing" />}
                    value={selectedTiming}
                    onChange={(e) =>
                      dispatch(setSelectedTiming(e.target.value))
                    }
                  >
                    {timings.map((i) => (
                      <MenuItem key={i.Description} value={i.Timing}>
                        {i.Description + " " + i.Timing}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.info.dark
                        : theme.palette.info.light,
                    color: theme.palette.text.primary,
                  }}
                  onClick={() =>
                    runScan(selectedFlag, selectedTarget, selectedTiming)
                  }
                >
                  Scan
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>
        {/* SCAN OPTIONS MENU END */}
        {/* NETWORK GRAPH CONTAINER*/}
        <Box
          sx={{
            display: "flex",
            height: "100%",
          }}
        >
          {/* NETWORK CHART & TOOLTIP */}
          {devices.map((device: Device, i: number) => (
            <Box key={i}>
              <Typography>{device.hostname}</Typography>
              <Typography>{device.ipAddress}</Typography>
              <Typography>{device.macAddress}</Typography>
              <Typography>{device.vendor}</Typography>
              <Typography display="flex" alignItems="center" gap={1}>
                Status: {<StatusCircle status={device.status} />}
              </Typography>
              <Typography>Open ports:</Typography>
              {device.openPorts.map((t) => (
                <Typography>
                  {t.portNumber} {t.protocol} {t.serviceName} {t.state}
                </Typography>
              ))}
            </Box>
          ))}
          {/* NETWORK CHART & TOOLTIP END*/}
        </Box>
        {/* NETWORK GRAPH CONTAINER END*/}
        {/* TABLE CONTAINER */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button
            sx={{ color: theme.palette.text.primary }}
            onClick={() => setShowScanTable(!showScanTable)}
          >
            {showScanTable ? <ExpandMore /> : <ExpandLess />}
          </Button>
          <Collapse in={showScanTable}>
            <NetworkTable />
          </Collapse>
        </Box>
        {/* TABLE CONTAINER END*/}
      </Box>
    </Box>
  );
});

export default Dashboard;
