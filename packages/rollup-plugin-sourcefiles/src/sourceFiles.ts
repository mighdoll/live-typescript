import path from "node:path";
import url from "node:url";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";
import { Plugin } from "vite";
import { remapImports } from "./remapImports.js";
import { collectTypeFiles } from "./typeFiles.js";

interface ConfigOptions {
  debugTypeFiles?: boolean;
  debugImportMap?: boolean;
}

let rootUrl = new URL("file:///");

let config: ConfigOptions = {};

/** (for testing) set the config */
export function setSourceFilesConfig(options: ConfigOptions): void {
  config = options;
}

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
export default function typeFiles(
  cwd: string,
  options?: ConfigOptions
): Plugin {
  config = options || {};
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

export interface SourceFiles {
  /** map of imports bare and synthetic to code text, suitable for a browser importmap */
  importMap: Record<string, string>;

  /** map of synethic file urls to .d.ts and package.json files, suitable for monaco */
  typeFiles: Record<string, string>;
}

/*
  find the package.json and all '*.d.ts' files in the package
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
export async function sourceFiles(
  pkg: string,
  baseUrl: URL
): Promise<SourceFiles> {
  const { importMap, pkgPaths } = await remapImports(pkg, baseUrl, new Set());
  if (config.debugImportMap) {
    console.log(
      "import map:\n ",
      Object.entries(importMap)
        .map(([pkg, text]) => `${pkg} => ${text.length} chars`)
        .join("\n  ")
    );
  }

  const pkgPath = pkgPaths[pkg];
  const typeFiles = await collectTypeFiles(pkg, pkgPath);
  if (config.debugTypeFiles) {
    console.log(
      "type files:\n ",
      Object.entries(typeFiles)
        .map(([url, text]) => `${url} => ${text.length} chars`)
        .join("\n  ")
    );
  }

  return { importMap, typeFiles };
}
