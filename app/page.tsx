import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import DashboardContainer from "@/components/DashboardContainer";
import clientPromise from "@/lib/db";
import { Entry, User } from "@/lib/types";
import { ObjectId } from "mongodb";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  const user = session.user as User

  const client = await clientPromise;
  const db = client.db();

  const userDoc = await db.collection("users").findOne({ _id: new ObjectId(user.id) });

  const fullUser = {
    ...user,
    preacherType: userDoc?.preacherType || 'publisher',
    monthlyGoal: userDoc?.monthlyGoal || 0,
  };

  const entries = await db
    .collection("entries")
    .find({ userId: user.id })
    .sort({ preachingDate: -1 })
    .toArray();

  // Serializar para Client Component
  const serializedEntries: Entry[] = entries.map(e => ({
    id: e._id.toString(),
    userId: e.userId,
    preachingDate: e.preachingDate,
    hours: e.hours,
    minutes: e.minutes,
    type: e.type,
    notes: e.notes,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return (
    <main className="min-h-screen bg-background">
      <DashboardContainer initialEntries={serializedEntries} user={fullUser} />
    </main>
  );
}
