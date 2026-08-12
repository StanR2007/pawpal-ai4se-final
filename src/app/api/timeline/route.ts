import { demoRepository } from "@/lib/store/demo-repository";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  if (typeof body.householdId !== "string" || typeof body.petId !== "string" || typeof body.title !== "string" || !body.title.trim() || typeof body.note !== "string" || !body.note.trim()) {
    return Response.json({ error: "请写下标题和这一刻的小故事。" }, { status: 400 });
  }
  const event = await demoRepository.addGrowthEvent({ householdId: body.householdId, petId: body.petId, title: body.title.trim().slice(0, 64), note: body.note.trim().slice(0, 280), occurredAt: new Date().toISOString() });
  return Response.json(event, { status: 201 });
}
