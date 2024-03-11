import {
  Button,
  CSSObject,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  styled,
  useTheme,
} from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import MuiDrawer from "@mui/material/Drawer";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { useState } from "react";
import { Link } from "react-router-dom";
import React from "react";

const Sidenav: React.FC = () => {
  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();

  const openedMixin = (theme: Theme): CSSObject => ({
    width: "280px",
    marginTop: "4rem",
    height: "calc(100% - 4rem)",
    backgroundColor: theme.palette.background.default,
    overflowX: "hidden",
  });

  const closedMixin = (theme: Theme): CSSObject => ({
    backgroundColor: theme.palette.background.default,
    marginTop: "4rem",
    height: "calc(100% - 4rem)",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
    overflowX: "hidden",
  });

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: "280px",
    flexShrink: 0,
    zIndex: 2,
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  const handleOpenDrawer = (): void => {
    setOpen(true);
  };

  const handleCloseDrawer = (): void => {
    setOpen(false);
  };

  interface ListItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
    onClick?: () => void;
  }

  function ListItemLink(props: ListItemLinkProps) {
    const { icon, primary, to, onClick } = props;
    return (
      <Button
        fullWidth
        disableTouchRipple
        size="small"
        tabIndex={-1}
        sx={{
          textTransform: "none",
          color: "inherit",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          ...(selected === to && {
            backgroundColor: theme.palette.action.selected,
          }),
        }}
      >
        <ListItem
          sx={{
            color: "inherit",
            outline: "none",
            pl: open ? "2.5rem" : "0.85rem",
          }}
          component={Link}
          to={to}
          onClick={onClick}
        >
          {icon ? (
            <ListItemIcon
              sx={{
                fontSize: "26px",
                color: "inherit",
              }}
            >
              {icon}
            </ListItemIcon>
          ) : null}
          <ListItemText
            sx={{
              textDecoration: "inherit",
              ...(!open && { visibility: "hidden" }),
            }}
            primary={primary}
          />
        </ListItem>
      </Button>
    );
  }

  return (
    <Drawer variant="permanent" open={open}>
      <IconButton
        color="inherit"
        title="Collapse"
        onClick={handleCloseDrawer}
        sx={{
          fontSize: "26px",
          alignSelf: "end",
          mr: "0.5rem",
          ...(!open && { display: "none" }),
        }}
      >
        <AiOutlineMenuFold />
      </IconButton>

      <IconButton
        color="inherit"
        title="Expand"
        onClick={handleOpenDrawer}
        sx={{
          fontSize: "26px",
          alignSelf: "center",
          ...(open && { display: "none" }),
        }}
      >
        <AiOutlineMenuUnfold />
      </IconButton>

      <List sx={{ mt: "2rem" }}>
        <ListItemLink
          to="/"
          primary="Dashboard"
          icon={<Dashboard />}
          onClick={() => {
            setSelected("/");
          }}
        />
      </List>
    </Drawer>
  );
};
export default Sidenav;
