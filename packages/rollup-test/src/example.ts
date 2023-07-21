import thimbImports from "thimbleberry?remapImports";
import thimbTypes from "thimbleberry?typeFiles";

// for testing the rollup plugin on its own

export function foo() {
  console.log("thimbTypes", thimbTypes);
  console.log("thimImports", thimbImports);
}
