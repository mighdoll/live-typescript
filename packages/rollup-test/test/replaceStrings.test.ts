import { test, assert, expect } from "vitest";
import {
  loadModule,
  modHash,
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
