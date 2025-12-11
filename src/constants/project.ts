import pkg from "@root/package.json";

export const NAME = pkg.name ?? "spice-cli";
export const VERSION = pkg.version;
export const BANNER = `${NAME} v${VERSION}`;
