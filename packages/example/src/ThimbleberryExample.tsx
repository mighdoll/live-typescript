import { CodeExample } from "live-typescript";
import "live-typescript/style.css";
import "react";
import thimbleberryCode from "thimbleberry?remapImports";
import thimbleberryTypeFiles from "thimbleberry?typeFiles";

export interface ThimbleberryCodeExampleProps {
  code: string;
}

export function ThimbleberryExample(
  props: ThimbleberryCodeExampleProps
): JSX.Element {
  const { code } = props;

  return (
    <CodeExample
      {...{
        embeddedPackages: thimbleberryCode,
        typeFiles: thimbleberryTypeFiles,
        code,
      }}
    ></CodeExample>
  );
}
