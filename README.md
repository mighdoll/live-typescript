A simple React component to show live typescript code samples.

- TypesScript hinting and error checking using the Monaco editor from VS Code.
- Code examples are vanilla typescript, not React components. Add any libraries you like.
- Live preview isolated in an iframe.
- Instant refresh, transpiles with sucrase.
- Docusaurus compatible.

Importing types for custom libraries is straightforward but not automatic.
live-typescript provides a hook to configure Monaco. To add a custom library,
call `addExtraLib()` with the text of the library's package.json
and .d.ts type definition files. Here's an [example][].

[example]: https://github.com/mighdoll/live-typescript/tree/main/packages/example/ThimbleberryExample.tsx
