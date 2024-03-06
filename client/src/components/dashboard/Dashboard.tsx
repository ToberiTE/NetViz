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
  useTheme,
} from "@mui/material";
import {
  Device,
  setDiscoveredHosts,
  setDevices,
  setScanStatus,
  setSelectedScanType,
  setSelectedTarget,
  setSelectedTiming,
  setValidation,
  setStatusMessage,
  setShowScanMessage,
  setShowScanOptions,
  setShowScanTable,
  setSelectedPorts,
} from "../../reducers/Slice";
import React from "react";
import { selectFields } from "../../reducers/selectors";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import NetworkTable from "./NetworkTable";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ScanStatus } from "./assets/customComponents";
import { scanTypes, timings } from "./assets/scanOptions";
import NetworkChart from "./NetworkChart";

const Dashboard: React.FC = React.memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch<Dispatch<AnyAction>>();
  const {
    devices,
    selectedScanType,
    selectedTarget,
    selectedTiming,
    selectedPorts,
    scanStatus,
    validation,
    showScanMessage,
    showScanOptions,
    showScanTable,
    statusMessage,
  } = useSelector(selectFields);

  const HandleValidationErrors = (): void => {
    if (selectedTarget.length < 2 && !selectedScanType && !selectedTiming) {
      HandleMessage("Scan requires more information.", "info");
      dispatch(setValidation(false));
    } else {
      dispatch(setValidation(true));
    }
  };

  const HandleMessage = (message: string, status: string) => {
    dispatch(setStatusMessage(message));
    dispatch(setScanStatus(status));
    dispatch(setShowScanMessage(true));
  };

  const runScan = async (
    selectedScanType: string,
    selectedTarget: string,
    selectedTiming: string,
    selectedPorts?: string,
    cancellationToken?: any
  ): Promise<void> => {
    HandleValidationErrors();
    if (validation === true) {
      try {
        const url = new URL("/scan", import.meta.env.VITE_BASE_URL);
        url.searchParams.append("scanType", selectedScanType);
        url.searchParams.append("target", encodeURIComponent(selectedTarget));
        url.searchParams.append("timing", selectedTiming);
        if (selectedPorts) {
          url.searchParams.append("ports", selectedPorts);
        }

        HandleMessage("", "pending");

        const res = await fetch(
          url.href,
          cancellationToken?.register // Pass the signal from cancellationToken
        );

        if (cancellationToken?.isCancellationRequested) {
          HandleMessage("Scan stopped.", "info");
          return;
        }

        if (!res.ok) {
          HandleMessage("Server error.", "error");
          return;
        }

        const data = await res.json();

        const deviceObj: Device[] = data.devices.map((item: any) => ({
          hostname: item.hostname,
          ipAddress: item.ipAddress,
          macAddress: item.macAddress,
          vendor: item.vendor,
          status: item.status,
          openPorts: item.openPorts,
        }));

        const hosts: string[] = data.devices.map((item: any) => ({
          ipAddress: item.ipAddress,
        }));

        if (hosts.length > 0) {
          dispatch(setDiscoveredHosts(hosts));
        }

        if (data.devices.length) {
          dispatch(setDevices(deviceObj));
        }

        if (data.scanSummary) {
          HandleMessage(`Scan succeeded: ${data.scanSummary}`, "success");
        }
      } catch (error) {
        HandleMessage("Scan failed.", "error");
      }
    } else {
      return;
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
      {/* SCAN STATUS MESSAGE */}
      {scanStatus && (
        <Collapse in={showScanMessage} sx={{ zIndex: "2" }}>
          <ScanStatus
            scanStatus={scanStatus}
            message={statusMessage}
            onClose={() => dispatch(setShowScanMessage(false))}
          />
        </Collapse>
      )}
      {/* SCAN STATUS MESSAGE END*/}

      {/* BODY CONTAINER */}
      <Box
        sx={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
        }}
      >
        {/* NETWORK GRAPH CONTAINER*/}
        <Box
          sx={{
            display: "flex",
            height: "100%",
            position: "relative",
          }}
        >
          {/* NETWORK CHART  */}
          {devices.length > 0 && <NetworkChart />}

          {/* NETWORK CHART END*/}

          {/* SCAN OPTIONS CONTAINER */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "fixed",
              right: "0",
              zIndex: 1,
            }}
          >
            <Button
              variant="text"
              disableTouchRipple
              sx={{
                gap: "0.5rem",
                paddingBlock: "0.5rem",
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
              onClick={() => dispatch(setShowScanOptions(!showScanOptions))}
            >
              Scan options
              {showScanOptions ? <ExpandLess /> : <ExpandMore />}
            </Button>

            <Collapse orientation="vertical" in={showScanOptions}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottomLeftRadius: "0.5rem",
                  p: "1rem",
                  gap: "1.5rem",
                  backgroundColor: theme.palette.background.default,
                }}
              >
                {/* ScanType */}
                <FormControl>
                  <InputLabel size="small" aria-invalid id="scanType">
                    Scan type
                  </InputLabel>
                  <Select
                    labelId="scanType"
                    size="small"
                    input={<OutlinedInput label="Scan type" />}
                    value={selectedScanType}
                    onChange={(e) =>
                      dispatch(setSelectedScanType(e.target.value))
                    }
                  >
                    {scanTypes.map((i) => (
                      <MenuItem key={i.Description} value={i.ScanType}>
                        {i.Description + " " + i.ScanType}
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
                  onChange={(e) => {
                    dispatch(setSelectedTarget(e.target.value));
                  }}
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

                {/*  Ports */}
                <TextField
                  label="Port / Ports"
                  spellCheck="false"
                  size="small"
                  type="text"
                  onChange={(e) => {
                    dispatch(setSelectedPorts(e.target.value));
                  }}
                />
                {scanStatus === "pending" ? (
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.error.dark
                          : theme.palette.error.light,
                      color: theme.palette.text.primary,
                    }}
                    onClick={async () => await runScan("", "", "", "", true)}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.info.dark
                          : theme.palette.info.light,
                      color: theme.palette.text.primary,
                    }}
                    onClick={async () =>
                      await runScan(
                        selectedScanType,
                        selectedTarget,
                        selectedTiming,
                        selectedPorts ?? null
                      )
                    }
                  >
                    Scan
                  </Button>
                )}
              </Box>
            </Collapse>
          </Box>
          {/* SCAN OPTIONS CONTAINER END */}
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
            onClick={() => dispatch(setShowScanTable(!showScanTable))}
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
