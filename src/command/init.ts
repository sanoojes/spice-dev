import { join, relative } from "node:path";
import { chdir, cwd } from "node:process";
import * as p from "@clack/prompts";
import * as pc from "picocolors";
import { linterOptions, templateOptions } from "@/constants";
import { createExtension } from "@/helpers/init/createExtension";
import { createTheme } from "@/helpers/init/createTheme";
import type { Linter } from "@/types/config";
import type { InitAction, InitAnswers } from "@/types/init";
import { ensureDir, exists, isEmptyDir } from "@/utils/fs";

export const init: InitAction = async (name, options) => {
  try {
    const opts = options;
    const initialCwd = cwd();

    p.intro("Welcome to the Spicetify Dev CLI");

    const answers: InitAnswers = await p.group(
      {
        // PROJECT NAME
        projectName: async () =>
          !name
            ? (
                await p.text({
                  message: "Where would you like your project to be created?",
                  placeholder: "(hit Enter to use './')",
                  defaultValue: "./",
                })
              )
                .toString()
                .trim()
            : name.trim(),

        // PROJECT DIR
        projectDir: async ({
          results,
        }: {
          results: { projectName?: string };
        }): Promise<string> => {
          const projectName = results.projectName;

          if (!projectName) {
            p.cancel("Failed to retrieve: projectName");
            throw new Error("Missing projectName");
          }

          p.log.step("Resolving project directory...");

          const dir =
            projectName === "./" || projectName === "."
              ? cwd()
              : join(cwd(), projectName);

          const dirExists = await exists(dir);

          if (dirExists) {
            const empty = await isEmptyDir(dir);

            if (!empty) {
              p.log.warn(`Directory '${dir}' is not empty.`);
              const ignore = await p.confirm({
                message: "Directory is not empty. Continue anyway?",
                initialValue: false,
              });

              if (!ignore) {
                p.cancel("Exiting without changes.");
                process.exit(0);
              }
            } else {
              p.log.info("Directory exists and is empty.");
            }
          } else {
            p.log.info("Directory does not exist; it will be created.");
          }

          return dir;
        },

        // TEMPLATE - Theme and Extension. (Custom Apps ?. Hell Nah)
        template: async () => {
          const cliTemplate = opts.template;
          const isValidTemplate =
            cliTemplate &&
            templateOptions.some((opt) => opt.value === cliTemplate);

          if (!isValidTemplate) {
            return (await p.select({
              message: "Which template would you like?",
              options: templateOptions,
              initialValue: "theme",
            })) as string;
          }

          p.log.info(`Using template: ${cliTemplate}`);
          return cliTemplate;
        },

        linter: async () => {
          if (opts.eslint) {
            return "eslint";
          }
          if (opts.biome) {
            return "biome";
          }

          return (await p.select({
            message: "Which linter would you like to use?",
            options: linterOptions,
            initialValue: "eslint",
          })) as Linter;
        },

        // TODO: Implement JS-only version.
        // USE FRICKING TS FOR NOW
        useTs: async () => {
          // For now this is forced true
          return true;
        },

        useReact: () =>
          p.confirm({
            message: "Do you want to use React?",
            initialValue: false,
          }),

        skipInstall: async () => options.skipInstall ?? false,
        pkgManager: async () => {
          // TODO: Add a prompt ?
          // i don't think its necessary and use the pkgManager thats used to init
          // DEFAULT: currently using one
          return options.use;
        },
      },
      {
        onCancel() {
          p.cancel("Operation cancelled by user.");
          process.exit(0);
        },
      },
    );

    try {
      await ensureDir(answers.projectDir);

      chdir(answers.projectDir);

      if (answers.template === "theme") {
        await createTheme(answers);
      } else if (answers.template === "extension") {
        await createExtension(answers);
      } else {
        p.log.error(`Unknown template: '${answers.template}'.`);
        p.outro("Template invalid. Exiting...");
        process.exit(1);
      }
    } catch (error) {
      p.log.error(
        `Error during scaffolding: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }

    p.log.success("Project created successfully.");

    const linterLabel =
      linterOptions.find((linter) => linter.value === answers.linter)?.label ??
      answers.linter;

    const templateLabel =
      templateOptions.find((template) => template.value === answers.template)
        ?.label ?? answers.template;

    p.note(
      [
        `${pc.bold("Location:")} ${answers.projectDir}`,
        `${pc.bold("Template:")} ${templateLabel}`,
        `${pc.bold("Linter:")} ${linterLabel}`,
        `${pc.bold("Package Manager:")} ${answers.pkgManager}`,
        `${pc.bold("React:")} ${answers.useReact ? pc.green("enabled") : pc.red("disabled")}`,
        `${pc.bold("TypeScript:")} ${
          answers.useTs ? pc.green("enabled") : pc.red("disabled")
        }`,
      ].join("\n"),
      "Project settings",
    );

    const cdPath =
      relative(initialCwd, answers.projectDir) === ""
        ? "."
        : relative(initialCwd, answers.projectDir);

    p.note(
      [
        `cd ${cdPath}`,
        "",
        `${pc.bold("To Start dev server:")} ${pc.green(
          `${answers.pkgManager} run dev`,
        )}`,
        `${pc.bold("To Build for outDir:")} ${pc.green(
          `${answers.pkgManager} run build`,
        )}`,
        "",
        `${pc.bold("Publish to Spicetify Marketplace:")}`,
        pc.cyan(
          "https://github.com/spicetify/marketplace/wiki/Publishing-to-Marketplace",
        ),
      ].join("\n"),
      "Next steps",
    );

    p.outro("You're ready to start building with your new Spicetify project.");
  } catch (e) {
    console.error(e);
    p.log.error("Unexpected error occurred. The CLI will now exit.");
    p.outro(
      "If this keeps happening, open an issue with the error output above.",
    );
    process.exit(1);
  }
};
