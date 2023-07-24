import { LiveTypescript } from "live-typescript";
import "live-typescript/style.css";
import "react";
import thimbSrc from "thimbleberry?sourceFiles";

export interface ThimbleberryLive {
  code: string;
}

export function ThimbleberryExample(props: ThimbleberryLive): JSX.Element {
  const { code } = props;

  return (
    <LiveTypescript
      embeddedPackages={[thimbSrc]}
      {...{ code }}
    ></LiveTypescript>
  );
}
