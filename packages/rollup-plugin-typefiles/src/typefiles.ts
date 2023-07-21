import fs from "fs/promises";
import path from "node:path";
import url from "node:url";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";
import { Plugin } from "vite";
import { glob } from "glob";
import { packageResolve } from "./resolve.js";

let rootUrl = new URL("file:///");

/** trigger on source code that imports from a package with this suffix attached */
const suffix = "?typeFiles".toLowerCase();

/**
 * This plugin enables import statements with a ?typeFiles suffix that will
 * resolve (at compile time) to a map of all type definition files in the package.
 *
 * This is useful for statically gathering type definitions for use in type aware
 * live editing environments like live-typescript.
 *
 * @param cwd - absolute file system path to start the search for packages.
 * Typically this is the directory containing package.json and node_modules.
 */
export default function typeFiles(cwd: string): Plugin {
  const rootPath = path.join(cwd, "package.json");
  rootUrl = url.pathToFileURL(rootPath);

  return {
    name: "typefiles",
    load,
    resolveId,
    enforce: "pre",
  };
}

/** plugin hook to detect import specifiers containing our suffix
 * (so that rollup will continue to try and load them) */
function resolveId(
  source: string,
  _importer: string | undefined,
  _options: {
    assertions: Record<string, string>;
    custom?: CustomPluginOptions;
    isEntry: boolean;
  }
): ResolveIdResult {
  if (source.toLowerCase().endsWith(suffix)) {
    return `${source}`;
  }
  return null;
}

async function load(id: string): Promise<LoadResult> {
  if (id.toLowerCase().endsWith(suffix)) {
    const pkg = id.slice(0, -suffix.length);
    const results = await collectTypeFiles(pkg, rootUrl);
    const resultsStr = JSON.stringify(results, null, 2);

    return `export default ${resultsStr};`;
  }
  return null;
}

/*
  find the package.json and all '*.d.ts' files in the package
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
export async function collectTypeFiles(
  pkg: string,
  baseUrl: URL
): Promise<Record<string, string>> {
  // find package.json
  const packageJsonUrl = packageResolve(pkg, baseUrl);

  // find .d.ts files
  const packageJsonPath = url.fileURLToPath(packageJsonUrl);
  const packagePath = path.resolve(packageJsonPath, "..");
  const typeFiles = await glob(`${packagePath}/**/*.d.ts`, { follow: true });

  // load all files
  const files = [packageJsonPath, ...typeFiles];
  const loadingFiles = files.map(async (f) => {
    const contents = await fs.readFile(f, "utf-8");
    return [f, contents];
  });
  const loaded = await Promise.all(loadingFiles);

  // remap to synthetic file urls
  const fileEntries = loaded.map(([f, contents]) => {
    // since the upstream code will tell monaco that the users example code is at the fs root,
    // we'll pretend that the node_modules folder is also at the root
    const relPath = path.relative(packagePath, f);
    const rootedFileUrl = `file:///node_modules/${pkg}/${relPath}`;
    return [rootedFileUrl, contents];
  });
  const map = Object.fromEntries(fileEntries);

  return map;
}
