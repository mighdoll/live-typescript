import path from "node:path";
import { moduleResolve } from "import-meta-resolve";
import fs from "fs/promises";
import module from "node:module";
import { modHash } from "./stringUtil.js";

/** cache from href to loaded code and hashId */
const moduleCache = new Map<string, LoadedModule>();

const importConditions = new Set(["node", "import"]);

/** @return the local fs path to the import entry point for a given package name */
export function resolveModule(pkg: string, baseUrl: URL): URL {
  // use import-meta-resolve if possible so that we can match the
  // exported 'import:' entry in package.json packages rather than using the 'require:' entry
  try {
    const pkgUrl = moduleResolve(pkg, baseUrl, importConditions);
    return pkgUrl;
  } catch (e) {}

  // but import-meta-resolve doesn't fall back to commonjs resolution for e.g. lodash,
  // so use node's module.resolve if necessary
  console.warn(
    `falling back to nodejs resolver for ${pkg} from ${baseUrl.href}`
  );
  const req = module.createRequire(baseUrl.href);
  const pkgPath = req.resolve(pkg);
  return new URL(`file://${pkgPath}`);
}

export interface LoadedModule {
  contents: string;
  hashId: string;
}

/** load a local module from the filesystem, returning and caching the results */
export async function cachedLoadModule(
  url: URL,
  importSpecifier: string
): Promise<LoadedModule> {
  const found = moduleCache.get(url.href);
  if (found) {
    return found;
  }

  const contents = await fs.readFile(url, { encoding: "utf-8" });
  const hashId = modHash(importSpecifier, contents);
  const result: LoadedModule = { contents, hashId };
  moduleCache.set(url.href, result);
  return result;
}

/** search up the path from a resolved module path to find package.json */
export async function containingPackageJson(pkgPath: string): Promise<string> {
  let dirPath = path.resolve(pkgPath, "..");
  while (dirPath !== "/") {
    const packageJsonPath = path.join(dirPath, "package.json");
    const fStat = await fs.stat(packageJsonPath).catch(() => null);
    if (fStat?.isFile()) {
      return packageJsonPath;
    }
    dirPath = path.resolve(dirPath, "..");
  }
  throw new Error(`could not find package.json in ${pkgPath}`);
}

/** find the package json for a name package, either in this directory's node_modules
 * or on a parent directory's node_modules */
export async function packageJsonForPkg(
  pkg: string,
  basePath: string
): Promise<string> {
  const nodeModulesPath = path.join(basePath, "node_modules");
  const nodeStat = await fs.stat(nodeModulesPath).catch(() => null);
  if (nodeStat?.isDirectory()) {
    const pkgJsonPath = path.join(nodeModulesPath, pkg, "package.json");
    const pkgJsonStat = await fs.stat(pkgJsonPath).catch(() => null);
    if (pkgJsonStat?.isFile()) {
      return pkgJsonPath;
    }
  }
  if (path.dirname(basePath) !== basePath) {
    return packageJsonForPkg(pkg, path.dirname(basePath));
  } else {
    throw new Error(`could not find package.json for ${pkg} in ${basePath}`);
  }
}
