import { redirect } from "next/navigation";
import DashboardContainer from "@/components/DashboardContainer";
import { getCurrentUser } from "@/lib/auth-options";
import { User } from "@/domain/User";
import { getEntriesForUser } from "./actions/entries";

export default async function Home() {
  const userSession = await getCurrentUser();
  if (!userSession) {
    redirect("/login");
  }
  const entries = await getEntriesForUser();
  const serializedUser = userSession ? { ...userSession } : null;

  return (
    <main className="min-h-screen bg-background">
      <DashboardContainer initialEntries={entries} user={serializedUser as User} />
    </main>
  );
}
