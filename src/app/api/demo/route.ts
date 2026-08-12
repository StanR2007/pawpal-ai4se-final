import { demoRepository } from "@/lib/store/demo-repository";

export async function GET() {
  const demo = await demoRepository.ensureDemo();
  return Response.json(await demoRepository.getDashboard(demo.household.id));
}
