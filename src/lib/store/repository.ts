import { randomUUID } from "node:crypto";
import type { JsonStore } from "./json-store";
import { demoSnapshot } from "./seed";
import type { CareTask, GrowthEvent, Household, Pet } from "./types";

export function createRepository(store: JsonStore) {
  let queue = Promise.resolve();
  const exclusive = async <T>(operation: () => Promise<T>): Promise<T> => {
    const pending = queue.then(operation, operation);
    queue = pending.then(() => undefined, () => undefined);
    return pending;
  };

  return {
    async ensureDemo() {
      return exclusive(async () => {
        const snapshot = await store.read();
        if (!snapshot.households.length) await store.write(demoSnapshot());
        const ready = await store.read();
        return { household: ready.households[0], pets: ready.pets };
      });
    },
    async listPets(householdId: string): Promise<Pet[]> {
      return (await store.read()).pets.filter((pet) => pet.householdId === householdId);
    },
    async listTodayTasks(householdId: string): Promise<CareTask[]> {
      return (await store.read()).tasks.filter((task) => task.householdId === householdId).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    },
    async completeTask(taskId: string): Promise<CareTask> {
      return exclusive(async () => {
        const snapshot = await store.read();
        const task = snapshot.tasks.find((candidate) => candidate.id === taskId);
        if (!task) throw new Error("task not found");
        if (task.status === "COMPLETED") throw new Error("task already completed");
        task.status = "COMPLETED";
        task.completedAt = new Date().toISOString();
        await store.write(snapshot);
        return task;
      });
    },
    async addPet(input: Omit<Pet, "id">): Promise<Pet> {
      return exclusive(async () => {
        const snapshot = await store.read();
        const pet = { ...input, id: randomUUID() };
        snapshot.pets.push(pet);
        await store.write(snapshot);
        return pet;
      });
    },
    async addGrowthEvent(input: Omit<GrowthEvent, "id">): Promise<GrowthEvent> {
      return exclusive(async () => {
        const snapshot = await store.read();
        const event = { ...input, id: randomUUID() };
        snapshot.growthEvents.push(event);
        await store.write(snapshot);
        return event;
      });
    },
    async getDashboard(householdId: string) {
      const snapshot = await store.read();
      return {
        household: snapshot.households.find((household) => household.id === householdId) as Household,
        pets: snapshot.pets.filter((pet) => pet.householdId === householdId),
        tasks: snapshot.tasks.filter((task) => task.householdId === householdId).sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
        growthEvents: snapshot.growthEvents.filter((event) => event.householdId === householdId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
      };
    },
  };
}
