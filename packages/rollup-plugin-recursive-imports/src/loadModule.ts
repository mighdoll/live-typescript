import { moduleResolve } from "import-meta-resolve";
import fs from "fs/promises";
import module from "node:module";
import { modHash } from "./stringUtil.js";

/** cache from href to loaded code and hashId */
const moduleCache = new Map<string, LoadedModule>();

const importConditions = new Set(["node", "import"]);

/** @return the local fs path for a given package name */
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
