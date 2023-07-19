import md5 from "blueimp-md5";

export function modHash(pkg: string, contents: string): string {
  const hash = md5(contents);
  const lastSlash = pkg.lastIndexOf("/");
  const afterPath = pkg.slice(lastSlash + 1);
  const shortName = trimNonAlphaNumeric(afterPath);
  const shortHash = hash.slice(0, 7);
  return `${shortName}-${shortHash}`;
}

function trimNonAlphaNumeric(s: string): string {
  let i = 0;
  for (; i < s.length; i++) {
    if (s[i].match(/[^\w\.-]/)) {
      break;
    }
  }
  return s.slice(0, i);
}

export interface PatchSpot {
  startIndex: number;
  endIndex: number;
  origText: string;
  newText: string;
}

export function replaceStrings(
  contents: string,
  patchSpots: PatchSpot[]
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
