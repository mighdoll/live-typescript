import * as esbuild from "esbuild";
import parseImports from "parse-imports";
import { cachedLoadModule, resolveModule } from "./loadModule.js";
import { StringPatch, isBareSpecifier, replaceStrings } from "./stringUtil.js";

export interface PatchedModule {
  imports: string[];
  map: Record<string, string>;
}

/** load code and child imports from this package */
export async function loadAndPatch(
  pkgUrl: URL,
  pkg: string
): Promise<PatchedModule> {
  const { contents, hashId } = await cachedLoadModule(pkgUrl, pkg);
  const transformed = await esbuild.transform(contents, {
    format: "esm",
    target: "es2022",
  });
  const importLocations = await parseModule(transformed.code);
  const patchedContents = await patchImports(
    transformed.code,
    importLocations,
    pkgUrl
  );

  console.log(`adding uniqified ${pkg}: ${hashId} to map`);
  const entries: [string, string][] = [[hashId, patchedContents]];
  if (isBareSpecifier(pkg)) {
    console.log(`adding bare import ${pkg} to map`);
    entries.push([pkg, patchedContents]);
  }
  const map = Object.fromEntries(entries);
  const imports = importLocations.map((i) => i.specifier);

  return { map, imports };
}

async function patchImports(
  code: string,
  importLocations: ImportLocation[],
  baseUrl: URL
): Promise<string> {
  const patches: StringPatch[] = [];
  for (const imported of importLocations) {
    const { specifier } = imported;
    const childUrl = resolveModule(specifier, baseUrl);
    const { hashId } = await cachedLoadModule(childUrl, specifier);
    const patch = makePatch(code, imported, hashId);
    patches.push(patch);
  }
  return replaceStrings(code, patches);
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
