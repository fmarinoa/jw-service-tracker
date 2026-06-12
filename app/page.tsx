import { redirect } from "next/navigation";
import DashboardContainer from "@/components/DashboardContainer";
import { entriesRepository } from "@/repositories";
import { getCurrentUser } from "@/lib/auth-options";
import { User } from "@/domain/User";

export default async function Home() {
  const userSession = await getCurrentUser();

  if (!userSession) {
    redirect("/login");
  }

  // Convertimos la sesión a nuestra clase de dominio (para compatibilidad con componentes)
  const user = new User(userSession);

  const entries = await entriesRepository.getByUser(user);

  return (
    <main className="min-h-screen bg-background">
      <DashboardContainer initialEntries={entries} user={user} />
    </main>
  );
}
