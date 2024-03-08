import fs from "fs/promises";
import { glob } from "glob";
import path from "node:path";
import { containingPackageJson, packageJsonForPkg } from "./loadModule.js";

/** 
  find the package.json and all '*.d.ts' files in the package and any dependent packages.
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
/*
  Typescript/Monaco doesn't likely need _all_ of the *.d.ts files. But we can't
  know at build time which types are needed for user code import statements. The user
  code can be edited at runtime. And even static example code might well
  be compiled in a separate package from the wrapper component using this plugin.
  So again the plugin can't know which types and therefore even which dependent packages 
  are needed, so we load all the types from all the non-dev dependencies.
*/
export async function collectTypeFiles(
  pkg: string, // name of package
  pkgPath: string // path to a file in the package in the package root dir or below (e.g. root/dist/index.js)
): Promise<Record<string, string>> {
  // find package.json
  const packageJsonPath = await containingPackageJson(pkgPath);
  return typeFilesRecursive(pkg, packageJsonPath);
}

/** 
  find the package.json and all '*.d.ts' files in the package and any dependent packages.
  returns synthetic file urls as if the baseUrl was the root of the filesystem
*/
async function typeFilesRecursive(
  pkg: string, // name of package
  packageJsonPath: string // path to package's package.json file
): Promise<Record<string, string>> {
  const jsonText = await fs.readFile(packageJsonPath, "utf-8");
  const json = JSON.parse(jsonText);
  const root = path.resolve(packageJsonPath, "..");
  const pkgMap = await packageTypeFiles(pkg, json, root, packageJsonPath);
  const atTypesMap = await atTypesFiles(pkg, root);
  const depsMap = await dependentTypeFiles(json, root); // recursive
  const map = { ...pkgMap, ...atTypesMap, ...depsMap };

  return map;
}
async function atTypesFiles(
  pkg: string,
  rootPath: string
): Promise<Record<string, string>> {
  const atTypes = `@types/${pkg}`;
  const pkgPath = await packageJsonForPkg(atTypes, rootPath).catch(() => null);
  if (pkgPath) {
    return typeFilesRecursive(atTypes, pkgPath);
  } else {
    return {};
  }
}

/** choose a virtual directory root path for this package.
 *    pkg -> pkg
 *    @group/pkg -> @group/pkg
 *    pkg/sub/path.js -> pkg/sub
 *
 * These are used to construct a virtual file heirarchy for the .d.ts files
 * The .d.ts virtual files can be anywhere, but must be unique.
 */
const fileSuffix = /(?:(?:\.jsx?)|(?:\.tsx?))$/;

export function pkgRootPrefix(pkg: string): string {
  if (fileSuffix.test(pkg)) {
    return pkg.split("/").slice(0, -1).join("/");
  } else {
    return pkg;
  }
}

/** finds all the *.d.ts files and returns a map to their contents with synthetic file urls.
 * the package.json file is also included in the map */
async function packageTypeFiles(
  pkg: string,
  packageJson: any,
  rootPath: string,
  packageJsonPath: string
): Promise<Record<string, string>> {
  const typeFiles = await dtsFiles(packageJson, rootPath);

  // load all files
  const files = [packageJsonPath, ...typeFiles];
  const loadingFiles = files.map(async (f) => {
    const contents = await fs.readFile(f, "utf-8");
    return [f, contents];
  });
  const loaded = await Promise.all(loadingFiles);

  let pkgRoot = pkgRootPrefix(pkg);

  // remap to synthetic file urls
  const fileEntries = loaded.map(([f, contents]) => {
    // since the upstream code will tell monaco that the users example code is at the fs root,
    // we'll pretend that the node_modules folder is also at the root
    const relPath = path.relative(rootPath, f);
    const rootedFileUrl = `file:///node_modules/${pkgRoot}/${relPath}`;
    return [rootedFileUrl, contents];
  });
  const pkgMap = Object.fromEntries(fileEntries);
  return pkgMap;
}

/** return all .d.ts files referenced from the package.json files entry */
async function dtsFiles(
  packageJson: any,
  packageRoot: string
): Promise<string[]> {
  // find .d.ts files in packageJson.files
  const filesEntries = packageJson?.files || [];
  const [dtsDirects, dirEntries] = partition(filesEntries, (d: string) =>
    d.endsWith(".d.ts")
  );
  const typeEntry = packageJson?.types || packageJson?.typings;
  if (typeEntry) {
    dtsDirects.push(typeEntry);
  }
  
  const dtsDirectPaths = dtsDirects.map((d: string) =>
    path.join(packageRoot, d)
  );
  const distSearch = dirEntries.map((path: string) => {
    const trimmed = trimPathSuffix(path);
    return `${packageRoot}/${trimmed}/**/*.d.ts`;
  });


  const foundTypeFiles = await glob(distSearch, { follow: true });
  return [...dtsDirectPaths, ...foundTypeFiles];
}

/** sometimes the files entry ends in / or ends with some glob syntax * or **.
 * Trim that stuff off.  */
function trimPathSuffix(path: string): string {
  let end = path.length - 1;
  let lastChar = path[end];
  while ((lastChar === "/" || lastChar === "*") && end > 0) {
    end--;
    lastChar = path[end];
  }
  return path.slice(0, end + 1);
}

/** recurse to find .d.ts files in packageJson.dependecies */
async function dependentTypeFiles(
  packageJson: any,
  packageRoot: string
): Promise<Record<string, string>> {
  const deps = packageJson?.dependencies || {};
  const futureDepTypes = Object.keys(deps).map(async (pkg) => {
    // for package entry point specifiers, return just the base package
    const pkgPath = await packageJsonForPkg(pkg, packageRoot).catch(() => null);

    if (pkgPath) {
      return typeFilesRecursive(pkg, pkgPath);
    } else {
      console.log("no package.json for", pkg, "from: ", packageRoot);
      return {};
    }
  });
  const futureDeps = await Promise.all(futureDepTypes);
  const map = futureDeps.reduce((acc, dep) => ({ ...acc, ...dep }), {});
  return map;
}

/** split an array into two parts by a discriminator function */
function partition<T>(elems: T[], fn: (elem: T) => boolean): [T[], T[]] {
  const a: T[] = [];
  const b: T[] = [];
  elems.forEach((e) => {
    if (fn(e)) {
      a.push(e);
    } else {
      b.push(e);
    }
  });
  return [a, b];
}
