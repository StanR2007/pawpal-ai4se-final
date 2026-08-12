export type TaskStatus = "PENDING" | "COMPLETED";

export type Household = { id: string; name: string; createdAt: string };
export type Pet = { id: string; householdId: string; name: string; species: string; emoji: string };
export type CareTask = {
  id: string;
  householdId: string;
  petId: string;
  title: string;
  dueAt: string;
  status: TaskStatus;
  completedAt?: string;
};
export type GrowthEvent = {
  id: string;
  householdId: string;
  petId: string;
  title: string;
  note: string;
  occurredAt: string;
};
export type Snapshot = {
  households: Household[];
  pets: Pet[];
  tasks: CareTask[];
  growthEvents: GrowthEvent[];
};

export const createEmptySnapshot = (): Snapshot => ({
  households: [],
  pets: [],
  tasks: [],
  growthEvents: [],
});
