import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { createTemplate } from "@root/template";
import { BIOME_JS_VERSION } from "@/constants/init";
import { installPackages } from "@/helpers/init/installPackages";
import type { Config } from "@/types/config";
import type { InitAnswers } from "@/types/init";
import { exists } from "@/utils/fs";
import { PackageJsonBuilder } from "@/utils/PackageJsonBuilder";

export async function createExtension(answers: InitAnswers) {
  p.log.step(`Creating extension: ${answers.projectName}`);

  const spinner = p.spinner();

  try {
    spinner.start("Scaffolding project files…");
    await createTemplate(answers);

    spinner.message("Creating spice.config.json…");
    await createSpiceDevConfig(answers);

    spinner.message("Generating package.json…");
    const pkg = await createPackageJson(answers);
    const packageJsonPath = join(answers.projectDir, "package.json");
    await writeFile(packageJsonPath, JSON.stringify(pkg, null, 2));

    spinner.message("Verifying project files…");
    const hasPackageJson = await exists(packageJsonPath);

    spinner.stop("Project files created.");

    if (!answers.skipInstall && hasPackageJson) {
      logPlannedPackages(pkg);

      p.log.step(
        `Installing dependencies with ${answers.pkgManager} (this can take a few minutes)…`,
      );
      await installPackages(answers.pkgManager, true);
      p.log.success("Dependencies installed.");
    } else if (answers.skipInstall) {
      p.log.info(
        "Skipping dependency installation (you can run it manually later).",
      );
    } else if (!hasPackageJson) {
      p.log.warn(
        "package.json was not found; skipped dependency installation.",
      );
    }
  } catch (error) {
    spinner.stop("Failed to create extension.");
    p.log.error(
      `An error occurred while creating the extension${
        answers.projectName ? ` "${answers.projectName}"` : ""
      }.`,
    );
    p.log.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

function logPlannedPackages(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}) {
  const deps = Object.entries(pkg.dependencies ?? {});
  const devDeps = Object.entries(pkg.devDependencies ?? {});

  if (!deps.length && !devDeps.length) {
    p.note(
      "No dependencies or devDependencies found in package.json.",
      "Packages",
    );
    return;
  }

  const lines: string[] = [];

  if (deps.length) {
    lines.push(`Dependencies (${deps.length}):`);
    for (const [name, version] of deps) {
      lines.push(` • ${name}@${version}`);
    }
  }

  if (devDeps.length) {
    if (lines.length) lines.push("");
    lines.push(`Dev dependencies (${devDeps.length}):`);
    for (const [name, version] of devDeps) {
      lines.push(` • ${name}@${version}`);
    }
  }

  p.note(lines.join("\n"), "Packages to be installed");
}

async function createSpiceDevConfig(answers: InitAnswers) {
  const config: Config = {
    $schema: "https://sanooj.uk/spice-dev/schema/v1.json",
    version: "1.0.0",
    name: answers.projectName,
    entry: "./src/app.tsx",
    type: answers.template,
    framework: answers.useReact ? "react" : "vanilla",
    language: answers.useTs ? "ts" : "js",
    linter: answers.linter,
    outDir: "dist",
  };

  const configPath = join(answers.projectDir, "spice.config.json");
  await writeFile(configPath, JSON.stringify(config, null, 2));
}

async function createPackageJson(answers: InitAnswers) {
  const builder = new PackageJsonBuilder({
    name: answers.projectName,
    version: "0.1.0",
    scripts: {
      dev: "spice-dev dev",
      build: "spice-dev build",
      lint: answers.linter === "eslint" ? "eslint" : "biome lint",
    },
    dependencies: {},
    devDependencies: {
      "spice-dev": "^1.0.0",
    },
  });

  if (answers.useReact) {
    builder
      .addDependency("react", "^18.3.1")
      .addDependency("react-dom", "^18.3.1")
      .addDevDependency("@types/react", "^18.3.1")
      .addDevDependency("@types/react-dom", "^18.3.1");
  }

  if (answers.useTs) {
    builder.addDevDependency("typescript", "^5.0.0");
  }

  if (answers.linter === "eslint") {
    builder
      .addDevDependency("@eslint/css", "^0.14.1")
      .addDevDependency("@eslint/js", "^9.39.1")
      .addDevDependency("@eslint/json", "^0.14.0")
      .addDevDependency("@types/bun", "latest")
      .addDevDependency("esbuild", "^0.27.1")
      .addDevDependency("eslint", "^9.39.1")
      .addDevDependency("globals", "^16.5.0");

    if (answers.useTs) builder.addDevDependency("typescript-eslint", "^8.49.0");

    if (answers.useReact) {
      builder.addDevDependency("eslint-plugin-react", "^7.37.5");
    }
  } else if (answers.linter === "biome") {
    builder.addDevDependency("@biomejs/biome", BIOME_JS_VERSION);
  }

  return builder.value;
}
