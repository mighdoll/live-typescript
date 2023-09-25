A rollup / vite plugin to collect file contents for
[live-typescript](https://www.npmjs.com/package/live-typescript) packages.

### Use

Install package

```sh
npm install --save-dev rollup-plugin
```

Add the plugin to `vite.config.ts`

```ts
import { defineConfig } from "vite";
import sourceFiles from "rollup-plugin-sourcefiles";

export default defineConfig({
  plugins: [sourceFiles(process.env.PWD)],
});
```

Use one or more `?sourceFiles` suffixed import statements to create
a `<live-typescript>` wrapper with your favorite packages pre-installed.

```ts
import thimbSrc from "thimbleberry?sourceFiles";

...

   <LiveTypescript embeddedPackages={[thimbSrc]}></LiveTypescript>
```

Full example [here](https://github.com/mighdoll/live-typescript/blob/main/packages/example/src/ThimbleberryExample.tsx).

<br>

### What it Makes Internally

The plugin collects source files and \*.d.ts files, and packages them up
to be consumed by the [live-typescript] live code editor. 
Using the plugin, an import from `pkgName?sourceFiles` will return two
javascript objects used as maps from string keys to string values.
One object is used as an html import map script for running the example code.
The other object is by the Monaco typescript editor for type hints and type checking.

The import map object is intended to be added to an importmap script tag
during execution of a code example.
The object maps import specifiers
(like package names, local package files, etc.) to module file contents, typically javascript.
The import statements in the javascript contents will map to to other keys in the map,
so the browser will load the other module contents as needed during execution.
To avoid name conflict between packages, the import statements and keys are extended
with a hash id.

The second object contains type description files .d.ts file contents as values.
These type description files are intended for the monaco syntax directed
editor, so that it can provide library typechecking and hints for user edited code.
The keys for the object are synthetic file urls, constructed as if the package was
at the root of the filesystem.

[live-typescript]: https://github.com/mighdoll/live-typescript/tree/main/
