import { InvalidOptionArgumentError } from "commander";

const validPkgManagers = ["npm", "pnpm", "yarn", "bun"] as const;
export type PkgManager = (typeof validPkgManagers)[number];

export function parsePkgManager(value: string): PkgManager {
  if (!validPkgManagers.includes(value as PkgManager)) {
    throw new InvalidOptionArgumentError(
      `Invalid package manager: "${value}". Use one of: ${validPkgManagers.join(", ")}`,
    );
  }
  return value as PkgManager;
}

const validFramework = ["react", "vanilla"] as const;
export type Framework = (typeof validFramework)[number];

export function parseFramework(value: string): PkgManager {
  if (!validFramework.includes(value as Framework)) {
    throw new InvalidOptionArgumentError(
      `Invalid framework: "${value}". Use one of: ${validFramework.join(", ")}`,
    );
  }
  return value as PkgManager;
}
