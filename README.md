A simple react component for showing code samples with type aware editing and live preview.

* TypesScript hinting and error checking, based on VS Code's Monaco editor.
* Not tied to React. Code samples are vanilla typescript. Add any libraries you like.
* Live preview, isolated in an iframe.
* Instant refresh, transpiles with sucrase.
* Docusaurus compatible.

Importing types for custom libraries is straightforward but not automatic.
The library provides a hook to configure Monaco. To add a custom library,
call `addExtraLib()` with the text of the library's package.json 
and .d.ts type definition files. See [stoneberry-code-example][] for an example. 

[stoneberry-code-example]: https://github.com/mighdoll/stoneberry-code-example/tree/main/src/StoneberryExample.tsx
