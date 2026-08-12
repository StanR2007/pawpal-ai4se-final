import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createEmptySnapshot, type Snapshot } from "./types";

export type JsonStore = { read(): Promise<Snapshot>; write(snapshot: Snapshot): Promise<void> };

export function createJsonStore(filePath: string): JsonStore {
  return {
    async read() {
      try {
        return JSON.parse(await readFile(filePath, "utf8")) as Snapshot;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return createEmptySnapshot();
        throw error;
      }
    },
    async write(snapshot) {
      await mkdir(dirname(filePath), { recursive: true });
      const temporaryPath = `${filePath}.tmp`;
      await writeFile(temporaryPath, JSON.stringify(snapshot, null, 2), "utf8");
      await rename(temporaryPath, filePath);
    },
  };
}
