import exampleUtilsJs from "/node_modules/stoneberry/dist/exampleUtils.js?raw";
import { importMapScript } from "./Imports.js";
import exampleUtilsMap from "/node_modules/stoneberry/dist/exampleUtils.js.map?raw";

export function stoneberryImportScript(): string {
  const utilsUrl = jsBlobUrl(exampleUtilsJs);
  const utilsMapUrl = jsBlobUrl(exampleUtilsMap);

  const importScript = importMapScript(["thimbleberry", "stoneberry/scan"], {
    "stoneberry/examples": utilsUrl,
    "exampleUtils.js.map": utilsMapUrl,
  });

  return importScript;
}

export function jsBlobUrl(code: string): string {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  return url;
}
