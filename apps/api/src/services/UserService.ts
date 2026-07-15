import bcrypt from "bcrypt";
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { User } from "../domain/User";
import { usersRepository } from "../repositories";

@Injectable()
export class UserService {
    constructor() {}

    async login(phone: string, password: string): Promise<User> {
        const normalizedPhone = phone.startsWith("+51") ? phone : `+51${phone}`;
        const user = await usersRepository.findByPhone(normalizedPhone);
        if (!user) {
            throw new UnauthorizedException("Usuario no encontrado");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Contraseña inválida");
        }
        
        const { password: _, ...userWithoutPass } = user;
        return new User(userWithoutPass);
    }
}