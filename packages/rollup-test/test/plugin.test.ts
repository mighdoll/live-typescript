import path from "node:path";
import url from "node:url";
import {
  loadModule,
  recursiveImports,
  resolveModule,
} from "rollup-plugin-recursive-imports";
import { expect, test } from "vitest";

test.only("load and patch thimbleberry", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "thimbleberry";
  const thimbUrl = resolveModule(pkg, rootUrl);
  const {map} = await loadModule(thimbUrl, pkg);

  // map contains thimbleberry bare reference
  const keys = Object.keys(map);
  expect(keys).toContain("thimbleberry");

  // map contains thimbleberry uniqified reference
  const hashedKeys = keys.filter((k) => k.startsWith("thimbleberry-"));
  expect(hashedKeys.length).toBeGreaterThan(0);

  // internal imports are uniqified
  const lines = map["thimbleberry"].split("\n");
  const importLines = lines.filter((l) => l.includes("import"));
  expect( importLines.length).toBeGreaterThan(2);
  importLines.forEach(l => {
    const hashImport = /-[a-z0-9]{7}/.test(l);
    expect(hashImport).toBe(true);
  });
  console.log(importLines);
});

test("recursive thimbleberry import", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const map = await recursiveImports("thimbleberry", rootUrl, new Set());

  Object.entries(map).forEach(([key, value]) => {
    if (value.includes("require")) {
      console.log(key);
    }
  });
  console.log(Object.keys(map));
});
