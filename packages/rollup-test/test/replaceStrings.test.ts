import {test, assert} from "vitest";
import {loadModule, resolveModule} from "rollup-plugin-recursive-imports";
import url from "node:url";
import path from "node:path";

test("simple", async () => {
  assert(1 + 1 === 2);
  console.log("foo");
  const rootPath = path.join(process.env.PWD!, "package.json");
  const rootUrl = url.pathToFileURL(rootPath);

  const thimbUrl = resolveModule("thimbleberry", rootUrl);
  const res = await loadModule(thimbUrl)
  console.log(res);
});