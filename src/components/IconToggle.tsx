import React, { PropsWithChildren } from "react";

interface IconToggleProps {
  active?: boolean;
  onClick?: () => void;
  title?: string;
}

// const useStyles = makeStyles((theme) => ({
//   active: {
//     color: theme.palette.secondary.main,
//   },
// }));

export default function IconToggle({
  children,
  active,
  onClick,
  title,
}: PropsWithChildren<IconToggleProps>) {
  // const classes = useStyles();
  return (
    // <Tooltip title={title || ''}>
    //   <IconButton className={active ? classes.active : ''} onClick={onClick}>
    //     {children}
    //   </IconButton>
    // </Tooltip>

    <button
      title={title || ""}
      className={
        "p-2 hover:text-white text-slate-200 " + (active ? "!text-red-500" : "")
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
