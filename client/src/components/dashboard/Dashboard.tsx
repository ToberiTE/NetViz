import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  debounce,
  useTheme,
} from "@mui/material";
import {
  Device,
  setDevices,
  setScanStatus,
  setSelectedFlag,
  setSelectedTarget,
} from "../../reducers/dashboardSlice";
import React, { useState } from "react";
import { selectDashboardFields } from "../../reducers/selectors";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import NetworkTable from "./NetworkTable";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ScanStatus, StatusCircle, flags } from "../Assets";

const Dashboard: React.FC = React.memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch<Dispatch<AnyAction>>();

  const { devices, selectedFlag, selectedTarget, scanStatus } = useSelector(
    selectDashboardFields
  );

  const [statusMessage, setStatusMessage] = useState<string>();

  const runScan = async (
    selectedFlag: string,
    selectedTarget: string
  ): Promise<void> => {
    try {
      if (selectedFlag && selectedTarget) {
        const url = new URL("/scan", import.meta.env.VITE_BASE_URL);
        url.searchParams.append("flag", selectedFlag);
        url.searchParams.append("target", encodeURIComponent(selectedTarget));
        dispatch(setScanStatus("pending"));
        const res = await fetch(url.href);

        if (!res.ok) {
          setStatusMessage("Scan failed.");
          dispatch(setScanStatus("error"));
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
        setStatusMessage("Scan succeded.");
        dispatch(setScanStatus("success"));
      }
    } catch (error) {
      setStatusMessage("Server error.");
      dispatch(setScanStatus("error"));
    }
    debounce(() => {
      setStatusMessage("");
      dispatch(setScanStatus(""));
    }, 5000);
  };

  const [tableCollapsed, setTableCollapsed] = useState<boolean>(false);
  const [scanOptionsCollapsed, setScanOptionsCollapsed] =
    useState<boolean>(false);

  const CollapseTable = (): void => {
    setTableCollapsed(!tableCollapsed);
  };
  const CollapseScanOptions = (): void => {
    setScanOptionsCollapsed(!scanOptionsCollapsed);
  };

  return (
    <Box
      bgcolor={theme.palette.background.paper}
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box
          display="flex"
          flexDirection="column"
          position="absolute"
          right={0}
        >
          <Box
            sx={{
              display: scanOptionsCollapsed ? "none" : "flex",
              flexDirection: "column",
              p: "1rem",
              gap: "1rem",
              zIndex: "2",
              backgroundColor: theme.palette.background.default,
            }}
          >
            <FormControl>
              <InputLabel size="small" aria-invalid id="flags">
                Flag
              </InputLabel>
              <Select
                labelId="flags"
                size="small"
                input={<OutlinedInput label="Flag" />}
                value={selectedFlag}
                onChange={(e) => dispatch(setSelectedFlag(e.target.value))}
              >
                {flags.map((flag) => (
                  <MenuItem key={flag.Name} value={flag.Flag}>
                    {flag.Name + " " + flag.Flag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Target"
              spellCheck="false"
              size="small"
              onChange={(e) => dispatch(setSelectedTarget(e.target.value))}
            />
            <Button
              variant="outlined"
              onClick={() => runScan(selectedFlag, selectedTarget)}
            >
              Scan
            </Button>
          </Box>
          <Button
            variant="contained"
            sx={{
              height: "1.5rem",
              zIndex: "100",
              color: theme.palette.primary.main,
              borderTopLeftRadius: "0",
              borderTopRightRadius: "0",
              borderBottomRightRadius: "0",
              backgroundColor: theme.palette.background.default,
            }}
            onClick={CollapseScanOptions}
          >
            {scanOptionsCollapsed ? <ExpandMore /> : <ExpandLess />}
          </Button>
        </Box>
        <Box display="flex" height="100%">
          <Box
            sx={{
              width: "100%",
              height: "2rem",
              position: "absolute",
            }}
          >
            {scanStatus === "pending" ? (
              <ScanStatus scanStatus={scanStatus} />
            ) : null}
            {scanStatus === "success" || scanStatus === "error" ? (
              <ScanStatus scanStatus={scanStatus} message={statusMessage} />
            ) : null}
          </Box>

          {devices.map((device: Device, i: number) => (
            <Box key={i} width="100%">
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
        </Box>
        <Button onClick={CollapseTable}>
          {tableCollapsed ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Box
          display="flex"
          flexDirection="column"
          height={tableCollapsed ? "0" : "auto"}
        >
          <NetworkTable />
        </Box>
      </Box>
    </Box>
  );
});

export default Dashboard;
