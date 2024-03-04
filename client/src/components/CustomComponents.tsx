import { Alert, Box, LinearProgress } from "@mui/material";
import React from "react";

const StatusCircle = React.memo(({ status }: { status: string }) => {
  const color = status === "up" ? "hsl(120, 73%, 70%)" : "hsl(0, 100%, 50%)";
  return (
    <Box
      width={14}
      height={14}
      borderRadius="50%"
      bgcolor={color}
      display="inline-block"
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
        return <LinearProgress variant="indeterminate" />;
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

export { StatusCircle, ScanStatus };
