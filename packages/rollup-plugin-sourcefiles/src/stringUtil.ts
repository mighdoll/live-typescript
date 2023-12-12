import md5 from "blueimp-md5";

export function modHash(moduleSpecifier: string, contents: string): string {
  const hash = md5(contents);

  let afterPath = moduleSpecifier;
  if (
    isRelativeSpecifier(moduleSpecifier) ||
    isAbsoluteSpecifier(moduleSpecifier) ||
    isUrl(moduleSpecifier)
  ) {
    const lastSlash = moduleSpecifier.lastIndexOf("/");
    afterPath = moduleSpecifier.slice(lastSlash + 1);
  }
  const shortName = trimSpecifierEnd(afterPath);
  const shortHash = hash.slice(0, 7);
  return `${shortName}-${shortHash}`;
}

function trimSpecifierEnd(s: string): string {
  const matches = s.match(/[\w\.@\/-]+/);
  if (matches?.length) {
    return matches[0];
  }
  return "?";
}

export interface StringPatch {
  newText: string;
  startIndex: number;
  endIndex: number;
  origText: string; // TODO unused, remove?
}

export function replaceStrings(
  contents: string,
  patchSpots: StringPatch[]
): string {
  let i = 0;
  const fragments: string[] = [];
  const sortedSpots = patchSpots.sort((a, b) => a.startIndex - b.startIndex);
  for (const patch of sortedSpots) {
    fragments.push(contents.slice(i, patch.startIndex));
    fragments.push(patch.newText);
    i = patch.endIndex;
  }
  fragments.push(contents.slice(i));
  return fragments.join("");
}

export function isBareSpecifier(specifier: string): boolean {
  return (
    !isRelativeSpecifier(specifier) &&
    !isAbsoluteSpecifier(specifier) &&
    !isUrl(specifier)
  );
}

function isRelativeSpecifier(specifier: string): boolean {
  return specifier.startsWith(".");
}
function isAbsoluteSpecifier(specifier: string): boolean {
  return specifier.startsWith("/");
}

function isUrl(s: string): boolean {
  // @ts-ignore @node/types is not up to date
  const isUrl = URL.canParse(s);
  return isUrl;
}
