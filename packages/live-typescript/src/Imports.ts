/**
 * create an import map so the browser can resolve packages from import statements.
 * Map entries for public modules are resolved from https://esm.sh.
 * Map entries for embedded modules (with module text provided) are resolved via blob urls.
 *
 * @return an import map script ready for use in html
 */
export function importMapScript(
  publicPackages: string[],
  embeddedPackages?: Record<string, string>
): string {
  const publicImports = publicPackages.map(
    (pkg) => `"${pkg}": "https://esm.sh/${pkg}"`
  );

  const embeddedImports = Object.entries(embeddedPackages || {}).map(
    ([key, value]) => `"${key}": "${jsBlobUrl(value)}"`
  );
  const imports = [...publicImports, ...embeddedImports].join(
    ",\n            "
  );
  return `
      <script type="importmap">
        {
          "imports": {
            ${imports}
          }
        }
      </script>
  `;
}

function jsBlobUrl(code: string): string {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  return url;
}
