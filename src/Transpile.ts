import { transform } from "sucrase";

export function transpile(code: string): string {
  try {
    const compiledCode = transform(code, {
      transforms: ["typescript"],
    });
    return compiledCode.code;
  } catch (e) {
    console.log("e", e);
    return "??";
  }
}

export function importMapScript(packages: string[]): string {
  const imports = packages
    .map((pkg) => `"${pkg}": "https://esm.sh/${pkg}"`)
    .join(",\n");
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
