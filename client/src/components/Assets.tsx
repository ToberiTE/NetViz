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
  ({ scanStatus, message }: { scanStatus: string; message?: string }) => {
    if (scanStatus === "pending") {
      return <LinearProgress variant="indeterminate" />;
    }
    if (scanStatus === "error") {
      return (
        <Alert variant="filled" severity="error">
          {message}
        </Alert>
      );
    }
    if (scanStatus === "success") {
      return (
        <Alert variant="filled" severity="success">
          {message}
        </Alert>
      );
    }
  }
);

const flags = [
  {
    Name: "TCP SYN",
    Flag: "-sS",
  },
  {
    Name: "TCP Connect",
    Flag: "-sT",
  },
  {
    Name: "UDP",
    Flag: "-sU",
  },
  {
    Name: "TCP FIN",
    Flag: "-sF",
  },
  {
    Name: "TCP NULL",
    Flag: "-sN",
  },
  {
    Name: "Xmas",
    Flag: "-sX",
  },
  {
    Name: "TCP ACK",
    Flag: "-sA",
  },
  {
    Name: "TCP Window",
    Flag: "-sW",
  },
  {
    Name: "TCP Maimon",
    Flag: "-sM",
  },
  {
    Name: "TCP Idle",
    Flag: "-sI",
  },
  {
    Name: "IP Protocol",
    Flag: "-sO",
  },
  {
    Name: "TCP FTP Bounce",
    Flag: "-b",
  },
];

export { StatusCircle, ScanStatus, flags };
