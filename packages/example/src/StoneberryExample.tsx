import "react";
import { CodeExample } from "live-typescript";
import { installStoneberryTypes } from "./StoneberryMonacoTypes.ts";
import "live-typescript/style.css";
import thimbleberry from "thimbleberry?imports";

export interface StoneberryCodeExampleProps {
  code: string;
  className?: string;
}

export function StoneberryExample(
  props: StoneberryCodeExampleProps
): JSX.Element {
  const packages = ["stoneberry/scan", "stoneberry-examples"];
  const embeddedPackages = thimbleberry;
  console.log("embeddedPackages", embeddedPackages);
  const { code, className } = props;
  return (
    <CodeExample
      {...{ packages, embeddedPackages, code, className }}
      setupTypes={installStoneberryTypes}
    ></CodeExample>
  );
}
