// Modified from: https://github.com/vercel/next.js/blob/24ccec0505c22c7cbe7c8f767e26aa56a6016e96/packages/create-next-app/helpers/install.ts

import { log } from "@clack/prompts";
import spawn from "cross-spawn";
import type { PkgManager } from "@/helpers/init/parsePkgManager";

/**
 * Spawn a package manager installation based on user preference.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export async function installPackages(
  /** Indicate which package manager to use. */
  packageManager: PkgManager,
  /** Indicate whether there is an active Internet connection.*/
  isOnline: boolean,
): Promise<void> {
  const args: string[] = ["install"];
  if (!isOnline) {
    log.warn("You appear to be offline.\nFalling back to the local cache.");
    args.push("--offline");
  }
  /**
   * Return a Promise that resolves once the installation is finished.
   */
  return new Promise((resolve, reject) => {
    /**
     * Spawn the installation process.
     */
    const child = spawn(packageManager, args, {
      stdio: "inherit",
      env: {
        ...process.env,
        ADBLOCK: "1",
        // we set NODE_ENV to development as pnpm skips dev
        // dependencies when production
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `${packageManager} ${args.join(" ")}` });
        return;
      }
      resolve();
    });
  });
}
