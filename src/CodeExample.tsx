import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

export function CodeEditor(): JSX.Element {
  const monaco = useMonaco();

  useEffect(() => {
    console.log("monaco", monaco);
  });

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
      />
      <iframe>
        tbd
      </iframe>
    </div>
  );
}
