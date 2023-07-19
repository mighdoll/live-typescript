import { test, assert, expect } from "vitest";
import {
  PatchSpot,
  loadModule,
  modHash,
  replaceStrings,
  resolveModule,
} from "rollup-plugin-recursive-imports";
import url from "node:url";
import path from "node:path";

test("simple", async () => {
  assert(1 + 1 === 2);
  console.log("foo");
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const thimbUrl = resolveModule("thimbleberry", rootUrl);
  const res = await loadModule(thimbUrl);
  console.log(JSON.stringify(res, null, 2).slice(0, 100));
});

test("modHash bare import", () => {
  const id = modHash("foo", "x");
  expect(id).toBe("foo-9dd4e46");
});

test("modHash relative import", () => {
  const id = modHash("./foo.js", "x");
  expect(id).toBe("foo.js-9dd4e46");
});

test("modHash drop query", () => {
  const id = modHash("https://foo.js?x=y", "x");
  expect(id).toBe("foo.js-9dd4e46");
});

test("string patch ", () => {
  const src = `import { foo } from "bar";`;
  const code = `"bar"`;
  const startIndex = src.indexOf(code);
  const patch: PatchSpot = {
    startIndex,
    endIndex: startIndex + code.length,
    origText: code,
    newText: `"bar-1234"`,
  };
  const result = replaceStrings(src, [patch]);
  expect(result).toBe(`import { foo } from "bar-1234";`);
});


test("string patch multiple out of orser", () => {
  const src = `import { foo } from "bar"; import { zip } from "zap";}`;
  const code1 = `"bar"`;
  const start1 = src.indexOf(code1);
  const patch1: PatchSpot = {
    startIndex: start1,
    endIndex: start1 + code1.length,
    origText: code1,
    newText: `"bar-1234"`,
  };
  const code2 = `"zap"`;
  const start2 = src.indexOf(code2);
  const patch2: PatchSpot = {
    startIndex: start2,
    endIndex: start2 + code1.length,
    origText: code2,
    newText: `"zap-3145"`,
  };
  const result = replaceStrings(src, [patch2, patch1]);
  expect(result).toBe(`import { foo } from "bar-1234"; import { zip } from "zap-3145";}`);
});
