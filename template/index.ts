import {join, resolve} from "node:path"
import type { InitAnswers } from "@/types/init";
import { FileManager } from "@/utils/fileManager";
import { writeFile } from "node:fs/promises";
import { getBiomeConfig } from "@/helpers/init/getBiomeConfig";
import { BIOME_JS_VERSION } from "@/constants";

const templateRoot = __dirname;

export async function createTemplate(answers: InitAnswers) {
  const { projectDir, useTs, useReact, linter } = answers;

  const langDir = useTs ? "ts" : "js";
  const frameworkDir = useReact ? "react" : "vanilla";

  const extensionTemplateDir = join(
    templateRoot,
    "extension",
    langDir,
    frameworkDir,
  );

  const fileManager = new FileManager(extensionTemplateDir, projectDir);
  const ex = useTs ? "ts" : "js";

  fileManager.addFile("gitignore", ".gitignore")
  fileManager.addFile("README-template.md", "README.md");
  if (useTs) fileManager.addFile("tsconfig.json", "tsconfig.json");


  const appFile = useReact ? `src/app.${ex}x` : `src/app.${ex}`;
  fileManager.addFile(appFile, appFile);

  if (linter === "eslint") {
    const eslintCommonDir = resolve(templateRoot, "common/eslint");
    fileManager.setFromDir(eslintCommonDir);

    const eslintSource = useReact ? `react.${ex}` : `common.${ex}`;
    fileManager.addFile(eslintSource, `eslint.config.${ex}`);
  } else if (linter === "biome") {
    const biomePackageJsonPath = join(projectDir, "package.json");
    await writeFile(
      biomePackageJsonPath,
      JSON.stringify(getBiomeConfig(BIOME_JS_VERSION), null, 2),
    );
  }

  await fileManager.copyFiles();
}
