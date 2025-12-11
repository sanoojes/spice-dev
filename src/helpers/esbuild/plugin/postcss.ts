import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { type Plugin, transform } from "esbuild";
import postcss, { type AcceptedPlugin } from "postcss";

type PostCssPluginProps = {
  plugins?: AcceptedPlugin[];
  minify?: boolean;
  sourcemap?: boolean;
};

export function postcssPlugin({
  plugins = [],
  minify = true,
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

        const transformedCss = await transform(result.css, {
          loader: "css",
          minify,
        });

        const js = `
const css = ${JSON.stringify(transformedCss.code.trim())};
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}
export default css;`;

        return {
          contents: js,
          loader: "js",
          resolveDir: dirname(args.path),
        };
      });
    },
  };
}
