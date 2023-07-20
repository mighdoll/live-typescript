
import path from "node:path";
import url from "node:url";
import {
  loadModule,
  recursiveImports,
  resolveModule
} from "rollup-plugin-recursive-imports";
import { assert, test } from "vitest";

test("loadModule", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const thimbUrl = resolveModule("thimbleberry", rootUrl);
  const res = await loadModule(thimbUrl);
  // console.log(res.imports)
});

test("recursive", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const map = await recursiveImports("thimbleberry", rootUrl, new Set());
  console.log(Object.keys(map))
  console.log(Object.keys(map))
});
