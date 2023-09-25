import "live-typescript/style.css";
import pkgSource from "thimbleberry?sourceFiles";

export function App(): JSX.Element {
  return (
    <div>
      <UsePackage />
      <UsePackageWrapper />
    </div>
  );
}

/* example of using LiveTypescript directly */
import { LiveTypescript } from "live-typescript";

export function UsePackage(): JSX.Element {
  return (
    <LiveTypescript
      embeddedPackages={[pkgSource]}
      code="
        import { mapN } from 'thimbleberry';

        const seq = mapN(10).join(' ');
        document.body.innerHTML = `<div> ${seq} </div>`;
      "
    />
  );
}

/* example of using a wrapper around LiveTypescript with embeddedPackages in the wrapper */
import { ThimbleberryExample } from "./ThimbleberryExample";

export function UsePackageWrapper(): JSX.Element {
  return (
    <ThimbleberryExample
      code="
        import { mapN } from 'thimbleberry';

        const seq = mapN(10).join(' ');
        document.body.innerHTML = `<div> ${seq} </div>`;
      "
    />
  );
}
