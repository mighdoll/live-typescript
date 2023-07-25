import fs from "fs/promises";
import { glob } from "glob";
import path from "node:path";

/*
  find the package.json and all '*.d.ts' files in the package
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
export async function collectTypeFiles(
  pkg: string,
  pkgPath: string
): Promise<Record<string, string>> {
  // find package.json
  const packageJsonPath = await findPackageJson(pkgPath); // TODO

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

  // for package entry point specifiers, return just the base package 
  const pkgBase = pkg.split("/", 1)[0]

  // remap to synthetic file urls
  const fileEntries = loaded.map(([f, contents]) => {
    // since the upstream code will tell monaco that the users example code is at the fs root,
    // we'll pretend that the node_modules folder is also at the root
    const relPath = path.relative(packagePath, f);
    const rootedFileUrl = `file:///node_modules/${pkgBase}/${relPath}`;
    return [rootedFileUrl, contents];
  });
  const map = Object.fromEntries(fileEntries);

  return map;
}

/** search up the path from a resolved module path to find package.json */
export async function findPackageJson(pkgPath: string): Promise<string> {
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
