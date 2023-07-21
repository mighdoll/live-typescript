import "live-typescript/style.css";
import { mapN } from "thimbleberry";
import { ThimbleberryExample } from "./ThimbleberryExample";

export function App(): JSX.Element {
  return <ThimbleberryExample {...{ code: exampleCode() }} />;
}

function example(): void {
  const seq = mapN(10).join(" ");
  document.body.innerHTML = `<div> ${seq} </div>`;
}

/** @return example function body as a string */
function exampleCode(): string {
  const codeLines = example.toString().split("\n");
  const codeImport = 'import {mapN} from "thimbleberry";\n';
  const bodyLines = codeLines
    .slice(1, codeLines.length - 1)
    .map((s) => s.trim());
  const code = [codeImport, ...bodyLines].join("\n");
  return code;
}
