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

export function jsBlobUrl(code: string): string {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  return url;
}
