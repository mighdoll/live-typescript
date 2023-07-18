import React from "react";
// import exampleCode from "/node_modules/stoneberry-examples/src/simpleScan.ts?raw";
import { StoneberryExample } from "../src/StoneberryExample";
import "live-typescript/style.css";

export function App(): JSX.Element {
  return <StoneberryExample code={"console.log(`hello world`);"} />;
}
