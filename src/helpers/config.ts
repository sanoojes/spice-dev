import schema from "@root/schema/v1.json";

import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Config } from "@/types/config";

const CONFIG_FILENAME = "spice.config.json";

function getValidate(): ValidateFunction<Config> {
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile<Config>(schema);
}

const validate = getValidate();

async function loadConfig(): Promise<unknown> {
  const projectDir = process.cwd();
  const filePath = path.join(projectDir, CONFIG_FILENAME);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export function validateConfig(config: unknown): config is Config {
  const ok = validate(config);

  if (!ok) {
    const errors = validate.errors ?? [];
    const message = JSON.stringify(errors, null, 2);
    throw new Error(`Invalid ${CONFIG_FILENAME}:\n${message}`);
  }

  return true;
}

export async function getConfig(): Promise<Config> {
  try {
    const candidate = await loadConfig();

    if (!validateConfig(candidate)) {
      throw new Error(`Invalid ${CONFIG_FILENAME}`);
    }

    return candidate;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : `Unknown error: ${String(err)}`;
    console.error(message);
    process.exit(1);
  }
}
