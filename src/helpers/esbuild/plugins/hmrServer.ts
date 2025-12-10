import type { Metafile, Plugin } from "esbuild";
import { WebSocketServer } from "ws";

type HmrMessage =
  | { type: "reload" }
  | { type: "css-update"; files: string[] }
  | { type: "build-error"; errors: unknown[] };

export function createHmrServer(hmrPort: number): Plugin {
  let wss: WebSocketServer | null = null;
  let previousMetafile: Metafile | null = null;

  const broadcast = (payload: HmrMessage) => {
    if (!wss) return;

    const data = JSON.stringify(payload);

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    }
  };

  return {
    name: "hmr-server",
    setup(build) {
      build.initialOptions.metafile = true;

      if (!wss) {
        wss = new WebSocketServer({ port: hmrPort });
      }

      build.onEnd((result) => {
        if (!wss) return;

        const hasErrors = result.errors.length > 0;

        if (hasErrors) {
          broadcast({ type: "build-error", errors: result.errors });
          console.log("Build finished with errors. Check terminal output.");
          return;
        }

        const metafile = result.metafile;

        if (!metafile || !previousMetafile) {
          previousMetafile = metafile ?? previousMetafile;
          broadcast({ type: "reload" });
          console.log("Build finished, full reload (no previous metafile).");
          return;
        }

        const changedOutputs: string[] = [];

        for (const [file, info] of Object.entries(metafile.outputs)) {
          const prev = previousMetafile.outputs[file];
          if (!prev || prev.bytes !== info.bytes) {
            changedOutputs.push(file);
          }
        }

        previousMetafile = metafile;

        if (changedOutputs.length === 0) {
          return;
        }

        const cssOutputs = changedOutputs.filter((f) => f.endsWith(".css"));
        const onlyCssChanged = cssOutputs.length === changedOutputs.length;

        if (onlyCssChanged) {
          broadcast({ type: "css-update", files: cssOutputs });
          console.log("Build finished, CSS-only change. HMR css-update sent.");
        } else {
          broadcast({ type: "reload" });
          console.log("Build finished, JS change. HMR reload sent.");
        }
      });
    },
  };
}
