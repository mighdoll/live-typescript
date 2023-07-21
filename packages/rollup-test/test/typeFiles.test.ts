import path from "node:path";
import url from "node:url";
import { collectTypeFiles } from "rollup-plugin-typefiles";
import { expect, test } from "vitest";

test("collectTypeFiles", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);
  const pkg = "thimbleberry";
  const map = await collectTypeFiles(pkg, rootUrl);
  const files = [...Object.keys(map)];
  const packageJsonFile = files.filter((f) =>
    f.endsWith(`${pkg}/package.json`)
  );
  expect(packageJsonFile.length).toBe(1);
  const typeFiles = files.filter((f) => f.endsWith(`.d.ts`));
  expect(typeFiles.length).toBeGreaterThan(10);
});
