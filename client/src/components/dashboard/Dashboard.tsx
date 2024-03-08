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
    showScanMessage,
    showScanOptions,
    showScanTable,
    statusMessage,
  } = useSelector(selectFields);

  const [errors, setErrors] = useState({
    selectedScanType: "",
    selectedTarget: "",
    selectedTiming: "",
    selectedPorts: "",
  });

  const validateInput = () => {
    const validateIpAddress = (addr: string): boolean => {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

      // Check for IPv4 with optional CIDR
      if (ipv4Regex.test(addr)) {
        // Validate each octet is between 0 and 255
        const parts = addr.split("/");
        const octets = parts[0].split(".");
        for (let i = 0; i < octets.length; i++) {
          if (parseInt(octets[i], 10) > 255) {
            return false;
          }
        }
        // Check if CIDR is between 0 and 32
        if (
          parts[1] &&
          (parseInt(parts[1], 10) < 0 || parseInt(parts[1], 10) > 32)
        ) {
          return false;
        }
        return true;
      }
      return false;
    };

    HandleMessage("Scan requires more information.", "info");
    const errors: any = {};

    if (!selectedTarget || !validateIpAddress(selectedTarget)) {
      errors.selectedTarget = {};
    }
    if (!selectedScanType) {
      errors.selectedScanType = {};
    }
    if (!selectedTiming) {
      errors.selectedTiming = {};
    }
    const regex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    if (!selectedPorts && regex.test(selectedPorts)) {
      errors.selectedPorts = "Ex: 80 | 80-500 | 80,443 | http";
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
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottomLeftRadius: "0.5rem",
                  padding: "1rem",
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

                {/*  Target */}
                <TextField
                  value={selectedTarget}
                  error={!!errors.selectedTarget}
                  label="Target"
                  spellCheck="false"
                  size="small"
                  type="text"
                  onChange={(e) => dispatch(setSelectedTarget(e.target.value))}
                />

                {/*  Timing */}
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

                {/*  Ports */}
                <TextField
                  error={!!errors.selectedPorts}
                  label="Port / Ports / Protocol"
                  spellCheck="false"
                  value={selectedPorts}
                  size="small"
                  type="text"
                  onChange={(e) => dispatch(setSelectedPorts(e.target.value))}
                />
                <FormHelperText>{errors.selectedPorts}</FormHelperText>
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
                    onClick={() => handleSubmit(true)}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.info.dark
                          : theme.palette.info.light,
                      color: theme.palette.text.primary,
                    }}
                    onClick={() => handleSubmit(false)}
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
