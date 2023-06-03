
export function importMapScript(
  publicPackages: string[],
  customEntries?: Record<string, string>
): string {
  const publicImports = publicPackages.map(
    (pkg) => `"${pkg}": "https://esm.sh/${pkg}"`
  );

  const customImports = Object.entries(customEntries || {}).map(
    ([key, value]) => `"${key}": "${value}"`
  );
  const imports = [...publicImports, ...customImports].join(",\n            ");
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