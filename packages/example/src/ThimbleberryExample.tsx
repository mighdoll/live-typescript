import "react";
import { CodeExample } from "live-typescript";
import { installThimbleberryTypes } from "./ThimbleberryMonacoTypes.ts";
import "live-typescript/style.css";
import thimbleberry from "thimbleberry?remapImports";

export interface ThimbleberryCodeExampleProps {
  code: string;
}

export function ThimbleberryExample(
  props: ThimbleberryCodeExampleProps
): JSX.Element {
  const { code } = props;
  const embeddedPackages = thimbleberry;
  return (
    <CodeExample
      {...{ embeddedPackages, code }}
      setupTypes={installThimbleberryTypes}
    ></CodeExample>
  );
}
