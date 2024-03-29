import path from "node:path";
import url from "node:url";
import { pkgRootPrefix, sourceFiles } from "rollup-plugin-sourcefiles";
import { assert, expect, test } from "vitest";

// setSourceFilesConfig({ debugTypeFiles: true });

test("local dependency", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "local-package";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);

  verifyImportMap(pkg, importMap);
  verifyTypeFiles(pkg, typeFiles);

  // contains file from dist
  const typeFileNames = Object.keys(typeFiles);
  const foundDist = typeFileNames.find((f) =>
    f.endsWith("local-package/dist/index.d.ts")
  );
  assert(foundDist);

  // contains dependency type files
  assert(typeFileNames.find((f) => f.includes("stoneberry"))); // direct dependency
  assert(typeFileNames.find((f) => f.includes("thimbleberry"))); // recursive dependency
  assert(typeFileNames.find((f) => f.includes("@reactively"))); // partitioned package name
});

test("thimbleberry sourceFiles", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "thimbleberry";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);

  verifyImportMap(pkg, importMap);

  // recursive import got a child package
  expect(Object.keys(importMap)).contains("@reactively/core");

  verifyTypeFiles(pkg, typeFiles);
});

test("stoneberry/scan", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "stoneberry/scan";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);
  verifyImportMap(pkg, importMap);
  verifyTypeFiles(pkg, typeFiles);
});

test("@webgpu/types", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "@webgpu/types";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);
  verifyImportMap(pkg, importMap);
  verifyTypeFiles(pkg, typeFiles);
});

test("semver dependency finds @types", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "semver";
  const { typeFiles } = await sourceFiles(pkg, rootUrl);

  const typeFileNames = Object.keys(typeFiles);

  // contains dependency type files
  assert(typeFileNames.find((f) => f.includes("@types/semver")));
});

test("stoneberry/binop/BinOpModuleSumF32.js", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const pkg = "stoneberry/binop/BinOpModuleSumF32.js";
  const { importMap, typeFiles } = await sourceFiles(pkg, rootUrl);

  const typeFileNames = Object.keys(typeFiles);
  assert(typeFileNames.find((f) => f.includes("stoneberry/binop")));
  verifyImportMap(pkg, importMap);
  verifyTypeFiles(pkg, typeFiles);
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

function verifyTypeFiles(pkg: string, typeFiles: Record<string, string>): void {
  const files = [...Object.keys(typeFiles)];

  const pkgRoot = pkgRootPrefix(pkg);
  const packageJsonFile = files.filter((f) =>
    f.endsWith(`${pkgRoot}/package.json`)
  );
  expect(packageJsonFile.length).toBe(1);
  const dtsFiles = files.filter((f) => f.endsWith(".d.ts"));
  expect(dtsFiles.length).toBeGreaterThan(0);
}
