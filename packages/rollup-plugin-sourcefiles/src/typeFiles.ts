import fs from "fs/promises";
import path from "node:path";
import url from "node:url";
import { CustomPluginOptions, LoadResult, ResolveIdResult } from "rollup";
import { Plugin } from "vite";
import { glob } from "glob";

/*
  find the package.json and all '*.d.ts' files in the package
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
export async function collectTypeFiles(
  pkg: string,
  baseUrl: URL
): Promise<Record<string, string>> {
  // find package.json
  const packageJsonPath = await findPackageJson(""); // TODO

  // find .d.ts files
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

export async function findPackageJson(codePath: string): Promise<string> {
  // TODO search up the path to find path containing package.json

  return "";
}
