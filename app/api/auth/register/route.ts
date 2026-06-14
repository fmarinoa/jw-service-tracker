import { NextResponse } from "next/server";

import { User } from "@/domain/User";
import { usersRepository } from "@/repositories";

import { handlerApiRequest } from "../../_utils";

export const POST = handlerApiRequest(
  async (_req, { body }) => {
    const user = User.validateForRegistration(body);
    const existingUser = await usersRepository.findByPhone(user.phone);

    if (existingUser) {
      return NextResponse.json(
        { error: "El celular ya está registrado." },
        { status: 400 },
      );
    }

    const createdUser = await usersRepository.create(user);
    // Serialize for response
    const { password, ...safeUser } = createdUser;

    return { user: safeUser, success: true };
  },
  { responseHttpCode: 201 },
);
