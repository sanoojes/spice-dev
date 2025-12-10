import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Plugin } from "esbuild";
import postcss, { type AcceptedPlugin } from "postcss";

type PostCssPluginProps = {
  plugins?: AcceptedPlugin[];
  sourcemap?: boolean;
};

export function postcssPlugin({
  plugins = [],
  sourcemap = false,
}: PostCssPluginProps = {}): Plugin {
  return {
    name: "postcss",
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const css = await readFile(args.path, "utf8");

        const result = await postcss(plugins).process(css, {
          from: args.path,
          map: sourcemap ? { inline: true, annotation: true } : false,
        });

        return {
          contents: result.css,
          loader: "css",
          resolveDir: dirname(args.path),
        };
      });
    },
  };
}
