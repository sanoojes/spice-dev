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
