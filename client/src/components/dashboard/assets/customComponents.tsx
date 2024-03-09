import {
  Alert,
  Button,
  LinearProgress,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { Device, Port } from "../../../reducers/Slice";

const StatusCircle = React.memo(({ status }: { status: string }) => {
  const color = status === "up" ? "hsl(120, 73%, 70%)" : "hsl(0, 100%, 50%)";
  return (
    <span
      style={{
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        backgroundColor: `${color}`,
        display: "inline-block",
      }}
    />
  );
});

const ScanStatus = React.memo(
  ({
    scanStatus,
    message,
    onClose,
  }: {
    scanStatus: string;
    message?: string;
    onClose: () => void;
  }) => {
    switch (scanStatus) {
      case "pending":
        return <LinearProgress color="info" variant="indeterminate" />;
      case "error":
        return (
          <Alert
            sx={{
              borderRadius: "0",
            }}
            variant="filled"
            severity="error"
            onClose={onClose}
          >
            {message}
          </Alert>
        );
      case "success":
        return (
          <Alert
            sx={{
              borderRadius: "0",
            }}
            variant="filled"
            severity="success"
            onClose={onClose}
          >
            {message}
          </Alert>
        );
      case "info":
        return (
          <Alert
            sx={{
              borderRadius: "0",
            }}
            variant="filled"
            severity="info"
            onClose={onClose}
          >
            {message}
          </Alert>
        );
      default:
        return null;
    }
  }
);

const ValidateIpAddress = (addr: string): boolean => {
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

const ValidatePorts = (ports: string): boolean => {
  const portRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
  // check if: single port 80, comma separated string 80,443 or range 80-500.
  if (portRegex.test(ports)) {
    return true;
  }
  return false;
};

const DeviceInfo = ({ device }: { device: Device }) => (
  <>
    <Typography>{device.hostname}</Typography>
    <Typography>{device.ipAddress}</Typography>
    <Typography>{device.macAddress}</Typography>
    <Typography>{device.vendor}</Typography>
    <Typography display="flex" alignItems="center" gap={1}>
      Status: {<StatusCircle status={device.status} />}
    </Typography>
    <Typography pt="0.5rem">Open ports:</Typography>
    {device.openPorts.map((port: Port, key: number) => (
      <Typography key={key}>
        {port.portNumber} {port.protocol} {port.serviceName} {port.state}
      </Typography>
    ))}
  </>
);

const ScanButton = ({
  onclick,
  bgColor,
  label,
}: {
  onclick: () => void;
  bgColor: string;
  label: string;
}): JSX.Element => {
  const theme = useTheme();
  return (
    <Button
      disableTouchRipple
      type="submit"
      variant="outlined"
      style={{
        color: theme.palette.text.primary,
      }}
      onClick={onclick}
      sx={{ backgroundColor: bgColor }}
    >
      {label}
    </Button>
  );
};

export {
  StatusCircle,
  ScanStatus,
  ValidateIpAddress,
  ValidatePorts,
  DeviceInfo,
  ScanButton,
};
