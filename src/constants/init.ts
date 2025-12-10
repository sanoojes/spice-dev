import type { Linter } from "@/types/config";

export const BIOME_JS_VERSION = "2.3.8";

export const templateOptions: SelectOptions = [
  {
    label: "Theme",
    value: "theme",
  },
  { label: "Extension", value: "extension" },
];

export const linterOptions: SelectOptions<Linter> = [
  { label: "Eslint", value: "eslint", hint: "More comprehensive lint rules" },
  {
    label: "Biome",
    value: "biome",
    hint: "Fast formatter and linter (fewer rules)",
  },
  { label: "None", value: "none", hint: "Skip linter configuration" },
];
