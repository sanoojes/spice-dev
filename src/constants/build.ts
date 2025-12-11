import autoprefixer from "autoprefixer";
import type { BuildOptions, Plugin } from "esbuild";
import type { AcceptedPlugin } from "postcss";
import postcssNested from "postcss-nested";
import { externalGlobal } from "@/helpers/esbuild/plugin/externalGlobal";

// common esbuild options used by the build and dev
export const COMMON_ESBUILD_OPTIONS: Omit<
  BuildOptions,
  "plugins" | "outdir" | "entryPoints" | "sourcemap"
> = {
  bundle: true,
  treeShaking: true,
  format: "esm",
  jsx: "transform",
  platform: "browser",
  legalComments: "none",
  tsconfig: "tsconfig.json",
  external: ["react", "react-dom"],
};

export const DEFAULT_POSTCSS_PLUGIN: AcceptedPlugin[] = [
  postcssNested,
  autoprefixer,
];

export const DEFAULT_ESBUILD_PLUGIN: Plugin[] = [
  externalGlobal({
    react: "Spicetify.React",
    "react-dom": "Spicetify.ReactDOM",
    "react/jsx-runtime": "Spicetify.ReactJSX",
    "react-dom/client": "Spicetify.ReactDOM",
    "react-dom/server": "Spicetify.ReactDOMServer",
  }),
];
