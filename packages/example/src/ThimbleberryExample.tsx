import "react";
import { CodeExample } from "live-typescript";
import "live-typescript/style.css";
import thimbleberry from "thimbleberry?remapImports";
import thimbleberryPackage from "../node_modules/thimbleberry/package.json?raw";

const thimbleberryTypes = import.meta.glob(
  "/node_modules/thimbleberry/**/*.d.ts",
  {
    as: "raw",
    eager: true,
  }
);

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
        embeddedPackages: thimbleberry,
        typeFiles: createTypeFiles(),
        code,
      }}
    ></CodeExample>
  );
}

function createTypeFiles(): Record<string, string> {
  const mapEntries = Object.entries(thimbleberryTypes).map(([path, text]) => {
    return [`file://${path}`, text];
  });
  mapEntries.push([
    "file:///node_modules/thimbleberry/package.json",
    thimbleberryPackage,
  ]);
  const map = Object.fromEntries(mapEntries);
  return map;
}
