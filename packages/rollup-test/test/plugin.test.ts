import path from "node:path";
import url from "node:url";
import { loadAndPatch, recursiveImports } from "rollup-plugin-recursive-imports";
import { assert, expect, test } from "vitest";
import { resolveModule } from "../../rollup-plugin-recursive-imports/src/loadModule.ts";

test("load and patch thimbleberry", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "thimbleberry";
  const pkgUrl = resolveModule(pkg, rootUrl);
  const { map } = await loadAndPatch(pkgUrl, pkg);

  // map contains package bare reference map entry
  const keys = Object.keys(map);
  expect(keys).toContain(pkg);

  // map contains package uniqified map entry
  const hashedKeys = keys.filter((k) => k.startsWith(pkg + "-"));
  expect(hashedKeys.length).toBeGreaterThan(0);

  // internal imports are uniqified
  verifyImportHashIds(map);
});

test("load and patch stoneberry/scan", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "stoneberry/scan";
  const pkgUrl = resolveModule(pkg, rootUrl);
  const { map } = await loadAndPatch(pkgUrl, pkg);

  // map contains package bare reference map entry
  const keys = Object.keys(map);
  expect(keys).toContain(pkg);

  // map contains package uniqified map entry
  const hashedKeys = keys.filter((k) => k.startsWith(pkg + "-"));
  expect(hashedKeys.length).toBeGreaterThan(0);

  // internal imports are uniqified
  verifyImportHashIds(map);
});

test("recursive thimbleberry import", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const map = await recursiveImports("thimbleberry", rootUrl, new Set());

  // recursive import got a child package
  expect(Object.keys(map)).contains("@reactively/core");

  // no require statements left behind
  Object.entries(map).forEach(([key, value]) => {
    if (value.includes("require")) {
      assert.fail(`require found in ${key}`);
    }
  });

  // internal imports are uniqified
  verifyImportHashIds(map);
});

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
