import type { Plugin } from "esbuild";

export const createHmrClient = (hmrPort: number): Plugin => ({
  name: "hmr-client",
  setup(build) {
    const entryPoints = build.initialOptions.entryPoints;
    if (
      !entryPoints ||
      (Array.isArray(entryPoints) && entryPoints.length === 0)
    )
      return;

    const entryFilter =
      typeof entryPoints === "string"
        ? new RegExp(
            (entryPoints as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          )
        : undefined;

    const code = `
if (typeof window !== "undefined") {
  type HmrMessage =
    | { type: "reload" }
    | { type: "css-update"; files?: string[] }
    | { type: "build-error"; errors: unknown[] };

  const refreshCss = (files?: string[]) => {
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")
    );
    const now = Date.now().toString();

    for (const link of links) {
      const href = link.getAttribute("href");
      if (!href) continue;

      if (files && files.length > 0) {
        const fileNameMatches = files.some((file) => {
          const fileName = file.split("/").pop() ?? file;
          return href.includes(fileName);
        });

        if (!fileNameMatches) continue;
      }

      const url = new URL(href, window.location.origin);
      url.searchParams.set("v", now);
      link.href = url.toString();
    }
  };

  try {
    const ws = new WebSocket("ws://localhost:${hmrPort}");
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data) as HmrMessage;

      if (msg.type === "css-update") {
        // CSS-only change: just refresh stylesheets
        refreshCss(msg.files);
        return;
      }

      if (msg.type === "reload") {
        // JS (or mixed) change: do a full reload
        window.location.reload();
        return;
      }

      if (msg.type === "build-error") {
        console.error("[HMR] Build failed:", msg.errors);
      }
    });
  } catch (err) {
    console.error("[HMR] Failed to connect:", err);
  }
}
`;

    build.onLoad(
      {
        filter: entryFilter ?? /.*/,
      },
      async (args) => {
        if (entryFilter && !entryFilter.test(args.path)) {
          return;
        }

        const fs = await import("node:fs/promises");
        const source = await fs.readFile(args.path, "utf8");
        return {
          contents: `${source}\n\n/* --- HMR runtime injected by spice-cli --- */\n${code}`,
          loader: "ts",
        };
      },
    );
  },
});
