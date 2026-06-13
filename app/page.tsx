import { redirect } from "next/navigation";
import DashboardContainer from "@/components/DashboardContainer";
import { getCurrentUser } from "@/lib/auth-options";
import { User } from "@/domain/User";
import { entriesRepository } from "@/repositories";

export default async function Home() {
  const userSession = await getCurrentUser();
  if (!userSession) {
    redirect("/login");
  }

  const domainUser = new User(userSession);
  const entries = await entriesRepository.getByUser(domainUser);

  // Serialize for Client Component
  const serializedEntries = entries.map(entry => ({
    ...entry,
    user: { ...entry.user }
  }));

  const serializedUser = userSession ? { ...userSession } : null;

  return (
    <main className="min-h-screen bg-background">
      <DashboardContainer initialEntries={serializedEntries as any} user={serializedUser as User} />
    </main>
  );
}
