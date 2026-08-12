import type { Snapshot } from "./types";

export const demoSnapshot = (): Snapshot => {
  const householdId = "home-sunshine";
  const today = new Date().toISOString().slice(0, 10);
  return {
    households: [{ id: householdId, name: "阳光小屋", createdAt: `${today}T08:00:00.000Z` }],
    pets: [
      { id: "pet-momo", householdId, name: "Momo", species: "猫咪", emoji: "🐈" },
      { id: "pet-doudou", householdId, name: "豆豆", species: "狗狗", emoji: "🐕" },
    ],
    tasks: [
      { id: "task-momo-breakfast", householdId, petId: "pet-momo", title: "给 Momo 准备早餐", dueAt: `${today}T08:30:00.000Z`, status: "PENDING" },
      { id: "task-doudou-walk", householdId, petId: "pet-doudou", title: "带豆豆散步", dueAt: `${today}T18:00:00.000Z`, status: "PENDING" },
    ],
    growthEvents: [
      { id: "event-momo-window", householdId, petId: "pet-momo", title: "窗边的午后", note: "今天第一次主动靠近窗台晒太阳。", occurredAt: `${today}T13:20:00.000Z` },
      { id: "event-doudou-ball", householdId, petId: "pet-doudou", title: "新球到家", note: "豆豆立刻学会了把球叼回来。", occurredAt: `${today}T10:10:00.000Z` },
    ],
  };
};
