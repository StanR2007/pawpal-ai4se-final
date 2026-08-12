import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createJsonStore } from "@/lib/store/json-store";
import { createRepository } from "@/lib/store/repository";
import { createEmptySnapshot } from "@/lib/store/types";

describe("JSON persistence", () => {
  it("writes a snapshot atomically and reads it back", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pawpal-store-"));
    const filePath = join(directory, "pawpal.json");
    const store = createJsonStore(filePath);
    const snapshot = createEmptySnapshot();

    await store.write(snapshot);

    expect(await store.read()).toEqual(snapshot);
    expect(JSON.parse(await readFile(filePath, "utf8"))).toEqual(snapshot);
  });

  it("completes the same care task only once", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pawpal-repository-"));
    const repository = createRepository(createJsonStore(join(directory, "pawpal.json")));
    const demo = await repository.ensureDemo();
    const task = (await repository.listTodayTasks(demo.household.id))[0];

    expect(await repository.completeTask(task.id)).toMatchObject({ status: "COMPLETED" });
    await expect(repository.completeTask(task.id)).rejects.toThrow("already completed");
  });
});
