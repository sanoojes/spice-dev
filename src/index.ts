#!/usr/bin/env node

import { Command } from "commander";
import { build } from "@/command/build";
import { init } from "@/command/init";
import { parsePkgManager } from "@/helpers/init/parsePkgManager";
import { getPkgManager } from "@/utils/getPkgManager";

const program = new Command();

program
  .name("spice-cli")
  .description("A Powerful tool for making Spicetify Themes/Extensions");

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
  .option("--sourcemap", "Generate source maps", false)
  .action(build);

// dev
program
  .command("dev")
  .description("Run the Spicetify theme/extension in dev mode")
  .option("-w, --watch", "Rebuild on file changes", true)
  .option("-m, --minify", "Minify the output bundle", true)
  .option("--sourcemap", "Generate source maps", true)
  .action(build);

program.parse();
