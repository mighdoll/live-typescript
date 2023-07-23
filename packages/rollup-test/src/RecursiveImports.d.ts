/// <reference types="rollup-plugin-sourcefiles" />

/** @hidden */
declare module "*?remapImports" {
  const content: Record<string, string>;
  export default content;
}

/** @hidden */
declare module "*?typeFiles" {
  const content: Record<string, string>;
  export default content;
}

/** @hidden */
declare module "*?sourceFiles" {
  const content: SourceFiles;
  export default content;
}
