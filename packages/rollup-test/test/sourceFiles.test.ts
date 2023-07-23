import path from "node:path";
import url from "node:url";
import { sourceFiles } from "rollup-plugin-sourcefiles";
import { test } from "vitest";

test("thimbleberry sourceFiles", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "thimbleberry";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);

  console.log("code:\n ", [...Object.keys(importMap)].join("\n  "));
  console.log("types:\n ", [...Object.keys(typeFiles)].join("\n  "));
});
