import { access, constants, copyFile, mkdir, opendir } from "node:fs/promises";

export type CopyFileData = { to: string; from: string };

export async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

export const copyFiles = async (data: CopyFileData[]) => {
  await Promise.all(data.map(({ from, to }) => copyFile(from, to)));
};

export const isEmptyDir = async (path: string): Promise<boolean> => {
  try {
    const dirent = await opendir(path);
    const value = await dirent.read();
    await dirent.close();
    return value === null;
  } catch {
    return false;
  }
};

export async function exists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
