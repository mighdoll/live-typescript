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
