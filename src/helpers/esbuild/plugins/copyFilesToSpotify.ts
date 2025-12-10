import { join, resolve } from "node:path";
import type { Plugin } from "esbuild";
import type { Config } from "@/types/config";
import { FileManager } from "@/utils/fileManager";
import { getSpotifyPath } from "@/utils/spotify";

const spotifyPath = getSpotifyPath();

export const copyFilesToSpotify = (config: Config): Plugin => {
  return {
    name: "copy-files-to-spotify",
    setup(build) {
      const fromDir = build.initialOptions.outdir
        ? resolve(build.initialOptions.outdir)
        : resolve("dist");

      const xpuiPath = join(spotifyPath, "Apps", "xpui");
      const hmrPath = join(xpuiPath, "extensions/hmr");

      const fileManager = new FileManager(fromDir, hmrPath);

      build.onEnd(async (result) => {
        if (result.errors.length > 0) return;

        fileManager
          .addFile("app.js", `"${config.name}.js`)
          .addFile("app.css", `"${config.name}.css`);

        try {
          await fileManager.copyFiles();
        } catch (err) {
          console.error("[copy-files-to-spotify] Failed to copy files:", err);
        }
      });
    },
  };
};
