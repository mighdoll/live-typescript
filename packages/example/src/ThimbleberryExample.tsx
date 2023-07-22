import { LiveTypescript } from "live-typescript";
import "live-typescript/style.css";
import "react";
import thimbleberryCode from "thimbleberry?remapImports";
import thimbleberryTypeFiles from "thimbleberry?typeFiles";

export interface ThimbleberryLive {
  code: string;
}

export function ThimbleberryExample(
  props: ThimbleberryLive
): JSX.Element {
  const { code } = props;

  return (
    <LiveTypescript
      {...{
        embeddedPackages: thimbleberryCode,
        typeFiles: thimbleberryTypeFiles,
        code,
      }}
    ></LiveTypescript>
  );
}
