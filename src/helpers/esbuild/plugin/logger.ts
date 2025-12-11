import type { Plugin } from "esbuild";
import pc from "picocolors";
import { TICK } from "@/constants/symbols";
import type { BuildOptions } from "@/types/build";
import type { Config } from "@/types/config";
import { formatBytes, formatCount, formatDuration } from "@/utils/format";

export const buildLogger = (config: Config & BuildOptions): Plugin => ({
  name: "spice-dev-build-logger",
  setup(build) {
    let start: number | null = null;

    build.initialOptions.metafile = true;

    build.onStart(() => {
      start = Date.now();
    });

    build.onEnd((result) => {
      const end = Date.now();
      const timeLabel = formatDuration(start, end);

      if (result.errors.length > 0) {
        console.log(
          `${pc.red("✖ Build failed")} ${pc.dim(
            `in ${timeLabel}`,
          )} with ${pc.red(formatCount(result.errors.length, "error"))}.`,
        );

        for (const error of result.errors) {
          console.error(pc.red(`  • ${error.text}`));
        }

        return;
      }

      if (result.warnings.length > 0) {
        console.log(
          `${pc.yellow("⚠ Built with warnings")} ${pc.dim(
            `in ${timeLabel}`,
          )} (${pc.yellow(formatCount(result.warnings.length, "warning"))})`,
        );

        for (const warning of result.warnings) {
          console.warn(pc.yellow(`  • ${warning.text}`));
        }
      }

      const metafile = result.metafile;
      if (!metafile) {
        console.log(`${TICK} Build complete ${pc.dim(`in ${timeLabel}`)}`);
        return;
      }

      const transformedCount = Object.keys(metafile.inputs ?? {}).length;
      console.log(`${TICK} ${transformedCount} modules transformed.`);

      const outputs = Object.entries(metafile.outputs)
        .filter(([filePath, meta]) => {
          if (filePath.endsWith(".map")) return false;
          return meta.bytes > 0;
        })
        .map(([filePath, meta]) => ({
          path: filePath.replace(/\\/g, "/"),
          bytes: meta.bytes,
        }));

      const maxPathLength = outputs.reduce(
        (max, o) => Math.max(max, o.path.length),
        0,
      );

      for (const o of outputs) {
        const pathLabel = o.path.padEnd(maxPathLength, " ");
        const sizeLabel = formatBytes(o.bytes).padStart(7, " ");

        console.log(`${pathLabel}   ${sizeLabel}`);
      }

      console.log(pc.cyan(`built in ${timeLabel}`));

      if (config.watch) {
        console.log(pc.green(``));
      }
    });
  },
});
