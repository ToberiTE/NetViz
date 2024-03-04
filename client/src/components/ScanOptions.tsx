const flags = [
  {
    Description: "TCP SYN",
    Flag: "-sS",
  },
  {
    Description: "TCP Connect",
    Flag: "-sT",
  },
  {
    Description: "UDP",
    Flag: "-sU",
  },
  {
    Description: "TCP FIN",
    Flag: "-sF",
  },
  {
    Description: "TCP NULL",
    Flag: "-sN",
  },
  {
    Description: "Xmas",
    Flag: "-sX",
  },
  {
    Description: "TCP ACK",
    Flag: "-sA",
  },
  {
    Description: "TCP Window",
    Flag: "-sW",
  },
  {
    Description: "TCP Maimon",
    Flag: "-sM",
  },
  {
    Description: "TCP Idle",
    Flag: "-sI",
  },
  {
    Description: "IP Protocol",
    Flag: "-sO",
  },
  {
    Description: "TCP FTP Bounce",
    Flag: "-b",
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

// TODO?: add options for single port.
// TODO?: add options for port range.
// TODO?: add options for timing granularity.

export { flags, timings };
