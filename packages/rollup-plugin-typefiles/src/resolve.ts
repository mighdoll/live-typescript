// adapted from import-meta-resolve and node.js
//
import { statSync } from "node:fs";
import { fileURLToPath } from "url";
const invalidPackageNameRegEx = /^\.|%|\\/;

/**
 * @param {string} specifier
 * @param {URL} base
 * @param {Set<string> | undefined} conditions
 * @returns {URL}
 */
export function packageResolve(
  specifier: string,
  base: URL
  // conditions: Set<string> | undefined
): URL {
  const { packageName, isScoped } = parsePackageName(
    specifier,
    base
  );

  // // ResolveSelf
  // const packageConfig = getPackageScopeConfig(base);

  // // Can’t test.
  // /* c8 ignore next 16 */
  // if (packageConfig.exists) {
  //   const packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
  //   if (
  //     packageConfig.name === packageName &&
  //     packageConfig.exports !== undefined &&
  //     packageConfig.exports !== null
  //   ) {
  //     return packageExportsResolve(
  //       packageJsonUrl,
  //       packageSubpath,
  //       packageConfig,
  //       base,
  //       conditions
  //     );
  //   }
  // }

  let packageJsonUrl = new URL(
    "./node_modules/" + packageName + "/package.json",
    base
  );
  let packageJsonPath = fileURLToPath(packageJsonUrl);
  /** @type {string} */
  let lastPath;
  do {
    const stat = statSync(packageJsonPath.slice(0, -13), {
      throwIfNoEntry: false,
    });
    if (!stat?.isDirectory()) {
      lastPath = packageJsonPath;
      packageJsonUrl = new URL(
        (isScoped ? "../../../../node_modules/" : "../../../node_modules/") +
          packageName +
          "/package.json",
        packageJsonUrl
      );
      packageJsonPath = fileURLToPath(packageJsonUrl);
      continue;
    }

    // Package match.
    // const packageConfig = getPackageConfig(packageJsonPath, specifier, base);
    // if (packageConfig.exports !== undefined && packageConfig.exports !== null) {
    //   return packageExportsResolve(
    //     packageJsonUrl,
    //     packageSubpath,
    //     packageConfig,
    //     base,
    //     conditions
    //   );
    // }

    // if (packageSubpath === '.') {
    //   return legacyMainResolve(packageJsonUrl, packageConfig, base)
    // }

    // return new URL(packageSubpath, packageJsonUrl);

    return packageJsonUrl

    // Cross-platform root check.
  } while (packageJsonPath.length !== lastPath.length);

  throw new Error(
    `module not found ${packageName}  base: ${fileURLToPath(base)}`
  );
}

/**
 * @param {string} specifier
 * @param {URL} base
 */
export function parsePackageName(specifier: string, base: URL) {
  let separatorIndex = specifier.indexOf("/");
  let validPackageName = true;
  let isScoped = false;
  if (specifier[0] === "@") {
    isScoped = true;
    if (separatorIndex === -1 || specifier.length === 0) {
      validPackageName = false;
    } else {
      separatorIndex = specifier.indexOf("/", separatorIndex + 1);
    }
  }

  const packageName =
    separatorIndex === -1 ? specifier : specifier.slice(0, separatorIndex);

  // Package name cannot have leading . and cannot have percent-encoding or
  // \\ separators.
  if (invalidPackageNameRegEx.exec(packageName) !== null) {
    validPackageName = false;
  }

  if (!validPackageName) {
    throw new Error(`"${specifier}" is not a valid package name ${base.href}`);
  }

  const packageSubpath =
    "." + (separatorIndex === -1 ? "" : specifier.slice(separatorIndex));

  return { packageName, packageSubpath, isScoped };
}
