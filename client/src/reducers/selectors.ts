import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

const selectState = (state: RootState) => state.Reducer;

export const selectFields = createSelector(
    selectState,
    (state) => ({
        devices: state.devices,
        selectedScanType: state.selectedScanType,
        selectedTarget: state.selectedTarget,
        selectedTiming: state.selectedTiming,
        selectedPorts: state.selectedPorts,
        scanStatus: state.scanStatus,
        discoveredHosts: state.discoveredHosts,
        statusMessage: state.statusMessage,
        validation: state.validation,
        showScanTable: state.showScanTable,
        showScanOptions: state.showScanOptions,
        showScanMessage: state.showScanMessage,
        selectedDeviceInfo: state.selectedDeviceInfo,
        showSelectedDeviceInfo: state.showSelectedDeviceInfo,
    })
);
