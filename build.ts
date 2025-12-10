#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "bun";
import pc from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild(shouldRun: boolean, appArgs: string[]) {
  console.log(pc.cyan("Starting Bun build...\n"));

  const result = await build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    target: "node",
    format: "esm",
    sourcemap: "external",
    minify: true,
    splitting: false,
  });

  if (!result.success) {
    console.error(pc.red("Build failed."));
    process.exit(1);
  }

  console.log(pc.green("Build outputs:"));
  for (const output of result.outputs) {
    console.log(pc.gray(` - ${output.path} `) + pc.dim(`(${output.kind})`));
  }
  console.log(pc.green("\nBuild completed successfully.\n"));

  if (!shouldRun) {
    return;
  }

  const runner = process.env.SPICE_RUNNER ?? "bun";
  const entry = resolve(__dirname, "dist/index.js");

  console.log(
    pc.cyan(
      `Running ${runner} ${entry}` +
        (appArgs.length ? ` ${appArgs.join(" ")}` : "") +
        "\n",
    ),
  );

  const child = spawn(runner, [entry, ...appArgs], {
    stdio: "inherit",
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error(pc.red("Failed to start child process:"));
    console.error(err);
    process.exit(1);
  });
}

const args = process.argv.slice(2);
const shouldRun = args.includes("--run");
const appArgs = args.filter((arg) => arg !== "--run");

runBuild(shouldRun, appArgs).catch((err) => {
  console.error(pc.red("Build threw an error:"));
  console.error(err);
  process.exit(1);
});
