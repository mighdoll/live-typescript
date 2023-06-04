import React from "react";
import { CodeEditor } from "./CodeExample.js";

const exampleCode = `
  import { bufferI32 } from "thimbleberry";
  import { PrefixScan } from "stoneberry/scan";
  import { renderTable, withGpuDevice } from "stoneberry-examples";

  withGpuDevice(main);
  console.log("hello world");

  async function main(device: GPUDevice): Promise<void> {
    const srcData = [1, 2, 3, 4, 5, 6];
    const src = bufferI32(device, srcData);

    const scanner = new PrefixScan({ device, src });
    const inclusiveScan = await scanner.scan();

    renderTable({ source: srcData, "inclusive scan": inclusiveScan });
  }


`;

export function App(): JSX.Element {
  return <CodeEditor code={exampleCode}/>;
}
