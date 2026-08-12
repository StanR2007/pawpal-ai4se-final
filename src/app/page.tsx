import { demoRepository } from "@/lib/store/demo-repository";
import { DashboardView } from "./dashboard";

export default async function Home() {
  const demo = await demoRepository.ensureDemo();
  const dashboard = await demoRepository.getDashboard(demo.household.id);
  return <DashboardView initial={dashboard} />;
}
