A simple React component to show live Typescript code samples.

- TypesScript hinting and error checking using the Monaco editor from VS Code.
- Your example code is vanilla Typescript, depend on any libraries you like.
- You can depend on local packages (not just public packages on npm).
- Live preview, isolated in an iframe.
- Instant refresh, transpiles with sucrase.
- Docusaurus compatible.

Here's a simple example:

```
  <LiveTypescript code="console.log('hello world');"/>
```

To use modules in your example code, use the provided plugin in your vite or rollup build:
[rollup-plugin-sourcefiles].

```
  import pkgSource from "thimbleberry?sourceFiles";

  <LiveTypescript embeddedPackages={[pkgSource]}
      code="
        import { mapN } from 'thimbleberry';

        const seq = mapN(10).join(' ');
        document.body.innerHTML = `<div> ${seq} </div>`;
      "
    > </LiveTypescript>
```

Here's a complete [example][] using vite.

[example]: https://github.com/mighdoll/live-typescript/tree/main/packages/example/App.tsx
[rollup-plugin-sourcefiles]: https://github.com/mighdoll/live-typescript/tree/main/packages/rollup-plugin-sourcefiles
