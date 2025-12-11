import readline from "node:readline";
import colors from "picocolors";

export type Shortcut<Context = void> = {
  key: string;
  description: string;
  action(context: Context): void | Promise<void>;
};

export type ShortcutOptions<Context> = {
  context: Context;
  shortcuts: Shortcut<Context>[];
  printHelp?: boolean;
};

export function createShortcuts<Context>({
  context,
  shortcuts,
  printHelp = true,
}: ShortcutOptions<Context>) {
  if (!process.stdin.isTTY || process.env.CI) {
    return () => {};
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  let actionRunning = false;

  const printList = () => {
    const maxKeyLen = Math.max(...shortcuts.map((s) => s.key.length));

    shortcuts.forEach((shortcut) => {
      const paddedKey = shortcut.key.padEnd(maxKeyLen);
      console.log(
        colors.dim("  press ") +
          colors.bold(colors.magenta(`${paddedKey} + enter`)) +
          colors.dim(`  ${shortcut.description}`),
      );
    });
    console.log();
  };

  if (printHelp) {
    console.log(colors.bold(colors.cyan("\n  Shortcuts")));
    printList();
  }

  const onInput = async (input: string) => {
    const key = input.trim();

    if (actionRunning || !key) return;

    if (key === "h") {
      console.log(colors.bold(colors.cyan("\n  Shortcuts")));
      printList();
      return;
    }

    const shortcut = shortcuts.find((s) => s.key === key);
    if (shortcut) {
      actionRunning = true;
      try {
        await shortcut.action(context);
      } catch (err) {
        console.error(colors.red(`  X Error running shortcut '${key}':`), err);
      } finally {
        actionRunning = false;
      }
    }
  };

  rl.on("line", onInput);

  return function dispose() {
    rl.removeAllListeners("line");
    rl.close();
  };
}
