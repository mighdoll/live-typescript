import * as esbuild from "esbuild";
import path from "node:path";
import url from "node:url";
import parseImports from "parse-imports";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";
import { StringPatch, isBareSpecifier, replaceStrings } from "./stringUtil.js";
import { cachedLoadModule, resolveModule } from "./loadModule.js";
import { loadAndPatch } from "./patchModule.js";

/*
Use this plugin to generate import maps for packages imported with the suffix ?importMap.

  import map from "my-package?remapImports";

map will be set to a record of module specifiers to the module code, including recursively
all the modules referenced by imports.

The intent is that the returned record can be used as an import map in the browser, 
with the code text in blob or data urls, and the modified package names as keys. 

By using the map, the vite/rollup user can use code modules statically in the browser, 
without bundling or publishing to a service like esm.sh. This is useful for live code editors
like live-typescript.
  . works with code modules that are not published to npm
  . avoids needing to rebundle when code examples are changed.

The package names are modified to include a unique id. The modified package name is returned 
as the record key and the modified packaged name is also patched into the import statement in
the returned code. 

The unique-ification of packages names solves two problems. Firstly, it enables relative imports
to to work correctly, even when the source of the import is in a blob or data url. (relative imports
like: 
  import foo from "./utils.js" 
can't be scoped correctly in an import map from a blob or data url. 
Secondly, multiple versions of the same package to be imported in the same app if necessary.

For imports of bare specifiers, the map will have two entries to the same code
. one with the original package name as specifier
. one with the mod-hash as specifier
This is so that user entered packages imports statements will work w/o patching the import statement.
(In the unlikely case where there are multiple versions of the package that the user wants to manually
import, the user would have to use the mod-hash specifier to choose a particular one..)
*/

let rootUrl = new URL("file:///");

/** trigger on source code that imports from a package with this suffix attached */
const suffix = "?imports";

/** @param cwd - absolute file system path to start the search for packages.
 * Typically this is the directory containing package.json and node_modules.
 */
export default function plugin(cwd: string) {
  const rootPath = path.join(cwd, "package.json");
  rootUrl = url.pathToFileURL(rootPath);

  return {
    name: "recursive-imports",
    load,
    resolveId,
  };
}

/** plugin hook to detect import specifiers containing our suffix
 * (so that rollup will continue to try and load them) */
function resolveId(
  source: string,
  importer: string | undefined,
  options: {
    assertions: Record<string, string>;
    custom?: CustomPluginOptions;
    isEntry: boolean;
  }
): ResolveIdResult {
  if (source.endsWith(suffix)) {
    return `${source}`;
  }
  return null;
}

/** For imports from our suffix load the .js code for the import
 * and recursively load all child imports listed in the .js code.
 *
 * @returns an object with the package names as keys and the .js code as the values.
 *
 * e.g. if the source does
 *  import foo from "my-package?imports";
 *
 * and my-package.js includes an import of other-pkg.js,
 * and other-pkg.js includes an import of bar.js
 *
 * The return value of load will be:
 *   export default {
 *     "my-package": "// text of my-package.js file...",
 *     "other-pkg": "// text of other-package.js file...",
 *     "bar": "// text of bar.js file...",
 *    },
 */
async function load(id: string): Promise<LoadResult> {
  if (id.endsWith(suffix)) {
    const pkg = id.slice(0, -suffix.length);
    console.log("load", pkg, "from", rootUrl.href);
    const results = await recursiveImports(pkg, rootUrl, new Set());
    const resultsStr = JSON.stringify(results, null, 2);

    return `export default ${resultsStr};`;
  }
  return null;
}

/**
 * Load and link code for this package and all recursively imported packages.
 * The import statements in the loaded code is patched to import via uniqified
 * ids for each module.
 *
 * @returns a map with the uniqified ids and bare imports as keys and the code as values.
 */
export async function recursiveImports(
  pkg: string,
  baseUrl: URL,
  found: Set<string>
): Promise<Record<string, string>> {
  const pkgUrl = resolveModule(pkg, baseUrl);
  if (found.has(pkgUrl.href)) {
    return {};
  } else {
    found.add(pkgUrl.href);
  }

  // load code and child imports from this package
  const { map, imports } = await loadAndPatch(pkgUrl, pkg);

  // recurse to collect imports from this package
  const childMaps: Record<string, string>[] = [];
  for (const importPkg of imports) {
    console.log("recursing to import", importPkg, "from", pkg);
    const results = await recursiveImports(importPkg, pkgUrl, found);
    childMaps.push(results);
  }

  const combinedMap = childMaps.reduce(
    (m, combined) => ({ ...m, ...combined }),
    map
  );
  return combinedMap;
}
