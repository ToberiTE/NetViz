import { useMemo } from "react";
import {
  MaterialReactTable,
  MRT_Row,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Button, ThemeProvider, useTheme } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { Device } from "../../reducers/Slice";
import { useSelector } from "react-redux";
import { selectFields } from "../../reducers/selectors";
import { StatusCircle } from "./assets/customComponents";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const ProjectTable = () => {
  const theme = useTheme();
  const { devices } = useSelector(selectFields);

  const columns = useMemo<MRT_ColumnDef<Device>[]>(
    () => [
      {
        accessorKey: "hostname",
        header: "Hostname",
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
      },
      {
        accessorKey: "macAddress",
        header: "MAC Address",
      },
      {
        accessorKey: "vendor",
        header: "Vendor",
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => <StatusCircle status={cell.getValue() as string} />,
      },
      {
        accessorKey: "OpenPorts",
        header: "Open Ports",
      },
    ],
    []
  );

  const handleExportRows = (rows: MRT_Row<Device>[]) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(devices);
    download(csvConfig)(csv);
  };

  return (
    <ThemeProvider theme={theme}>
      <MaterialReactTable
        enableColumnResizing
        enableColumnOrdering
        enableFilterMatchHighlighting
        columns={columns}
        data={devices ?? []}
        initialState={{ showColumnFilters: false }}
        enableRowSelection
        enableGrouping
        renderTopToolbarCustomActions={({ table }) => (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={1}>
              <Button
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                variant="text"
                size="small"
              >
                Export raw
              </Button>
              <Button
                disabled={table.getPrePaginationRowModel().rows.length === 0}
                onClick={() =>
                  handleExportRows(table.getPrePaginationRowModel().rows)
                }
                startIcon={<FileDownloadIcon />}
                variant="text"
                size="small"
              >
                Export filtered
              </Button>
              <Button
                disabled={table.getRowModel().rows.length === 0}
                onClick={() => handleExportRows(table.getRowModel().rows)}
                startIcon={<FileDownloadIcon />}
                variant="text"
                size="small"
              >
                Export page
              </Button>
              <Button
                disabled={
                  !table.getIsSomeRowsSelected() &&
                  !table.getIsAllRowsSelected()
                }
                onClick={() =>
                  handleExportRows(table.getSelectedRowModel().rows)
                }
                startIcon={<FileDownloadIcon />}
                variant="text"
                size="small"
              >
                Export selection
              </Button>
            </Box>
          </Box>
        )}
      />
    </ThemeProvider>
  );
};

export default ProjectTable;
