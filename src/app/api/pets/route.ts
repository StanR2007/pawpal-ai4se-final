import { demoRepository } from "@/lib/store/demo-repository";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.householdId !== "string" || typeof body.name !== "string" || !body.name.trim() || typeof body.species !== "string" || !body.species.trim()) {
    return Response.json({ error: "请填写宠物名称和种类。" }, { status: 400 });
  }
  const pet = await demoRepository.addPet({ householdId: body.householdId, name: body.name.trim().slice(0, 32), species: body.species.trim().slice(0, 32), emoji: typeof body.emoji === "string" && body.emoji.trim() ? body.emoji.trim().slice(0, 8) : "🐾" });
  return Response.json(pet, { status: 201 });
}
