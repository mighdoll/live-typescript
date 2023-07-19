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

interface PatchSpot {
  startIndex: number;
  endIndex: number;
  origText: string;
  newText: string;
}

export function replaceStrings(
  contents: string,
  patchSpots: PatchSpot[]
): string {
  return contents;
}
