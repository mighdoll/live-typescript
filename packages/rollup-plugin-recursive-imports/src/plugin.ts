import fs from "fs/promises";
import { moduleResolve } from "import-meta-resolve";
import module from "node:module";
import path from "node:path";
import url from "node:url";
import parseImports from "parse-imports";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";
import {
  StringPatch,
  isBareSpecifier,
  modHash,
  replaceStrings,
} from "./stringUtil.js";

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

const importConditions = new Set(["node", "import"]);

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

interface ModuleText {
  contents: string;
  hashId: string;
}

/** cache from href to loaded code and hashId */
const moduleCache = new Map<string, ModuleText>();

async function cachedLoadModule(
  url: URL,
  importSpecifier: string
): Promise<ModuleText> {
  const found = moduleCache.get(url.href);
  if (found) {
    return found;
  }

  const contents = await fs.readFile(url, { encoding: "utf-8" });
  const hashId = modHash(importSpecifier, contents);
  const result: ModuleText = { contents, hashId };
  moduleCache.set(url.href, result);
  return result;
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
  const { contents, hashId } = await cachedLoadModule(pkgUrl, pkg);
  const imports = await parseModule(contents);
  const patchedContents = await patchImports(contents, imports, pkgUrl);

  const entries: [string, string][] = [[hashId, patchedContents]];
  if (isBareSpecifier(pkg)) {
    entries.push([pkg, patchedContents]);
  }

  // recurse to collect imports from this package
  for (const imported of imports) {
    const results = await recursiveImports(imported.specifier, pkgUrl, found);
    entries.push(...Object.entries(results));
  }

  return Object.fromEntries(entries);
}

async function patchImports(
  contents: string,
  imports: ImportLocation[],
  baseUrl: URL
): Promise<string> {
  // load child packages
  const patches: StringPatch[] = [];
  for (const imported of imports) {
    const { specifier } = imported;
    const childUrl = resolveModule(specifier, baseUrl);
    const { hashId } = await cachedLoadModule(childUrl, specifier);
    const patch = makePatch(contents, imported, hashId);
    patches.push(patch);
  }
  return replaceStrings(contents, patches);
}

function makePatch(
  contents: string,
  src: ImportLocation,
  hashId: string
): StringPatch {
  const { lineStart, origText } = src;

  const startIndex = contents.indexOf(origText, lineStart);
  const endIndex = startIndex + origText.length;
  const newText = `"${hashId}"`;
  return { startIndex, endIndex, origText, newText };
}

interface ImportLocation {
  lineStart: number;
  lineEnd: number;
  specifier: string;
  origText: string;
}

/** load the code for a given module and return
 *  the code, the imported module specifieres and the text locations of the import statements
 */

async function parseModule(contents: string): Promise<ImportLocation[]> {
  const parsed = await parseImports(contents);
  const mods = [...parsed].filter(
    ({ moduleSpecifier: { type, isConstant } }) =>
      isConstant && (type === "package" || type === "relative")
  );
  const imports = mods.map((mod) => {
    const { startIndex, endIndex, moduleSpecifier } = mod;
    return {
      lineStart: startIndex,
      lineEnd: endIndex,
      origText: moduleSpecifier.code,
      specifier: moduleSpecifier.value!,
    };
  });

  return imports;
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
