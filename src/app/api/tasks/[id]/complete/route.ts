import { demoRepository } from "@/lib/store/demo-repository";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    return Response.json(await demoRepository.completeTask((await context.params).id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete task";
    return Response.json({ error: message }, { status: message === "task not found" ? 404 : 409 });
  }
}
