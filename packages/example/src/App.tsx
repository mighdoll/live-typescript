import "live-typescript/style.css";
import { LiveTypescript } from "live-typescript";

/* Example 1: using LiveTypescript embedding a package at build time.
 * Requires the sourceFiles plugin which works in vite and rollup.
*/ 
import pkgSource from "thimbleberry?sourceFiles";

export function PackageExample(): JSX.Element {
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

/* Example 2: using a wrapper around LiveTypescript with embeddedPackages in the wrapper 
*  This saves a few lines of code in the typical case where 
*  many examples import the same packages.
*/
import { ThimbleberryExample } from "./ThimbleberryExample";

export function WrapperExample(): JSX.Element {
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

/* Example 3: Using LiveTypescript with an npm package loaded from a public CDN.
 *   + no build plugin is required
 *   - can't import private packages or unpublished local packages
 *   - currently w/o type support (this could be fixed)
 */
export function PublicPackageExample(): JSX.Element {
  return (
    <LiveTypescript
      npmPackages={["thimbleberry"]} 
      height="100px"
      previewWidth="500px"
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
      <PackageExample />
      <WrapperExample />
      <PublicPackageExample />
    </div>
  );
}
