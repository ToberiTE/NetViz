import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Device = {
    hostname: string,
    ipAddress: string,
    macAddress: string,
    vendor: string,
    status: string,
    openPorts: Port[],
};

export type Port = {
    portNumber: number,
    protocol: string,
    serviceName: string,
    state: string
}

export interface DashboardState
{
    devices: Device[];
    selectedFlag: string;
    selectedTarget: string,
    selectedTiming: string,
    scanStatus: string,
}

const initialState: DashboardState = {
    devices: [],
    selectedFlag: "",
    selectedTarget: "",
    selectedTiming: "",
    scanStatus: "",
};

export const dashboardSlice = createSlice({
    name: 'dashboardSlice',
    initialState,
    reducers: {
        setDevices: (state, action: PayloadAction<Device[]>) =>
        {
            state.devices = action.payload;
        },
        setSelectedFlag: (state, action: PayloadAction<string>) =>
        {
            state.selectedFlag = action.payload;
        },
        setSelectedTarget: (state, action: PayloadAction<string>) =>
        {
            state.selectedTarget = action.payload;
        },
        setSelectedTiming: (state, action: PayloadAction<string>) =>
        {
            state.selectedTiming = action.payload;
        },
        setScanStatus: (state, action: PayloadAction<string>) =>
        {
            state.scanStatus = action.payload;
        },
    },
});

export const { setDevices, setSelectedFlag, setSelectedTarget, setSelectedTiming, setScanStatus } = dashboardSlice.actions;

export default dashboardSlice.reducer;