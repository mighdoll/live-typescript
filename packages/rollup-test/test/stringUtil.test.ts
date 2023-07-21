import {
  StringPatch,
  isBareSpecifier,
  modHash,
  replaceStrings,
} from "rollup-plugin-remap-imports";
import { expect, test } from "vitest";

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

test("modHash @reactively/core", () => {
  const id = modHash("@reactively/core", "x");
  expect(id).toBe("@reactively/core-9dd4e46");
});

test("isBareSpecifier stoneberry/scan", () => {
  expect(isBareSpecifier("stoneberry/scan")).toBe(true);
});

test("string patch ", () => {
  const src = `import { foo } from "bar";`;
  const code = `"bar"`;
  const startIndex = src.indexOf(code);
  const patch: StringPatch = {
    startIndex,
    endIndex: startIndex + code.length,
    origText: code,
    newText: `"bar-1234"`,
  };
  const result = replaceStrings(src, [patch]);
  expect(result).toBe(`import { foo } from "bar-1234";`);
});

test("string patch multiple out of order", () => {
  const src = `import { foo } from "bar"; import { zip } from "zap";}`;
  const code1 = `"bar"`;
  const start1 = src.indexOf(code1);
  const patch1: StringPatch = {
    startIndex: start1,
    endIndex: start1 + code1.length,
    origText: code1,
    newText: `"bar-1234"`,
  };
  const code2 = `"zap"`;
  const start2 = src.indexOf(code2);
  const patch2: StringPatch = {
    startIndex: start2,
    endIndex: start2 + code1.length,
    origText: code2,
    newText: `"zap-3145"`,
  };
  const result = replaceStrings(src, [patch2, patch1]);
  expect(result).toBe(
    `import { foo } from "bar-1234"; import { zip } from "zap-3145";}`
  );
});
