
import path from "node:path";
import url from "node:url";
import {
  loadModule,
  resolveModule
} from "rollup-plugin-recursive-imports";
import { assert, test } from "vitest";

test("simple", async () => {
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const thimbUrl = resolveModule("thimbleberry", rootUrl);
  const res = await loadModule(thimbUrl);
  console.log(JSON.stringify(res, null, 2).slice(0, 100));
});
