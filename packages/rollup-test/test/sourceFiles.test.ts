import { importMap } from "thimbleberry?sourceFiles";
import path from "node:path";
import url from "node:url";
import { sourceFiles } from "rollup-plugin-sourcefiles";
import { assert, expect, test } from "vitest";

test("thimbleberry sourceFiles", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "thimbleberry";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);

  verifyImportMap(pkg, importMap);

  // recursive import got a child package
  expect(Object.keys(importMap)).contains("@reactively/core");
});

test.only("stoneberry/scan", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "stoneberry/scan";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);
  verifyImportMap(pkg, importMap);
  // console.log("code:\n ", [...Object.keys(importMap)].join("\n  "));
  // console.log("types:\n ", [...Object.keys(typeFiles)].join("\n  "));
});

function verifyImportMap(pkg: string, importMap: Record<string, string>): void {
  // map contains package bare reference map entry
  const keys = Object.keys(importMap);
  expect(keys).toContain(pkg);

  // map contains package uniqified map entry
  const hashedKeys = keys.filter((k) => k.startsWith(pkg + "-"));
  expect(hashedKeys.length).toBeGreaterThan(0);

  // no require statements left behind
  Object.entries(importMap).forEach(([key, value]) => {
    if (value.includes("require(")) {
      console.log(value);
      assert.fail(`require found in ${key}`);
    }
  });

  // internal imports are uniqified
  verifyImportHashIds(importMap);
}

function verifyImportHashIds(map: Record<string, string>): void {
  Object.entries(map).forEach(([key, code]) => {
    const lines = code.split("\n");
    const importLines = lines.filter((l) => l.includes(' from "'));
    importLines.forEach((line) => {
      const hashImport = /-[a-z0-9]{7}/.test(line);
      if (!hashImport) {
        assert.fail(`non-uniqified import from ${key}: ${line}`);
      }
    });
  });
}
