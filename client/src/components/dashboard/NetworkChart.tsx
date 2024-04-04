import { Graph } from "react-d3-graph";
import { useDispatch, useSelector } from "react-redux";
import { Box, useTheme } from "@mui/material";
import { selectFields } from "../../reducers/selectors";
import { Port, setSelectedDeviceInfo } from "../../reducers/Slice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useRef, useState, useEffect } from "react";

const NetworkGraph = () => {
  const theme = useTheme();
  const dispatch = useDispatch<Dispatch<AnyAction>>();
  const { discoveredHosts, devices } = useSelector(selectFields);

  const config = {
    width: 1000,
    height: 1000,
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

  const graphContainerRef = useRef<HTMLElement | null>(null);
  const [graphDimensions, setGraphDimensions] = useState({
    width: config.width,
    height: config.height,
  });

  const updateGraphDimensions = (): void => {
    if (graphContainerRef.current) {
      setGraphDimensions({
        width: graphContainerRef.current.offsetWidth,
        height: graphContainerRef.current.offsetHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateGraphDimensions);
    updateGraphDimensions();

    return () => {
      window.removeEventListener("resize", updateGraphDimensions);
    };
  }, []);

  const newConfig = {
    ...config,
    width: graphDimensions.width,
    height: graphDimensions.height,
  };

  const onClickNode = (nodeId: string): void => {
    const node = devices.find(
      (host: { ipAddress: string }) => host.ipAddress === nodeId
    );
    if (node) {
      const deviceInfo = {
        hostname: node.hostname,
        ipAddress: node.ipAddress,
        macAddress: node.macAddress,
        vendor: node.vendor,
        status: node.status,
        openPorts: node.openPorts.map((port: Port) => ({
          portNumber: port.portNumber,
          protocol: port.protocol,
          serviceName: port.serviceName,
          state: port.state,
        })),
      };
      dispatch(setSelectedDeviceInfo(deviceInfo));
    }
  };

  const onClickOutsideNode = (): void => {
    dispatch(setSelectedDeviceInfo(null));
  };

  const nodes = discoveredHosts.map(
    (host: { ipAddress: string }, index: number) => ({
      id: host.ipAddress || `empty-${index}`,
    })
  );

  // TODO: some way to decide if a link is a router/switch?
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
    <Box onClick={onClickOutsideNode} ref={graphContainerRef}>
      <Graph
        id="graph-id"
        data={data}
        config={newConfig}
        onClickNode={onClickNode}
        onZoomChange={updateGraphDimensions}
      />
    </Box>
  );
};
export default NetworkGraph;
