import { PropsWithChildren } from "react";

export default function FlexBox({
  children,
  classes,
}: PropsWithChildren & { classes?: string }) {
  return (
    <div
      className={
        "flex flex-col gap items-center justify-center " + (classes || "")
      }
    >
      {children}
    </div>
  );
}
