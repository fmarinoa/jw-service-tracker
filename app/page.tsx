import { redirect } from "next/navigation";

import DashboardContainer from "@/components/DashboardContainer";
import { getCurrentUser } from "@/lib/auth-options";

export default async function Home() {
  const userSession = await getCurrentUser();
  if (!userSession) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardContainer userId={userSession.id} />
    </main>
  );
}
