#!/usr/bin/env node

import { Command } from "commander";
import { build } from "@/command/build";
import { dev } from "@/command/dev";
import { init } from "@/command/init";
import { BANNER } from "@/constants/project";
import { parsePkgManager } from "@/utils/cliParser";
import { getPkgManager } from "@/utils/getPkgManager";

const program = new Command();

program
  .name("spice-dev")
  .description("A Powerful tool for making Spicetify Themes/Extensions")
  .addHelpText("before", `${BANNER}\n`);

// init
program
  .command("init")
  .description("Initialize a new Spicetify theme/extension project")
  .argument("[project-name]", "Project Name (folder name will be same).")
  .option("-t, --template <name>", "Template name")
  .option("--eslint", "Initialize with ESLint config.")
  .option("--biome", "Initialize with Biome config.")
  .option(
    "-u, --use <pkg-manager>",
    "Package manager to use (npm, pnpm, yarn, bun)",
    parsePkgManager,
    getPkgManager(),
  )
  .option("--skip-install", "Skip installation of packages.", false)
  .action(init);

//  build
program
  .command("build")
  .description("Build the Spicetify theme/extension for production")
  .option("-w, --watch", "Rebuild on file changes", false)
  .option("-m, --minify", "Minify the output bundle", false)
  .option("--sourcemap", "Enables inline sourcemap", false) // gotta test if it will work
  .action(build);

//  dev
program
  .command("dev")
  .description("Starts dev environment Spicetify theme/extension")
  .option(
    "-p, --port <number>",
    "Port to run the dev server on",
    (v) => {
      const parsed = Number(v);
      if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid Port: "${v}" is not a valid number.`);
      }

      return parsed;
    },
    5173,
  )
  .action(dev);

program.parse();
