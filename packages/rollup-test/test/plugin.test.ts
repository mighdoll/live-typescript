import path from "node:path";
import url from "node:url";
import {
  recursiveImports,
  resolveModule,
} from "rollup-plugin-recursive-imports";
import { expect, test } from "vitest";

// test("loadModule", async () => {
//   const rootPath = path.join(process.env.PWD!, "package.json");
//   const rootUrl = url.pathToFileURL(rootPath);

//   const thimbUrl = resolveModule("thimbleberry", rootUrl);
//   const res = await loadModule(thimbUrl);
//   // console.log(res.imports)
// });

test.only("recursive", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const map = await recursiveImports("thimbleberry", rootUrl, new Set());

  const keys = Object.keys(map);
  expect(keys).toContain("thimbleberry");
  const hashedKeys = keys.filter((k) => k.startsWith("thimbleberry-"));
  expect(hashedKeys.length).toBeGreaterThan(0);

  // const lines = map["thimbleberry"].split("\n");
  // const imports = lines.filter((l) => l.includes("import"));
  // console.log(imports);
  console.log(Object.keys(map));
});
