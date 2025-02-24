import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormHelperText,
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
  setStatusMessage,
  setShowScanMessage,
  setShowScanOptions,
  setShowScanTable,
  setSelectedPorts,
} from "../../reducers/Slice";
import React, { useState } from "react";
import { selectFields } from "../../reducers/selectors";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import NetworkTable from "./NetworkTable";
import {
  ExpandLess,
  ExpandMore,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";
import {
  DeviceInfo,
  ScanButton,
  ScanStatus,
  ValidateIpAddress,
  ValidatePorts,
} from "./assets/customComponents";
import { scanTypes, timings } from "./assets/scanOptions";
import NetworkChart from "./NetworkChart";

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<Dispatch<AnyAction>>();
  const {
    devices,
    selectedScanType,
    selectedTarget,
    selectedTiming,
    selectedPorts,
    scanStatus,
    showScanMessage,
    showScanOptions,
    showScanTable,
    statusMessage,
    selectedDeviceInfo,
  } = useSelector(selectFields);

  const [errors, setErrors] = useState({
    selectedScanType: "",
    selectedTarget: "",
    selectedTiming: "",
    selectedPorts: "",
  });

  const [fullscreen, setFullscreen] = useState<boolean>(false);

  const validateInput = () => {
    HandleMessage("Scan requires more information.", "info");
    const errors: any = {};

    if (!selectedTarget || !ValidateIpAddress(selectedTarget)) {
      errors.selectedTarget = "*Valid IPv4, mask optional";
    }
    if (!selectedScanType) {
      errors.selectedScanType = {};
    }
    if (!selectedTiming) {
      errors.selectedTiming = {};
    }
    if (selectedPorts && !ValidatePorts(selectedPorts)) {
      errors.selectedPorts = "*Ex: 80 | 80-500 | 80,443";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (abortScan?: boolean) => {
    if (validateInput()) {
      runScan(
        selectedScanType,
        selectedTarget,
        selectedTiming,
        selectedPorts,
        abortScan
      );
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
    abortScan?: boolean
  ): Promise<void> => {
    try {
      const url = new URL("/scan", import.meta.env.VITE_BASE_URL);
      url.searchParams.append("scanType", selectedScanType);
      url.searchParams.append("target", encodeURIComponent(selectedTarget));
      url.searchParams.append("timing", selectedTiming);
      selectedPorts && url.searchParams.append("ports", selectedPorts);
      abortScan && url.searchParams.append("abortScan", "true");

      HandleMessage("", "pending");

      const res = await fetch(url.href);

      if (!abortScan && !res.ok) {
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
    } catch (error: any) {
      if (abortScan) {
        HandleMessage("Scan aborted.", "info");
      } else {
        HandleMessage("An error occurred.", "error");
      }
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* SCAN STATUS MESSAGE */}
      {scanStatus && (
        <Collapse in={showScanMessage} sx={{ zIndex: "50" }}>
          <ScanStatus
            scanStatus={scanStatus}
            message={statusMessage}
            onClose={() => dispatch(setShowScanMessage(false))}
          />
        </Collapse>
      )}
      {/* SCAN STATUS MESSAGE END */}

      {/* BODY CONTAINER */}
      <Box
        sx={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
        }}
      >
        {/* NETWORK GRAPH CONTAINER */}
        <Box
          sx={{
            display: "flex",
            height: "100%",
            position: fullscreen ? "fixed" : "relative",
            zIndex: fullscreen ? 1000 : "initial",
            top: fullscreen ? 0 : "initial",
            left: fullscreen ? 0 : "initial",
            width: fullscreen ? "100%" : "initial",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* SELECTED DEVICE CONTAINER */}
          {selectedDeviceInfo && (
            <Box
              sx={{
                backgroundColor: theme.palette.background.default,
                zIndex: 1,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                overflowY: "auto",
                height: "fit-content",
                top: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <DeviceInfo device={selectedDeviceInfo} />
            </Box>
          )}

          {/* SELECTED DEVICE CONTAINER END */}
          {/* NETWORK CHART */}
          {devices.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
            >
              <NetworkChart />
            </Box>
          )}

          {/* NETWORK CHART END */}

          {/* SCAN OPTIONS CONTAINER */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              position: "absolute",
              right: 0,
              bottom: 0,
              top: 0,
              height: "fit-content",
              zIndex: 1,
            }}
          >
            {/* LEFT COLUMN */}
            <Box>
              <Button
                disableTouchRipple
                title={!fullscreen ? "Toggle fullscreen" : "Close fullscreen"}
                sx={{
                  paddingBlock: "0.525rem",
                  borderBottomRightRadius: 0,
                  borderTopRightRadius: 0,
                  borderTopLeftRadius: 0,
                  backgroundColor: theme.palette.background.default,
                  "&:hover": {
                    backgroundColor: theme.palette.background.default,
                  },
                }}
                onClick={() => setFullscreen(!fullscreen)}
              >
                {!fullscreen ? <Fullscreen /> : <FullscreenExit />}
              </Button>
            </Box>
            {/* RIGHT COLUMN */}
            <Box>
              <Button
                disableTouchRipple
                sx={{
                  width: "100%",
                  gap: "0.5rem",
                  paddingBlock: "0.5rem",
                  borderRadius: 0,
                  borderBottomLeftRadius: showScanOptions ? 0 : "",
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
                    padding: "1.5rem 1rem 1rem 1rem",
                    gap: "1.5rem",
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  {/* ScanType */}
                  <FormControl required error={!!errors.selectedScanType}>
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

                  {/* Target */}
                  <TextField
                    value={selectedTarget}
                    error={!!errors.selectedTarget}
                    label="Target"
                    spellCheck="false"
                    size="small"
                    type="text"
                    onChange={(e) =>
                      dispatch(setSelectedTarget(e.target.value))
                    }
                  />
                  {errors.selectedTarget && (
                    <FormHelperText sx={{ mt: "-1rem" }}>
                      {errors.selectedTarget}
                    </FormHelperText>
                  )}

                  {/* Timing */}
                  <FormControl required error={!!errors.selectedTiming}>
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

                  {/* Ports */}
                  <TextField
                    error={!!errors.selectedPorts}
                    label="Port / Ports"
                    spellCheck="false"
                    value={selectedPorts}
                    size="small"
                    type="text"
                    onChange={(e) => dispatch(setSelectedPorts(e.target.value))}
                  />
                  {errors.selectedPorts && (
                    <FormHelperText sx={{ mt: "-1rem" }}>
                      {errors.selectedPorts}
                    </FormHelperText>
                  )}

                  {scanStatus === "pending" ? (
                    <ScanButton
                      onClick={() => handleSubmit(true)}
                      bgColor={
                        theme.palette.mode === "dark"
                          ? theme.palette.error.dark
                          : theme.palette.error.light
                      }
                      label="Stop"
                    />
                  ) : (
                    <ScanButton
                      onClick={() => handleSubmit(false)}
                      bgColor={
                        theme.palette.mode === "dark"
                          ? theme.palette.info.dark
                          : theme.palette.info.light
                      }
                      label="Scan"
                    />
                  )}
                </Box>
              </Collapse>
            </Box>
            {/* RIGHT COLUMN END */}
          </Box>
          {/* SCAN OPTIONS CONTAINER END */}
        </Box>
        {/* NETWORK GRAPH CONTAINER END */}

        {/* TABLE CONTAINER */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button
            disableTouchRipple
            title={!showScanTable ? "Show" : "Hide"}
            sx={{
              borderRadius: 0,
              backgroundColor: theme.palette.background.default,
              "&:hover": {
                backgroundColor: theme.palette.background.default,
              },
            }}
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
};

export default Dashboard;
