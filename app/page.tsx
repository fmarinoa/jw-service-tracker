import { redirect } from "next/navigation";
import DashboardContainer from "@/components/DashboardContainer";
import { getCurrentUser } from "@/lib/auth-options";
import { entriesRepository, usersRepository } from "@/repositories";
import { User } from "@/domain/User";
import { Entry } from "@/domain/Entry";

export default async function Home() {
  const userSession = await getCurrentUser();
  if (!userSession) {
    redirect("/login");
  }

  const retrieveEntries = async (user: User): Promise<Entry[]> => {
    const entries = await entriesRepository.getByUser(user);

    // Return data directly, handler will wrap in JSON
    return entries.map(entry => ({
      ...entry,
      user: { ...entry.user }
    }));
  };

  const retrieveFullUser = async (user: User): Promise<User> => {
    const findUser = await usersRepository.findById(user.id);
    if (!findUser) {
      throw new Error(`Usuario con ID ${user.id} no encontrado en la base de datos.`);
    }
    return { ...findUser };
  };

  const domainUser = new User(userSession);
  const entries = await retrieveEntries(domainUser);
  const user = await retrieveFullUser(domainUser);

  return (
    <main className="min-h-screen bg-background">
      <DashboardContainer initialEntries={entries} user={user} />
    </main>
  );
}
