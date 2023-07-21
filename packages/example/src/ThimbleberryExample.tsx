import "react";
import { CodeExample } from "live-typescript";
import "live-typescript/style.css";
import thimbleberryCode from "thimbleberry?remapImports";
import thimbleberryPackage from "../node_modules/thimbleberry/package.json?raw";
import webgpuTypes from "../node_modules/@webgpu/types/dist/index.d.ts?raw";
import webgpuPackage from "../node_modules/@webgpu/types/package.json?raw";

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
        embeddedPackages: thimbleberryCode,
        typeFiles: createTypeFiles(),
        code,
      }}
    ></CodeExample>
  );
}

function createTypeFiles(): Record<string, string> {
  const mapEntries = [
    localPackage("thimbleberry/package.json", thimbleberryPackage),
    localPackage(`@webgpu/types/dist/index.d.ts`, webgpuTypes),
    localPackage(`@webgpu/types/package.json`, webgpuPackage),
  ];
  const typeEntries = Object.entries(thimbleberryTypes).map(([path, text]) => {
    return [`file://${path}`, text];
  });
  const map = Object.fromEntries([...mapEntries, ...typeEntries]);
  return map;
}

function localPackage(path: string, code: string): [string, string] {
  return [`file:///node_modules/${path}`, code];
}
