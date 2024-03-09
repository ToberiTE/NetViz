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

export interface State
{
    devices: Device[];
    selectedScanType: string;
    selectedTarget: string,
    selectedTiming: string,
    selectedPorts: string,
    scanStatus: string,
    discoveredHosts: any[],
    statusMessage: string,
    showScanTable: boolean,
    showScanOptions: boolean,
    showScanMessage: boolean,
    selectedDeviceInfo: Device | null,

}

const initialState: State = {
    devices: [],
    selectedScanType: "",
    selectedTarget: "",
    selectedTiming: "",
    selectedPorts: "",
    scanStatus: "",
    discoveredHosts: [],
    statusMessage: "",
    showScanTable: true,
    showScanOptions: true,
    showScanMessage: false,
    selectedDeviceInfo: null,
};

export const Slice = createSlice({
    name: 'Slice',
    initialState,
    reducers: {
        setDevices: (state, action: PayloadAction<Device[]>) =>
        {
            state.devices = action.payload;
        },
        setSelectedScanType: (state, action: PayloadAction<string>) =>
        {
            state.selectedScanType = action.payload;
        },
        setSelectedTarget: (state, action: PayloadAction<string>) =>
        {
            state.selectedTarget = action.payload;
        },
        setSelectedTiming: (state, action: PayloadAction<string>) =>
        {
            state.selectedTiming = action.payload;
        },
        setSelectedPorts: (state, action: PayloadAction<string>) =>
        {
            state.selectedPorts = action.payload;
        },
        setScanStatus: (state, action: PayloadAction<string>) =>
        {
            state.scanStatus = action.payload;
        },
        setDiscoveredHosts: (state, action: PayloadAction<any[]>) =>
        {
            state.discoveredHosts = action.payload;
        },
        setStatusMessage: (state, action: PayloadAction<string>) =>
        {
            state.statusMessage = action.payload;
        },
        setShowScanTable: (state, action: PayloadAction<boolean>) =>
        {
            state.showScanTable = action.payload;
        },
        setShowScanOptions: (state, action: PayloadAction<boolean>) =>
        {
            state.showScanOptions = action.payload;
        },
        setShowScanMessage: (state, action: PayloadAction<boolean>) =>
        {
            state.showScanMessage = action.payload;
        },
        setSelectedDeviceInfo: (state, action: PayloadAction<Device | null>) =>
        {
            state.selectedDeviceInfo = action.payload;
        },
    },
});

export const { setDevices, setSelectedScanType, setSelectedTarget, setSelectedTiming, setSelectedPorts, setScanStatus, setDiscoveredHosts, setStatusMessage, setShowScanTable, setShowScanOptions, setShowScanMessage, setSelectedDeviceInfo } = Slice.actions;

export default Slice.reducer;