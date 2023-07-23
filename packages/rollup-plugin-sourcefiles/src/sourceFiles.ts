import fs from "fs/promises";
import path from "node:path";
import url from "node:url";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";
import { Plugin } from "vite";
import { glob } from "glob";

let rootUrl = new URL("file:///");

/** trigger on source code that imports from a package with this suffix attached */
const suffix = "?sourceFiles".toLowerCase();

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
    name: "sourcefiles",
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
    const results = await sourceFiles(pkg, rootUrl);
    const resultsStr = JSON.stringify(results, null, 2);

    return `export default ${resultsStr};`;
  }
  return null;
}

/*
  find the package.json and all '*.d.ts' files in the package
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
export async function sourceFiles(
  pkg: string,
  baseUrl: URL
): Promise<Record<string, string>> {
  // TODO call remapImports and typeFiles
  return {}
}
