import thimbSources from "thimbleberry?sourceFiles";

// for testing the rollup plugin on its own w/o vite

function main() {
  const { importMap, typeFiles } = thimbSources;
  console.log("importMap:\n ", [...Object.keys(importMap)].join("\n  "));
  console.log("typeFiles:\n ", [...Object.keys(typeFiles)].join("\n  "));
}

main();
