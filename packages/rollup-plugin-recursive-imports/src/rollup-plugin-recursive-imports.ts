import fs from "fs/promises";
import { moduleResolve } from "import-meta-resolve";
import url from "node:url";
import module from "node:module";
import path from "node:path";
import parseImports from "parse-imports";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";

/*
Use this plugin to generate import maps for packages imported with the suffix ?importMap.

  import map from "my-package?importMap";

map will be set to a record of module specifiers to the module code, including recursively
all the modules referenced by imports.

The intent is that the returned record can be used as an import map in the browser, 
with the code text in blob or data urls, and the modified package names as keys. 

By using the map, the vite/rollup user can use code modules statically in the browser, 
without bundling or publishing to a service like esm.sh. This is useful for live code editors
like live-typescript.
  . works with code modules that are not published to npm
  . avoids needing to rebundle the entire app when code examples are changed.

The package names are modified to include a unique id. The modified package name is returned 
as the record key and the modified packaged name is also patched into the import statement in
the returned code. 

The unique-ification of packages names solves two problems. Firstly, it enables relative imports
to to work correctly, even when the source of the import is in a blob or data url. (relative imports
like: 
  import foo from "./utils.js" 
can't be scoped correctly in an import map from a blob or data url. 
Secondly, multiple versions of the same package to be imported in the same app if necessary.

Note that the top level package itself, 'my-package' in this case, is not suffixed with a unique id.
*/

let rootUrl = new URL("file:///");

const importConditions = new Set(["node", "import"]);

/** trigger on source code that imports from a package with this suffix attached */
const suffix = "?imports";

/** @param cwd - absolute file system path to start the search for packages.
 * Typically this is the directory containing package.json and node_modules.
 */
export default function main(cwd: string) {
  const rootPath = path.join(cwd, "package.json");
  rootUrl = url.pathToFileURL(rootPath);

  return {
    name: "recursive-imports",
    load,
    resolveId,
  };
}

/** detect imports containing our suffix so that rollup will try and load them */
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
    const results = await recursiveImports(pkg, rootUrl, new Set());
    const resultsStr = JSON.stringify(results, null, 2);

    return `export default ${resultsStr};`;
  }
  return null;
}

/** load code for this package, the child packages imported by this package,
 * the grandchild packages imported by the child packages, etc.
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

  // load code and imports from this package
  const { contents, imports } = await loadModule(pkgUrl);
  const pkgContents = { [pkg]: contents };

  // recurse to collect imports from this package
  const nested: Record<string, string>[] = [];
  for (const imported of imports) {
    nested.push(await recursiveImports(imported, pkgUrl, found));
  }

  // merge our module with modules imported by our module
  const result = nested.reduce((elem, sum) => {
    return { ...elem, ...sum };
  }, pkgContents);
  return result;
}


interface ModuleContents {
  contents: string;
  imports: string[];
}

let id = 0;

/** load the code for a given module and replace all imports with constructed identifiers,
 * @return the code, the
 *  */
export async function loadModule(pkgUrl: URL): Promise<ModuleContents> {
  const contents = await fs.readFile(pkgUrl, { encoding: "utf-8" });

  const parsed = await parseImports(contents);
  const mods = [...parsed].filter(
    ({ moduleSpecifier: { type, isConstant } }) =>
      isConstant && (type === "package" || type === "relative")
  );
  const imports = mods.map((imported) => imported.moduleSpecifier.value!);
  mods.forEach((mod) => {
    const { startIndex, endIndex } = mod;
    const text = contents.slice(startIndex, endIndex);
    console.log("code:", mod.moduleSpecifier.code);
    console.log("value:", mod.moduleSpecifier.value);
    console.log("contents:", text);
  });

  return { contents, imports };
}

/** @return the local fs path for a given package name */
export function resolveModule(pkg: string, baseUrl: URL): URL {
  // use import-meta-resolve if possible,
  // so that we can match the exported 'import' entry in package.json packages rather than 'require'
  try {
    const pkgUrl = moduleResolve(pkg, baseUrl, importConditions);
    return pkgUrl;
  } catch (e) {}

  // but import-meta-resolve doesn't fall back to commonjs resolution for e.g. lodash,
  // so use node's module.resolve if necessary
  const req = module.createRequire(baseUrl.href);
  const pkgPath = req.resolve(pkg);
  return new URL(`file://${pkgPath}`);
}

function replaceStrings(
  contents: string,
  replacements: Record<string, string>
): string {
  const keys = Object.keys(replacements);
  const pattern = new RegExp(keys.join("|"), "g");
  return contents.replace(pattern, (matched) => replacements[matched]);
}
