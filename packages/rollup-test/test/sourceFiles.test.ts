import path from "node:path";
import url from "node:url";
import { sourceFiles } from "rollup-plugin-sourcefiles";
import { assert, expect, test } from "vitest";

test("thimbleberry sourceFiles", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "thimbleberry";
  const map = await sourceFiles(pkg, rootUrl);
  console.log(map)
});
