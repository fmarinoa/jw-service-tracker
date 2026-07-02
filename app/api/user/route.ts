import { NextResponse } from "next/server";

import { User } from "@/domain/User";
import { usersRepository } from "@/repositories";

import { handlerApiRequest } from "../_utils";

async function getUserById(
  userId: string,
): Promise<{ error?: NextResponse; user: User; finded: boolean }> {
  const user = await usersRepository.findById(userId);
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      ),
      finded: false,
      user: {} as User,
    };
  }
  return { user, finded: true };
}

export const GET = handlerApiRequest(
  async (_req, { user }) => {
    const result = await getUserById(user.id);
    if (!result.finded) return result.error;

    const { password, ...userWithoutPassword } = result.user;
    return { success: true, user: userWithoutPassword };
  },
  { requiresAuth: true },
);

export const PUT = handlerApiRequest(
  async (_req, { user, body }) => {
    const userToUpdate = User.validateForUpdate({ ...body, id: user.id });

    const result = await getUserById(userToUpdate.id);
    if (!result.finded) return result.error;

    result.user.updateGoals(
      userToUpdate.monthlyGoal,
      userToUpdate.preacherType,
    );

    const updatedUser = await usersRepository.update(result.user);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "No se pudo actualizar la configuración" },
        { status: 400 },
      );
    }

    return { success: true, user: updatedUser };
  },
  { requiresAuth: true },
);
