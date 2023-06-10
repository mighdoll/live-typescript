A simple React component to show live typescript code samples. 

* TypesScript hinting and error checking using the Monaco editor from VS Code.
* Code examples are vanilla typescript, not React components. Add any libraries you like.
* Live preview isolated in an iframe.
* Instant refresh, transpiles with sucrase.
* Docusaurus compatible.

Importing types for custom libraries is straightforward but not automatic.
live-typescript provides a hook to configure Monaco. To add a custom library,
call `addExtraLib()` with the text of the library's package.json 
and .d.ts type definition files. See [stoneberry-code-example][] for an example. 

[stoneberry-code-example]: https://github.com/mighdoll/stoneberry-code-example/tree/main/src/StoneberryExample.tsx
