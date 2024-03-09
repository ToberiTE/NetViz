const scanTypes = [
    {
        Description: "TCP SYN",
        ScanType: "-sS",
    },
    {
        Description: "TCP Connect",
        ScanType: "-sT",
    },
    {
        Description: "UDP",
        ScanType: "-sU",
    },
    {
        Description: "TCP FIN",
        ScanType: "-sF",
    },
    {
        Description: "TCP NULL",
        ScanType: "-sN",
    },
    {
        Description: "Xmas",
        ScanType: "-sX",
    },
    {
        Description: "TCP ACK",
        ScanType: "-sA",
    },
    {
        Description: "TCP Window",
        ScanType: "-sW",
    },
    {
        Description: "TCP Maimon",
        ScanType: "-sM",
    },
    {
        Description: "TCP Idle",
        ScanType: "-sI",
    },
    {
        Description: "IP Protocol",
        ScanType: "-sO",
    },
    {
        Description: "TCP FTP Bounce",
        ScanType: "-b",
    },
    {
        Description: "SCTP INIT",
        ScanType: "-sY",
    },
    {
        Description: "SCTP COOKIE ECHO",
        ScanType: "-sZ",
    },
];

const timings = [
    {
        Description: "Very slow",
        Timing: "-T0",
    },
    {
        Description: "Slow",
        Timing: "-T1",
    },
    {
        Description: "Slower",
        Timing: "-T2",
    },
    {
        Description: "Faster",
        Timing: "-T3",
    },
    {
        Description: "Fast",
        Timing: "-T4",
    },
    {
        Description: "Very fast",
        Timing: "-T5",
    },
];

// TODO?: add options for timing granularity.

export { scanTypes, timings };
