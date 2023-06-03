import exampleUtilsJs from "/node_modules/stoneberry/dist/exampleUtils.js?raw";
import { importMapScript } from "./Imports.js";
import exampleUtilsMap from "/node_modules/stoneberry/dist/exampleUtils.js.map?raw";
// import exampleUtilsSrc from "/node_modules/stoneberry/packages/examples/src/exampleUtils.ts?raw";

export function stoneberryImportScript(): string {
  const utilsUrl = jsBlobUrl(exampleUtilsJs);
  const utilsMapUrl = jsBlobUrl(exampleUtilsMap);
  // const utilsSrcUrl = jsBlobUrl(exampleUtilsSrc);

  const importScript = importMapScript(["thimbleberry", "stoneberry/scan"], {
    "stoneberry/examples": utilsUrl,
    "exampleUtils.js.map": utilsMapUrl,
    // "../packages/examples/src/exmapleUtils.ts": utilsSrcUrl,
  });

  return importScript;
}

export function jsBlobUrl(code: string): string {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  return url;
}
