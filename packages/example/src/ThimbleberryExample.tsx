import { LiveTypescript, LiveTypescriptProps } from "live-typescript";
import "live-typescript/style.css";
import "react";
import thimbSrc from "thimbleberry?sourceFiles";

/** an example wrapper around LiveTypescript with a package preinstalled */
export function ThimbleberryExample(props: LiveTypescriptProps): JSX.Element {
  // add thimbleberry package
  const embeddedPackages = (props?.embeddedPackages || []).concat(thimbSrc);

  // (optional) make thimbleberry visible w/o explicit import
  const visibleTypes = (props?.visibleTypes || []).concat("thimbleberry");

  return (
    <LiveTypescript
      {...{ ...props, embeddedPackages, visibleTypes }}
    ></LiveTypescript>
  );
}
