import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";

import { phoneSchema, User } from "../domain/User";
import { UserService } from "../services/UserService";

const loginSchema = z.object({
    phone: phoneSchema,
    password: z.string().min(1, "La contraseña es obligatoria"),
});

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("login")
    async login(@Body() body: unknown): Promise<User> {
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestException(result.error.issues[0]?.message || "Datos inválidos");
        }

        const { phone, password } = result.data;
        return this.userService.login(phone, password);
    }
}