import { cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ensureDir } from "@/utils/fs";

export type CopyData = { from: string; to: string };

export class FileManager {
  private filesToCopy: CopyData[] = [];

  constructor(
    private fromDir: string,
    private toDir: string,
  ) {}

  setFromDir(dir: string): this {
    this.fromDir = dir;
    return this;
  }
  setToDir(dir: string): this {
    this.toDir = dir;
    return this;
  }

  addFile(from: string, to: string): this {
    this.filesToCopy.push({
      from: join(this.fromDir, from),
      to: join(this.toDir, to),
    });
    return this;
  }

  addFiles(files: [string, string][]): this {
    for (const [from, to] of files) this.addFile(from, to);
    return this;
  }

  getFiles(): ReadonlyArray<CopyData> {
    return this.filesToCopy;
  }

  private async ensureDestinationDirs() {
    const dirs = new Set<string>();

    for (const file of this.filesToCopy) {
      dirs.add(dirname(file.to));
    }

    for (const dir of dirs) {
      await ensureDir(dir);
    }
  }

  async copyFiles() {
    if (this.filesToCopy.length === 0) return;

    await this.ensureDestinationDirs();

    await Promise.all(
      this.filesToCopy.map((file) =>
        cp(file.from, file.to, { recursive: false }),
      ),
    );
  }
}
