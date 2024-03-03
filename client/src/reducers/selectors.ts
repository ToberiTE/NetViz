import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

const selectDashboardState = (state: RootState) => state.dashboardReducer;

export const selectDashboardFields = createSelector(
    selectDashboardState,
    (dashboard) => ({
        devices: dashboard.devices,
        selectedFlag: dashboard.selectedFlag,
        selectedTarget: dashboard.selectedTarget,
        scanStatus: dashboard.scanStatus,
    })
);
