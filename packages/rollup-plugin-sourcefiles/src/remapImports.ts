import url from "node:url";
import { resolveModule } from "./loadModule.js";
import { loadAndPatch } from "./patchModule.js";
import { isBareSpecifier } from "./stringUtil.js";

/*
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

export interface RemappedImports {
  importMap: Record<string, string>;
  pkgPaths: Record<string, string>;
}

/**
 * Load and link code for this package and all recursively imported packages.
 * The import statements in the loaded code are patched to import via uniqified
 * ids for each module.
 *
 * @returns a map with the uniqified ids and bare imports as keys and the code as values
 * and a map of package names to file paths for all bare imports
 */
export async function remapImports(
  pkg: string,
  baseUrl: URL,
  found: Set<string>
): Promise<RemappedImports> {
  const pkgUrl = resolveModule(pkg, baseUrl);
  const pkgPath = url.fileURLToPath(pkgUrl);
  const pkgPaths = isBareSpecifier(pkg) ? { [pkg]: pkgPath } : {};
  if (found.has(pkgUrl.href)) {
    return { importMap: {}, pkgPaths };
  } else {
    found.add(pkgUrl.href);
  }

  // load code and child imports from this package
  const { importMap, imports } = await loadAndPatch(pkgUrl, pkg);

  // recurse to collect imports from this package
  const childResults: RemappedImports[] = [];
  for (const importPkg of imports) {
    const results = await remapImports(importPkg, pkgUrl, found);
    childResults.push(results);
  }

  const pkgResult: RemappedImports = { importMap, pkgPaths };

  const combinedResults = childResults.reduce(
    (child, combined) => ({
      pkgPaths: { ...child.pkgPaths, ...combined.pkgPaths },
      importMap: { ...child.importMap, ...combined.importMap },
    }),
    pkgResult
  );

  return combinedResults;
}
