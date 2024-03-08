import { Graph } from "react-d3-graph";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, useTheme } from "@mui/material";
import { selectFields } from "../../reducers/selectors";
import {
  Port,
  setSelectedDeviceInfo,
  setShowSelectedDeviceInfo,
} from "../../reducers/Slice";
import { StatusCircle } from "./assets/customComponents";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";

const NetworkGraph = () => {
  const theme = useTheme();
  const dispatch = useDispatch<Dispatch<AnyAction>>();
  const {
    discoveredHosts,
    devices,
    showSelectedDeviceInfo,
    selectedDeviceInfo,
    showScanTable,
  } = useSelector(selectFields);

  const config = {
    width: 1400,
    height: showScanTable ? 450 : 800,
    highlightDegree: 0,
    nodeHighlightBehavior: true,
    node: {
      color: "blue",
      highlightColor: "lightblue",
      fontColor: theme.palette.text.primary,
      size: 100,
    },

    link: {
      strokeWidth: 0.1,
      color: theme.palette.text.primary,
    },
  };

  const onClickNode = (nodeId: string): void => {
    const node = devices.find(
      (host: { ipAddress: string }) => host.ipAddress === nodeId
    );
    if (node) {
      dispatch(
        setSelectedDeviceInfo(
          <Box>
            <Typography>{node.hostname}</Typography>
            <Typography>{node.ipAddress}</Typography>
            <Typography>{node.macAddress}</Typography>
            <Typography>{node.vendor}</Typography>
            <Typography display="flex" alignItems="center" gap={1}>
              Status: {<StatusCircle status={node.status} />}
            </Typography>
            <Typography>Open ports:</Typography>
            {node.openPorts.map((port: Port, key: number) => (
              <Typography key={key}>
                {port.portNumber} {port.protocol} {port.serviceName}{" "}
                {port.state}
              </Typography>
            ))}
          </Box>
        )
      );
      dispatch(setShowSelectedDeviceInfo(true));
    }
  };

  const onClickOutsideNode = (): void => {
    dispatch(setShowSelectedDeviceInfo(false));
  };

  const nodes = discoveredHosts.map(
    (host: { ipAddress: string }, index: number) => ({
      id: host.ipAddress || `empty-${index}`,
    })
  );

  const links = discoveredHosts
    .slice(1)
    .map((host: { ipAddress: string }, index: number) => ({
      source: discoveredHosts[index].ipAddress || `empty-${index}`,
      target: host.ipAddress || `empty-${index + 1}`,
    }));

  const data = {
    nodes,
    links,
  };

  return (
    <Box onClick={onClickOutsideNode}>
      <Graph
        id="graph-id"
        data={data}
        config={config}
        onClickNode={onClickNode}
      />
      {showSelectedDeviceInfo && (
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            overflowY: "auto",
            width: "fit-content",
            top: 0,
            left: 0,
            bottom: "auto",
          }}
        >
          {selectedDeviceInfo}
        </Box>
      )}
    </Box>
  );
};
export default NetworkGraph;
