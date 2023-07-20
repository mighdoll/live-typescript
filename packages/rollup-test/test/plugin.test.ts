import path from "node:path";
import url from "node:url";
import {
  loadModule,
  recursiveImports,
  resolveModule,
} from "rollup-plugin-recursive-imports";
import { assert, expect, test } from "vitest";

test("load and patch thimbleberry", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "thimbleberry";
  const thimbUrl = resolveModule(pkg, rootUrl);
  const { map } = await loadModule(thimbUrl, pkg);

  // map contains thimbleberry bare reference map entry
  const keys = Object.keys(map);
  expect(keys).toContain("thimbleberry");

  // map contains thimbleberry uniqified map entry
  const hashedKeys = keys.filter((k) => k.startsWith("thimbleberry-"));
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
