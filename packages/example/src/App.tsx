import "live-typescript/style.css";
import { LiveTypescript } from "live-typescript";

/* example of using LiveTypescript with a public package */
export function PublicPackage(): JSX.Element {
  return (
    <LiveTypescript
      npmPackages={["thimbleberry"]} // (currently no typechecking for these)
      code="
        import { mapN } from 'thimbleberry';

        const seq = mapN(10).join(' ');
        document.body.innerHTML = `<div> ${seq} </div>`;
      "
    />
  );
}

/* example of using LiveTypescript directly, embedding a package */
import pkgSource from "thimbleberry?sourceFiles";

export function EmbedPackage(): JSX.Element {
  return (
    <LiveTypescript
      embeddedPackages={[pkgSource]} // loads source and type files
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

export function PackageWrapper(): JSX.Element {
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

export function App(): JSX.Element {
  return (
    <div>
      <PublicPackage />
      <EmbedPackage />
      <PackageWrapper />
    </div>
  );
}
