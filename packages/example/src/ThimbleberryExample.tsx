import "react";
import { CodeExample } from "live-typescript";
import { installThimbleberryTypes } from "./ThimbleberryMonacoTypes.ts";
import "live-typescript/style.css";
import thimbleberry from "thimbleberry?remapImports";

export interface ThimbleberryCodeExampleProps {
  code: string;
  className?: string;
}

export function ThimbleberryExample(
  props: ThimbleberryCodeExampleProps
): JSX.Element {
  const embeddedPackages = thimbleberry;
  const { code, className } = props;
  return (
    <CodeExample
      {...{ embeddedPackages, code, className }}
      setupTypes={installThimbleberryTypes}
    ></CodeExample>
  );
}
